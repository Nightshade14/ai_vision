# from fastapi import FastAPI, Request, HTTPException, Header
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# from typing import Optional, List, Dict, Any
# from datetime import datetime
# from PIL import Image
# import base64
# import io
# import uuid
# import json
# import os
# from llama_api_client import LlamaAPIClient
# import dotenv

# # Load environment variables from .env file
# dotenv.load_dotenv("backend/.env")

# app = FastAPI(
#     title="AI Vision API",
#     description="API for image reasoning and analysis",
#     version="1.0.0"
# )

# # Initialize LlamaAPI client
# client = LlamaAPIClient(api_key=os.getenv("LLAMA_API_KEY"))

# # Add CORS middleware to allow frontend requests
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Adjust to your frontend domain in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Supported formats
# SUPPORTED_FORMATS = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"}

# # In-memory history (replace with DB in production)
# chat_history: Dict[str, List[Dict[str, Any]]] = {}

# # Response model
# class ImageAnalysisResponse(BaseModel):
#     response: str

# @app.get("/")
# async def root():
#     return {"message": "AI Vision API is running", "status": "healthy"}

# @app.get("/health")
# async def health_check():
#     return {"status": "healthy", "service": "AI Vision API"}

# def process_base64_image(image_data: str) -> Image.Image:
#     """Convert base64 string to a PIL image."""
#     try:
#         if image_data.startswith("data:"):
#             _, encoded = image_data.split(",", 1)
#         else:
#             encoded = image_data
#         image_bytes = base64.b64decode(encoded)
#         image = Image.open(io.BytesIO(image_bytes))
#         image.verify()
#         return Image.open(io.BytesIO(image_bytes))  # Reopen for usage
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid image data")

# def add_message_to_history(user_id: str, message_type: str, content: str,
#                            image_data: Optional[str] = None,
#                            analysis: Optional[Dict[str, Any]] = None):
#     msg_id = str(uuid.uuid4())
#     message = {
#         "message_id": msg_id,
#         "user_id": user_id,
#         "message_type": message_type,
#         "content": content,
#         "image_data": image_data,
#         "timestamp": datetime.now().isoformat(),
#         "analysis": analysis
#     }
    
#     if user_id not in chat_history:
#         chat_history[user_id] = []
    
#     chat_history[user_id].append(message)
#     return msg_id

# @app.get("/")
# async def root():
#     """Root endpoint to check if the API is running"""
#     return {"message": "AI Vision API is running", "status": "healthy"}

# def process_base64_image(image_data: str) -> Image.Image:
#     """Process base64 image data and return PIL Image object"""
#     # Handle data URL format (data:image/jpeg;base64,...)
#     if image_data.startswith('data:'):
#         header, encoded = image_data.split(',', 1)
#         image_bytes = base64.b64decode(encoded)
#     else:
#         # Plain base64 string
#         image_bytes = base64.b64decode(image_data)
    
#     # Validate that it's a valid image
#     try:
#         image = Image.open(io.BytesIO(image_bytes))
#         image.verify()  # Verify it's a valid image
#         # Reopen for processing (verify() closes the image)
#         image = Image.open(io.BytesIO(image_bytes))
#         return image
#     except Exception as e:
#         raise HTTPException(
#             status_code=400,
#             detail="Invalid image data or corrupted image"
#         )

# def query_llm(image: Image.Image, user_message: str = None) -> str:
#     """Query the LLM with the processed image and return response"""
#     try:
#         # Convert PIL Image back to base64 for the API call
#         buffer = io.BytesIO()
#         image.save(buffer, format='JPEG')
#         img_base64 = base64.b64encode(buffer.getvalue()).decode()
#         img_data_url = f"data:image/jpeg;base64,{img_base64}"
        
#         # Prepare the messages for the API call
#         messages = [
#             {
#                 "role": "system",
#                 "content": "You are a helpful assistant that understands the image given to you and helps vision-impaired people navigate their environment."
#             },
#             {
#                 "role": "user",
#                 "content": [
#                     {
#                         "type": "text",
#                         "text": user_message if user_message else "Please describe this image and provide navigation guidance for a vision-impaired person."
#                     },
#                     {
#                         "type": "image_url",
#                         "image_url": {
#                             "url": f"data:image/jpeg;base64,{img_base64}"
#                         }
#                     }
#                 ]
#             }
#         ]
        
#         # Make the API call
#         response = client.chat.completions.create(
#             messages=messages,
#             model="Llama-4-Scout-17B-16E-Instruct-FP8",
#             stream=False,
#             temperature=0.5,
#             max_completion_tokens=2048,
#             top_p=0.9,
#             repetition_penalty=1,
#             tools=[],
#         )
        
#         print(f"LLM Response: {response}")
#         # Extract the response content from the LlamaAPI response structure
#         return response.completion_message.content.text
        
#     except Exception as e:
#         # Fallback to basic image information if API call fails
#         width, height = image.size
#         format_type = image.format or "UNKNOWN"
#         return f"Error calling LLM API: {str(e)}. Basic info: {format_type} image with dimensions {width}x{height}."

