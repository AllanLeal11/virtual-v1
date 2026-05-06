"""
WhatsApp VIP SaaS — Backend endpoints
Gestiona órdenes de pago (SINPE/PayPal/USDT), tokens mágicos y configuración del bot.
"""
import os
import secrets
import uuid
import logging
import urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List

import jwt
import requests
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Header, BackgroundTasks
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

# ============== CONFIG ==============

JWT_SECRET = os.environ.get("JWT_SECRET", "vertice_secret_2025")
JWT_ALGORITHM = "HS256"
USD_TO_CRC = float(os.environ.get("USD_TO_CRC", "510"))
ADMIN_TOKEN = os.environ.get("VIP_ADMIN_TOKEN", "vip-admin-change-me")

# Notificación a tu WhatsApp cuando llega un pago para aprobar
ADMIN_WHATSAPP = os.environ.get("ADMIN_WHATSAPP", "+50687518055")
CALLMEBOT_API_KEY = os.environ.get("CALLMEBOT_API_KEY", "")
VIP_WEBHOOK_URL = os.environ.get("VIP_WEBHOOK_URL", "")  # Make.com / Zapier

PLANS = {
    "starter": {"name": "Básico", "price_usd": 29, "max_conversations": 1000},
    "pro": {"name": "Pro", "price_usd": 59, "max_conversations": 5000},
    "premium": {"name": "Premium", "price_usd": 149, "max_conversations": -1},
}

PAYMENT_METHODS = {"sinpe", "paypal", "usdt"}

UPLOAD_DIR = Path(__file__).parent / "uploads" / "sinpe"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ============== ROUTER ==============

vip_router = APIRouter(prefix="/api/vip", tags=["vip"])


# ============== DB INJECTION ==============
# La DB se inyecta desde server.py al importar el módulo
db = None

def init_db(database):
    """Llamado desde server.py al cargar el módulo."""
    global db
    db = database


# ============== MODELS ==============

class CreateOrderRequest(BaseModel):
    plan: str  # starter | pro | premium
    method: str  # sinpe | paypal | usdt
    email: EmailStr
    phone: str


class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    plan: str
    method: str
    status: str  # pending | processing | paid | cancelled
    amount_usd: float
    amount_crc: int
    email: str
    phone: str
    created_at: str
    access_token: Optional[str] = None


class CryptoConfirmRequest(BaseModel):
    tx_hash: str


class BotConfig(BaseModel):
    business_name: Optional[str] = ""
    welcome_message: Optional[str] = ""
    business_hours: Optional[str] = ""
    phone_id: Optional[str] = ""
    access_token: Optional[str] = ""
    verify_token: Optional[str] = ""
    connected: bool = False
    message_delay: int = 3
    max_per_hour: int = 60
    rotate_messages: bool = True


class AutoResponseCreate(BaseModel):
    trigger: str
    response: str


class AutoResponse(BaseModel):
    id: str
    trigger: str
    response: str
    created_at: str


# ============== HELPERS ==============

def make_token(user_id: str, plan: str, expires_days: int = 365) -> str:
    payload = {
        "sub": user_id,
        "plan": plan,
        "iat": datetime.now(timezone.utc).timestamp(),
        "exp": (datetime.now(timezone.utc) + timedelta(days=expires_days)).timestamp(),
        "type": "vip",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "vip":
            raise HTTPException(status_code=401, detail="Token inválido")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Falta autorización")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    user = await db.vip_users.find_one({"_id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def check_admin(token: Optional[str]) -> None:
    if not token or token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="No autorizado")


def notify_admin_new_payment(order: dict) -> None:
    """Avisa por WhatsApp + webhook que hay un pago para aprobar."""
    plan = (order.get("plan") or "?").upper()
    method = (order.get("method") or "?").upper()
    email = order.get("email", "?")
    phone = order.get("phone", "?")
    amount = order.get("amount_usd", 0)
    order_id = str(order.get("_id", ""))[-6:]
    reference = order.get("sinpe_reference") or order.get("tx_hash") or "—"

    text = (
        f"💰 NUEVO PAGO VIP por aprobar\n\n"
        f"Plan: {plan} (${amount} USD)\n"
        f"Método: {method}\n"
        f"Cliente: {email}\n"
        f"WhatsApp: {phone}\n"
        f"Referencia: {reference}\n"
        f"Order ID: VIP-{order_id}\n\n"
        f"Aprobar: /api/vip/admin/orders/{order.get('_id')}/approve"
    )

    # 1. WhatsApp via CallMeBot (gratis)
    if CALLMEBOT_API_KEY and ADMIN_WHATSAPP:
        try:
            phone_clean = ADMIN_WHATSAPP.replace("+", "").replace(" ", "").replace("-", "")
            url = (
                f"https://api.callmebot.com/whatsapp.php"
                f"?phone={phone_clean}"
                f"&text={urllib.parse.quote(text)}"
                f"&apikey={CALLMEBOT_API_KEY}"
            )
            requests.get(url, timeout=5)
            logger.info(f"WhatsApp notification sent for order {order_id}")
        except Exception as e:
            logger.warning(f"CallMeBot failed: {e}")

    # 2. Webhook Make.com / Zapier
    if VIP_WEBHOOK_URL:
        try:
            requests.post(VIP_WEBHOOK_URL, json={
                "event": "vip_payment_pending",
                "order_id": str(order.get("_id")),
                "plan": plan,
                "method": method,
                "amount_usd": amount,
                "amount_crc": order.get("amount_crc"),
                "email": email,
                "phone": phone,
                "reference": reference,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }, timeout=5)
        except Exception as e:
            logger.warning(f"VIP webhook failed: {e}")


async def activate_order(order_id: str) -> str:
    """Marca una orden como pagada y crea el usuario VIP. Devuelve access_token."""
    order = await db.vip_orders.find_one({"_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    if order["status"] == "paid":
        return order.get("access_token", "")

    user_id = str(uuid.uuid4())
    access_token = make_token(user_id, order["plan"])

    # Crear usuario VIP
    await db.vip_users.insert_one({
        "_id": user_id,
        "email": order["email"],
        "phone": order["phone"],
        "plan": order["plan"],
        "status": "active",
        "order_id": order_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Inicializar config bot vacía
    await db.vip_bot_configs.insert_one({
        "_id": user_id,
        "business_name": "",
        "welcome_message": "",
        "business_hours": "",
        "phone_id": "",
        "access_token": "",
        "verify_token": "",
        "connected": False,
        "message_delay": 3,
        "max_per_hour": 60,
        "rotate_messages": True,
    })

    # Marcar orden como pagada
    await db.vip_orders.update_one(
        {"_id": order_id},
        {"$set": {
            "status": "paid",
            "access_token": access_token,
            "user_id": user_id,
            "paid_at": datetime.now(timezone.utc).isoformat(),
        }}
    )
    logger.info(f"VIP order {order_id} activated for {order['email']}")
    return access_token


# ============== ENDPOINTS: ÓRDENES ==============

@vip_router.post("/orders", response_model=OrderResponse)
async def create_order(req: CreateOrderRequest):
    if req.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Plan inválido")
    if req.method not in PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Método de pago inválido")

    plan_info = PLANS[req.plan]
    order_id = str(uuid.uuid4())
    amount_usd = plan_info["price_usd"]
    amount_crc = int(amount_usd * USD_TO_CRC)

    order = {
        "_id": order_id,
        "plan": req.plan,
        "method": req.method,
        "status": "pending",
        "amount_usd": amount_usd,
        "amount_crc": amount_crc,
        "email": req.email,
        "phone": req.phone,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.vip_orders.insert_one(order)
    return OrderResponse(id=order_id, **{k: v for k, v in order.items() if k != "_id"})


@vip_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    order = await db.vip_orders.find_one({"_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    return OrderResponse(id=order_id, **{k: v for k, v in order.items() if k != "_id"})


@vip_router.post("/orders/{order_id}/sinpe")
async def upload_sinpe_proof(
    order_id: str,
    reference: str = Form(...),
    screenshot: Optional[UploadFile] = File(None),
):
    order = await db.vip_orders.find_one({"_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    update = {
        "status": "processing",
        "sinpe_reference": reference,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }

    if screenshot:
        filename = f"{order_id}_{secrets.token_hex(4)}_{screenshot.filename}"
        path = UPLOAD_DIR / filename
        with open(path, "wb") as f:
            content = await screenshot.read()
            f.write(content)
        update["sinpe_screenshot"] = str(filename)

    await db.vip_orders.update_one({"_id": order_id}, {"$set": update})

    # Avisarle al admin (vos) que hay pago pendiente
    updated = await db.vip_orders.find_one({"_id": order_id})
    notify_admin_new_payment(updated)

    return {"ok": True, "message": "Comprobante recibido. Te avisamos al activar."}


@vip_router.post("/orders/{order_id}/crypto")
async def confirm_crypto(order_id: str, req: CryptoConfirmRequest):
    order = await db.vip_orders.find_one({"_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    await db.vip_orders.update_one(
        {"_id": order_id},
        {"$set": {
            "status": "processing",
            "tx_hash": req.tx_hash,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
        }}
    )

    # Avisarle al admin (vos) que hay crypto pendiente
    updated = await db.vip_orders.find_one({"_id": order_id})
    notify_admin_new_payment(updated)

    return {"ok": True, "message": "Hash recibido, validando en blockchain."}


# ============== ENDPOINTS: ADMIN (aprobar pagos) ==============

@vip_router.get("/admin/orders")
async def admin_list_orders(
    status: Optional[str] = None,
    x_admin_token: Optional[str] = Header(None),
):
    check_admin(x_admin_token)
    query = {"status": status} if status else {}
    cursor = db.vip_orders.find(query).sort("created_at", -1).limit(100)
    orders = []
    async for o in cursor:
        o["id"] = o.pop("_id")
        orders.append(o)
    return orders


@vip_router.post("/admin/orders/{order_id}/approve")
async def admin_approve_order(
    order_id: str,
    x_admin_token: Optional[str] = Header(None),
):
    check_admin(x_admin_token)
    token = await activate_order(order_id)
    order = await db.vip_orders.find_one({"_id": order_id})
    return {
        "ok": True,
        "access_token": token,
        "user_email": order["email"],
        "user_phone": order["phone"],
        "magic_link": f"/vip/configuracion?token={token}",
    }


@vip_router.post("/admin/orders/{order_id}/reject")
async def admin_reject_order(
    order_id: str,
    reason: str = Form(""),
    x_admin_token: Optional[str] = Header(None),
):
    check_admin(x_admin_token)
    await db.vip_orders.update_one(
        {"_id": order_id},
        {"$set": {"status": "cancelled", "rejection_reason": reason}}
    )
    return {"ok": True}


# ============== ENDPOINTS: USER (configuración del bot) ==============

@vip_router.get("/me")
async def me(user: dict = Depends(current_user)):
    return {
        "id": user["_id"],
        "email": user["email"],
        "phone": user["phone"],
        "plan": user["plan"],
        "status": user.get("status", "active"),
    }


@vip_router.get("/bot/config")
async def get_bot_config(user: dict = Depends(current_user)):
    config = await db.vip_bot_configs.find_one({"_id": user["_id"]}) or {}
    config.pop("_id", None)
    config.pop("access_token", None)  # No devolver access token al frontend
    return config


@vip_router.put("/bot/config")
async def update_bot_config(config: BotConfig, user: dict = Depends(current_user)):
    data = config.model_dump(exclude_unset=True)
    await db.vip_bot_configs.update_one(
        {"_id": user["_id"]},
        {"$set": data},
        upsert=True,
    )
    # Si tiene phone_id + access_token + verify_token → marcar conectado
    full = await db.vip_bot_configs.find_one({"_id": user["_id"]})
    is_connected = bool(
        full.get("phone_id") and full.get("access_token") and full.get("verify_token")
    )
    await db.vip_bot_configs.update_one(
        {"_id": user["_id"]},
        {"$set": {"connected": is_connected}}
    )
    return {"ok": True, "connected": is_connected}


@vip_router.get("/bot/responses")
async def list_responses(user: dict = Depends(current_user)):
    cursor = db.vip_responses.find({"user_id": user["_id"]}).sort("created_at", -1)
    responses = []
    async for r in cursor:
        responses.append({
            "id": r["_id"],
            "trigger": r["trigger"],
            "response": r["response"],
            "created_at": r["created_at"],
        })
    return responses


@vip_router.post("/bot/responses")
async def create_response(data: AutoResponseCreate, user: dict = Depends(current_user)):
    rid = str(uuid.uuid4())
    doc = {
        "_id": rid,
        "user_id": user["_id"],
        "trigger": data.trigger.strip().lower(),
        "response": data.response.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.vip_responses.insert_one(doc)
    return {
        "id": rid,
        "trigger": doc["trigger"],
        "response": doc["response"],
        "created_at": doc["created_at"],
    }


@vip_router.put("/bot/responses/{rid}")
async def update_response(rid: str, data: AutoResponseCreate, user: dict = Depends(current_user)):
    result = await db.vip_responses.update_one(
        {"_id": rid, "user_id": user["_id"]},
        {"$set": {"trigger": data.trigger.strip().lower(), "response": data.response.strip()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    return {"ok": True}


@vip_router.delete("/bot/responses/{rid}")
async def delete_response(rid: str, user: dict = Depends(current_user)):
    result = await db.vip_responses.delete_one({"_id": rid, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    return {"ok": True}


@vip_router.get("/bot/stats")
async def get_stats(user: dict = Depends(current_user)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0).isoformat()
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0).isoformat()

    today = await db.vip_messages.count_documents({
        "user_id": user["_id"],
        "created_at": {"$gte": today_start},
    })
    month = await db.vip_messages.count_documents({
        "user_id": user["_id"],
        "created_at": {"$gte": month_start},
    })

    return {"today": today, "month": month}
