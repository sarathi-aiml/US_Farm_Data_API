# US Farm Data API Documentation
https://USFD-API.USFarmData.org:8082

(Private and IP Restricted, Contact US Farm Data for Access to this API endpoint)



## Overview

The US Farm Data API allows authenticated users to upload criteria JSON and retrieve results as JSON (Available number of farmers and ranchers by US State) . The API supports uploading structured data about geographic locations, crops, livestock, and acreage information.

- **API Version:** 1.0.0

## Authentication

The API uses OAuth2 with Bearer token authentication. All API calls (except the login endpoint) require a valid JWT token in the Authorization header.

### Obtaining a Token

```
POST /token
```

**Request Body:**
```
{
  "username": "your_username",
  "password": "your_password"
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Incorrect username or password"
}
```

**Note:** The token is valid for 24 hours. After expiration, you'll need to request a new token.

## Endpoints

### 1. Upload Criteria

```
POST /upload_criteria
```

This endpoint allows you to upload criteria JSON data for processing.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `customerid` (string, required): Your customer ID
- `GLS` (string, required): The GLS identifier

**Request Body:**
A JSON object with the following structure:

```json
{
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
}
```

**Success Response (200 OK):**
```json
{
  "message": "Criteria uploaded successfully",
  "request_id": "22810f58-dc91-4efb-9297-0f60d9172d68",
  "timestamp": "20250308210520"
}
```

**Error Responses:**
- 400 Bad Request: If customerid or GLS is missing or invalid
- 401 Unauthorized: If authentication token is missing or invalid
- 500 Internal Server Error: For server-side errors

### 2. Check Request Status

```
GET /get_status/{request_id}
```

This endpoint allows you to check the status of a previously submitted criteria upload request.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `request_id` (string, required): The unique request ID returned from the upload_criteria endpoint

**Success Response (200 OK):**
```json
{
  "request_id": "22810f58-dc91-4efb-9297-0f60d9172d68",
  "customer_id": "09754",
  "status": "completed",
  "message": "Your request has been processed successfully. You can now download the response.",
  "can_download": true
}
```

**Possible Status Values:**
- `pending`: Request is in the queue waiting to be processed
- `in_process`: Request is currently being processed by the backend
- `completed`: Processing finished successfully, response is ready for download
- `error`: There was an error processing the request
- `hold`: Request needs additional information, contact farm data admin

**Error Responses:**
- 401 Unauthorized: If authentication token is missing or invalid
- 404 Not Found: If the request ID does not exist
- 500 Internal Server Error: For server-side errors

### 3. Get Response

```
GET /get_response/{request_id}
```

This endpoint allows you to download the response JSON for a completed request.

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `request_id` (string, required): The unique request ID returned from the upload_criteria endpoint

**Success Response (200 OK) - When Status is "completed":**
```json
{
  "results": {
    "matched_records": 156,
    "data": [
      // The complete response data will be returned here
    ]
  }
}
```

**Response - When Status is Not "completed":**
```json
{
  "request_id": "22810f58-dc91-4efb-9297-0f60d9172d68",
  "status": "pending",
  "error": "Response data is not available yet. The request must be in 'completed' status to download the response.",
  "message": "Please check the status of your request using the get_status endpoint."
}
```

**Error Responses:**
- 401 Unauthorized: If authentication token is missing or invalid
- 404 Not Found: If the request ID does not exist
- 500 Internal Server Error: For server-side errors

### 4. Get Current User

```
GET /users/me
```

This endpoint allows you to verify your authentication and get your username.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
  "username": "your_username"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Invalid authentication credentials"
}
```

## Typical Workflow

1. Authenticate using the `/token` endpoint to get an access token
2. Upload criteria data using the `/upload_criteria` endpoint
3. Use the request ID from the upload response to check status with `/get_status/{request_id}`
4. Once the status is "completed", retrieve the results with `/get_response/{request_id}`

For assistance with the API, please contact the US Farm Data support team. at www.USFarmData.com
