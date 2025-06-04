// Setze Kallenderdaten in HTML ein
function loadCalendar() {
    var calendarContainer = document.getElementById('calendar');

    const max_entries = 5;
    var currentDate = new Date();
    var tomorowDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    for (var i = 0; i < max_entries && i < calendardata.length; i++) {
        if (calendardata[i]) {
            var event = calendardata[i];
            console.log(event);

            var starttimeDate = new Date(event.start);
            var endtimeDate = new Date(event.end);
            if (endtimeDate > currentDate) {
                if (starttimeDate < tomorowDate) {

                    // Erstelle CalendarEvent (li)
                    var CalendarEvent = document.createElement('li');
                    CalendarEvent.id = 'CalendarEvent-' + (i);
                    CalendarEvent.className = `CalendarEvent`;

                    // Erstelle Inhalt des Events
                    var title = document.createElement('h3');
                    title.id = 'EventTitle-' + (i);
                    title.className = 'EventTitle';
                    title.innerHTML = event.title;
                    CalendarEvent.appendChild(title);
                    
                    calendarContainer.appendChild(CalendarEvent);

                } else {
                    console.log(`Event "${event.title}" (Startzeit: ${event.start})liegt ausserhalb der maximalen Zeitspanne und wird nicht mehr angezeigt`)
                    break;
                }
            } else {
                console.log(`Event "${event.title}" (Endzeit: ${event.end}) ist vergangen und wird nicht angezeigt`)
                i = i-1
            };
        };
    };
};