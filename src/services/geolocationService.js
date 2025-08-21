/**
 * Geolocation Service
 * This service handles browser geolocation functionality
 */

/**
 * Get the user's current position using the browser's Geolocation API
 * @returns {Promise} A promise that resolves with the latitude and longitude
 */
const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  });
};

export { getCurrentPosition };
