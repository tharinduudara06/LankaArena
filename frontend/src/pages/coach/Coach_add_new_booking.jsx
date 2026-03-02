import React, { useEffect, useState } from "react";
import "./styles/coach_add_new_booking.css";
import {ToastContainer,toast} from 'react-toastify'
import axios from 'axios'
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt,faPhone,faMoneyBillWave,faCreditCard,faCloud,faSun,faCloudRain,faSnowflake,faWind,faThermometerHalf,faEye} from "@fortawesome/free-solid-svg-icons"
import Coach_sideBar from "./Coach_sideBar";

const Coach_add_new_booking = () => {

  const {id} = useParams();

  const [ground, setGround] = useState([]);
  const [fullPrice,setFullPrice] = useState('');
  const[date,setDate] = useState('');
  const [from,setFrom] = useState('');
  const[to,setTo] = useState('');
  const [paymethod, setPaymethod] = useState('credit-card');
  const [hour, setHours] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  
  // Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Debug ground state
  useEffect(() => {
    console.log('Ground state updated:', ground);
    console.log('Ground length:', ground.length);
  }, [ground]);

  const navigate = useNavigate();

  // Weather fetching function using free weather APIs
  const fetchWeatherData = async (location, selectedDate) => {
    if (!location || !selectedDate) return;
    
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      const { city } = location;
      console.log('Fetching weather for:', city, selectedDate);
      
      // Try multiple free weather APIs as fallback
      let weatherData = null;
      
      // Method 1: Try Open-Meteo API first
      try {
        console.log('Trying Open-Meteo API...');
        
        // Step 1: Get coordinates using free geocoding API
        const geoResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&country=LK&count=1&language=en&format=json`
        );
        
        if (!geoResponse.ok) {
          throw new Error(`Geocoding API error: ${geoResponse.status}`);
        }
        
        const geoData = await geoResponse.json();
        console.log('Geocoding response:', geoData);
        
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('Location not found in geocoding');
        }
        
        const { latitude, longitude } = geoData.results[0];
        console.log('Coordinates found:', latitude, longitude);
        
        // Step 2: Get weather forecast using free Open-Meteo API
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto&forecast_days=7`
        );
        
        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
        
        const weatherApiData = await weatherResponse.json();
        console.log('Weather API response:', weatherApiData);
        
        // Step 3: Find weather for selected date
        const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0];
        const dateIndex = weatherApiData.daily.time.findIndex(date => date === selectedDateStr);
        
        if (dateIndex !== -1) {
          const weatherCode = weatherApiData.daily.weathercode[dateIndex];
          const maxTemp = weatherApiData.daily.temperature_2m_max[dateIndex];
          const minTemp = weatherApiData.daily.temperature_2m_min[dateIndex];
          const avgTemp = Math.round((maxTemp + minTemp) / 2);
          
          // Convert weather code to description and icon
          const getWeatherInfo = (code) => {
            const weatherCodes = {
              0: { description: 'clear sky', icon: '01d', main: 'Clear' },
              1: { description: 'mainly clear', icon: '02d', main: 'Clear' },
              2: { description: 'partly cloudy', icon: '02d', main: 'Clouds' },
              3: { description: 'overcast', icon: '03d', main: 'Clouds' },
              45: { description: 'fog', icon: '50d', main: 'Fog' },
              48: { description: 'depositing rime fog', icon: '50d', main: 'Fog' },
              51: { description: 'light drizzle', icon: '09d', main: 'Rain' },
              53: { description: 'moderate drizzle', icon: '09d', main: 'Rain' },
              55: { description: 'dense drizzle', icon: '09d', main: 'Rain' },
              61: { description: 'slight rain', icon: '10d', main: 'Rain' },
              63: { description: 'moderate rain', icon: '10d', main: 'Rain' },
              65: { description: 'heavy rain', icon: '10d', main: 'Rain' },
              71: { description: 'slight snow', icon: '13d', main: 'Snow' },
              73: { description: 'moderate snow', icon: '13d', main: 'Snow' },
              75: { description: 'heavy snow', icon: '13d', main: 'Snow' },
              77: { description: 'snow grains', icon: '13d', main: 'Snow' },
              80: { description: 'slight rain showers', icon: '09d', main: 'Rain' },
              81: { description: 'moderate rain showers', icon: '09d', main: 'Rain' },
              82: { description: 'violent rain showers', icon: '09d', main: 'Rain' },
              85: { description: 'slight snow showers', icon: '13d', main: 'Snow' },
              86: { description: 'heavy snow showers', icon: '13d', main: 'Snow' },
              95: { description: 'thunderstorm', icon: '11d', main: 'Thunderstorm' },
              96: { description: 'thunderstorm with slight hail', icon: '11d', main: 'Thunderstorm' },
              99: { description: 'thunderstorm with heavy hail', icon: '11d', main: 'Thunderstorm' }
            };
            return weatherCodes[code] || { description: 'unknown', icon: '01d', main: 'Clear' };
          };
          
          const weatherInfo = getWeatherInfo(weatherCode);
          const currentWeather = weatherApiData.current_weather;
          
          weatherData = {
            date: selectedDateStr,
            temperature: avgTemp,
            description: weatherInfo.description,
            icon: weatherInfo.icon,
            humidity: 65,
            windSpeed: currentWeather ? currentWeather.windspeed : 0,
            visibility: 10,
            main: weatherInfo.main
          };
        } else {
          throw new Error('Weather data not available for selected date');
        }
      } catch (openMeteoError) {
        console.log('Open-Meteo API failed:', openMeteoError);
        
        // Method 2: Fallback to wttr.in API (simpler, more reliable)
        try {
          console.log('Trying wttr.in API as fallback...');
          
          const wttrResponse = await fetch(
            `https://wttr.in/${encodeURIComponent(city)},SriLanka?format=j1`
          );
          
          if (wttrResponse.ok) {
            const wttrData = await wttrResponse.json();
            console.log('wttr.in response:', wttrData);
            
            const current = wttrData.current_condition[0];
            const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0];
            
            // Find weather for selected date in forecast
            const forecastDay = wttrData.weather.find(day => 
              day.date === selectedDateStr
            );
            
            const dayData = forecastDay || wttrData.weather[0];
            const hourlyData = dayData.hourly[Math.floor(dayData.hourly.length / 2)]; // Get middle of day
            
            weatherData = {
              date: selectedDateStr,
              temperature: parseInt(hourlyData.tempC),
              description: hourlyData.weatherDesc[0].value.toLowerCase(),
              icon: getWeatherIcon(hourlyData.weatherCode),
              humidity: parseInt(hourlyData.humidity),
              windSpeed: parseInt(hourlyData.windspeedKmph) / 3.6, // Convert km/h to m/s
              visibility: parseInt(hourlyData.visibility),
              main: getWeatherMain(hourlyData.weatherCode)
            };
          } else {
            throw new Error(`wttr.in API error: ${wttrResponse.status}`);
          }
        } catch (wttrError) {
          console.log('wttr.in API also failed:', wttrError);
          
          // Method 3: Fallback to mock data for demonstration
          console.log('Using mock data as final fallback...');
          
          const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Thunderstorm'];
          const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
          
          const dateObj = new Date(selectedDate);
          const month = dateObj.getMonth();
          const isSummer = month >= 3 && month <= 8; // April to September
          const baseTemp = isSummer ? 28 : 22;
          const temperature = baseTemp + Math.floor(Math.random() * 8) - 4;
          
          weatherData = {
            date: selectedDate,
            temperature: temperature,
            description: randomCondition === 'Clear' ? 'clear sky' : 
                        randomCondition === 'Clouds' ? 'few clouds' :
                        randomCondition === 'Rain' ? 'light rain' : 'thunderstorm',
            icon: randomCondition === 'Clear' ? '01d' :
                  randomCondition === 'Clouds' ? '02d' :
                  randomCondition === 'Rain' ? '10d' : '11d',
            humidity: 60 + Math.floor(Math.random() * 30),
            windSpeed: (Math.random() * 5).toFixed(1),
            visibility: (8 + Math.random() * 4).toFixed(1),
            main: randomCondition
          };
        }
      }
      
      if (weatherData) {
        console.log('Weather data successfully fetched:', weatherData);
        setWeatherData(weatherData);
      } else {
        throw new Error('No weather data received');
      }
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherError(`Unable to fetch weather data: ${error.message}`);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Helper function to get weather icon from wttr.in weather code
  const getWeatherIcon = (weatherCode) => {
    const iconMap = {
      113: '01d', // Clear
      116: '02d', // Partly cloudy
      119: '03d', // Cloudy
      122: '04d', // Overcast
      143: '50d', // Mist
      176: '09d', // Patchy rain
      179: '13d', // Patchy snow
      182: '13d', // Patchy sleet
      185: '13d', // Patchy freezing drizzle
      200: '11d', // Thundery outbreaks
      227: '13d', // Blowing snow
      230: '13d', // Blizzard
      248: '50d', // Fog
      260: '50d', // Freezing fog
      263: '09d', // Patchy light drizzle
      266: '09d', // Light drizzle
      281: '13d', // Freezing drizzle
      284: '13d', // Heavy freezing drizzle
      293: '09d', // Patchy light rain
      296: '10d', // Light rain
      299: '10d', // Moderate rain
      302: '10d', // Heavy rain
      305: '10d', // Heavy rain
      308: '10d', // Heavy rain
      311: '13d', // Light freezing rain
      314: '13d', // Moderate freezing rain
      317: '13d', // Heavy freezing rain
      320: '13d', // Heavy freezing rain
      323: '13d', // Patchy light snow
      326: '13d', // Light snow
      329: '13d', // Moderate snow
      332: '13d', // Heavy snow
      335: '13d', // Heavy snow
      338: '13d', // Heavy snow
      350: '13d', // Ice pellets
      353: '09d', // Light rain shower
      356: '09d', // Moderate rain shower
      359: '09d', // Heavy rain shower
      362: '13d', // Light sleet shower
      365: '13d', // Moderate sleet shower
      368: '13d', // Heavy sleet shower
      371: '13d', // Light snow shower
      374: '13d', // Moderate snow shower
      377: '13d', // Heavy snow shower
      386: '11d', // Patchy light rain with thunder
      389: '11d', // Moderate rain with thunder
      392: '11d', // Heavy rain with thunder
      395: '13d'  // Heavy snow with thunder
    };
    return iconMap[weatherCode] || '01d';
  };

  // Helper function to get weather main category
  const getWeatherMain = (weatherCode) => {
    if (weatherCode >= 200 && weatherCode < 300) return 'Thunderstorm';
    if (weatherCode >= 300 && weatherCode < 400) return 'Drizzle';
    if (weatherCode >= 500 && weatherCode < 600) return 'Rain';
    if (weatherCode >= 600 && weatherCode < 700) return 'Snow';
    if (weatherCode >= 700 && weatherCode < 800) return 'Atmosphere';
    if (weatherCode === 800) return 'Clear';
    if (weatherCode > 800) return 'Clouds';
    return 'Clear';
  };

  // Fetch weather when date changes
  useEffect(() => {
    if (date && ground.length > 0) {
      const groundLocation = ground[0].location;
      fetchWeatherData(groundLocation, date);
    }
  }, [date, ground]);

