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
                return img_base64  # Return just the base64 string, not the data URL
            
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