# @app.post("/analyze", response_model=ImageAnalysisResponse)
# async def analyze_image(request: Request):
#     try:
#         data = await request.json()
#         image_data = data.get("image")
#         user_message = data.get("user_message", "")
#         user_id = data.get("user_id", str(uuid.uuid4()))

#         if not image_data:
#             raise HTTPException(status_code=400, detail="Missing 'image' field")

#         processed_image = process_base64_image(image_data)
#         response_text = query_llm(processed_image, user_message)

#         add_message_to_history(
#             user_id=user_id,
#             message_type="image",
#             content="User uploaded image",
#             image_data=None,
#             analysis={
#                 "width": processed_image.size[0],
#                 "height": processed_image.size[1],
#                 "format": processed_image.format
#             }
#         )

#         add_message_to_history(
#             user_id=user_id,
#             message_type="response",
#             content=response_text
#         )

#         return ImageAnalysisResponse(response=response_text)

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


import streamlit as st
import requests
import base64
import io
from PIL import Image
import uuid
import json

# Configuration
API_BASE_URL = "http://localhost:8000"  # Adjust for production

def main():
    st.set_page_config(
        page_title="AI Vision Assistant",
        page_icon="👁️",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    st.title("👁️ AI Vision Assistant")
    st.markdown("Upload an image and get AI-powered analysis and navigation guidance")
    
    # Initialize session state
    if 'user_id' not in st.session_state:
        st.session_state.user_id = str(uuid.uuid4())
    if 'chat_history' not in st.session_state:
        st.session_state.chat_history = []
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("Settings")
        api_url = st.text_input("API URL", value=API_BASE_URL)
        st.info(f"User ID: {st.session_state.user_id[:8]}...")
        
        if st.button("Clear History"):
            st.session_state.chat_history = []
            st.rerun()
    
    # Main interface
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.header("Upload Image")
        uploaded_file = st.file_uploader(
            "Choose an image...",
            type=['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'],
            help="Upload an image for AI analysis"
        )
        
        user_message = st.text_area(
            "Additional Message (Optional)",
            placeholder="Ask specific questions about the image...",
            height=100
        )
        
        if uploaded_file is not None:
            # Display the uploaded image
            image = Image.open(uploaded_file)
            st.image(image, caption="Uploaded Image", use_column_width=True)
            
            # Convert image to base64
            def image_to_base64(img):
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG')
                img_base64 = base64.b64encode(buffer.getvalue()).decode()
                return f"data:image/jpeg;base64,{img_base64}"
            
            if st.button("🔍 Analyze Image", type="primary"):
                with st.spinner("Analyzing image..."):
                    try:
                        # Prepare the request
                        image_b64 = image_to_base64(image)
                        payload = {
                            "image": image_b64,
                            "user_message": user_message if user_message else "",
                            "user_id": st.session_state.user_id
                        }
                        
                        # Make API call
                        response = requests.post(
                            f"{api_url}/analyze",
                            json=payload,
                            headers={"Content-Type": "application/json"}
                        )
                        
                        if response.status_code == 200:
                            result = response.json()
                            analysis_result = result.get("response", "No response received")
                            
                            # Add to chat history
                            st.session_state.chat_history.append({
                                "type": "user",
                                "content": "Image uploaded",
                                "image": image,
                                "message": user_message
                            })
                            st.session_state.chat_history.append({
                                "type": "assistant",
                                "content": analysis_result
                            })
                            
                            st.success("Analysis completed!")
                            st.rerun()
                            
                        else:
                            st.error(f"API Error: {response.status_code} - {response.text}")
                            
                    except requests.exceptions.ConnectionError:
                        st.error("❌ Cannot connect to API. Make sure your FastAPI server is running.")
                    except Exception as e:
                        st.error(f"❌ Error: {str(e)}")
    
    with col2:
        st.header("Analysis Results")
        
        if st.session_state.chat_history:
            # Display chat history
            for i, message in enumerate(st.session_state.chat_history):
                if message["type"] == "user":
                    with st.container():
                        st.markdown("**You:**")
                        if "image" in message:
                            st.image(message["image"], width=200)
                        if message.get("message"):
                            st.write(message["message"])
                        st.markdown("---")
                        
                elif message["type"] == "assistant":
                    with st.container():
                        st.markdown("**AI Assistant:**")
                        st.write(message["content"])
                        st.markdown("---")
        else:
            st.info("Upload an image to get started with AI analysis!")
    
    # Health check section
    with st.expander("API Health Check"):
        if st.button("Check API Status"):
            try:
                health_response = requests.get(f"{api_url}/health")
                if health_response.status_code == 200:
                    health_data = health_response.json()
                    st.success(f"✅ API is healthy: {health_data}")
                else:
                    st.error(f"❌ API health check failed: {health_response.status_code}")
            except Exception as e:
                st.error(f"❌ Cannot reach API: {str(e)}")

if __name__ == "__main__":
    main()
