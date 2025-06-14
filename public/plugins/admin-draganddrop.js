let dragCounter = 0; // Zähler für dragenter und dragleave

// Funktion zur Verarbeitung des Drag-and-Drop-Events
document.addEventListener('dragenter', function(event) {
    dragCounter++; // Drag enter erhöht den Zähler

    event.preventDefault(); // Damit der Browser das Standardverhalten verhindert
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('dropHint').style.display = 'block';

    // console.log('dragenter');

});

document.addEventListener('dragover', function(event) {
    event.preventDefault(); // Damit der Browser das Standardverhalten verhindert

    // console.log('dragover');
});

document.addEventListener('dragleave', function(event) {
    dragCounter--; // Drag leave verringert den Zähler

    if (dragCounter === 0) {
        // Nur wenn der Zähler 0 erreicht, verschwindet der Hinweis
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('dropHint').style.display = 'none';
    };
    
    // console.log('dragleave');

});

document.addEventListener('drop', function(event) {
    dragCounter = 0; // Zurücksetzen des Zählers

    event.preventDefault(); // Damit der Browser das Standardverhalten verhindert
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('dropHint').style.display = 'none';

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        console.log(event.dataTransfer.files[0]);
        console.log(event.dataTransfer.files[0].type);

        if (event.dataTransfer.files[0].type === 'image/jpeg' || event.dataTransfer.files[0].type === 'image/png') {
            openPopup('addImageSlide'); // Öffnet das Popup, wenn eine Datei gezogen wird
            const fileInput = document.getElementById('ImageFileInput');
            fileInput.files = event.dataTransfer.files; // Setzt die Datei in das Input-Feld
        } else if (event.dataTransfer.files[0].type === 'video/mp4') {
            document.getElementById('confirmationMessageTitel').innerHTML = `Videoupload comming soon`;
            document.getElementById('confirmationMessageText').innerHTML = `Aktuell sind noch keine Videos in der Slideshow möglich. An der Implementierung wird aber gearbeitet.`;
            document.getElementById('confirmationMessage').style.display = 'block';
        } else {
            // ungültiges Dateiformat angegeben
            document.getElementById('confirmationMessageTitel').innerHTML = `Ungültiges Dateiformat: ${event.dataTransfer.files[0].type}`;
            document.getElementById('confirmationMessageText').innerHTML = `"${event.dataTransfer.files[0].type}" ist kein unterstütztes Dateiformat für die Slideshow`;
            document.getElementById('confirmationMessage').style.color = 'red';
            document.getElementById('confirmationMessage').style.display = 'block';
        };
    }
});