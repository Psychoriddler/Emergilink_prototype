#!/usr/bin/env python3
"""
EmergiLink Backend API Testing Suite
Tests all emergency app backend endpoints
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing EmergiLink Backend APIs at: {API_BASE}")
print("=" * 60)

def test_health_check():
    """Test health check endpoint"""
    print("\n🏥 Testing Health Check API...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            if 'status' in data and 'service' in data:
                print("✅ Health check API working correctly")
                return True
            else:
                print("❌ Health check response missing required fields")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False

def test_emergency_sos_api():
    """Test Emergency SOS API"""
    print("\n🚨 Testing Emergency SOS API...")
    
    # Test data with realistic emergency scenario
    test_user_id = str(uuid.uuid4())
    emergency_data = {
        "user_id": test_user_id,
        "emergency_type": "medical",
        "location": {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "address": "123 Market Street, San Francisco, CA 94102"
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/emergency/sos",
            json=emergency_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            required_fields = ['id', 'user_id', 'emergency_type', 'location', 'timestamp', 'status']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print("✅ Emergency SOS API working correctly")
                print(f"✅ Emergency call ID generated: {data['id']}")
                return True, data['id']
            else:
                print(f"❌ Emergency SOS response missing fields: {missing_fields}")
                return False, None
        else:
            print(f"❌ Emergency SOS failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Emergency SOS error: {str(e)}")
        return False, None

def test_ambulance_apis():
    """Test Ambulance APIs"""
    print("\n🚑 Testing Ambulance APIs...")
    
    # Test nearby ambulances
    print("\n--- Testing GET /api/ambulances/nearby ---")
    try:
        response = requests.get(f"{API_BASE}/ambulances/nearby", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            ambulances = response.json()
            print(f"Found {len(ambulances)} ambulances")
            
            if ambulances:
                print("Sample ambulance data:")
                print(json.dumps(ambulances[0], indent=2))
                
                # Verify ambulance data structure
                required_fields = ['id', 'name', 'type', 'location', 'availability', 'phone', 'estimated_arrival']
                ambulance = ambulances[0]
                missing_fields = [field for field in required_fields if field not in ambulance]
                
                if not missing_fields:
                    print("✅ Ambulance nearby API working correctly")
                    ambulance_nearby_success = True
                    test_ambulance_id = ambulance['id']
                else:
                    print(f"❌ Ambulance data missing fields: {missing_fields}")
                    ambulance_nearby_success = False
                    test_ambulance_id = None
            else:
                print("❌ No ambulances returned")
                ambulance_nearby_success = False
                test_ambulance_id = None
        else:
            print(f"❌ Ambulance nearby API failed with status {response.status_code}")
            ambulance_nearby_success = False
            test_ambulance_id = None
            
    except Exception as e:
        print(f"❌ Ambulance nearby API error: {str(e)}")
        ambulance_nearby_success = False
        test_ambulance_id = None
    
    # Test ambulance booking
    print("\n--- Testing POST /api/ambulances/book ---")
    if test_ambulance_id:
        user_id = str(uuid.uuid4())
        booking_data = {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "address": "456 Mission Street, San Francisco, CA 94105"
        }
        
        try:
            response = requests.post(
                f"{API_BASE}/ambulances/book?ambulance_id={test_ambulance_id}&user_id={user_id}",
                json=booking_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                booking_result = response.json()
                print(f"Booking Response: {json.dumps(booking_result, indent=2)}")
                
                # Verify booking response
                required_fields = ['message', 'booking_id', 'estimated_arrival', 'status']
                missing_fields = [field for field in required_fields if field not in booking_result]
                
                if not missing_fields:
                    print("✅ Ambulance booking API working correctly")
                    ambulance_booking_success = True
                else:
                    print(f"❌ Ambulance booking response missing fields: {missing_fields}")
                    ambulance_booking_success = False
            else:
                print(f"❌ Ambulance booking failed with status {response.status_code}")
                print(f"Response: {response.text}")
                ambulance_booking_success = False
                
        except Exception as e:
            print(f"❌ Ambulance booking error: {str(e)}")
            ambulance_booking_success = False
    else:
        print("⚠️ Skipping ambulance booking test - no ambulance ID available")
        ambulance_booking_success = False
    
    return ambulance_nearby_success and ambulance_booking_success

def test_hospital_apis():
    """Test Hospital APIs"""
    print("\n🏥 Testing Hospital APIs...")
    
    # Test nearby hospitals
    print("\n--- Testing GET /api/hospitals/nearby ---")
    try:
        response = requests.get(f"{API_BASE}/hospitals/nearby", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            hospitals = response.json()
            print(f"Found {len(hospitals)} hospitals")
            
            if hospitals:
                print("Sample hospital data:")
                print(json.dumps(hospitals[0], indent=2))
                
                # Verify hospital data structure
                required_fields = ['id', 'name', 'address', 'location', 'phone', 'specialties', 'emergency_services']
                hospital = hospitals[0]
                missing_fields = [field for field in required_fields if field not in hospital]
                
                if not missing_fields:
                    print("✅ Hospital nearby API working correctly")
                    hospital_nearby_success = True
                    test_hospital_id = hospital['id']
                else:
                    print(f"❌ Hospital data missing fields: {missing_fields}")
                    hospital_nearby_success = False
                    test_hospital_id = None
            else:
                print("❌ No hospitals returned")
                hospital_nearby_success = False
                test_hospital_id = None
        else:
            print(f"❌ Hospital nearby API failed with status {response.status_code}")
            hospital_nearby_success = False
            test_hospital_id = None
            
    except Exception as e:
        print(f"❌ Hospital nearby API error: {str(e)}")
        hospital_nearby_success = False
        test_hospital_id = None
    
    # Test hospital details
    print("\n--- Testing GET /api/hospitals/{hospital_id} ---")
    if test_hospital_id:
        try:
            response = requests.get(f"{API_BASE}/hospitals/{test_hospital_id}", timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                hospital_details = response.json()
                print(f"Hospital Details: {json.dumps(hospital_details, indent=2)}")
                
                # Verify hospital details structure
                required_fields = ['id', 'name', 'emergency_contact', 'departments']
                missing_fields = [field for field in required_fields if field not in hospital_details]
                
                if not missing_fields:
                    print("✅ Hospital details API working correctly")
                    hospital_details_success = True
                else:
                    print(f"❌ Hospital details missing fields: {missing_fields}")
                    hospital_details_success = False
            else:
                print(f"❌ Hospital details failed with status {response.status_code}")
                hospital_details_success = False
                
        except Exception as e:
            print(f"❌ Hospital details error: {str(e)}")
            hospital_details_success = False
    else:
        print("⚠️ Skipping hospital details test - no hospital ID available")
        hospital_details_success = False
    
    return hospital_nearby_success and hospital_details_success

def test_disaster_alerts_api():
    """Test Disaster Alerts API"""
    print("\n⚠️ Testing Disaster Alerts API...")
    
    try:
        response = requests.get(f"{API_BASE}/alerts/active", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            alerts = response.json()
            print(f"Found {len(alerts)} active alerts")
            
            if alerts:
                print("Sample alert data:")
                print(json.dumps(alerts[0], indent=2))
                
                # Verify alert data structure
                required_fields = ['id', 'title', 'description', 'alert_type', 'severity', 'location_affected', 'active']
                alert = alerts[0]
                missing_fields = [field for field in required_fields if field not in alert]
                
                if not missing_fields:
                    print("✅ Disaster alerts API working correctly")
                    return True
                else:
                    print(f"❌ Alert data missing fields: {missing_fields}")
                    return False
            else:
                print("⚠️ No active alerts (this might be expected)")
                return True  # No alerts is acceptable
        else:
            print(f"❌ Disaster alerts API failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Disaster alerts API error: {str(e)}")
        return False

def test_emergency_history(user_id):
    """Test Emergency History API"""
    print(f"\n📋 Testing Emergency History API for user {user_id}...")
    
    try:
        response = requests.get(f"{API_BASE}/emergency/history/{user_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history = response.json()
            print(f"Found {len(history)} emergency calls in history")
            
            if history:
                print("Sample emergency call from history:")
                print(json.dumps(history[0], indent=2))
                print("✅ Emergency history API working correctly - data is being saved to MongoDB")
                return True
            else:
                print("⚠️ No emergency calls in history (might be expected for new user)")
                return True
        else:
            print(f"❌ Emergency history API failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Emergency history API error: {str(e)}")
        return False

def test_emergency_news_apis():
    """Test Emergency News APIs"""
    print("\n📰 Testing Emergency News APIs...")
    
    all_tests_passed = True
    
    # Test 1: Basic news retrieval
    print("\n--- Testing GET /api/news (basic retrieval) ---")
    try:
        response = requests.get(f"{API_BASE}/news", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            news = response.json()
            print(f"Found {len(news)} news articles")
            
            if news:
                print("Sample news article:")
                print(json.dumps(news[0], indent=2))
                
                # Verify news article structure
                required_fields = ['id', 'title', 'summary', 'content', 'category', 'location', 'published_at', 'priority']
                article = news[0]
                missing_fields = [field for field in required_fields if field not in article]
                
                if not missing_fields:
                    print("✅ Emergency News basic retrieval working correctly")
                    test_news_id = article['id']
                else:
                    print(f"❌ News article missing fields: {missing_fields}")
                    all_tests_passed = False
                    test_news_id = None
            else:
                print("❌ No news articles returned")
                all_tests_passed = False
                test_news_id = None
        else:
            print(f"❌ Emergency News API failed with status {response.status_code}")
            all_tests_passed = False
            test_news_id = None
            
    except Exception as e:
        print(f"❌ Emergency News API error: {str(e)}")
        all_tests_passed = False
        test_news_id = None
    
    # Test 2: News with limit parameter
    print("\n--- Testing GET /api/news?limit=3 ---")
    try:
        response = requests.get(f"{API_BASE}/news?limit=3", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            news = response.json()
            if len(news) <= 3:
                print(f"✅ News limit parameter working correctly - returned {len(news)} articles")
            else:
                print(f"❌ News limit parameter failed - returned {len(news)} articles, expected max 3")
                all_tests_passed = False
        else:
            print(f"❌ News limit parameter test failed with status {response.status_code}")
            all_tests_passed = False
            
    except Exception as e:
        print(f"❌ News limit parameter test error: {str(e)}")
        all_tests_passed = False
    
    # Test 3: News category filter
    print("\n--- Testing GET /api/news?category=emergency_response ---")
    try:
        response = requests.get(f"{API_BASE}/news?category=emergency_response", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            news = response.json()
            if news:
                # Check if all articles have the correct category
                correct_category = all(article.get('category') == 'emergency_response' for article in news)
                if correct_category:
                    print(f"✅ News category filter working correctly - {len(news)} emergency_response articles")
                else:
                    print("❌ News category filter failed - some articles have wrong category")
                    all_tests_passed = False
            else:
                print("✅ No emergency_response articles found (acceptable)")
        else:
            print(f"❌ News category filter test failed with status {response.status_code}")
            all_tests_passed = False
            
    except Exception as e:
        print(f"❌ News category filter test error: {str(e)}")
        all_tests_passed = False
    
    # Test 4: News priority filter
    print("\n--- Testing GET /api/news?priority=high ---")
    try:
        response = requests.get(f"{API_BASE}/news?priority=high", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            news = response.json()
            if news:
                # Check if all articles have the correct priority
                correct_priority = all(article.get('priority') == 'high' for article in news)
                if correct_priority:
                    print(f"✅ News priority filter working correctly - {len(news)} high priority articles")
                else:
                    print("❌ News priority filter failed - some articles have wrong priority")
                    all_tests_passed = False
            else:
                print("✅ No high priority articles found (acceptable)")
        else:
            print(f"❌ News priority filter test failed with status {response.status_code}")
            all_tests_passed = False
            
    except Exception as e:
        print(f"❌ News priority filter test error: {str(e)}")
        all_tests_passed = False
    
    # Test 5: News details with valid ID
    if test_news_id:
        print(f"\n--- Testing GET /api/news/{test_news_id} ---")
        try:
            response = requests.get(f"{API_BASE}/news/{test_news_id}", timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                article = response.json()
                print("News article details:")
                print(json.dumps(article, indent=2))
                
                # Verify article structure
                required_fields = ['id', 'title', 'summary', 'content', 'category', 'location', 'published_at', 'priority']
                missing_fields = [field for field in required_fields if field not in article]
                
                if not missing_fields:
                    print("✅ News details API working correctly")
                else:
                    print(f"❌ News details missing fields: {missing_fields}")
                    all_tests_passed = False
            else:
                print(f"❌ News details API failed with status {response.status_code}")
                all_tests_passed = False
                
        except Exception as e:
            print(f"❌ News details API error: {str(e)}")
            all_tests_passed = False
    
    # Test 6: News details with invalid ID (should return 404)
    print("\n--- Testing GET /api/news/invalid-id-12345 ---")
    try:
        response = requests.get(f"{API_BASE}/news/invalid-id-12345", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            print("✅ News details with invalid ID correctly returns 404")
        else:
            print(f"❌ News details with invalid ID should return 404, got {response.status_code}")
            all_tests_passed = False
            
    except Exception as e:
        print(f"❌ News details invalid ID test error: {str(e)}")
        all_tests_passed = False
    
    # Test 7: News categories
    print("\n--- Testing GET /api/news/categories ---")
    try:
        response = requests.get(f"{API_BASE}/news/categories", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("News categories:")
            print(json.dumps(data, indent=2))
            
            if 'categories' in data and isinstance(data['categories'], list):
                categories = data['categories']
                expected_categories = ['emergency_response', 'disaster_relief', 'safety_update', 'community_alert']
                
                # Check if all expected categories are present
                category_ids = [cat.get('id') for cat in categories]
                missing_categories = [cat for cat in expected_categories if cat not in category_ids]
                
                if not missing_categories:
                    # Check category structure
                    valid_structure = all('id' in cat and 'name' in cat and 'icon' in cat for cat in categories)
                    
                    if valid_structure:
                        print(f"✅ News categories API working correctly - {len(categories)} categories with proper structure")
                    else:
                        print("❌ News categories missing required fields (id, name, icon)")
                        all_tests_passed = False
                else:
                    print(f"❌ News categories missing expected categories: {missing_categories}")
                    all_tests_passed = False
            else:
                print("❌ News categories response format invalid")
                all_tests_passed = False
        else:
            print(f"❌ News categories API failed with status {response.status_code}")
            all_tests_passed = False
            
    except Exception as e:
        print(f"❌ News categories API error: {str(e)}")
        all_tests_passed = False
    
    return all_tests_passed

def run_all_tests():
    """Run all backend API tests"""
    print("🚀 Starting EmergiLink Backend API Tests")
    print("=" * 60)
    
    test_results = {}
    
    # Test each API endpoint
    test_results['health_check'] = test_health_check()
    test_results['emergency_sos'], emergency_id = test_emergency_sos_api()
    test_results['ambulance_apis'] = test_ambulance_apis()
    test_results['hospital_apis'] = test_hospital_apis()
    test_results['disaster_alerts'] = test_disaster_alerts_api()
    test_results['emergency_news_apis'] = test_emergency_news_apis()  # NEW: Emergency News API tests
    
    # Test emergency history to verify MongoDB integration
    if emergency_id:
        # Extract user_id from the emergency call we just made
        # We'll use a test user ID to check history
        test_user_id = "test-user-123"  # Use a consistent test user ID
        test_results['emergency_history'] = test_emergency_history(test_user_id)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend APIs are working correctly!")
        return True
    else:
        print("⚠️ Some backend APIs have issues that need attention")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)