// Setze Wetterdaten in HTML ein
function displayWeather() {
    try {

      if (document.getElementById("currwther_text") && reqparam.debug == 'true') {
        const currwther_datetime = new Date(weatherdata.current.date_time);
        const currwther_hours = currwther_datetime.getHours();
        const currwther_minutes = currwther_datetime.getMinutes();
        document.getElementById("currwther_text").innerHTML += `<br><span class="textsizehalf">(${currwther_hours.toString().padStart(2, '0')}:${currwther_minutes.toString().padStart(2, '0')})</span>`;
      };
      if (document.getElementById("currwther_symbol")) {
        document.getElementById("currwther_symbol").innerHTML = `<img src="${weatherdata.current.symbol_code}.svg">`;
      };
      if (document.getElementById("currwther_temperatur")) {
        document.getElementById("currwther_temperatur").innerHTML = `${Math.round(weatherdata.current.TTT_C)}°C<br>(${Math.round(weatherdata.current.TTTFEEL_C)}°C)`;
      };
      if (document.getElementById("currwther_rain")) {
        document.getElementById("currwther_rain").innerHTML = `${Math.round(weatherdata.current.PROBPCP_PERCENT)}%<br>${weatherdata.current.RRR_MM} mm`;
      };
      if (document.getElementById("currwther_wind")) {
        document.getElementById("currwther_wind").innerHTML = `${Math.round(weatherdata.current.FF_KMH)} km/h<br><img style="transform-origin: 50% 50%; transform: rotate(${weatherdata.current.DD_DEG}deg);" src="winddir.svg">`;
      };

      if (document.getElementById("aftnxtwther_text") && reqparam.debug == 'true') {
        const aftnxtwther_datetime = new Date(weatherdata.afternext.date_time);
        const aftnxtwther_hours = aftnxtwther_datetime.getHours();
        const aftnxtwther_minutes = aftnxtwther_datetime.getMinutes();
        document.getElementById("aftnxtwther_text").innerHTML += `<br><span class="textsizehalf">(${aftnxtwther_hours.toString().padStart(2, '0')}:${aftnxtwther_minutes.toString().padStart(2, '0')})</span>`;
      };
      if (document.getElementById("aftnxtwther_symbol")) {
        document.getElementById("aftnxtwther_symbol").innerHTML = `<img src="${weatherdata.afternext.symbol_code}.svg">`;
      };
      if (document.getElementById("aftnxtwther_temperatur")) {
        document.getElementById("aftnxtwther_temperatur").innerHTML = `${Math.round(weatherdata.afternext.TTT_C)}°C<br>(${Math.round(weatherdata.afternext.TTTFEEL_C)}°C)`;
      };
      if (document.getElementById("aftnxtwther_rain")) {
        document.getElementById("aftnxtwther_rain").innerHTML = `${Math.round(weatherdata.afternext.PROBPCP_PERCENT)}%<br>${weatherdata.afternext.RRR_MM} mm`;
      };
      if (document.getElementById("aftnxtwther_wind")) {
        document.getElementById("aftnxtwther_wind").innerHTML = `${Math.round(weatherdata.afternext.FF_KMH)} km/h<br><img style="transform-origin: 50% 50%; transform: rotate(${weatherdata.afternext.DD_DEG}deg);" src="winddir.svg">`;
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


// Checke ob Ruderverbot besteht und blende Text ein
function checkRuderverbot() {
    statustext = "";
    const symbolcode_badweather = [14, 16, 26, 28, 30]
  
    try {
      if (Math.round(hydrodata.discharge) > 350) { // Durchfluss > 350m2
        statustext = "RUDERVERBOT! (zu viel Strömung)";
      } else if (Math.round(hydrodata.discharge) > 300) { // Durchfluss > 300m2
        statustext = "Starke Strömung, nur bis 6er!";
      } else if (Math.round(weatherdata.current.FF_KMH) > 46) { // Wind > 46
        statustext = "RUDERVERBOT! (Starkwindwarnung)";
      } else if (Math.round(weatherdata.afternext.FF_KMH) > 46) { // Wind > 46
        statustext = "RUDERVERBOT! (Starkwindwarnung in 2h)";
      } else if (symbolcode_badweather.includes(weatherdata.current.symbol_code)) { // Schlechtwetter (Gewitter)
        statustext = "RUDERVERBOT! (Gewitter)";
      } else if (symbolcode_badweather.includes(weatherdata.afternext.symbol_code)) { // Schlechtwetter (Gewitter)
        statustext = "RUDERVERBOT! (Gewitter in 2h)";
      } else if (weatherdata.current.symbol_code < 0 && weatherdata.afternext.symbol_code < 0) { // komplett Dunkel
        statustext = "RUDERVERBOT! (Dunkelheit)";
      } else if (weatherdata.afternext.symbol_code < 0) { // in 2h Dunkel
        statustext = "Es wird Dunkel...";
      } else if (Math.round(weatherdata.current.FF_KMH) > 25) { // Wind > 25kmh
        statustext = "Achtung starker Wind";
      } else if (Math.round(weatherdata.afternext.FF_KMH) > 25) { // Wind > 25kmh
        statustext = "Achtung starker Wind in 2h";
      };
    
      if (statustext != "") {
        // console.warn(statustext);
        document.getElementById("welcometext").innerHTML = "";
        document.getElementById("statusRuderverbot").innerHTML = statustext; //`<b>${statustext}</b>`;
      };

    } catch(err) {
      console.error(`Fehler beim berechnen des Ruderverbots: ${err}`)
    };
  };