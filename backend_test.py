#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class PowerBIBackendTester:
    def __init__(self):
        self.base_url = "https://report-builder-114.preview.emergentagent.com/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_project_id = None
        self.test_page_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {name}")
            if details:
                print(f"   {details}")

    def test_root_endpoint(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            success = response.status_code == 200 and "Power BI" in response.text
            self.log_test("API Root Endpoint", success, 
                         f"Status: {response.status_code}, Response: {response.text[:100]}")
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Error: {str(e)}")
            return False

    def test_get_projects_empty(self):
        """Test getting projects (initially empty)"""
        try:
            response = requests.get(f"{self.base_url}/projects")
            success = response.status_code == 200
            if success:
                data = response.json()
                self.log_test("Get Projects (Initial)", success, 
                             f"Found {len(data)} projects")
            else:
                self.log_test("Get Projects (Initial)", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Projects (Initial)", False, f"Error: {str(e)}")
            return False

    def test_create_project(self):
        """Test creating a new project"""
        try:
            project_data = {
                "name": f"Test Project {datetime.now().strftime('%H%M%S')}",
                "description": "Automated test project"
            }
            response = requests.post(f"{self.base_url}/projects", json=project_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.test_project_id = data.get('id')
                # Should have one default page
                self.test_page_id = data.get('pages', [{}])[0].get('id') if data.get('pages') else None
                self.log_test("Create Project", success, 
                             f"Created project with ID: {self.test_project_id}")
            else:
                self.log_test("Create Project", success, 
                             f"Status: {response.status_code}, Response: {response.text}")
            return success
        except Exception as e:
            self.log_test("Create Project", False, f"Error: {str(e)}")
            return False

    def test_get_project_by_id(self):
        """Test getting a specific project"""
        if not self.test_project_id:
            self.log_test("Get Project by ID", False, "No project ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.log_test("Get Project by ID", success, 
                             f"Retrieved project: {data.get('name', 'Unknown')}")
            else:
                self.log_test("Get Project by ID", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Project by ID", False, f"Error: {str(e)}")
            return False

    def test_update_project(self):
        """Test updating a project"""
        if not self.test_project_id:
            self.log_test("Update Project", False, "No project ID available")
            return False
            
        try:
            update_data = {
                "name": "Updated Test Project",
                "description": "Updated description"
            }
            response = requests.put(f"{self.base_url}/projects/{self.test_project_id}", json=update_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.log_test("Update Project", success, 
                             f"Updated project name: {data.get('name', 'Unknown')}")
            else:
                self.log_test("Update Project", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Update Project", False, f"Error: {str(e)}")
            return False

    def test_add_page(self):
        """Test adding a new page to project"""
        if not self.test_project_id:
            self.log_test("Add Page", False, "No project ID available")
            return False
            
        try:
            page_data = {
                "name": "Test Page 2",
                "layout": "executive"
            }
            response = requests.post(f"{self.base_url}/projects/{self.test_project_id}/pages", json=page_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                pages_count = len(data.get('pages', []))
                self.log_test("Add Page", success, 
                             f"Project now has {pages_count} pages")
            else:
                self.log_test("Add Page", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Add Page", False, f"Error: {str(e)}")
            return False

    def test_update_page(self):
        """Test updating a page with components"""
        if not self.test_project_id or not self.test_page_id:
            self.log_test("Update Page", False, "No project/page ID available")
            return False
            
        try:
            # Add some components to the page
            components = [
                {
                    "id": "test-comp-1",
                    "type": "bar_chart",
                    "label": "Test Bar Chart",
                    "position": {"x": 50, "y": 50, "width": 300, "height": 200},
                    "style": {"backgroundColor": "#FFFFFF"},
                    "data": {}
                }
            ]
            
            annotations = [
                {
                    "id": "test-note-1",
                    "text": "Test annotation",
                    "position": {"x": 100, "y": 100, "width": 150, "height": 60},
                    "color": "#F59E0B"
                }
            ]
            
            page_data = {
                "name": "Updated Test Page",
                "components": components,
                "annotations": annotations
            }
            
            response = requests.put(f"{self.base_url}/projects/{self.test_project_id}/pages/{self.test_page_id}", 
                                   json=page_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                page = data.get('pages', [{}])[0]  # Get first page
                comp_count = len(page.get('components', []))
                ann_count = len(page.get('annotations', []))
                self.log_test("Update Page", success, 
                             f"Page has {comp_count} components and {ann_count} annotations")
            else:
                self.log_test("Update Page", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Update Page", False, f"Error: {str(e)}")
            return False

    def test_get_templates(self):
        """Test getting layout templates"""
        try:
            response = requests.get(f"{self.base_url}/templates")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                template_names = [t.get('name', 'Unknown') for t in data]
                self.log_test("Get Templates", success, 
                             f"Found {len(data)} templates: {', '.join(template_names)}")
            else:
                self.log_test("Get Templates", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Get Templates", False, f"Error: {str(e)}")
            return False

    def test_export_project(self):
        """Test exporting project as JSON"""
        if not self.test_project_id:
            self.log_test("Export Project", False, "No project ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/projects/{self.test_project_id}/export")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.log_test("Export Project", success, 
                             f"Export contains {len(data.get('pages', []))} pages")
            else:
                self.log_test("Export Project", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Export Project", False, f"Error: {str(e)}")
            return False

    def test_delete_page(self):
        """Test deleting a page (should fail if only one page)"""
        if not self.test_project_id:
            self.log_test("Delete Page (Validation)", False, "No project ID available")
            return False
            
        try:
            # First get current pages
            project_response = requests.get(f"{self.base_url}/projects/{self.test_project_id}")
            if project_response.status_code != 200:
                self.log_test("Delete Page (Validation)", False, "Could not get project")
                return False
                
            pages = project_response.json().get('pages', [])
            if len(pages) <= 1:
                # Should fail - can't delete last page
                if pages:
                    page_id = pages[0]['id']
                    response = requests.delete(f"{self.base_url}/projects/{self.test_project_id}/pages/{page_id}")
                    success = response.status_code == 400  # Should fail
                    self.log_test("Delete Page (Validation)", success, 
                                 "Correctly prevented deletion of last page")
                else:
                    self.log_test("Delete Page (Validation)", False, "No pages found")
                return success
            else:
                # Delete second page
                page_id = pages[1]['id']
                response = requests.delete(f"{self.base_url}/projects/{self.test_project_id}/pages/{page_id}")
                success = response.status_code == 200
                self.log_test("Delete Page", success, 
                             f"Status: {response.status_code}")
                return success
        except Exception as e:
            self.log_test("Delete Page (Validation)", False, f"Error: {str(e)}")
            return False

    def test_delete_project(self):
        """Test deleting the test project"""
        if not self.test_project_id:
            self.log_test("Delete Project", False, "No project ID available")
            return False
            
        try:
            response = requests.delete(f"{self.base_url}/projects/{self.test_project_id}")
            success = response.status_code == 200
            
            if success:
                self.log_test("Delete Project", success, "Project deleted successfully")
            else:
                self.log_test("Delete Project", success, 
                             f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Delete Project", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🧪 Starting Power BI Backend API Tests")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_get_projects_empty,
            self.test_create_project,
            self.test_get_project_by_id,
            self.test_update_project,
            self.test_add_page,
            self.test_update_page,
            self.test_get_templates,
            self.test_export_project,
            self.test_delete_page,
            self.test_delete_project,
        ]
        
        for test in tests:
            test()
            print()  # Add spacing between tests
        
        # Summary
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = PowerBIBackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)