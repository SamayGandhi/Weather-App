import React from 'react';

const WeatherDisplay = ({ data }) => {
  // Do not render anything if there is no data
  if (!data) return null;

  return (
    
    <div className="weather-card">
      <h3>Current Weather in {data.city}</h3>
      <h1>{data.temperature}</h1>
      <p><strong>Condition:</strong> {data.condition}</p>
      <p><strong>Humidity:</strong> {data.humidity}</p>
      <p><strong>Wind Speed:</strong> {data.windSpeed}</p>
    </div>
  );
};

export default WeatherDisplay;