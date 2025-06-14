function calendar_init() {
    if (document.getElementById('calendarList') && calendardata && calendardata.length > 0) {
        if (calendar_max_entries === undefined || calendar_max_entries === null || calendar_max_entries < 1) {
            calendar_max_entries = 5; // Standardwert, wenn nicht gesetzt
        }
        if (calendar_maxhour_future === undefined || calendar_maxhour_future === null || calendar_maxhour_future < 1) {
            calendar_maxhour_future = 24; // Standardwert, wenn nicht gesetzt
        }
        loadCalendar(calendar_max_entries, calendar_maxhour_future);
    } else {
        console.warn('Fehler: Kalender-Element nicht gefunden oder keine Kalendereinträge vorhanden.');
        document.getElementById('calendar').style.display = 'none';
    }
}

// Setze Kalenderdaten in HTML ein
function loadCalendar(max_entries, maxhour_future) {
    var calendarContainer = document.getElementById('calendarList');

    var currentDate = new Date();
    var tomorowDate = new Date(currentDate.getTime() + maxhour_future * 60 * 60 * 1000);

    var entrie_count = 0
    for (var i = 0; entrie_count < max_entries && i < calendardata.length; i++) {
        if (calendardata[i]) {
            var event = calendardata[i];
            var starttimeDate = new Date(event.start);
            var endtimeDate = new Date(event.end);

            if (endtimeDate > currentDate) {
                if (starttimeDate < tomorowDate) {

                    // Erstelle CalendarEvent (li)
                    var CalendarEvent = document.createElement('li');
                    CalendarEvent.id = `CalendarEvent-${i}`;
                    CalendarEvent.className = `CalendarEvent`;

                    // Titel des Events
                    var title = document.createElement('h6');
                    title.id = `EventTitle-${i}`;
                    title.className = `EventTitle EventDetails CalendarEvent-${i}`;
                    title.innerHTML = event.title;
                    CalendarEvent.appendChild(title);

                    // Dauer des Events
                    var datetime = document.createElement('p');
                    datetime.id = `EventDateTime-${i}`;
                    datetime.className = `EventDateTime EventDetails CalendarEvent-${i}`;
                    if (event.fullday === true) {
                        endtimeDate = new Date(endtimeDate-(3 * 60 * 60 * 1000)); // setze Datum einen Tag zurück, um Verwirrungen zu vermeiden
                        if (starttimeDate.getDate() === endtimeDate.getDate()) {
                            datetime.innerHTML = `${datetimeFormater(starttimeDate, withhour=false)} (ganztags)`;
                        } else {
                            datetime.innerHTML = `${datetimeFormater(starttimeDate, withhour=false)} - ${datetimeFormater(endtimeDate, withhour=false)} (ganztags)`;
                        };
                    } else {
                        if (starttimeDate.getDate() === endtimeDate.getDate()) {
                            datetime.innerHTML = `${datetimeFormater(starttimeDate, withhour=true)} - ${datetimeFormater(endtimeDate, withhour=true, withdate=false)}`;
                        } else {
                            datetime.innerHTML = `${datetimeFormater(starttimeDate, withhour=true)} - ${datetimeFormater(endtimeDate, withhour=true)}`;
                        };
                    };
                    CalendarEvent.appendChild(datetime);

                    // wenn vorhanden Standort des Events
                    if (event.location !== 'None') {
                        var location = document.createElement('p');
                        location.id = `EventLocation-${i}`;
                        location.className = `EventLocation EventDetails CalendarEvent-${i}`;
                        location.innerHTML = event.location;
                        CalendarEvent.appendChild(location);
                    };

                    // wenn vorhanden Kategorien des Events
                    if (event.categories.length > 0) {
                        var categories = document.createElement('p');
                        categories.id = `EventCategroies-${i}`;
                        categories.className = `EventCategroies EventDetails CalendarEvent-${i}`;
                        categories.innerHTML = event.categories.join();
                        CalendarEvent.appendChild(categories);
                    };

                    // wenn vorhanden Beschreibung des Events
                    if (event.description !== 'None') {
                        var description = document.createElement('p');
                        description.id = `EventDescription-${i}`;
                        description.className = `EventDescription EventDetails CalendarEvent-${i}`;
                        description.innerHTML = event.description;
                        CalendarEvent.appendChild(description);
                    };
                    
                    calendarContainer.appendChild(CalendarEvent);
                    entrie_count = entrie_count+1

                } else {
                    console.log(`Event "${event.title}" (Startzeit: ${event.start}) liegt ausserhalb der maximalen Zeitspanne und wird nicht mehr angezeigt`)
                    break;
                }
            } else {
                console.log(`Event "${event.title}" (Endzeit: ${event.end}) ist vergangen und wird nicht angezeigt`)
            };
        };
    };
};


// Aufarbeiten des Datums
function datetimeFormater(datetime, withhour=true, withdate=true) {
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1; // Monate beginnen mit 0 (Januar)
    var day = datetime.getDate();
    var hours = datetime.getHours();
    var minutes = datetime.getMinutes();
    var seconds = datetime.getSeconds();
    
    // Wenn Zeitzone 0 (UTC) ist, keine Stunden mitgeben (ganztägiges Ereignis)
    var timezone = datetime.getTimezoneOffset();
    if (timezone === 0) {
        withhour = false
    }

    // Füge führende Nullen hinzu, wenn nötig
    const monthNamesShort = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    clean_month = (month < 10 ? '0' : '') + month;
    clean_day = (day < 10 ? '0' : '') + day;
    clean_hours = (hours < 10 ? '0' : '') + hours;
    clean_minutes = (minutes < 10 ? '0' : '') + minutes;
    clean_seconds = (seconds < 10 ? '0' : '') + seconds;

    // Erstelle Datum
    if (withdate === true && withhour === true) {
        var cleandate = `${day}. ${monthNames[datetime.getMonth()]} ${year} ${clean_hours}:${clean_minutes}`;
        //var cleandate = `${clean_day}.${clean_month}.${year} ${clean_hours}:${clean_minutes}`;
    } else if (withdate === true && withhour === false) {
        var cleandate = `${day}. ${monthNames[datetime.getMonth()]} ${year}`;
        //var cleandate = `${clean_day}.${clean_month}.${year}`;
    } else if (withdate === false && withhour === true) {
        var cleandate = `${clean_hours}:${clean_minutes}`;
    } else {
        var cleandate = `Error: "withdate" UND "withhour" ist beides auf false gesetzt`;
    };

    return cleandate
};