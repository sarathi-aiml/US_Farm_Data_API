# Define variables
API_URL="https://api.usfarmdataservice.com"
USERNAME="your_username"
PASSWORD="your_password"
CUSTOMER_ID="your_customer_id"
GLS="your_gls_identifier"

# Step 1: Authenticate and get token
TOKEN=$(curl -s -X POST "${API_URL}/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${USERNAME}&password=${PASSWORD}" | jq -r '.access_token')

echo "Auth Token: ${TOKEN}"

# Step 2: Upload criteria
REQUEST_ID=$(curl -s -X POST "${API_URL}/upload_criteria?customerid=${CUSTOMER_ID}&GLS=${GLS}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "geo": {
      "zip_no": 23330,
      "City_no": 20085,
      "county_code": 2706,
      "STATE": "IL"
    },
    "crops": {
      "CORNF": true,
      "SOYBEANF": true,
      "WHEATF": false
    },
    "livestocks": {
      "GOATSF": false,
      "CATTLEF": true,
      "CATTLEHEAD": "251 to 500",
      "GOATSHEAD": null
    },
    "acreage": {
      "CORNACRE": "E",
      "WHEATACRE": null,
      "SOYBEANACRE": "C",
      "TOTACRES": "F"
    }
  }' | jq -r '.request_id')

echo "Request ID: ${REQUEST_ID}"

# Step 3: Check status
curl -s -X GET "${API_URL}/get_status/${REQUEST_ID}" \
  -H "Authorization: Bearer ${TOKEN}" | jq .

# Step 4: Get response (once status is "completed")
curl -s -X GET "${API_URL}/get_response/${REQUEST_ID}" \
  -H "Authorization: Bearer ${TOKEN}" > response_${REQUEST_ID}.json

echo "Response saved to response_${REQUEST_ID}.json"