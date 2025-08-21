// Test script for Flask backend integration

// Function to test the Flask backend directly
async function testFlaskBackend() {
  console.log('Testing Flask backend directly...');
  
  try {
    // Test the /ask endpoint
    const askResponse = await fetch('http://localhost:5000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'What is the capital of France?' }),
    });
    
    if (!askResponse.ok) {
      throw new Error(`API request failed with status: ${askResponse.status}`);
    }
    
    const askData = await askResponse.json();
    console.log('Response from /ask endpoint:', askData);
    
    // Test the /weather endpoint
    const weatherResponse = await fetch('http://localhost:5000/weather', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude: 48.8566, longitude: 2.3522 }), // Paris coordinates
    });
    
    if (!weatherResponse.ok) {
      throw new Error(`API request failed with status: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    console.log('Response from /weather endpoint:', weatherData);
    
    console.log('Flask backend test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing Flask backend:', error);
    return false;
  }
}

// Function to simulate using the langChainService
async function testLangChainService() {
  console.log('Testing langChainService integration...');
  
  try {
    // Import the getWeatherData function
    // Note: This would normally be done in a React component
    // This is just for testing purposes
    const { getWeatherData } = await import('./src/services/langChainService.js');
    
    // Test the getWeatherData function
    const weatherData = await getWeatherData(48.8566, 2.3522); // Paris coordinates
    console.log('Weather data from langChainService:', weatherData);
    
    console.log('langChainService test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing langChainService:', error);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting tests...');
  
  // Test the Flask backend
  const backendTestResult = await testFlaskBackend();
  console.log('Backend test result:', backendTestResult ? 'PASSED' : 'FAILED');
  
  // Test the langChainService
  const serviceTestResult = await testLangChainService();
  console.log('Service test result:', serviceTestResult ? 'PASSED' : 'FAILED');
  
  console.log('All tests completed.');
}

// Instructions for running the tests
console.log(`
=== Flask Integration Test ===

To run these tests:

1. Start the Flask backend:
   $ python app.py

2. In a separate terminal, run this test script:
   $ node test-flask-integration.js

Note: Make sure you have Flask, Flask-CORS, python-dotenv, and interlinked installed in your Python environment.
If not, install them with: pip install flask flask-cors python-dotenv interlinked

Also ensure that the VITE_API_URL in .env is set to http://localhost:5000
`);

// Export the test functions
export { testFlaskBackend, testLangChainService, runTests };
