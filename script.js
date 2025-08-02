const apiKey = '9b16887a6cfe6c5d185cc5b11c6d38d5';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
    } else {
        alert('Please insert city name');
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>Loading...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();

        displayWeather(data);
        saveToHistory(city);

        localStorage.setItem('lastWeatherData', JSON.stringify(data));
        localStorage.setItem('lastWeatherCity', city);

        getForecast(city);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p class="weather-description">${description}</p>
        <p>humidity: ${humidity}%</p>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('history', JSON.stringify(history));
        displaySearchHistory();
    }
}

function removeFromHistory(cityToRemove) {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    history = history.filter(city => city !== cityToRemove);
    localStorage.setItem('history', JSON.stringify(history));
    displaySearchHistory();
}

function displaySearchHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const datalist = document.getElementById('city-history');
    datalist.innerHTML = '';

    history.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
}


async function getForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=en`;
    const response = await fetch(forecastUrl);
    const data = await response.json();

    displayForecast(data.list);

    localStorage.setItem('lastForecastData', JSON.stringify(data.list));
}


function displayForecast(list) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';

    const filtered = list.filter(item => item.dt_txt.includes('12:00:00'));

    filtered.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString('th-TH');
        const temp = item.main.temp.toFixed(1);
        const description = item.weather[0].description;
        const icon = item.weather[0].icon;

        const card = document.createElement('div');
        card.className = 'bg-white/10 rounded p-2 m-1 text-center';
        card.innerHTML = `
            <p><strong>${date}</strong></p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <p>${temp}°C</p>
            <p>${description}</p>
        `;
        container.appendChild(card);
        document.getElementById('forecast-section').style.display = 'block';
    });
}
 
window.addEventListener('DOMContentLoaded', () => {
    displaySearchHistory();

    const savedWeather = localStorage.getItem('lastWeatherData');
    const savedForecast = localStorage.getItem('lastForecastData');

    if (savedWeather) {
        const weatherData = JSON.parse(savedWeather);
        displayWeather(weatherData);
    }

    if (savedForecast) {
        const forecastData = JSON.parse(savedForecast);
        displayForecast(forecastData);
    }
});

document.getElementById('clear-history-btn').addEventListener('click', () => {
    localStorage.removeItem('history');
    displaySearchHistory();
});



displaySearchHistory();