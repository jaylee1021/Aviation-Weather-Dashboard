'use client';
import axios from "axios";
import { useState, useEffect, useCallback, use } from "react";
import '../css/weather.css';
import * as React from 'react';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import setAuthToken from "../utils/setAuthToken"; // Set token for authorization
import handleLogout from "../utils/handleLogout"; // Logout function
import CustomCharts from "./CustomCharts"; // Weather charts component
import ShowHide from "./ShowHide"; // ShowHide component
import UpdateParams from "./UpdateParams"; // Updating operating window component
import AqiCheck from "./AqiCheck"; // Air quality component
import WeatherSummary from "./WeatherSummary"; // Weather summary component
import SiteSelection from "./SiteSelection";
import WindUnitConvert from "./WindUnitConvert";
import TempUnitConvert from "./TempUnitConvert";
import WeatherTable from "./WeatherTable";

export default function WeatherMain() {

    const [userData, setUserData] = useState([]);
    const [weather, setWeather] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [wind, setWind] = useState('');
    const [windOpWindow, setWindOpWindow] = useState('');
    const [windUnit, setWindUnit] = useState('');
    const [windGust, setWindGust] = useState('');
    const [windGustOpWindow, setWindGustOpWindow] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date().toLocaleString());
    const [minCountdown, setMinCountdown] = useState(60);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('userId') : null);
    const [temp, setTemp] = useState('');
    const [tempUnit, setTempUnit] = useState('');
    const [tempLow, setTempLow] = useState('');
    const [tempHigh, setTempHigh] = useState('');
    const [aqiData, setAqiData] = useState();
    const router = useRouter();

    // conversion constants
    const mphToKnots = 0.868976;
    const mphToMetersPerSec = 0.44704;
    const knotsToMeterPerSec = 0.514444;
    const meterPerSecToKnots = 1.94384;

    // convert fahrenheit to celsius
    const toC = (f) => {
        return (f - 32) * (5 / 9);
    };

    // set wind unit on page load
    useEffect(() => {
        setWindUnit(localStorage.getItem('windUnit') ? localStorage.getItem('windUnit') : 'knots');
        setAuthToken(localStorage.getItem('jwtToken'));
    }, [router]);

    const fetchUser = useCallback(async () => {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${userId}`);
        const fetchedUserData = res.data.user;
        setUserData(fetchedUserData);
        localStorage.getItem('tempUnit') === 'f' ? (setTempLow(fetchedUserData.tempLow), setTempHigh(fetchedUserData.tempHigh)) :
            (setTempLow((toC(fetchedUserData.tempLow)).toFixed(1)), setTempHigh((toC(fetchedUserData.tempHigh)).toFixed(1)));
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        setAuthToken(localStorage.getItem('jwtToken'));
        if (localStorage.getItem('jwtToken')) {
            axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${userId}`)
                .then((res) => {
                    let userData = jwtDecode(localStorage.getItem('jwtToken'));
                    if (userData.email === localStorage.getItem('email')) {
                        fetchUser();
                    } else {
                        router.push('/users/login');
                    }
                })
                .catch((err) => {
                    console.log(err);
                    router.push('/users/login');
                });
        } else {
            router.push('/users/login');
        }
    }, [userId, fetchUser, router]);

    // convert wind speed to knots
    const toKnots = useCallback(() => {
        // set wind speed and wind gust to knots
        setWind((weather.wind_mph * mphToKnots).toFixed(1));
        userData.userWindUnit === 'knots' ? setWindOpWindow(userData.wind) : setWindOpWindow(userData.wind * meterPerSecToKnots);

        setWindGust((weather.gust_mph * mphToKnots).toFixed(1));
        userData.userWindGustUnit === 'knots' ? setWindGustOpWindow(userData.windGust) : setWindGustOpWindow(userData.windGust * meterPerSecToKnots);

    }, [mphToKnots, userData.wind, userData.windGust, userData.userWindUnit, userData.userWindGustUnit, weather.wind_mph, weather.gust_mph]);

    // convert wind speed to m/s
    const toMetersPerSec = useCallback(() => {
        // set wind speed and wind gust to m/s
        setWind((weather.wind_mph * mphToMetersPerSec).toFixed(1));
        userData.userWindUnit === 'm/s' ? setWindOpWindow(userData.wind) : setWindOpWindow(userData.wind * knotsToMeterPerSec);

        setWindGust((weather.gust_mph * mphToMetersPerSec).toFixed(1));
        userData.userWindGustUnit === 'm/s' ? setWindGustOpWindow(userData.windGust) : setWindGustOpWindow(userData.windGust * knotsToMeterPerSec);

    }, [mphToMetersPerSec, userData.wind, userData.windGust, userData.userWindUnit, userData.userWindGustUnit, weather.wind_mph, weather.gust_mph]);

    // fetch weather data on page load and every minute
    const fetchData = useCallback(async () => {

        const selectSite = localStorage.getItem('selectSite') ? localStorage.getItem('selectSite') : 'hsiland';
        let latitude;
        let longitude;
        if (selectSite === 'hsiland' || localStorage.getItem('selectSite') === 'hsiland') {
            latitude = process.env.NEXT_PUBLIC_HSILAND_LATITUDE;
            longitude = process.env.NEXT_PUBLIC_HSILAND_LONGITUDE;
        } else if (selectSite === 'pdt10_hangar' || localStorage.getItem('selectSite') === 'pdt10_hangar') {
            latitude = process.env.NEXT_PUBLIC_PDT10_HANGAR_LATITUDE;
            longitude = process.env.NEXT_PUBLIC_PDT10_HANGAR_LONGITUDE;
        } else if (selectSite === 'pdt10_northpad' || localStorage.getItem('selectSite') === 'pdt10_northpad') {
            latitude = process.env.NEXT_PUBLIC_PDT10_NORTH_PAD_LATITUDE;
            longitude = process.env.NEXT_PUBLIC_PDT10_NORTH_PAD_LONGITUDE;
        }

        try {
            const [weatherResponse, aqiResponse] = await Promise.all([
                axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${latitude},${longitude}`),
                axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi&hourly=us_aqi&timezone=America%2FLos_Angeles&forecast_days=1`)
            ]);
            const weatherData = weatherResponse.data;
            setForecast(weatherData.forecast.forecastday[0].hour);
            setWeather(weatherData.current);
            localStorage.getItem('tempUnit') === 'f' ? (setTemp(weatherData.current.temp_f), setTempUnit('F')) : (setTemp(weatherData.current.temp_c), setTempUnit('C'));

            const aqiData = aqiResponse.data;
            setAqiData(aqiData);

            if (windUnit === 'knots') {
                toKnots();
            } else if (windUnit === 'm/s') {
                toMetersPerSec();
            }
            setMinCountdown(60);

        } catch (error) {
            console.log(error);
        }
    }, [toKnots, toMetersPerSec, windUnit]);

    // return operating window to default values
    const handleReturnToDefault = useCallback(async () => {
        await axios.put(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/${userId}`, {
            wind: 14, windGust: 25, tempLow: 32, tempHigh: 91, precipitation: 0.0, visibility: 3,
            cloudBaseHeight: 1000, densityAltitudeLow: -2000, densityAltitudeHigh: 4600, lighteningStrike: 30,
            unit: 'knots', userWindUnit: 'knots', userWindGustUnit: 'knots', windDirectionLow: -1, windDirectionHigh: 361
        })
            .then((res) => {
                localStorage.setItem('windUnit', 'knots');
                localStorage.setItem('selectSite', 'hsiland');
                localStorage.setItem('tempUnit', 'f');
                setTemp(weather.temp_f);
                setTempUnit('F');
                setWindUnit('knots');
                fetchData();
                fetchUser();
            })
            .catch((err) => {
                console.log(err);
            });

    }, [userId, fetchData, fetchUser, weather.temp_f]);

    // check if it's midnight PST and if it's midnight, run handleReturnToDefault()
    const checkMidnightPST = useCallback(() => {
        const currentTime = new Date();
        const pacificTimeOffset = -8;

        const currentPSTHour = currentTime.getUTCHours() + pacificTimeOffset;
        const currentPSTMinutes = currentTime.getUTCMinutes();

        if (currentPSTHour === 0 && currentPSTMinutes === 0) {
            handleReturnToDefault();
            handleLogout();
        }
    }, [handleReturnToDefault]);

    // Function to update time
    const updateTime = () => {
        const currentTime = new Date();
        const formattedDate = currentTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        setCurrentDateTime(`${formattedDate}, ${formattedTime}`);
    };

    useEffect(() => {
        // Update time immediately on mount
        updateTime();
        // Fetch data immediately on mount
        fetchData();
        // Check if it's midnight PST immediately on mount
        checkMidnightPST();
    }, [fetchData, checkMidnightPST]);

    useEffect(() => {
        // run fetchData() every minute
        const fetchDataIntervalId = setInterval(fetchData, 60000);
        // run checkMidnightPST() every minute to check if it's midnight PST
        const midnightIntervalId = setInterval(checkMidnightPST, 60000);
        // run countdown every second
        const countdownInterval = setInterval(() => {
            setMinCountdown(prevCountdown => prevCountdown > 0 ? prevCountdown - 1 : 0);
        }, 1000);
        // Set interval to update time every sec
        const updateTimeIntervalId = setInterval(updateTime, 1000);

        return () => {
            clearInterval(fetchDataIntervalId);
            clearInterval(countdownInterval);
            clearInterval(midnightIntervalId);
            clearInterval(updateTimeIntervalId);
        };
    }, [fetchUser, fetchData, checkMidnightPST]);

    // refresh page on button click
    const handleManualRefresh = () => {
        fetchData();
    };

    const logout = () => {
        handleLogout();
        router.push('/users/login');
    };

    const topMenu = (
        <div>
            <div style={{ display: 'flex' }}>
                <h1 className='page_title'>Flight Test Weather Dashboard, Welcome {userData.firstName} {userData.lastName}!</h1>
                {userData.firstName === 'John' && userData.lastName === 'Doe' &&
                    <div className="tooltip demo_tooltip"> (Note)
                        <span className="tooltiptext">Attention: You are currently logged in using a demo account.
                            Please exercise caution and responsibility while using it.</span>
                    </div>
                }
            </div>
        </div>
    );

    // loading screen
    if (loading) return (
        topMenu
    );

    return (
        <div className="top_wrapper">
            {topMenu}
            <div className="top">
                <div className="buttons_wrapper">
                    <div>
                        <SiteSelection fetchData={fetchData} />
                    </div>
                    <div>
                        <WindUnitConvert userId={userId} setWindUnit={setWindUnit} windUnit={windUnit}
                            toKnots={toKnots} toMetersPerSec={toMetersPerSec} />
                    </div>
                    <div>
                        <TempUnitConvert setTemp={setTemp} setTempUnit={setTempUnit} setTempLow={setTempLow}
                            setTempHigh={setTempHigh} weather={weather} userData={userData} toC={toC} />
                    </div>
                    <div className="button_padding">
                        <Button variant='outlined' onClick={handleManualRefresh}>Manual Refresh</Button>
                    </div>
                    <div className="button_padding">
                        <UpdateParams windUnit={windUnit} userId={userId} fetchUser={fetchUser} />
                    </div>
                    <div className="button_padding">
                        <ShowHide userData={userData} userId={userId} fetchUser={fetchUser} />
                    </div>
                    <div className="button_padding">
                        <Button variant='outlined' onClick={() => handleReturnToDefault()}>Return to default</Button>
                    </div>
                </div>
            </div>
            <div className="time_style_top" >
                <div className="time_style">
                    <p>Current date/time: {currentDateTime}</p>
                </div>
                <div className="time_style">
                    <p className="time_style">Last updated: {weather.last_updated}</p>
                    <p>Refreshing in: {minCountdown}s</p>
                </div>
                <div className="tooltip">(Note)
                    <span className="tooltiptext">Please be aware that, due to constraints associated with the use of a free weather API,
                        we are unable to provide some of the essential aviation weather data. (ex: Cloud base height, DA, lightening strike) </span>
                </div>
            </div>
            <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', flex: 'auto' }}>
                    <WeatherTable userData={userData} weather={weather} wind={wind} windGust={windGust}
                        windUnit={windUnit} temp={temp} tempUnit={tempUnit} windOpWindow={windOpWindow}
                        windGustOpWindow={windGustOpWindow} tempLow={tempLow} tempHigh={tempHigh} />
                </div>
                <div className="side_bar">
                    <WeatherSummary props={{ wind, windOpWindow, userData, windGust, windGustOpWindow, temp, tempLow, tempHigh, weather }} />
                    <div className="table_border" style={{ margin: '10px' }}>
                        {aqiData && <AqiCheck aqiData={aqiData} />}
                    </div>
                    <Button style={{ margin: '0 10px' }} variant="outlined" onClick={logout}>Log Out</Button>
                </div>
            </div>
            {aqiData && <CustomCharts weatherData={forecast} fetchData={fetchData} aqiData={aqiData} userData={userData}
                windOpWindow={windOpWindow} windGustOpWindow={windGustOpWindow} />}
        </div >
    );
};