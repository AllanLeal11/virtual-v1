import requests
import sys
import json
from datetime import datetime

class VerticeAPITester:
    def __init__(self, base_url="https://costa-rica-dev.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "allan", "password": "Vertice2025$"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_verify_token(self):
        """Test token verification"""
        if not self.token:
            print("❌ No token available for verification")
            return False
        return self.run_test("Token Verification", "GET", "auth/verify", 200)[0]

    def test_get_agents(self):
        """Test getting agents list"""
        return self.run_test("Get Agents", "GET", "agents", 200)[0]

    def test_chat_functionality(self):
        """Test AI chat functionality"""
        success, response = self.run_test(
            "AI Chat",
            "POST",
            "chat",
            200,
            data={"message": "Hola, necesito una cotización para un sitio web"}
        )
        if success:
            print(f"   Agent: {response.get('agent_name', 'Unknown')}")
            print(f"   Response length: {len(response.get('response', ''))}")
        return success

    def test_chat_history(self):
        """Test chat history retrieval"""
        return self.run_test("Chat History", "GET", "chat/history", 200)[0]

    def test_clients_crud(self):
        """Test clients CRUD operations"""
        # Create client
        client_data = {
            "name": "Test Client",
            "business": "Test Business",
            "service": "Sitio Web",
            "status": "Lead",
            "phone": "+506 1234-5678",
            "notes": "Test client for API testing"
        }
        
        success, response = self.run_test(
            "Create Client",
            "POST",
            "clients",
            200,
            data=client_data
        )
        
        if not success:
            return False
            
        client_id = response.get('id')
        if not client_id:
            print("❌ No client ID returned")
            return False
            
        # Get clients
        success, _ = self.run_test("Get Clients", "GET", "clients", 200)
        if not success:
            return False
            
        # Update client
        update_data = {"status": "Active", "notes": "Updated notes"}
        success, _ = self.run_test(
            "Update Client",
            "PUT",
            f"clients/{client_id}",
            200,
            data=update_data
        )
        if not success:
            return False
            
        # Delete client
        success, _ = self.run_test(
            "Delete Client",
            "DELETE",
            f"clients/{client_id}",
            200
        )
        return success

    def test_projects_crud(self):
        """Test projects CRUD operations"""
        # Create project
        project_data = {
            "name": "Test Project",
            "client_name": "Test Client",
            "service": "Sitio Web",
            "stage": "Design",
            "deadline": "2025-02-15",
            "notes": "Test project for API testing"
        }
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=project_data
        )
        
        if not success:
            return False
            
        project_id = response.get('id')
        if not project_id:
            print("❌ No project ID returned")
            return False
            
        # Get projects
        success, _ = self.run_test("Get Projects", "GET", "projects", 200)
        if not success:
            return False
            
        # Update project
        update_data = {"stage": "Dev", "notes": "Updated notes"}
        success, _ = self.run_test(
            "Update Project",
            "PUT",
            f"projects/{project_id}",
            200,
            data=update_data
        )
        if not success:
            return False
            
        # Delete project
        success, _ = self.run_test(
            "Delete Project",
            "DELETE",
            f"projects/{project_id}",
            200
        )
        return success

    def test_contact_form(self):
        """Test public contact form (no auth required)"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+506 1234-5678",
            "service": "Sitio Web",
            "message": "Test message from API testing"
        }
        
        # Temporarily remove token for public endpoint
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Contact Form",
            "POST",
            "contact",
            200,
            data=contact_data
        )
        
        # Restore token
        self.token = temp_token
        
        if success:
            print(f"   WhatsApp redirect: {response.get('whatsapp_redirect', 'Not provided')}")
        
        return success

def main():
    print("🚀 Starting Vértice Digital API Tests")
    print("=" * 50)
    
    tester = VerticeAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Admin Login", tester.test_login),
        ("Token Verification", tester.test_verify_token),
        ("Get Agents", tester.test_get_agents),
        ("AI Chat", tester.test_chat_functionality),
        ("Chat History", tester.test_chat_history),
        ("Clients CRUD", tester.test_clients_crud),
        ("Projects CRUD", tester.test_projects_crud),
        ("Contact Form", tester.test_contact_form),
    ]
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} tests...")
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            tester.failed_tests.append({
                "test": test_name,
                "error": str(e)
            })
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())