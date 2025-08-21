from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Loaded environment variables from .env file")
except ImportError:
    print("python-dotenv not installed. Environment variables from .env file will not be loaded.")

# Import interlinked with GoogleAIClient
try:
    from interlinked import AI
    from interlinked.core.clients.googleaiclient import GoogleAIClient
    
    # Get API key from environment variables
    api_key = os.environ.get('VITE_GEMINI_API_KEY')
    if not api_key:
        print("Warning: VITE_GEMINI_API_KEY not found in environment variables")
    
    # Create GoogleAIClient with the API key
    google_ai_client = GoogleAIClient(model_name='gemini-2.0-flash', api_key=api_key)
    print("Successfully initialized GoogleAIClient with API key")
except ImportError as e:
    print(f"Import Error Details: {e}")
    print("Error: interlinked package not installed. Please install it with: pip install interlinked")
    
    # Fallback mock implementation if interlinked is not available
    class MockResponse:
        def __init__(self, text):
            self.raw = text
            self.response = text
    
    class MockObservation:
        def __init__(self, text):
            self.response = MockResponse(text)
    
    class MockAI:
        @staticmethod
        def ask(prompt, files=None, client=None):
            return MockObservation(f"Mock AI response to: {prompt}")
    
    AI = MockAI
    google_ai_client = None

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/ask', methods=['POST'])
def ask_ai():
    data = request.get_json()
    prompt = data['prompt']
    
    try:
        # Use GoogleAIClient if available
        if google_ai_client:
            observation = AI.ask(prompt=prompt, client=google_ai_client)
            return jsonify({'response': observation.response.raw})
        else:
            # Fallback to default client
            observation = AI.ask(prompt=prompt)
            return jsonify({'response': observation.response.raw})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/weather', methods=['POST'])
def get_weather():
    """
    Endpoint to get weather data for a specific location
    Expects JSON with latitude and longitude
    """
    data = request.get_json()
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    # Create a prompt for weather data
    prompt = f"""
    You are a weather information service.
    Provide the current weather conditions and a 3-day forecast for the location at coordinates {latitude}, {longitude}.
    
    Return ONLY the data in the following JSON format without any additional text:
    {{
      "current": {{
        "temperature": number,
        "condition": string,
        "humidity": number,
        "windSpeed": number
      }},
      "forecast": [
        {{
          "day": string,
          "highTemp": number,
          "lowTemp": number,
          "condition": string
        }},
        {{
          "day": string,
          "highTemp": number,
          "lowTemp": number,
          "condition": string
        }},
        {{
          "day": string,
          "highTemp": number,
          "lowTemp": number,
          "condition": string
        }}
      ]
    }}
    """
    
    try:
        # Use GoogleAIClient if available
        if google_ai_client:
            observation = AI.ask(prompt=prompt, client=google_ai_client)
            response = observation.response.raw
        else:
            # Fallback to default client
            observation = AI.ask(prompt=prompt)
            response = observation.response.raw
        
        # Try to parse the response as JSON
        try:
            # Try to find JSON in the response
            json_match = json.loads(response) if isinstance(response, str) else response
            return jsonify(json_match)
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract JSON from the string
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                weather_data = json.loads(json_match.group(0))
                return jsonify(weather_data)
            else:
                raise ValueError("Could not extract JSON from response")
    except Exception as e:
        # If parsing fails, return an error
        return jsonify({
            'error': 'Failed to parse weather data from AI response',
            'details': str(e)
        }), 500

@app.route('/weather-news', methods=['GET'])
def get_weather_news():
    """
    Endpoint to get latest global weather news
    """
    
    # Create a prompt for weather news with generative UI instructions
    prompt = """
    You are a global weather news service with UI generation capabilities.
    Provide the latest 4 significant weather events or news from around the world.
    
    Return ONLY the data in the following JSON format without any additional text:
    {
      "ui": {
        "layout": string (choose from: "grid", "list", "cards", "timeline"),
        "theme": {
          "primary_color": string (hex color code),
          "secondary_color": string (hex color code),
          "background_color": string (hex color code),
          "text_color": string (hex color code)
        },
        "components": [
          {
            "type": string (choose from: "header", "alert", "info", "chart", "map"),
            "priority": number (1-5, where 1 is highest priority),
            "style": {
              "size": string (choose from: "small", "medium", "large"),
              "emphasis": boolean,
              "border": boolean
            },
            "content": string (brief content for this component)
          }
        ]
      },
      "news": [
        {
          "title": string,
          "summary": string,
          "source": string,
          "date": string (YYYY-MM-DD format),
          "severity": string (choose from: "low", "medium", "high", "critical"),
          "region": string (geographical region affected),
          "visual_type": string (choose from: "chart", "map", "image", "alert")
        },
        {
          "title": string,
          "summary": string,
          "source": string,
          "date": string (YYYY-MM-DD format),
          "severity": string (choose from: "low", "medium", "high", "critical"),
          "region": string (geographical region affected),
          "visual_type": string (choose from: "chart", "map", "image", "alert")
        },
        {
          "title": string,
          "summary": string,
          "source": string,
          "date": string (YYYY-MM-DD format),
          "severity": string (choose from: "low", "medium", "high", "critical"),
          "region": string (geographical region affected),
          "visual_type": string (choose from: "chart", "map", "image", "alert")
        },
        {
          "title": string,
          "summary": string,
          "source": string,
          "date": string (YYYY-MM-DD format),
          "severity": string (choose from: "low", "medium", "high", "critical"),
          "region": string (geographical region affected),
          "visual_type": string (choose from: "chart", "map", "image", "alert")
        }
      ]
    }
    
    The news should be real and current, focusing on significant weather events like storms, heat waves,
    unusual weather patterns, climate-related events, etc. from different parts of the world.
    
    IMPORTANT: All dates must be from the current year 2025. Do not use dates from previous years.
    
    For the UI section:
    - Choose a layout that best fits the current weather news (e.g., "timeline" for sequential events, "grid" for diverse news)
    - Select a color theme appropriate for the overall weather situation (e.g., blues for rain, reds for heat waves)
    - Create components that would enhance the user experience (e.g., an alert component for severe weather)
    - Assign appropriate severity levels to each news item
    - Suggest the best visual representation for each news item
    """
    
    try:
        # Use GoogleAIClient if available
        if google_ai_client:
            observation = AI.ask(prompt=prompt, client=google_ai_client)
            response = observation.response.raw
        else:
            # Fallback to default client
            observation = AI.ask(prompt=prompt)
            response = observation.response.raw
        
        # Try to parse the response as JSON
        try:
            # Try to find JSON in the response
            json_match = json.loads(response) if isinstance(response, str) else response
            return jsonify(json_match)
        except json.JSONDecodeError as e:
            # If direct parsing fails, try to extract JSON from the string
            import re
            # Log the raw response for debugging
            print(f"Raw response from AI: {response}")
            print(f"JSON decode error: {str(e)}")
            
            # Try to extract JSON from the string
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                try:
                    json_str = json_match.group(0)
                    # Clean up potential issues in the JSON string
                    json_str = json_str.replace('\n', ' ').replace('\r', '')
                    news_data = json.loads(json_str)
                    return jsonify(news_data)
                except json.JSONDecodeError as inner_e:
                    print(f"Failed to parse extracted JSON: {str(inner_e)}")
                    raise ValueError(f"Could not parse extracted JSON: {str(inner_e)}")
            else:
                raise ValueError("Could not extract JSON from response")
    except Exception as e:
        # If parsing fails, return an error
        return jsonify({
            'error': 'Failed to parse weather news from AI response',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