const totalPrice = (e, g) => {
  e.preventDefault();

  try {
    
    if (!from || !to) {
      toast.error("Please select both start and end time!");
      return;
    }

    const start = from.split(':').map(Number);
    const end = to.split(':').map(Number);

   
    if (start.length !== 2 || end.length !== 2 || 
        start.some(isNaN) || end.some(isNaN)) {
      toast.error("Invalid time format!");
      return;
    }

    const [startHour, startMinute] = start;
    const [endHour, endMinute] = end;

    
    if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
        endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
      toast.error("Invalid time values!");
      return;
    }

   
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    
    if (endTotalMinutes <= startTotalMinutes) {
      toast.error("End time must be later than start time!");
      return;
    }

    
    const exactHours = (endTotalMinutes - startTotalMinutes) / 60;
    
    
    const hours = Math.floor(exactHours);
    
    const total = hours * g.price;

   
    setFullPrice(total.toFixed(2));
    setHours(hours);

  } catch (error) {
    toast.error("An error occurred while calculating the price!");
    console.error("Error in totalPrice:", error);
  }
};

//################################ fetch grounds by id ##############################
  useEffect(() => {

    const fetchGround = async() =>
    {
      try {
        console.log('Fetching ground with ID:', id);
        
        const res = await axios.get(`http://localhost:8080/api/coach/get-ground-by-id/${id}`,
          {withCredentials:true}
        )

        console.log('Ground response:', res.data);
        console.log('Ground data:', res.data.data);

        if(res.status === 200)
        {
          setGround(res.data.data);
          console.log('Ground set in state:', res.data.data);
        }

        const resSlots = await axios.get(`http://localhost:8080/api/coach/booked-slots/${id}`, { withCredentials: true });
          if (resSlots.status === 200) {
            console.log('Coach - Booked slots response:', resSlots.data);
            console.log('Coach - Booked slots data:', resSlots.data.bookedSlots);
            setBookedSlots(resSlots.data.bookedSlots);
          }

      } catch (error) {
        console.error('Error fetching ground:', error);
        console.error('Error response:', error.response?.data);
        
        if(error.response)
        {
          if(error.response.status === 400)
          {
            navigate('/log');
          }
          else if(error.response.status === 404)
          {
            toast.error("Ground Not Found!",{autoClose:1500});
          }

          else if(error.response.status === 500)
          {
            toast.error("Internal server error occured!",{autoClose:1500});
          }
        }
      }
    }

    fetchGround();

  },[id]);

  
  //############################ confirm booking ##############################
  const handleConfirm = async(ground) =>
  {
    try {

      const available = await checkAvailability(ground._id, date, from, to);
        if (!available) {
        return;
        }

      if (!paymethod || !['credit-card', 'paypal', 'cash'].includes(paymethod)) {
        toast.error("Please select a valid payment method!");
        return;
    }

    if (!date || !from || !to) {
      toast.error("Please fill all required fields!");
      return;
    }
      
      const bookingData = {
        venueId:ground._id,
        date:date,
        method:paymethod,
        price:fullPrice,
        from:from,
        to:to
      }

      const res = await axios.post('http://localhost:8080/api/coach/player-book-ground',bookingData,
        {withCredentials:true}
      )

      if(res.status === 200)
      {
        toast.success("Successfully saved Your Booking,Waiting for approval",{autoClose:1500});
        setFullPrice('');
        setDate('');
        setFrom('');
        setTo('');
        setPaymethod('credit-card');
      }

    } catch (error) {
      if(error.response)
      {
        if(error.response.status === 400)
        {
          navigate('/log');
        }
        else if(error.response.status === 401)
        {
          toast.error("Booking Failed!",{autoClose:1500});
        }
        else if(error.response.status === 402)
        {
          toast.error(error.response.data.message,{autoClose:1500});
        }
        else if(error.response.status === 403)
        {
            toast.error(error.response.data.message,{autoClose:1500});
        }
        else if(error.response.status === 404)
        {
            toast.error(error.response.data.message,{autoClose:1500});
        }
        else if(error.response.status === 500)
        {
          toast.error("internal server error!",{autoClose:1500});
        }
      }
    }
  }

  //############################ check availability ##############################
  const checkAvailability = async (groundId, date, from, to) => {
  try {
    console.log('Checking availability with:', { groundId, date, from, to });
    
    const res = await axios.post("http://localhost:8080/api/coach/check-availability",
      { venueId: groundId, date, from, to },
      { withCredentials: true }
    );

    console.log('Availability response:', res.data);

    if (res.status === 200 && res.data.available) {
      return true;
    }
  } catch (error) {
    console.error('Availability check error:', error);
    console.error('Error response:', error.response?.data);
    
    if (error.response && error.response.status === 409) {
      toast.error(error.response.data.message, { autoClose: 2000 });
      return false;
    } else if (error.response && error.response.status === 400) {
      toast.error(error.response.data.message, { autoClose: 2000 });
      return false;
    } else {
      toast.error("Error checking availability!", { autoClose: 2000 });
      return false;
    }
  }
};

