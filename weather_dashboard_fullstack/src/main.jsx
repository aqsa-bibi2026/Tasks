import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import axios from "axios";
import "./style.css";

function App(){
 const [city,setCity]=useState("London");
 const [weather,setWeather]=useState(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);

 const weatherDescription = code => {
  if(code === 0) return "clear sky";
  if([1,2,3].includes(code)) return "partly cloudy";
  if([45,48].includes(code)) return "foggy";
  if([51,53,55,56,57].includes(code)) return "drizzle";
  if([61,63,65,66,67,80,81,82].includes(code)) return "rain showers";
  if([71,73,75,77,85,86].includes(code)) return "snow showers";
  if([95,96,99].includes(code)) return "thunderstorm";
  return "mixed conditions";
 };

 async function search(){
  if(!city.trim()) return;
  try{
   setError("");
   setLoading(true);
    const location=await axios.get("https://geocoding-api.open-meteo.com/v1/search",{
     params:{name:city.trim(),count:1,language:"en",format:"json"}
    });
    const place=location.data.results?.[0];
    if(!place) throw new Error("City not found");
    const forecast=await axios.get("https://api.open-meteo.com/v1/forecast",{
     params:{latitude:place.latitude,longitude:place.longitude,current:"temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility",timezone:"auto"}
    });
    const current=forecast.data.current;
    setWeather({
     name:place.name,
     sys:{country:place.country_code},
     main:{temp:current.temperature_2m,feels_like:current.apparent_temperature,humidity:current.relative_humidity_2m,pressure:current.surface_pressure},
     weather:[{description:weatherDescription(current.weather_code)}],
     wind:{speed:current.wind_speed_10m},
     visibility:current.visibility
    });
  }catch(e){
   setError("We couldn't find that city. Check the name or API key.");
  }finally{
   setLoading(false);
  }
 }

 return <div className="app">
  <header className="topbar">
   <div className="brand"><span className="brand-mark">☼</span><span>Atmos</span></div>
   <span className="status"><span className="status-dot"/> Live weather</span>
  </header>

  <main>
   <section className="intro">
    <p className="eyebrow">Your daily outlook</p>
    <h1>Know your sky.</h1>
    <p className="subheading">A clear view of the weather, wherever your day takes you.</p>
    <form className="search" onSubmit={e=>{e.preventDefault();search();}}>
     <span className="search-icon">⌕</span>
     <input aria-label="City name" value={city} placeholder="Search a city..." onChange={e=>setCity(e.target.value)}/>
     <button type="submit" disabled={loading}>{loading ? "Loading..." : "Explore"}<span>→</span></button>
    </form>
   </section>

   {error && <p className="error" role="alert">{error}</p>}

   {weather ? <section className="weather-grid">
    <article className="main-card">
     <div className="card-top"><div><p className="label">CURRENT WEATHER</p><h2>{weather.name}<span>, {weather.sys.country}</span></h2></div><span className="date">Today</span></div>
     <div className="temperature"><span>{Math.round(weather.main.temp)}</span><sup>°C</sup></div>
     <p className="condition">{weather.weather[0].description}</p>
     <p className="feels">Feels like {Math.round(weather.main.feels_like)}°</p>
     <div className="sun" aria-hidden="true">☀</div>
    </article>
    <div className="stats">
     <article className="stat-card"><span className="stat-icon">◌</span><div><p>Humidity</p><strong>{weather.main.humidity}%</strong></div></article>
     <article className="stat-card"><span className="stat-icon">≋</span><div><p>Wind speed</p><strong>{weather.wind.speed} <small>m/s</small></strong></div></article>
     <article className="stat-card"><span className="stat-icon">◒</span><div><p>Pressure</p><strong>{weather.main.pressure} <small>hPa</small></strong></div></article>
     <article className="stat-card"><span className="stat-icon">▣</span><div><p>Visibility</p><strong>{(weather.visibility / 1000).toFixed(1)} <small>km</small></strong></div></article>
    </div>
   </section> : <section className="empty-state"><div className="empty-icon">☁</div><h2>Your forecast starts here</h2><p>Search for a city to see its current conditions and a handful of useful details.</p></section>}
  </main>
  <footer>Atmos / Weather, made simple</footer>
 </div>
}

createRoot(document.getElementById("root")).render(<App/>);