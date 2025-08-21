# Flask AI Backend Integration with React

This project demonstrates how to replace ChatGoogleGenerativeAI with a custom Flask backend for AI responses in a React application.

## Project Structure

- `app.py`: Flask backend with AI endpoints
- `start-app.js`: Script to start both Flask backend and React application together
- `test-flask-integration.js`: Test script for the Flask backend integration

## Setup Instructions

### 1. Install Node.js and Python

Make sure you have both Node.js and Python installed on your system.

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install flask flask-cors python-dotenv interlinked
```

### 3. Configure Environment Variables

The React application uses environment variables to configure the API URL. Make sure the `.env` file contains:

```
VITE_API_URL=http://localhost:5000
```

### 4. Start the Application (Recommended)

Use the provided npm script to start both the Flask backend and React application together:

```bash
npm run start
```

Or you can run the script directly:

```bash
node start-app.js
```

This script will:
- Automatically detect whether to use `python` or `python3` command
- Check if required Python packages are installed and install them if needed
- Start the Flask backend
- Start the React application
- Handle proper shutdown of both services when you press Ctrl+C

### 5. Alternative: Start Services Separately

If you prefer to start the services separately:

#### Start the Flask Backend

```bash
python app.py
```

This will start the Flask server on http://localhost:5000 with the following endpoints:
- `/ask`: General AI endpoint for any prompt
- `/weather`: Specific endpoint for weather data

#### Start the React Application

```bash
npm run dev
```

## API Usage

### Flask Backend API

#### General AI Query

```javascript
fetch('http://localhost:5000/ask', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'Your prompt here' }),
})
.then(response => response.json())
.then(data => {
    console.log('Response from AI:', data.response);
});
```

#### Weather Data Query

```javascript
fetch('http://localhost:5000/weather', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ latitude: 48.8566, longitude: 2.3522 }), // Example: Paris coordinates
})
.then(response => response.json())
.then(data => {
    console.log('Weather data:', data);
});
```

## Testing

To test the integration, you can use the provided test script:

```bash
node test-flask-integration.js
```

Make sure the Flask backend is running before executing the test script.

## Notes

- The Flask backend uses the `interlinked` package with GoogleAIClient to connect to Google's Gemini AI.
- The API key is loaded from the .env file (VITE_GEMINI_API_KEY).
- A fallback mock implementation is included if the interlinked package is not available.
- Error handling is implemented to fall back to mock data if the AI service is unavailable.
- CORS is enabled on the Flask backend to allow requests from the React application.