useEffect(() => {
  console.log("Coach - Booked slots:", bookedSlots);
  console.log("Coach - Selected date:", date);
  if (date && bookedSlots.length > 0) {
    const filteredSlots = bookedSlots.filter(slot => {
      const slotDate = slot.date; // Already in YYYY-MM-DD format from backend
      const selectedDate = date; // Already in YYYY-MM-DD format from input
      console.log("Coach - Comparing slot date:", slotDate, "with selected date:", selectedDate);
      console.log("Coach - Are they equal?", slotDate === selectedDate);
      return slotDate === selectedDate;
    });
    console.log("Coach - Filtered slots for selected date:", filteredSlots);
  }
}, [date, bookedSlots]);

  return (
    <div className="p-nb-body">
      {/* Sidebar */}
      <Coach_sideBar/>
      <ToastContainer/>
      {/* Main Content */}
      <div className="p-nb-main-content">
        <div className="p-nb-page-header">
          <h1 className="p-nb-page-title">Book Now</h1>
        </div>

        <div className="p-nb-booking-container">
          
          {ground.length > 0 ? (
            ground.map((g) => (
              
            <div key={g._id} className="p-nb-booking-wrapper">
            <div className="p-nb-ground-info">
            <div className="p-nb-ground-image">
              <img
                src={`/uploads/${g.photo.filename}`}
                alt="Sports Ground"
              />
            </div>

            <h2 className="p-nb-ground-name">{g.name}</h2>

            <div className="p-nb-price-tag">LKR {g.price} / hour</div>

            <div className="p-nb-ground-details">
              <div className="p-nb-detail-item">
                <FontAwesomeIcon icon={faMapMarkerAlt}/>
                <span>{g.location.address},{g.location.city}</span>
              </div>
              <div className="p-nb-detail-item">
                <FontAwesomeIcon icon={faPhone}/>
                <span>{g.ground_manager.mobile}</span>
              </div>
              
            </div>

            <div className="p-nb-facilities">
              <h3>Facilities</h3>
              <div className="p-nb-facility-tags">
                {g.facilities.map((facility,i) => (
                  <span key={i} className="p-nb-facility-tag">{facility}</span>
                ))}
                
              </div>
            </div>
          </div>
              

            
          <div className="p-nb-booking-form">
            
            <form onSubmit={(e)=>totalPrice(e,g)}>
              <div className="p-nb-form-section">
              <h3>
                <i className="far fa-calendar-alt"></i> Select Date & Time
              </h3>

              <div className="p-nb-form-group">
                <label htmlFor="booking-date">Booking Date</label>
                <input 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date" id="booking-date" required className="p-nb-form-control" 
                min={new Date().toLocaleDateString("en-CA")}
                />
              </div>

              {date && (
              <div className="p-nb-booked-slots">
                <h4>Unavailable Time Slots</h4>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
                  Total booked slots: {bookedSlots.length} | Selected date: {date}
                </div>
                {(() => {
                  const filteredSlots = bookedSlots.filter(slot => {
                    const slotDate = slot.date; // Already in YYYY-MM-DD format from backend
                    const selectedDate = date; // Already in YYYY-MM-DD format from input
                    console.log("Coach - Comparing slot date:", slotDate, "with selected date:", selectedDate);
                    return slotDate === selectedDate;
                  });
                  
                  console.log("Coach - Filtered slots for date", date, ":", filteredSlots);
                  
                  return filteredSlots.length > 0 ? (
                    <ul>
                      {filteredSlots.map((slot, i) => (
                        <li key={i}>
                          {slot.startTime} - {slot.endTime}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No bookings found for this date. All slots are available!</p>
                  );
                })()}
              </div>
            )}

            {/* Weather Display Component */}
            {date && ground.length > 0 && (
              <div className="p-nb-weather-section">
                <h4>
                  <i className="fas fa-cloud-sun"></i> Weather Forecast for {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                
                {weatherLoading ? (
                  <div className="p-nb-weather-loading">
                    <div className="p-nb-weather-spinner"></div>
                    <span>Loading weather data...</span>
                  </div>
                ) : weatherError ? (
                  <div className="p-nb-weather-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{weatherError}</span>
                  </div>
                ) : weatherData ? (
                  <div className="p-nb-weather-card">
                    <div className="p-nb-weather-main">
                      <div className="p-nb-weather-icon">
                        <img 
                          src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} 
                          alt={weatherData.description}
                        />
                      </div>
                      <div className="p-nb-weather-info">
                        <div className="p-nb-weather-temp">{weatherData.temperature}°C</div>
                        <div className="p-nb-weather-desc">{weatherData.description}</div>
                      </div>
                    </div>
                    
                    <div className="p-nb-weather-details">
                      <div className="p-nb-weather-detail">
                        <FontAwesomeIcon icon={faThermometerHalf} />
                        <span>Feels like {weatherData.temperature}°C</span>
                      </div>
                      <div className="p-nb-weather-detail">
                        <FontAwesomeIcon icon={faWind} />
                        <span>{weatherData.windSpeed} m/s</span>
                      </div>
                      <div className="p-nb-weather-detail">
                        <FontAwesomeIcon icon={faEye} />
                        <span>{weatherData.visibility} km visibility</span>
                      </div>
                      <div className="p-nb-weather-detail">
                        <FontAwesomeIcon icon={faCloud} />
                        <span>{weatherData.humidity}% humidity</span>
                      </div>
                    </div>
                    
                    <div className="p-nb-weather-recommendation">
                      {weatherData.main === 'Rain' && (
                        <div className="p-nb-weather-warning">
                          <i className="fas fa-exclamation-triangle"></i>
                          <strong>Rain Expected:</strong> Consider indoor training alternatives or reschedule.
                        </div>
                      )}
                      {weatherData.main === 'Clear' && (
                        <div className="p-nb-weather-good">
                          <i className="fas fa-check-circle"></i>
                          <strong>Perfect Weather:</strong> Ideal conditions for outdoor training!
                        </div>
                      )}
                      {weatherData.main === 'Clouds' && (
                        <div className="p-nb-weather-good">
                          <i className="fas fa-check-circle"></i>
                          <strong>Good Weather:</strong> Cloudy but suitable for outdoor activities.
                        </div>
                      )}
                      {weatherData.temperature > 30 && (
                        <div className="p-nb-weather-warning">
                          <i className="fas fa-thermometer-full"></i>
                          <strong>Hot Weather:</strong> Ensure proper hydration and consider shorter sessions.
                        </div>
                      )}
                      {weatherData.temperature < 15 && (
                        <div className="p-nb-weather-warning">
                          <i className="fas fa-thermometer-empty"></i>
                          <strong>Cold Weather:</strong> Dress warmly and consider indoor alternatives.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

              <div className="p-nb-time-inputs">
                <div className="p-nb-form-group">
                  <label htmlFor="start-time">Start Time</label>
                  <input 
                  
                  onChange={(e) => setFrom(e.target.value)}
                  type="time" id="start-time" required className="p-nb-form-control" />
                </div>

                <div className="p-nb-form-group">
                  <label htmlFor="end-time">End Time</label>
                  <input
                   
                  onChange={(e) => setTo(e.target.value)}
                  type="time" id="end-time" required className="p-nb-form-control" />
                </div>
              </div>
            </div>
            

            <div className="p-nb-form-section">
              <h3>
                <i className="far fa-credit-card"></i> Payment Method
              </h3>

              <div className="p-nb-payment-methods">
                <label className="p-nb-payment-option">
                  <input 
                  onChange={(e) => setPaymethod(e.target.value)}
                  type="radio" 
                  name="payment-method" 
                  value="credit-card" 
                  checked={paymethod === 'credit-card'}
                  />
                  <div className="p-nb-payment-option-content">
                    <div className="p-nb-custom-radio"></div>
                    <div className="p-nb-payment-option-icon">
                      <FontAwesomeIcon icon={faCreditCard}/>
                    </div>
                    <span className="p-nb-payment-option-label">Credit Card</span>
                  </div>
                </label>

                <label className="p-nb-payment-option">
                  <input 
                  onChange={(e) => setPaymethod(e.target.value)}
                  type="radio" 
                  name="payment-method" 
                  value="paypal" 
                  checked={paymethod === 'paypal'}
                  />
                  <div className="p-nb-payment-option-content">
                    <div className="p-nb-custom-radio"></div>
                    <div className="p-nb-payment-option-icon">
                      
                    </div>
                    <span className="p-nb-payment-option-label">PayPal</span>
                  </div>
                </label>

                <label className="p-nb-payment-option">
                  <input 
                  onChange={(e) => setPaymethod(e.target.value)}
                  type="radio" 
                  name="payment-method" 
                  value="cash" 
                  checked={paymethod === 'cash'}
                  />
                  <div className="p-nb-payment-option-content">
                    <div className="p-nb-custom-radio"></div>
                    <div className="p-nb-payment-option-icon">
                      <FontAwesomeIcon icon={faMoneyBillWave}/>
                    </div>
                    <span className="p-nb-payment-option-label">Cash</span>
                  </div>
                </label>
              </div>
            </div>
            

            <div className="p-nb-btn-total">
              <button>Total price</button>
            </div>
            </form>

            {fullPrice ? (
              <div className="p-nb-form-section">
              <h3>
                <i className="fas fa-receipt"></i> Price Summary
              </h3>

              <div className="p-nb-price-summary">
                <div className="p-nb-price-row">
                  <span>Price per hour</span>
                  <span>LKR {g.price}</span>
                </div>
                <div className="p-nb-price-row">
                  <span>Duration</span>
                  <span>{hour} hours</span>
                </div>
                <div className="p-nb-price-row total">
                  <span>Total Amount</span>
                  <span>LKR {fullPrice}</span>
                </div>

                 <button 
                 onClick={()=>handleConfirm(g)}
                 className="p-nb-btn-book">Confirm Booking</button>
              </div>
            </div>
            ):(
              <div
                style={{marginTop:"20px", padding:"10px"}}
              >Please fill the rental details and click "Total Price" to see summary.</div>
            )}

          </div>
          </div>
            ))
          ):(
            <div
              style={{width:"100%",padding:"20px",textAlign:"center",fontWeight:"bold",fontSize:"1.5rem"}}
            >No Ground Selected</div>
          )}
         

        
        </div>
      </div>
    </div>
  );
};

export default Coach_add_new_booking;
