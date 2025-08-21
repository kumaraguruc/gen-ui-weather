/**
 * LangChain Service
 * This service handles integration with custom Flask AI backend
 */

// Define the API URL (can be configured in .env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Function to fetch weather news using the Flask AI backend
const getWeatherNews = async () => {
  console.log('Fetching global weather news');
  
  // Make a request to the Flask backend
  const response = await fetch(`${API_URL}/weather-news`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }
  
  // Parse the JSON response
  const data = await response.json();
  console.log('27', data);
  // Check if the response contains an error
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
};

// Function to create a mock weather data for testing
const createMockWeatherData = (latitude, longitude) => {
  console.log(`Creating mock weather data for coordinates: ${latitude}, ${longitude}`);
  return {
    current: {
      temperature: 25,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 10
    },
    forecast: [
      {
        day: "Today",
        highTemp: 28,
        lowTemp: 20,
        condition: "Partly Cloudy"
      },
      {
        day: "Tomorrow",
        highTemp: 30,
        lowTemp: 22,
        condition: "Sunny"
      },
      {
        day: "Day After",
        highTemp: 26,
        lowTemp: 19,
        condition: "Light Rain"
      }
    ]
  };
};

/**
 * Get weather data for a specific location using the Flask AI backend
 * @param {number} latitude - The latitude coordinate
 * @param {number} longitude - The longitude coordinate
 * @returns {Promise} A promise that resolves with the weather data
 */
const getWeatherData = async (latitude, longitude) => {
  try {
    console.log(`Fetching weather data for coordinates: ${latitude}, ${longitude}`);
    
    // Make a request to the Flask backend
    const response = await fetch(`${API_URL}/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check if the response contains an error
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting weather data:', error);
    
    // If all attempts fail, return mock data for testing
    console.log('Falling back to mock data');
    return createMockWeatherData(latitude, longitude);
  }
};

export { getWeatherData, getWeatherNews };
