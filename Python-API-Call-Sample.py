import requests
import json
import time

# API Base URL
BASE_URL = "https://api.usfarmdataservice.com"  # Replace with your actual API URL

def authenticate(username, password):
    """Get authentication token from API"""
    response = requests.post(
        f"{BASE_URL}/token",
        data={"username": username, "password": password}
    )
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Authentication failed: {response.text}")
        return None

def upload_criteria(token, customer_id, gls, criteria_data):
    """Upload criteria data to API"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        f"{BASE_URL}/upload_criteria?customerid={customer_id}&GLS={gls}",
        headers=headers,
        json=criteria_data
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Upload failed: {response.text}")
        return None

def check_status(token, request_id):
    """Check status of a request"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/get_status/{request_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Status check failed: {response.text}")
        return None

def get_response(token, request_id):
    """Get response data for a completed request"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(
        f"{BASE_URL}/get_response/{request_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Getting response failed: {response.text}")
        return None

def main():
    # Your credentials
    username = "your_username"
    password = "your_password"
    customer_id = "your_customer_id"
    gls = "your_gls_identifier"
    
    # Sample criteria data
    criteria_data = {
        "geo": {
            "zip_no": 23330,
            "City_no": 20085,
            "county_code": 2706,
            "STATE": "IL"
        },
        "crops": {
            "CORNF": True,
            "SOYBEANF": True,
            "WHEATF": False
        },
        "livestocks": {
            "GOATSF": False,
            "CATTLEF": True,
            "CATTLEHEAD": "251 to 500",
            "GOATSHEAD": None
        },
        "acreage": {
            "CORNACRE": "E",
            "WHEATACRE": None,
            "SOYBEANACRE": "C",
            "TOTACRES": "F"
        }
    }
    
    # Step 1: Authenticate and get token
    print("Authenticating...")
    token = authenticate(username, password)
    if not token:
        return
    print("Authentication successful!")
    
    # Step 2: Upload criteria
    print("Uploading criteria...")
    upload_result = upload_criteria(token, customer_id, gls, criteria_data)
    if not upload_result:
        return
    
    request_id = upload_result["request_id"]
    print(f"Upload successful! Request ID: {request_id}")
    
    # Step 3: Check status periodically until completed
    print("Checking status...")
    max_attempts = 10
    wait_seconds = 30
    
    for attempt in range(max_attempts):
        status_result = check_status(token, request_id)
        if not status_result:
            return
        
        current_status = status_result["status"]
        print(f"Current status: {current_status} - {status_result['message']}")
        
        if current_status == "completed":
            break
        elif current_status in ["error", "hold"]:
            print("Request cannot be processed. Please contact support.")
            return
            
        if attempt < max_attempts - 1:
            print(f"Waiting {wait_seconds} seconds before cCahecking again...")
            time.sleep(wait_seconds)
    
    # Step 4: Get response if completed
    if current_status == "completed":
        print("Retrieving response data...")
        response_data = get_response(token, request_id)
        if not response_data:
            return
        
        # If there's an error message in the response
        if "error" in response_data and "status" in response_data:
            print(f"Error: {response_data['error']}")
            print(f"Message: {response_data['message']}")
            return
            
        # Process response data
        print(f"Retrieved response successfully!")
        print(f"Result summary: {json.dumps(response_data, indent=2)[:200]}...")
        
        # Save the response to a file
        with open(f"response_{request_id}.json", "w") as f:
            json.dump(response_data, f, indent=4)
        print(f"Complete response saved to response_{request_id}.json")
    else:
        print(f"Request did not complete within the expected time. Current status: {current_status}")

if __name__ == "__main__":
    main()