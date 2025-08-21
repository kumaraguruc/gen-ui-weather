import React, { useEffect, useState } from 'react';
import { useLangChain } from '../lang-chain';
import './WeatherNews.css';

/**
 * GenerativeWeatherNews Component
 * Displays latest global weather news using data from LangChain and Google Gemini AI
 * Uses generative UI capabilities to dynamically render the UI based on AI instructions
 */
const GenerativeWeatherNews = () => {
  const [newsData, setNewsData] = useState(null);
  const [uiConfig, setUiConfig] = useState(null);
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
        console.log('26', data);
        
        // Separate UI configuration from news data
        if (data && data.ui) {
          setUiConfig(data.ui);
          setNewsData(data.news);
        } else if (data && data.news) {
          setNewsData(data.news);
          setUiConfig(null);
        } else {
          throw new Error('Invalid data format received from AI');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather news:', err);
        setError(`Failed to fetch weather news: ${err.message}. Please ensure the Flask backend is running and the AI API key is configured correctly.`);
        setLoading(false);
      }
    };

    fetchWeatherNews();
  }, [getWeatherNews]);

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
  
  // Helper function to get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#d32f2f'; // Red
      case 'high':
        return '#f57c00'; // Orange
      case 'medium':
        return '#fbc02d'; // Yellow
      case 'low':
        return '#388e3c'; // Green
      default:
        return '#757575'; // Grey
    }
  };
  
  // Helper function to get visual icon
  const getVisualIcon = (type) => {
    switch (type) {
      case 'chart':
        return '📊';
      case 'map':
        return '🗺️';
      case 'image':
        return '🖼️';
      case 'alert':
        return '⚠️';
      default:
        return '📰';
    }
  };
  
  // Generate dynamic styles based on UI configuration
  const generateStyles = () => {
    if (!uiConfig || !uiConfig.theme) return {};
    
    return {
      container: {
        backgroundColor: uiConfig.theme.background_color || '#ffffff',
        color: uiConfig.theme.text_color || '#333333',
      },
      header: {
        color: uiConfig.theme.primary_color || '#1976d2',
      },
      newsItem: {
        borderLeft: `4px solid ${uiConfig.theme.primary_color || '#1976d2'}`,
      }
    };
  };
  
  // Render UI components based on configuration
  const renderComponents = () => {
    if (!uiConfig || !uiConfig.components) return null;
    
    // Sort components by priority
    const sortedComponents = [...uiConfig.components].sort((a, b) => a.priority - b.priority);
    
    return sortedComponents.map((component, index) => {
      const style = {
        fontSize: component.style.size === 'large' ? '1.5rem' : 
                 component.style.size === 'medium' ? '1.2rem' : '1rem',
        fontWeight: component.style.emphasis ? 'bold' : 'normal',
        border: component.style.border ? `1px solid ${uiConfig.theme.secondary_color || '#dc004e'}` : 'none',
        padding: component.style.border ? '15px' : '5px',
        margin: '10px 0',
        borderRadius: '4px',
      };
      
      return (
        <div key={index} className={`generated-component ${component.type}`} style={style}>
          {component.type === 'alert' && <span className="alert-icon">⚠️ </span>}
          {component.type === 'map' && <span className="map-icon">🗺️ </span>}
          {component.type === 'chart' && <span className="chart-icon">📊 </span>}
          {component.content}
        </div>
      );
    });
  };

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
        <h2>AI-Generated Weather News</h2>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <div className="error-help">
            <h3>Troubleshooting Steps:</h3>
            <ol>
              <li>Ensure the Flask backend is running with <code>npm start</code></li>
              <li>Check that your Gemini API key is correctly set in the .env file</li>
              <li>Verify that the interlinked package is installed in your Python environment</li>
              <li>Check the browser console and server logs for more detailed error information</li>
            </ol>
          </div>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Generate dynamic styles
  const styles = generateStyles();
  
  // Determine layout class
  const layoutClass = uiConfig && uiConfig.layout ? `layout-${uiConfig.layout}` : 'layout-cards';
  
  // Get AI decisions for display
  const getAIDecisions = () => {
    if (!uiConfig) return [];
    
    const decisions = [];
    
    if (uiConfig.layout) {
      decisions.push(`Layout: ${uiConfig.layout} view`);
    }
    
    if (uiConfig.theme) {
      decisions.push(`Color theme: ${uiConfig.theme.primary_color} / ${uiConfig.theme.secondary_color}`);
    }
    
    if (uiConfig.components && uiConfig.components.length > 0) {
      decisions.push(`${uiConfig.components.length} custom components`);
    }
    
    return decisions;
  };
  
  const aiDecisions = getAIDecisions();

  // Render news data with generative UI
  return (
    <div className="weather-news-container" style={styles.container}>
      <div className="ai-generated-badge">
        <span className="ai-icon">🤖</span> AI-Generated UI
      </div>
      <h2 style={styles.header}>Global Weather News</h2>
      
      {uiConfig && (
        <div className="ai-ui-info">
          <p>
            <strong>AI-Selected Layout:</strong> {uiConfig.layout || 'default'}
            {uiConfig.theme && (
              <span className="color-samples">
                <span className="color-sample" style={{backgroundColor: uiConfig.theme.primary_color}}></span>
                <span className="color-sample" style={{backgroundColor: uiConfig.theme.secondary_color}}></span>
              </span>
            )}
          </p>
        </div>
      )}
      
      {/* AI explanation section */}
      <div className="ai-explanation">
        <h3>How AI Generated This UI</h3>
        <p>
          This weather news interface was dynamically generated by AI based on the content and context of the current weather events.
          The AI analyzed the severity, location, and type of weather events to create the most appropriate presentation.
        </p>
        
        {aiDecisions.length > 0 && (
          <div className="ai-decisions">
            <h4>AI Design Decisions:</h4>
            <ul>
              {aiDecisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Render AI-generated UI components */}
      <div className="generated-components">
        <h3>AI-Generated Components</h3>
        {renderComponents()}
      </div>
      
      <div className={`news-list ${layoutClass}`}>
        {newsData?.map((item, index) => (
          <div 
            key={index} 
            className="news-item"
            style={{
              ...styles.newsItem,
              borderLeft: `4px solid ${getSeverityColor(item.severity)}`
            }}
          >
            <div className="news-severity" style={{ color: getSeverityColor(item.severity) }}>
              {item.severity && item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
            </div>
            <h3 className="news-title">{item.title}</h3>
            <p className="news-summary">{item.summary}</p>
            <div className="news-visual-type">
              {getVisualIcon(item.visual_type)} {item.region}
            </div>
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

export default GenerativeWeatherNews;
