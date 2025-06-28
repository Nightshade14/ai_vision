# AI Vision Backend

A FastAPI server that provides image analysis and reasoning capabilities.

## Features

- **Image Upload**: Accept images in various formats (JPEG, PNG, GIF, BMP, WebP)
- **Image Analysis**: Basic image processing and analysis
- **Chat History**: Maintain conversation history for each user
- **User Management**: Create and manage user sessions
- **CORS Support**: Configured for frontend integration
- **Health Checks**: Built-in health monitoring endpoints

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST /reason
Upload an image and get analysis/reasoning about it. Automatically maintains chat history.

**Headers:**
- `X-User-ID`: Optional user ID. If not provided, a new user will be created.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Image file

**Response:**
```json
{
  "success": true,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "example.jpg",
  "image_message_id": "msg-123",
  "response_message_id": "msg-124",
  "analysis": {
    "basic_analysis": {
      "width": 1920,
      "height": 1080,
      "format": "JPEG",
      "mode": "RGB",
      "size_bytes": 245760,
      "aspect_ratio": 1.78
    },
    "description": "This is a 1920x1080 JPEG image in RGB mode.",
    "reasoning": "Image successfully processed. Ready for AI model integration."
  },
  "ai_response": "I can see this is a JPEG image with dimensions 1920x1080...",
  "message": "Image processed successfully and added to chat history"
}
```

### POST /users
Create a new user session.

**Request:**
```json
{
  "user_name": "John Doe"
}
```

**Response:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_name": "John Doe",
  "message": "User created successfully"
}
```

### GET /users/{user_id}/history
Get chat history for a specific user.

**Query Parameters:**
- `limit`: Number of messages to return (default: 50)
- `offset`: Number of messages to skip (default: 0)

**Response:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "messages": [
    {
      "message_id": "msg-123",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "message_type": "image",
      "content": "Uploaded image: example.jpg",
      "image_data": "base64_encoded_image...",
      "timestamp": "2025-06-28T10:30:00",
      "analysis": {...}
    }
  ],
  "total_messages": 10,
  "offset": 0,
  "limit": 50,
  "has_more": false
}
```

### POST /users/{user_id}/messages
Add a text message to user's chat history.

**Request:**
```json
{
  "content": "Hello, can you analyze this image?"
}
```

### DELETE /users/{user_id}/history
Clear chat history for a specific user.

### GET /users/{user_id}/history/{message_id}
Get a specific message by ID.

### GET /users
List all users (for development purposes).

### GET /
Root endpoint to check if the API is running.

### GET /health
Health check endpoint.

## Usage Examples

### Upload an image with chat history
```bash
# Create a new user first
curl -X POST "http://localhost:8000/users" \
     -H "Content-Type: application/json" \
     -d '{"user_name": "John Doe"}'

# Upload an image (use the user_id from the previous response)
curl -X POST "http://localhost:8000/reason" \
     -H "accept: application/json" \
     -H "X-User-ID: your-user-id-here" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@path/to/your/image.jpg"

# Get chat history
curl -X GET "http://localhost:8000/users/your-user-id-here/history" \
     -H "accept: application/json"

# Add a text message
curl -X POST "http://localhost:8000/users/your-user-id-here/messages" \
     -H "Content-Type: application/json" \
     -d '{"content": "Can you tell me more about this image?"}'
```

## Development

The server runs with auto-reload enabled during development. Any changes to the code will automatically restart the server.

## Next Steps

- Integrate with AI models (OpenAI GPT-4 Vision, Google Vision API, etc.)
- Add authentication and rate limiting
- Implement more sophisticated image analysis
- Add database storage for analysis results
