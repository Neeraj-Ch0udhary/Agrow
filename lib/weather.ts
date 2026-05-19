import * as Location from 'expo-location';

const API_KEY = '4c1c24ed610efafd607e516de01bce95';

export type WeatherData = {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  city: string;
  advice: string;
  feelsLike: number;
};

function getWeatherEmoji(code: number): string {
  if (code >= 200 && code < 300) return '⛈️';
  if (code >= 300 && code < 400) return '🌦️';
  if (code >= 500 && code < 600) return '🌧️';
  if (code >= 600 && code < 700) return '❄️';
  if (code >= 700 && code < 800) return '🌫️';
  if (code === 800) return '☀️';
  if (code === 801) return '🌤️';
  if (code === 802) return '⛅';
  if (code >= 803) return '☁️';
  return '🌡️';
}

function getFarmingAdvice(code: number, humidity: number, wind: number): string {
  if (code >= 500 && code < 600) return 'Avoid spraying today — rain expected';
  if (code >= 200 && code < 300) return 'Stay indoors — thunderstorm warning';
  if (code >= 600 && code < 700) return 'Protect crops from frost';
  if (wind > 30) return 'Avoid spraying — high winds';
  if (humidity > 85) return 'Watch for fungal diseases';
  if (humidity < 30) return 'Water your crops today';
  if (code === 800) return 'Great day for outdoor farming!';
  if (code <= 802) return 'Good day for spraying';
  return 'Moderate conditions for farming';
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Fetch weather from OpenWeatherMap
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) throw new Error('Weather API failed');

    const data = await response.json();

    const code      = data.weather[0].id;
    const humidity  = data.main.humidity;
    const wind      = Math.round(data.wind.speed * 3.6); // m/s to km/h

    return {
      temp:       Math.round(data.main.temp),
      feelsLike:  Math.round(data.main.feels_like),
      condition:  data.weather[0].description
                    .split(' ')
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' '),
      icon:       getWeatherEmoji(code),
      humidity,
      wind,
      city:       data.name,
      advice:     getFarmingAdvice(code, humidity, wind),
    };
  } catch (error) {
    return null;
  }
}
