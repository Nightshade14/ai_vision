from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from PIL import Image
import base64
import io
import uuid

app = FastAPI(
    title="AI Vision API",
    description="API for image reasoning and analysis",
    version="1.0.0"
)

# Allow frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supported formats
SUPPORTED_FORMATS = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"}

# In-memory history (replace with DB in production)
chat_history: Dict[str, List[Dict[str, Any]]] = {}

# Response model
class ImageAnalysisResponse(BaseModel):
    response: str

@app.get("/")
async def root():
    return {"message": "AI Vision API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Vision API"}

def process_base64_image(image_data: str) -> Image.Image:
    """Convert base64 string to a PIL image."""
    try:
        if image_data.startswith("data:"):
            _, encoded = image_data.split(",", 1)
        else:
            encoded = image_data
        image_bytes = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
        return Image.open(io.BytesIO(image_bytes))  # Reopen for usage
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

def query_llm(image: Image.Image, user_message: str = "") -> str:
    """Mock AI response generator"""
    width, height = image.size
    fmt = image.format or "unknown"
    msg = f"This is a {fmt} image of size {width}x{height}."
    if user_message:
        msg += f" You asked: '{user_message}' — the model would now provide relevant details here."
    return msg

def add_message_to_history(user_id: str, message_type: str, content: str,
                           image_data: Optional[str] = None,
                           analysis: Optional[Dict[str, Any]] = None):
    msg_id = str(uuid.uuid4())
    message = {
        "message_id": msg_id,
        "user_id": user_id,
        "message_type": message_type,
        "content": content,
        "image_data": image_data,
        "timestamp": datetime.now().isoformat(),
        "analysis": analysis
    }
    chat_history.setdefault(user_id, []).append(message)

@app.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(request: Request):
    try:
        data = await request.json()
        image_data = data.get("image")
        user_message = data.get("user_message", "")
        user_id = data.get("user_id", str(uuid.uuid4()))

        if not image_data:
            raise HTTPException(status_code=400, detail="Missing 'image' field")

        processed_image = process_base64_image(image_data)
        response_text = query_llm(processed_image, user_message)

        add_message_to_history(
            user_id=user_id,
            message_type="image",
            content="User uploaded image",
            image_data=None,
            analysis={
                "width": processed_image.size[0],
                "height": processed_image.size[1],
                "format": processed_image.format
            }
        )

        add_message_to_history(
            user_id=user_id,
            message_type="response",
            content=response_text
        )

        return ImageAnalysisResponse(response=response_text)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
