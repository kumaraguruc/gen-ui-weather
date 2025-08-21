import React, { useEffect, useState } from 'react';
import { getCurrentPosition } from '../../services/geolocationService';
import { useLangChain } from '../lang-chain';
import { getWeatherIcon, formatTemperature, formatDay } from '../../utils/weatherUtils';
import './Weather.css';

// Use simple emoji icons instead of a package that might not exist
const WeatherIcons = {
  sun: '☀️',
  cloud: '☁️',
  rain: '🌧️',
  snow: '❄️',
  thunder: '⚡',
  fog: '🌫️',
  wind: '💨',
  default: '🌤️'
};

/**
 * Weather Component
 * Displays current weather and 3-day forecast using data from LangChain and Google Gemini AI
 */
const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the LangChain context
  const { getWeatherData } = useLangChain();

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        
        // Get user's location
        const position = await getCurrentPosition();
        
        // Get weather data using LangChain and Gemini AI
        const data = await getWeatherData(position.latitude, position.longitude);
        
        setWeatherData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Failed to fetch weather data. Please try again later.');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [getWeatherData]);

  // Helper function to render the appropriate weather icon
  const renderWeatherIcon = (condition) => {
    const iconType = getWeatherIcon(condition);
    return <span style={{ fontSize: '2rem' }}>{WeatherIcons[iconType]}</span>;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="weather-container loading">
        <div className="loading-spinner"></div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="weather-container error">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Render weather data
  return (
    <div className="weather-container">
      <div className="current-weather">
        <div className="weather-icon">
          {weatherData?.current?.condition && renderWeatherIcon(weatherData.current.condition)}
        </div>
        <div className="weather-info">
          <h2>{weatherData?.current?.temperature !== undefined ? formatTemperature(weatherData.current.temperature) : 'N/A'}</h2>
          <p className="condition">{weatherData?.current?.condition || 'Unknown'}</p>
          <div className="weather-details">
            <span>Humidity: {weatherData?.current?.humidity !== undefined ? `${weatherData.current.humidity}%` : 'N/A'}</span>
            <span>Wind: {weatherData?.current?.windSpeed !== undefined ? `${weatherData.current.windSpeed} km/h` : 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div className="forecast">
        {weatherData?.forecast?.map((day, index) => (
          <div key={index} className="forecast-day">
            <h3>{day?.day ? formatDay(day.day) : `Day ${index + 1}`}</h3>
            <div className="forecast-icon">
              {day?.condition && renderWeatherIcon(day.condition)}
            </div>
            <div className="forecast-temp">
              <span className="high">{day?.highTemp !== undefined ? formatTemperature(day.highTemp) : 'N/A'}</span>
              <span className="low">{day?.lowTemp !== undefined ? formatTemperature(day.lowTemp) : 'N/A'}</span>
            </div>
            <p className="forecast-condition">{day?.condition || 'Unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Weather;
