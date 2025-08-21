import React, { useEffect, useState } from 'react';
import { useLangChain } from '../lang-chain';
import './WeatherNews.css';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * WeatherNews Component
 * Displays latest global weather news using data from LangChain and Google Gemini AI
 */
const WeatherNews = () => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the LangChain context
  const { getWeatherNews } = useLangChain();

  useEffect(() => {
    const fetchWeatherNews = async () => {
      try {
        setLoading(true);
        
        // Get weather news using LangChain and Gemini AI
        const data = await getWeatherNews();
        
        setNewsData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather news:', err);
        setError('Failed to fetch weather news. Please try again later.');
        setLoading(false);
      }
    };

    fetchWeatherNews();
  }, [getWeatherNews]);

  // Render loading state
  if (loading) {
    return (
      <div className="weather-news-container loading">
        <div className="loading-spinner"></div>
        <p>Loading weather news...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="weather-news-container error">
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

  // Render news data
  return (
    <div className="weather-news-container">
      <h2>Global Weather News</h2>
      <div className="news-list">
        {newsData?.news?.map((item, index) => (
          <div key={index} className="news-item">
            <h3 className="news-title">{item.title}</h3>
            <p className="news-summary">{item.summary}</p>
            <div className="news-footer">
              <span className="news-source">{item.source}</span>
              <span className="news-date">{formatDate(item.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherNews;
