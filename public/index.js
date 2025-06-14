function initSite() {
    // Allfällige Fehler und Warnungen ausgeben
    if (errors) {
        //console.warn('Vom Server wurden einige Fehler (oder Warnungen) zurückgegeben:')
        for (let i = 0; i < errors.length; i++) {
            if (errors[i].fatal == true) {
                console.error(errors[i].title+':\n'+errors[i].content)
            } else {
                console.warn(errors[i].title+':\n'+errors[i].content)
            };
        };
    };

    // Falls Prozess gedebugt werden soll, gebe erhaltene Variablen aus
    if (reqparam.debug == 'true') {
        try {
            if (typeof reqparam !== 'undefined' && reqparam) {console.log('URL-Parameter (reqparam):', reqparam);}
            if (typeof errors !== 'undefined' && errors) {console.log('aufgekommene Fehler (errors):', errors);}
            if (typeof sitetitle !== 'undefined' && sitetitle) {console.log('Seitentitel (sitetitle):', sitetitle);}
            if (typeof siteauthor !== 'undefined' && siteauthor) {console.log('Seitenautor (siteauthor):', siteauthor);}
            if (typeof favicon !== 'undefined' && favicon) {console.log('Favicon-Pfad (favicon):', favicon);}
            if (typeof datapath !== 'undefined' && datapath) {console.log('Slides- und Datenpfad (datapath):', datapath);}
            if (typeof slideduration !== 'undefined' && slideduration) {console.log('Slidedauer (slideduration):', slideduration);}
            if (typeof weatherdata !== 'undefined' && weatherdata) {console.log('Wetterdaten (weatherdata):', weatherdata);}
            if (typeof hydrodata !== 'undefined' && hydrodata) {console.log('Hydrodaten (hydrodata):', hydrodata);}
            if (typeof weathersymboltype !== 'undefined' && weathersymboltype) {console.log('Wettersymbole (weathersymboltype):', weathersymboltype);}
            if (typeof calendardata !== 'undefined' && calendardata) {console.log('Kallenderdaten (calendardata):', calendardata);}
            if (typeof calendar_max_entries !== 'undefined' && calendar_max_entries) {console.log('Maximale Anzahl Events (calendardata):', calendar_max_entries);}
            if (typeof calendar_maxhour_future !== 'undefined' && calendar_maxhour_future) {console.log('Maximale Vorauszeit eines Events (calendardata):', calendar_maxhour_future);}
        } catch (err) {
            console.error('Konnte Parameter nicht anzeigen: ', err);
        };
    };

    // Lade Index-Javascript-Funktionen
    updateClock();
};


// Liste der Fehler auf der Webseite laden
function renderErrors(errorsToRender) {

    // Suche Tag, wo die Alben gespeichert werden sollen und leere Tag
    const errorList = document.getElementById('error-list');
    errorList.innerHTML = '';
  
    // Jedes Album durchlaufen
    for (let error of errorsToRender) {
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
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hours = (hours < 10 ? "0" : "") + hours;
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
        //document.getElementById("current-date-time").innerHTML = day + "." + month + "." + year + "<br>" + hours + ":" + minutes;
        document.getElementById("current-date-time").innerHTML = `${day}.${month}.${year}<br><span class="textsizedouble">${hours}:${minutes}</span>`;
    };

    // warte eine Sekunde und führe Funktion nochmals aus (dauerschleife)
    setTimeout(updateClock, 1000);
};