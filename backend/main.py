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

class ImageAnalysisRequest(BaseModel):
    image: str  # Base64 encoded image with data URL prefix
    filename: Optional[str] = None
    user_message: Optional[str] = None
    user_id: Optional[str] = None

class ImageAnalysisResponse(BaseModel):
    response: str  # Only the LLM text response

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

def process_base64_image(image_data: str) -> Image.Image:
    """Process base64 image data and return PIL Image object"""
    # Handle data URL format (data:image/jpeg;base64,...)
    if image_data.startswith('data:'):
        header, encoded = image_data.split(',', 1)
        image_bytes = base64.b64decode(encoded)
    else:
        # Plain base64 string
        image_bytes = base64.b64decode(image_data)
    
    # Validate that it's a valid image
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify it's a valid image
        # Reopen for processing (verify() closes the image)
        image = Image.open(io.BytesIO(image_bytes))
        return image
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid image data or corrupted image"
        )

def query_llm(image: Image.Image, user_message: str = None) -> str:
    """Query the LLM with the processed image and return response"""
    # Get basic image information
    width, height = image.size
    format_type = image.format or "UNKNOWN"
    
    # TODO: Replace this with actual LLM integration (LangGraph, OpenAI, etc.)
    # For now, return a placeholder response
    response = f"I can see this is a {format_type} image with dimensions {width}x{height}."
    
    if user_message:
        response += f" Regarding your question '{user_message}': This is where the LLM would provide detailed analysis based on the image content."
    else:
        response += " This image has been successfully processed and analyzed."
    
    return response

@app.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(request: ImageAnalysisRequest):
    """
    Main endpoint that handles image analysis and LLM querying.
    Manages chat history and returns only the LLM response text.
    """
    try:
        # Get or create user ID
        user_id = request.user_id
        if not user_id or user_id not in chat_history:
            user_id = str(uuid.uuid4())
            chat_history[user_id] = []
        
        # Process the image
        image = process_base64_image(request.image)
        
        # Query the LLM
        llm_response = query_llm(image, request.user_message)
        
        # Add user message to chat history if provided
        if request.user_message:
            add_message_to_history(
                user_id=user_id,
                message_type="text",
                content=request.user_message
            )
        
        # Add image message to chat history
        add_message_to_history(
            user_id=user_id,
            message_type="image",
            content=f"Uploaded image: {request.filename or 'unknown.jpg'}",
            image_data=None,  # Don't store full image data
            analysis={"width": image.size[0], "height": image.size[1], "format": image.format}
        )
        
        # Add LLM response to chat history
        add_message_to_history(
            user_id=user_id,
            message_type="response",
            content=llm_response
        )
        
        return ImageAnalysisResponse(response=llm_response)
        
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

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )