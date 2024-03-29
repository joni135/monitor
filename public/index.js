function initSite() {
    
    // Allfällige Fehler und Warnungen ausgeben
    if (errors) {
        //console.warn('Vom Server wurden einige Fehler (oder Warnungen) zurückgegeben:')
        for (let i = 0; i < errors.length; i++) {
            if (errors[i].fatal == true) {
                console.error(errors[i].title+'\n'+errors[i].content)
            } else {
                console.warn(errors[i].title+'\n'+errors[i].content)
            };
          };
    };


    // Falls Prozess gedebugt werden soll, gebe erhaltene Variablen aus
    if (reqparam.debug == 'true') {
        console.log('URL-Parameter:', reqparam);
        console.log('aufgekommene Fehler:', errors);
        console.log('Seitentitel:', sitetitle)
        console.log('Seitenautor:', siteauthor)
        console.log('Favicon-Pfad:', favicon);
        if (weatherdata) {
          console.log('Wetterdaten:', weatherdata);
        };
        if (hydrodata) {
          console.log('Hydrodaten:', hydrodata);
        };
    };

  };


// Liste der Fehler auf der Webseite laden
function renderErrors(errorsToRender) {

    // Suche Tag, wo die Alben gespeichert werden sollen und leere Tag
    const errorList = document.getElementById('error-list');
    errorList.innerHTML = '';
  
    // Jedes Album durchlaufen
    for (let error of errorsToRender) {
      console.warn(error.title)
      errorList.innerHTML += `
        <li id="error-fatal-${error.fatal}" class="error">
          <h3 id="error-fatal-${error.fatal}-title" class="errortitle">${error.title}</h3>
          <p id="error-fatal-${error.fatal}-content" class="errorinfo">${error.content}</p>
        </li>
      `;
    };
  
    console.log(`Alle Fehler wurden geladen. Insgesammt wurden ${errorsToRender.length} gerendert!`);
  };


// Aktualisiere Uhr auf Monitor
function updateClock() {
    var currentTime = new Date();
    var year = currentTime.getFullYear();
    var month = currentTime.getMonth() + 1; // Monate beginnen mit 0 (Januar)
    var day = currentTime.getDate();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();

    // Füge führende Nullen hinzu, wenn nötig
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;

    // Setze Datum bei current-date
    if (document.getElementById("current-date")) {
      document.getElementById("current-date").innerHTML = day + "." + month + "." + year;
    };

    // Setze Zeit bei current-time
    if (document.getElementById("current-time")) {
      document.getElementById("current-time").innerHTML = hours + ":" + minutes;
    };

    // Setze Datum und Zeit bei current-date-time
    if (document.getElementById("current-date-time")) {
      document.getElementById("current-date-time").innerHTML = day + "." + month + "." + year + "<br>" + hours + ":" + minutes;
    };

    // warte eine Sekunde und führe Funktion nochmals aus (dauerschleife)
    setTimeout(updateClock, 1000);
  };


// Lade Bilder dynamisch
var slideIndex = 0;
var slideshowContainer = document.getElementById('slideshow-container');
var slideDuration = parseInt('{{slideDuration}}') || 3000;

function loadImages() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/images', true);

    xhr.onload = function () {
        if (xhr.status == 200) {
            var images = xhr.responseText.split('\n');
            for (var i = 0; i < images.length; i++) {
                if (images[i]) {
                    var slide = document.createElement('div');
                    slide.className = 'mySlides';
                    var image = document.createElement('img');
                    image.src = 'images/' + images[i];
                    image.alt = 'Slide ' + (i + 1);
                    slide.appendChild(image);
                    slideshowContainer.appendChild(slide);
                }
            }
            showSlides();
        }
    };

    xhr.send();
  };

function showSlides() {
    var slides = document.getElementsByClassName("mySlides");
    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, slideDuration);
  };


// Setze Wetterdaten in HTML ein
function displayWeather() {
    
    if (document.getElementById("currwther_symbol")) {
      document.getElementById("currwther_symbol").innerHTML = `<img src="${weatherdata.current.symbol_code}.svg">`;
    };
    if (document.getElementById("currwther_temperatur")) {
      document.getElementById("currwther_temperatur").innerHTML = `${Math.round(weatherdata.current.TTT_C)}°c<br>(${Math.round(weatherdata.current.TTTFEEL_C)}°c)`;
    };
    if (document.getElementById("currwther_rain")) {
      document.getElementById("currwther_rain").innerHTML = `${Math.round(weatherdata.current.PROBPCP_PERCENT)}%<br>${weatherdata.current.RRR_MM}mm`;
    };
    if (document.getElementById("currwther_wind")) {
      document.getElementById("currwther_wind").innerHTML = `${Math.round(weatherdata.current.FF_KMH)}km/h<br><img style="transform-origin: 50% 50%; transform: rotate(${weatherdata.current.DD_DEG}deg);" src="winddir.svg">`;
    };
    
    if (document.getElementById("aftnxtwther_symbol")) {
      document.getElementById("aftnxtwther_symbol").innerHTML = `<img src="${weatherdata.afternext.symbol_code}.svg">`;
    };
    if (document.getElementById("aftnxtwther_temperatur")) {
      document.getElementById("aftnxtwther_temperatur").innerHTML = `${Math.round(weatherdata.afternext.TTT_C)}°c<br>(${Math.round(weatherdata.afternext.TTTFEEL_C)}°c)`;
    };
    if (document.getElementById("aftnxtwther_rain")) {
      document.getElementById("aftnxtwther_rain").innerHTML = `${Math.round(weatherdata.afternext.PROBPCP_PERCENT)}%<br>${weatherdata.afternext.RRR_MM}mm`;
    };
    if (document.getElementById("aftnxtwther_wind")) {
      document.getElementById("aftnxtwther_wind").innerHTML = `${Math.round(weatherdata.afternext.FF_KMH)}km/h<br><img style="transform-origin: 50% 50%; transform: rotate(${weatherdata.afternext.DD_DEG}deg);" src="winddir.svg">`;
    };

  };


// Setze Hydrodaten in HTML ein
function displayHydro() {
  
    if (document.getElementById("hydro_discharge")) {
      document.getElementById("hydro_discharge").innerHTML = `Durchfluss:<br>${Math.round(hydrodata.discharge)}m&#0178;/sek`;
    };
    if (document.getElementById("hydro_watertemp")) {
      document.getElementById("hydro_watertemp").innerHTML = `Wassertemperatur:<br>${Math.round(hydrodata.waterTemperature)}°c`;
    };
    
  };


// Checke ob Ruderverbot besteht und blende Text ein
function checkRuderverbot() {
    statustext = "";
    const symbolcode_badweather = [14, 16, 26, 28, 30]
  
    if (Math.round(weatherdata.current.FF_KMH) > 25) { // Wind > 25kmh
      statustext = "Achtung starker Wind";
    };
    if (Math.round(weatherdata.afternext.FF_KMH) > 25) { // Wind > 25kmh
      statustext = "Achtung starker Wind in 2h";
    };
    if (Math.round(hydrodata.discharge) > 300) { // Durchfluss > 300m2
      statustext = "Starke Strömung, nur bis 6er!";
    };
    if (weatherdata.afternext.symbol_code < 0) { // in 2h Dunkel
      statustext = "Es wird Dunkel, Licht mitnehmen!";
    };
    if (weatherdata.current.symbol_code < 0 && weatherdata.afternext.symbol_code < 0) { // komplett Dunkel
      statustext = "RUDERVERBOT! (Dunkelheit)";
    };
    if (symbolcode_badweather.includes(weatherdata.current.symbol_code)) { // Schlechtwetter (Gewitter)
      statustext = "RUDERVERBOT! (Gewitter)";
    };
    if (symbolcode_badweather.includes(weatherdata.afternext.symbol_code)) { // Schlechtwetter (Gewitter)
      statustext = "RUDERVERBOT! (Gewitter in 2h)";
    };
    if (Math.round(weatherdata.current.FF_KMH) > 46) { // Wind > 46
      statustext = "RUDERVERBOT! (Starkwindwarnung)";
    };
    if (Math.round(weatherdata.afternext.FF_KMH) > 46) { // Wind > 46
      statustext = "RUDERVERBOT! (Starkwindwarnung in 2h)";
    };
    if (Math.round(hydrodata.discharge) > 350) { // Durchfluss > 350m2
      statustext = "RUDERVERBOT! (zu viel Strömung)";
    };
  
    if (statustext != "") {
      console.warn(statustext);
      document.getElementById("welcometext").innerHTML = "";
      document.getElementById("statusRuderverbot").innerHTML = statustext; //`<b>${statustext}</b>`;
    };
  }