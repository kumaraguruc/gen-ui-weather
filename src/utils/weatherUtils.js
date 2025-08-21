/**
 * Weather Utilities
 * This utility provides functions for parsing and formatting weather data
 */

/**
 * Get the appropriate weather icon name based on the weather condition
 * @param {string} condition - The weather condition description
 * @returns {string} The name of the icon to use
 */
const getWeatherIcon = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
    return 'sun';
  } else if (conditionLower.includes('cloud')) {
    return 'cloud';
  } else if (conditionLower.includes('rain')) {
    return 'rain';
  } else if (conditionLower.includes('snow')) {
    return 'snow';
  } else if (conditionLower.includes('thunder')) {
    return 'thunder';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'fog';
  } else if (conditionLower.includes('wind')) {
    return 'wind';
  } else {
    return 'default';
  }
};

/**
 * Format temperature for display
 * @param {number} temp - The temperature value
 * @returns {string} Formatted temperature with degree symbol
 */
const formatTemperature = (temp) => {
  return `${Math.round(temp)}°C`;
};

/**
 * Format day of week
 * @param {string} dayString - Day string from API response
 * @returns {string} Formatted day name
 */
const formatDay = (dayString) => {
  // If it's a date string, convert to day name
  if (dayString.includes('-') || dayString.includes('/')) {
    const date = new Date(dayString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return dayString;
};

export { getWeatherIcon, formatTemperature, formatDay };
