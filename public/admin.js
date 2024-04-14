// Alle Slides aus Datei auslesen (per API-Request)
function loadSlides() {  

    // HTML-API-Abfrage auf eigene Node.js-App machen, um alle 
    var sliderequest = new XMLHttpRequest();
    sliderequest.open('GET', `/getslides?slidefolder=${slidepath}`, true);

    sliderequest.onload = function () {
      if (sliderequest.status == 200) {
        slidesData = JSON.parse(sliderequest.responseText);
        if (reqparam.debug == 'true') {
          console.log('Slidedaten: ', slidesData);
        };

        renderSlides(slidesData);
      }
    };

    sliderequest.send();
  };


// Alle Slides auflisten
function renderSlides(slidesData) {
    var slidetableContainer = document.getElementById('slidetable');
    slidetableContainer.innerHTML = `
        <tr id="kopfzeile">
            <th>Vorschau</th>
            <th>Titel</th>
            <th>Dateipfad</th>
            <th></th>
        </tr>`;

    // Einzelne Slides in HTML einbetten
    for (var i = 0; i < slidesData.length; i++) {
      if (slidesData[i]) {
        var slideData = slidesData[i];

        // Erstelle slideElement (Tabellenzeile)
        var slide = document.createElement('tr');
        slide.id = 'slide-' + (i + 1);
        slide.className = `slideElement ${slideData.type}`;
        
        // Erstelle Spalte Vorschau
        var slidePreview = document.createElement('td');
        slidePreview.className = 'slidePreview';
        if (slideData.type === 'img') { // Erstelle Vorschauelement Bild
          var image = document.createElement('img');
          image.src = slidepath + slideData.path;
          image.id = slideData.id;
          image.className = 'slideImage slidePreview';
          slidePreview.appendChild(image);
        } else if (slideData.type === 'iframe') { // Erstelle Vorschauelement Iframe
          var iframe = document.createElement('iframe');
          iframe.src = slideData.path;
          iframe.id = slideData.id;
          iframe.className = 'slideIframe slidePreview';
          slidePreview.appendChild(iframe);
        };
        slide.appendChild(slidePreview);

        // Erstelle Spalte Beschreibung
        var slideDescription = document.createElement('td');
        slideDescription.className = 'slideTitle';
        slideDescription.innerHTML = `Titel: ${slideData.title}<br>Pfad: ${slideData.path}<br>Zeitrahmen: ${slideData.starttime} - ${slideData.endtime}`;
        slide.appendChild(slideDescription);

        // Erstelle Spalte Buttons
        var slideButtons = document.createElement('td');
        slideButtons.className = 'slideButtons';
        slideButtons.innerHTML = `
            <button id="buttonUp" onclick="slideUp('${slideData.id}')">&#11205;</button>
            <button id="buttonDown" onclick="slideDown('${slideData.id}')">&#11206;</button>
            <button id="buttonEdit" onclick="slideEdit('${slideData.id}')">&#9998;</button>
            <button id="buttonDelete" onclick="slideDelete('${slideData.id}')">&#128465;</button>
            `;
        slide.appendChild(slideButtons);
        
        slidetableContainer.appendChild(slide);
      
      };
    };
  };


// Popup-Fenster öffnen
function openPopup(PopupId) {
    document.getElementById(PopupId+'Form').reset(); // leert die Inputfelder
    document.getElementById('overlay').style.display = 'block';
    document.getElementById(PopupId).style.display = 'block';
  };


// Popup-Fenster schliessen
function closePopup(PopupId) {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById(PopupId).style.display = 'none';
  };


// Funktion zum Hochladen des Fotos und Speichern der Daten als JSON
function addImageSlide_v1() {
    const fileInput = document.getElementById('ImageFileInput');
    const titleInput = document.getElementById('ImageTitleInput');
    const endtimeInput = document.getElementById('ImageEndtimeInput');

    const file = fileInput.files[0];
    const title = titleInput.value;
    const endtime = endtimeInput.value;

    if (file && title && endtime) {
        const formData = new FormData();
        formData.append('image', file);

        // AJAX-Anfrage, um das Foto hochzuladen
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'upload.php', true); // Hier muss der Pfad zu Ihrem Upload-Skript angegeben werden
        xhr.onload = function() {
            if (xhr.status === 200) {
                const imagePath = xhr.responseText;
                
                // Daten als JSON speichern
                const imageData = {
                    imagePath: imagePath,
                    title: title,
                    endtime: endtime
                };

                // AJAX-Anfrage, um das JSON zu speichern
                const jsonXhr = new XMLHttpRequest();
                jsonXhr.open('POST', 'saveData.php', true); // Hier muss der Pfad zu Ihrem Skript zum Speichern von JSON angegeben werden
                jsonXhr.setRequestHeader('Content-Type', 'application/json');
                jsonXhr.onload = function() {
                    if (jsonXhr.status === 200) {
                        console.log('Daten erfolgreich gespeichert.');
                    } else {
                        console.error('Fehler beim Speichern der Daten.');
                    };
                };
                jsonXhr.send(JSON.stringify(imageData));
            } else {
                console.error('Fehler beim Hochladen des Fotos.');
            };
        };
        xhr.send(formData);
    } else {
        alert('Bitte füllen Sie alle Felder aus und wählen Sie ein Bild aus.');
    };
  };

function addImageSlide() {
    const form = document.getElementById('addImageSlideForm');
    const formData = new FormData(form);

    fetch('/uploadimage?slidefolder=slides_rcb', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.text();
    })
    .then(data => {
        const responseJson = JSON.parse(data);
        console.log(responseJson)

        document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
        document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
        if (responseJson.fatal === true) {
            document.getElementById('confirmationMessage').style.color = 'red';
        };

        document.getElementById('addImageSlide').style.display = 'none';
        document.getElementById('confirmationMessage').style.display = 'block';
        // Hier kannst du weitere Schritte ausführen, z.B. eine Benachrichtigung anzeigen
    });
  };


// Slide eine Position nach oben verschieben
function slideUp(slideId) {

    for (var i = 0; i < slidesData.length; i++) {
        if (slidesData[i].id === slideId) {
            var slidePositionId = i;
        };
    };
    
    if (slidePositionId !== 0) {
        var mySlideData = slidesData[slidePositionId];
        var preSlideData = slidesData[slidePositionId - 1];

        slidesData[slidePositionId - 1] = mySlideData;
        slidesData[slidePositionId] = preSlideData;

        renderSlides(slidesData)
    };

  };

// Slide eine Position nach unten verschieben
function slideDown(slideId) {

    for (var i = 0; i < slidesData.length; i++) {
        if (slidesData[i].id === slideId) {
            var slidePositionId = i;
        };
    };
    
    if (slidePositionId !== slidesData.length-1) {
        var mySlideData = slidesData[slidePositionId];
        var nextSlideData = slidesData[slidePositionId + 1];

        slidesData[slidePositionId + 1] = mySlideData;
        slidesData[slidePositionId] = nextSlideData;

        renderSlides(slidesData)
    };

  };