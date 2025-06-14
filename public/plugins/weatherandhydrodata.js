function weatherandhydrodata_init() {
    if (weatherdata && weatherdata.length > 0) {
        if (customweathersymboltype && customweathersymboltype !== null && customweathersymboltype !== '') {
            usedweathersymboltype = customweathersymboltype; // überschreibe Standardwert, wenn gesetzt
        } else {
            usedweathersymboltype = weathersymboltype; // Standardwert
        }
        displayWeather(usedweathersymboltype);
    } else {
        console.warn('Fehler: Keine Wetterdaten vorhanden. Es werden keine Wetterdaten angezeigt.');
    }

    if (hydrodata && hydrodata.length > 0) {
        displayHydro();
    } else {
        console.warn('Fehler: Keine Hydrodaten vorhanden. Es werden keine Hydrodaten angezeigt.');
    }

    if (document.getElementById("statusRuderverbot") && (hydrodata && hydrodata.length > 0) && (weatherdata && weatherdata.length > 0)) {
        displayRuderverbot();
    } else {
        console.warn('Fehler: statusRuderverbot-Element nicht gefunden oder keine Wetter- bzw. Hydrodaten vorhanden. Es wird kein Ruderverbot-Status angezeigt.');
    }
}

// Setze Wetterdaten in HTML ein
function displayWeather(usedweathersymboltype) {
    try {

        if (document.getElementById("weather0_text") && reqparam.debug == 'true') {
            const weather0_datetime = new Date(weatherdata.current.date_time);
            const weather0_hours = weather0_datetime.getHours();
            const weather0_minutes = weather0_datetime.getMinutes();
            document.getElementById("weather0_text").innerHTML += `<br><span class="textsizehalf">(${weather0_hours.toString().padStart(2, '0')}:${weather0_minutes.toString().padStart(2, '0')})</span>`;
        };
        if (document.getElementById("weather0_symbol")) {
            document.getElementById("weather0_symbol").innerHTML = `<img src="${usedweathersymboltype+'/'+weatherdata.current.symbol_code}.svg">`;
        };
        if (document.getElementById("weather0_temperatur")) {
            document.getElementById("weather0_temperatur").innerHTML = `${Math.round(weatherdata.current.TTT_C)}°C<br>(${Math.round(weatherdata.current.TTTFEEL_C)}°C)`;
        };
        if (document.getElementById("weather0_rain")) {
            document.getElementById("weather0_rain").innerHTML = `${Math.round(weatherdata.current.PROBPCP_PERCENT)}%<br>${weatherdata.current.RRR_MM} mm`;
        };
        if (document.getElementById("weather0_wind")) {
            document.getElementById("weather0_wind").innerHTML = `${Math.round(weatherdata.current.FF_KMH)} km/h<br><img style="transform-origin: 50% 50%; transform: rotate(${weatherdata.current.DD_DEG}deg);" src="${usedweathersymboltype}/winddir.svg">`;
        };

        if (document.getElementById("weather2_text") && reqparam.debug == 'true') {
            const weather2_datetime = new Date(weatherdata.in2h.date_time);
            const weather2_hours = weather2_datetime.getHours();
            const weather2_minutes = weather2_datetime.getMinutes();
            document.getElementById("weather2_text").innerHTML += `<br><span class="textsizehalf">(${weather2_hours.toString().padStart(2, '0')}:${weather2_minutes.toString().padStart(2, '0')})</span>`;
        };
        if (document.getElementById("weather2_symbol")) {
            document.getElementById("weather2_symbol").innerHTML = `<img src="${usedweathersymboltype+'/'+weatherdata.in2h.symbol_code}.svg">`;
        };
        if (document.getElementById("weather2_temperatur")) {
            document.getElementById("weather2_temperatur").innerHTML = `${Math.round(weatherdata.in2h.TTT_C)}°C<br>(${Math.round(weatherdata.in2h.TTTFEEL_C)}°C)`;
        };
        if (document.getElementById("weather2_rain")) {
            document.getElementById("weather2_rain").innerHTML = `${Math.round(weatherdata.in2h.PROBPCP_PERCENT)}%<br>${weatherdata.in2h.RRR_MM} mm`;
        };
        if (document.getElementById("weather2_wind")) {
            document.getElementById("weather2_wind").innerHTML = `${Math.round(weatherdata.in2h.FF_KMH)} km/h<br><img style="transform-origin: 50% 50%; transform: rotate(${weatherdata.in2h.DD_DEG}deg);" src="${usedweathersymboltype}/winddir.svg">`;
        };

    } catch(err) {
        console.error(`Fehler beim anzeigen der Wetterdaten: ${err}`)
    };
};


// Setze Hydrodaten in HTML ein
function displayHydro() {
    try {

        if (document.getElementById("hydro_discharge")) {
            document.getElementById("hydro_discharge").innerHTML = `${Math.round(hydrodata.discharge)} m&sup3;/sek`;
        };
        if (document.getElementById("hydro_watertemp")) {
            document.getElementById("hydro_watertemp").innerHTML = `${Math.round(hydrodata.waterTemperature)}°C`;
        };

    } catch(err) {
        console.error(`Fehler beim anzeigen der Hydrodaten: ${err}`)
    };
};


// Schaue ob Ruderverbot ist und setze ggf. Text in HTML ein
function displayRuderverbot() {
    const statusRuderverbot = checkRuderverbot();

    if (statusRuderverbot.urgency > 0) {
        try {document.getElementById("welcometext").innerHTML = "";} catch(err) {};
        document.getElementById("statusRuderverbot").innerHTML = statusRuderverbot.text; //`<b>${statustext}</b>`;
    };

};

// Checke ob Ruderverbot besteht und blende Text ein
function checkRuderverbot() {
    statusRuderverbot = {text: "", urgency: 0};
    const symbolcode_badweather = [14, 16, 26, 28, 30];
  
    try {
        if (Math.round(hydrodata.discharge) > 350) { // Durchfluss > 350m2
            statusRuderverbot.text = "RUDERVERBOT! (zu viel Strömung)";
            statusRuderverbot.urgency = 3;
        } else if (Math.round(hydrodata.discharge) > 300) { // Durchfluss > 300m2
            statusRuderverbot.text = "Starke Strömung, nur bis 6er!";
            statusRuderverbot.urgency = 3;
        } else if (Math.round(weatherdata.current.FF_KMH) > 46) { // Wind > 46
            statusRuderverbot.text = "RUDERVERBOT! (Starkwindwarnung)";
            statusRuderverbot.urgency = 2;
        } else if (Math.round(weatherdata.in2h.FF_KMH) > 46) { // Wind > 46
            statusRuderverbot.text = "RUDERVERBOT! (Starkwindwarnung in 2h)";
            statusRuderverbot.urgency = 2;
        } else if (symbolcode_badweather.includes(weatherdata.current.symbol_code)) { // Schlechtwetter (Gewitter)
            statusRuderverbot.text = "RUDERVERBOT! (Gewitter)";
            statusRuderverbot.urgency = 2;
        } else if (symbolcode_badweather.includes(weatherdata.in2h.symbol_code)) { // Schlechtwetter (Gewitter)
            statusRuderverbot.text = "RUDERVERBOT! (Gewitter in 2h)";
            statusRuderverbot.urgency = 2;
        } else if (weatherdata.current.symbol_code < 0 && weatherdata.in2h.symbol_code < 0) { // komplett Dunkel
            statusRuderverbot.text = "RUDERVERBOT! (Dunkelheit)";
            statusRuderverbot.urgency = 2;
        } else if (weatherdata.in1h.symbol_code < 0) { // in 1h Dunkel
            statusRuderverbot.text = "Es wird Dunkel...";
            statusRuderverbot.urgency = 1;
        } else if (Math.round(weatherdata.current.FF_KMH) > 25) { // Wind > 25kmh
            statusRuderverbot.text = "Achtung starker Wind";
            statusRuderverbot.urgency = 1;
        } else if (Math.round(weatherdata.in2h.FF_KMH) > 25) { // Wind > 25kmh
            statusRuderverbot.text = "Achtung starker Wind in 2h";
            statusRuderverbot.urgency = 1;
        };

        console.log(statusRuderverbot)
        return statusRuderverbot;

    } catch(err) {
        console.error(`Fehler beim berechnen des Ruderverbots: ${err}`)
        return {text: "", urgency: 0};
    };
};