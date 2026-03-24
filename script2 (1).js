const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
    const API_BASE = "https://api.openweathermap.org/data/2.5/weather";

    const consoleOutput = document.getElementById("consoleOutput");
    const historyTags = document.getElementById("historyTags");
    const weatherDisplay = document.getElementById("weatherDisplay");
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");

    
    
    function log(msg, type = "sync") {
      const line = document.createElement("div");
      line.className = "log-line";
      const dot = document.createElement("span");
      dot.className = `log-dot dot-${type}`;
      const text = document.createElement("span");
      text.className = `log-${type}`;
      text.textContent = msg;
      line.appendChild(dot);
      line.appendChild(text);
      consoleOutput.appendChild(line);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

        function clearConsole() {
        consoleOutput.innerHTML = "";
        }

    
    function getHistory() {
      try {
        return JSON.parse(localStorage.getItem("weatherHistory") || "[]");
      } catch { return []; }
    }

    function saveToHistory(city) {
      let history = getHistory();
      history = [city, ...history.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 8);
      localStorage.setItem("weatherHistory", JSON.stringify(history));
      loadHistory();
    }

    function clearHistory() {
      localStorage.removeItem("weatherHistory");
      loadHistory();
    }

    function loadHistory() {
      const history = getHistory();
      const clearBtn = document.getElementById("clearBtn");
      historyTags.innerHTML = "";
      clearBtn.style.display = history.length ? "inline-block" : "none";
      history.forEach(city => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = city;
        tag.onclick = () => {
          cityInput.value = city;
          handleSearch();
        };
        historyTags.appendChild(tag);
      });
    }

    
    function showWeather(data) {
      weatherDisplay.innerHTML = `
      <table class="weather-table">
        <tr><td>City</td><td>${data.name}, ${data.sys.country}</td></tr>
        <tr><td>Temp</td><td>${(data.main.temp - 273.15).toFixed(1)} °C</td></tr>
        <tr><td>Weather</td><td>${data.weather[0].main}</td></tr>
        <tr><td>Humidity</td><td>${data.main.humidity}%</td></tr>
        <tr><td>Wind</td><td>${data.wind.speed} m/s</td></tr>
      </table>`;
    }

    function showError(msg) {
      weatherDisplay.innerHTML = `<span class="weather-error">${msg}</span>`;
    }

    
    async function fetchWeather(city) {
      clearConsole();

      
      log("▶ Sync Start", "sync");

      
      const fetchPromise = fetch(`${API_BASE}?q=${encodeURIComponent(city)}&appid=${API_KEY}`)
        .then(res => {
         
          log("Promise.then (Microtask)", "sync");
          return res;
        })
        .catch(err => {
          log("Promise.catch – Network Error (Microtask)", "error");
          throw err;
        });

      
      log("▶ Sync End", "sync");
      log("[ASYNC] Start fetching…", "async");

      
      setTimeout(() => {
        log("setTimeout (Macrotask)", "macro");
      }, 0);

      try {
        const response = await fetchPromise; 
        const data = await response.json();

        if (!response.ok) {
          
          log("[ASYNC] API error received", "error");
          showError(data.message ? `City not found: "${city}"` : "API error. Try again.");
          return;
        }

        
        log("[ASYNC] Data received ✓", "async");
        showWeather(data);
        saveToHistory(data.name);

      } catch (err) {
        log(`[ASYNC] Error: ${err.message}`, "error");
        showError("Network error. Please check your connection.");
      }
    }

    
    function handleSearch() {
      const city = cityInput.value.trim();
      if (!city) return;

      searchBtn.disabled = true;
      weatherDisplay.innerHTML = `<span class="weather-empty">Fetching…</span>`;

      fetchWeather(city).finally(() => {
        searchBtn.disabled = false;
      });
    }

    cityInput.addEventListener("keydown", e => {
      if (e.key === "Enter") handleSearch();
    });

    
    loadHistory();