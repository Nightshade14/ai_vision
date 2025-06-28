from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from PIL import Image
import io
import base64
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import json

app = FastAPI(
    title="AI Vision API",
    description="API for image reasoning and analysis",
    version="1.0.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supported image formats
SUPPORTED_FORMATS = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"}

# In-memory storage for chat history (in production, use a database)
chat_history: Dict[str, List[Dict[str, Any]]] = {}

# Pydantic models for request/response
class ChatMessage(BaseModel):
    message_id: str
    user_id: str
    message_type: str  # "image", "text", "response"
    content: str
    image_data: Optional[str] = None
    timestamp: datetime
    analysis: Optional[Dict[str, Any]] = None

class ChatHistoryResponse(BaseModel):
    user_id: str
    messages: List[ChatMessage]
    total_messages: int

class UserCreateRequest(BaseModel):
    user_name: Optional[str] = None

def get_or_create_user_id(user_id: Optional[str] = Header(None, alias="X-User-ID")) -> str:
    """Get user ID from header or create a new one"""
    if user_id and user_id in chat_history:
        return user_id
    
    # Create new user ID
    new_user_id = str(uuid.uuid4())
    chat_history[new_user_id] = []
    return new_user_id

def add_message_to_history(user_id: str, message_type: str, content: str, 
                          image_data: Optional[str] = None, 
                          analysis: Optional[Dict[str, Any]] = None) -> str:
    """Add a message to user's chat history"""
    message_id = str(uuid.uuid4())
    message = {
        "message_id": message_id,
        "user_id": user_id,
        "message_type": message_type,
        "content": content,
        "image_data": image_data,
        "timestamp": datetime.now().isoformat(),
        "analysis": analysis
    }
    
    if user_id not in chat_history:
        chat_history[user_id] = []
    
    chat_history[user_id].append(message)
    return message_id

@app.get("/")
async def root():
    """Root endpoint to check if the API is running"""
    return {"message": "AI Vision API is running", "status": "healthy"}

@app.post("/reason")
async def reason_about_image(file: UploadFile = File(...), user_id: str = Depends(get_or_create_user_id)):
    """
    Endpoint that accepts an image and returns reasoning/analysis about it.
    Also stores the interaction in chat history.
    
    Args:
        file: The uploaded image file
        user_id: User ID from header or newly created
        
    Returns:
        JSON response with image analysis and updated chat history
    """
    try:
        # Validate file type
        if file.content_type not in SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Supported formats: {', '.join(SUPPORTED_FORMATS)}"
            )
        
        # Read the image file
        image_data = await file.read()
        
        # Validate that it's a valid image
        try:
            image = Image.open(io.BytesIO(image_data))
            image.verify()  # Verify it's a valid image
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file or corrupted image data"
            )
        
        # Reopen the image for processing (verify() closes the image)
        image = Image.open(io.BytesIO(image_data))
        
        # Get basic image information
        width, height = image.size
        format_type = image.format
        mode = image.mode
        
        # Convert image to base64 for storage
        buffered = io.BytesIO()
        image.save(buffered, format=format_type)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # TODO: This is where you would integrate with an AI model
        # For now, we'll return basic image analysis
        reasoning = {
            "basic_analysis": {
                "width": width,
                "height": height,
                "format": format_type,
                "mode": mode,
                "size_bytes": len(image_data),
                "aspect_ratio": round(width / height, 2)
            },
            "description": f"This is a {width}x{height} {format_type} image in {mode} mode.",
            "reasoning": "Image successfully processed. Ready for AI model integration.",
        }
        
        # Add image message to chat history
        image_message_id = add_message_to_history(
            user_id=user_id,
            message_type="image",
            content=f"Uploaded image: {file.filename}",
            image_data=img_base64,
            analysis=reasoning
        )
        
        # Add AI response to chat history
        ai_response = f"I can see this is a {format_type} image with dimensions {width}x{height}. {reasoning['reasoning']}"
        response_message_id = add_message_to_history(
            user_id=user_id,
            message_type="response",
            content=ai_response,
            analysis=reasoning
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "user_id": user_id,
                "filename": file.filename,
                "image_message_id": image_message_id,
                "response_message_id": response_message_id,
                "analysis": reasoning,
                "ai_response": ai_response,
                "message": "Image processed successfully and added to chat history"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Vision API"}

@app.post("/users")
async def create_user(request: UserCreateRequest):
    """Create a new user and return user ID"""
    user_id = str(uuid.uuid4())
    chat_history[user_id] = []
    
    # Add welcome message
    add_message_to_history(
        user_id=user_id,
        message_type="system",
        content=f"Welcome {request.user_name or 'User'}! You can upload images for analysis."
    )
    
    return {
        "user_id": user_id,
        "user_name": request.user_name,
        "message": "User created successfully"
    }

@app.get("/users/{user_id}/history")
async def get_chat_history(user_id: str, limit: int = 50, offset: int = 0):
    """Get chat history for a specific user"""
    if user_id not in chat_history:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_messages = chat_history[user_id]
    total_messages = len(user_messages)
    
    # Apply pagination
    paginated_messages = user_messages[offset:offset + limit]
    
    return {
        "user_id": user_id,
        "messages": paginated_messages,
        "total_messages": total_messages,
        "offset": offset,
        "limit": limit,
        "has_more": offset + limit < total_messages
    }

@app.delete("/users/{user_id}/history")
async def clear_chat_history(user_id: str):
    """Clear chat history for a specific user"""
    if user_id not in chat_history:
        raise HTTPException(status_code=404, detail="User not found")
    
    chat_history[user_id] = []
    
    return {
        "user_id": user_id,
        "message": "Chat history cleared successfully"
    }

@app.get("/users/{user_id}/history/{message_id}")
async def get_message(user_id: str, message_id: str):
    """Get a specific message by ID"""
    if user_id not in chat_history:
        raise HTTPException(status_code=404, detail="User not found")
    
    for message in chat_history[user_id]:
        if message["message_id"] == message_id:
            return message
    
    raise HTTPException(status_code=404, detail="Message not found")

@app.post("/users/{user_id}/messages")
async def add_text_message(user_id: str, message: dict):
    """Add a text message to user's chat history"""
    if user_id not in chat_history:
        raise HTTPException(status_code=404, detail="User not found")
    
    content = message.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Message content is required")
    
    message_id = add_message_to_history(
        user_id=user_id,
        message_type="text",
        content=content
    )
    
    return {
        "message_id": message_id,
        "user_id": user_id,
        "content": content,
        "message": "Text message added successfully"
    }

@app.get("/users")
async def list_users():
    """List all users (for development/debugging purposes)"""
    users = []
    for user_id, messages in chat_history.items():
        users.append({
            "user_id": user_id,
            "message_count": len(messages),
            "last_activity": messages[-1]["timestamp"] if messages else None
        })
    
    return {
        "users": users,
        "total_users": len(users)
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )