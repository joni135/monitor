let slidesData = {}

// Alle Slides aus Datei auslesen (per API-Request)
function loadSlidesAdmin() {  

    // HTML-API-Abfrage auf eigene Node.js-App machen, um alle 
    var sliderequest = new XMLHttpRequest();
    sliderequest.open('GET', `/getslides?slidefolder=${datapath}`, true);

    sliderequest.onload = function () {
        if (sliderequest.status == 200) {
            slidesData = JSON.parse(sliderequest.responseText);
            if (reqparam.debug == 'true') {
                console.log('Slidedaten: ', slidesData);
            };

            renderSlidesAdmin(slidesData);
        };
    };

    sliderequest.send();
};

// Alle Slides auflisten
function renderSlidesAdmin(slidesData) {
    var slidetableContainer = document.getElementById('slidetable');
    slidetableContainer.innerHTML = `
        <tr id="kopfzeile">
            <th>Vorschau</th>
            <th>Informationen</th>
            <th>Bearbeiten</th>
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
                image.src = slideData.path;
                image.id = slideData.id;
                image.className = 'slideImage';
                slidePreview.appendChild(image);

            } else if (slideData.type === 'iframe') { // Erstelle Vorschauelement Iframe
                var iframe = document.createElement('iframe');
                iframe.src = slideData.path;
                iframe.id = slideData.id;
                iframe.className = 'slideIframe';
                slidePreview.appendChild(iframe);
            };
            slide.appendChild(slidePreview);

            // Bearbeite Daten für Spalte Beschreibung
            if (!slideData.displayduration || slideData.displayduration === 0 || slideData.displayduration === '') {
                slideData.displayduration_text = `Standard (${slideduration}s)`
            } else {
                slideData.displayduration_text = slideData.displayduration+' Sekunden'
            };

            // Erstelle Spalte Beschreibung
            var slideDescription = document.createElement('td');
            slideDescription.className = 'slideTitle';
            slideDescription.innerHTML = `
                Titel: ${slideData.title}<br>
                Bemerkung: ${slideData.comment}<br>
                Pfad: <a href="${slideData.path}" target="_blank">${slideData.path}</a><br>
                Anzeigedauer: ${slideData.displayduration_text}<br>
                Zeitrahmen: ${slideData.starttime} - ${slideData.endtime}`;
            slide.appendChild(slideDescription);

            // Erstelle Spalte Buttons
            var slideButtons = document.createElement('td');
            slideButtons.className = 'slideButtons';
            slideButtons.innerHTML = `
                <button id="buttonUp" onclick="slideUp('${slideData.id}')"><i class="fa fa-arrow-up"></i></button>
                <button id="buttonDown" onclick="slideDown('${slideData.id}')"><i class="fa fa-arrow-down"></i></button>
                <button id="buttonEdit" onclick="openSlideEditPopup('${slideData.id}')"><i class="fa fa-pencil"></i></button>
                <button id="buttonDelete" onclick="slideDelete('${slideData.id}')"><i class="fa fa-trash"></i></button>
                `;
            slide.appendChild(slideButtons);
            
            slidetableContainer.appendChild(slide);
      
        };
    };
};


// Funktion zum Hinzufügen einer Bilder-Slide
function addImageSlide() {
    const fileInput = document.getElementById('ImageFileInput');
    const file = fileInput.files[0];
    let confirmationMessage;

    if (file) {
        if (file.type.startsWith('image/')) {
            const form = document.getElementById('addImageSlideForm');
            const formData = new FormData(form);

            fetch(`/uploadimage?slidefolder=${datapath}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                const responseJson = JSON.parse(data);
                confirmationMessage = responseJson;

                if (responseJson.fatal !== true) {
                    slidesData = responseJson.slidesData;
                    renderSlidesAdmin(slidesData);
                }
                closePopup('addImageSlide', confirmationMessage);
            })
            .catch(error => {
                confirmationMessage = {
                    'title': 'Fehler beim Hochladen des Bildes',
                    'content': error.message,
                    'fatal': true
                };
                closePopup('addImageSlide', confirmationMessage);
            });
            return;
        } else {
            confirmationMessage = {
                'title': 'Bilder-Slide konnte nicht erstellt werden',
                'content': 'Die hochgeladene Datei ist kein Bild.',
                'fatal': true
            };
        }
    } else {
        confirmationMessage = {
            'title': 'Bilder-Slide konnte nicht erstellt werden',
            'content': 'Es ist keine Bild-Datei zum hochladen angegeben.',
            'fatal': true
        };
    }
    closePopup('addImageSlide', confirmationMessage);
}

// Funktion zum hinzufügen einer Iframe-Slide
function addIframeSlide() {
    const urlInput = document.getElementById('IframeUrlInput');
    let confirmationMessage;

    if (urlInput.value) {
        const form = document.getElementById('addIframeSlideForm');
        const formData = new FormData(form);

        fetch(`/uploadiframe?slidefolder=${datapath}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            const responseJson = JSON.parse(data);

            if (responseJson.fatal !== true) {
                slidesData = responseJson.slidesData;
                renderSlidesAdmin(slidesData);
            }
            closePopup('addIframeSlide', responseJson);
        })
        .catch(error => {
            confirmationMessage = {
                'title': 'Fehler beim Hochladen des Iframe',
                'content': error.message,
                'fatal': true
            };
            closePopup('addIframeSlide', confirmationMessage);
        });
    } else {
        confirmationMessage = {
            'title': 'Iframe-Slide konnte nicht erstellt werden',
            'content': 'Es ist keine URL für das Iframe angegeben.',
            'fatal': true
        };
        closePopup('addIframeSlide', confirmationMessage);
    }
}

// Popup-Fenster für das Bearbeiten der Slide öffnen
function openSlideEditPopup(slideId) {
    document.getElementById('editSlideForm').reset();
    document.getElementById('editSlideTitel').innerHTML = `Slide "${slideId}" bearbeiten`;
    document.getElementById('slideId').innerHTML = slideId;

    let slidePositionId = -1;
    for (let i = 0; i < slidesData.length; i++) {
        if (slidesData[i].id === slideId) {
            slidePositionId = i;
            break;
        }
    }
    if (slidePositionId === -1) return;

    document.getElementById('SlideTitleInput').value = slidesData[slidePositionId].title;
    document.getElementById('SlideCommentInput').value = slidesData[slidePositionId].comment;
    document.getElementById('SlideDisplaydurationInput').value = slidesData[slidePositionId].displayduration;
    document.getElementById('SlideStarttimeInput').value = slidesData[slidePositionId].starttime;
    document.getElementById('SlideStarttimeInput').min = formatedDatetime();
    document.getElementById('SlideEndtimeInput').value = slidesData[slidePositionId].endtime;
    document.getElementById('SlideEndtimeInput').min = formatedDatetime();

    openPopup('editSlide');
}

// Funktion zum bearbeiten einer Slide
function editSlide() {
    const slideId = document.getElementById('slideId').innerHTML;
    const form = document.getElementById('editSlideForm');
    const formData = new FormData(form);

    fetch(`/editslide?slidefolder=${datapath}&slideid=${slideId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        const responseJson = JSON.parse(data);

        if (responseJson.fatal !== true) {
            slidesData = responseJson.slidesData;
            renderSlidesAdmin(slidesData);
        }

        closePopup('editSlide', responseJson);
    });
}

// Funktion zum löschen einer Slide
function slideDelete(slideId) {
    const slidedeleterequest = new XMLHttpRequest();
    slidedeleterequest.open('GET', `/deleteslide?slidefolder=${datapath}&slideid=${slideId}`, true);

    slidedeleterequest.onload = function () {
        const responseJson = JSON.parse(slidedeleterequest.responseText);
        
        if (responseJson.fatal !== true) {
            slidesData = responseJson.slidesData;
            renderSlidesAdmin(slidesData);
        };

        closePopup('deleteSlide', responseJson);
    };

    slidedeleterequest.send();
}

// Slide eine Position nach oben verschieben
function slideUp(slideId) {
    const slidechangerequest = new XMLHttpRequest();
    slidechangerequest.open('GET', `/changeorderslideup?slidefolder=${datapath}&slideid=${slideId}`, true);

    slidechangerequest.onload = function () {
        const responseJson = JSON.parse(slidechangerequest.responseText);
        
        if (responseJson.fatal !== true) {
            slidesData = responseJson.slidesData;
            renderSlidesAdmin(slidesData);
        } else {
            closePopup('moveSlide', responseJson);
        };
    };

    slidechangerequest.send();
}

// Slide eine Position nach unten verschieben
function slideDown(slideId) {
    const slidechangerequest = new XMLHttpRequest();
    slidechangerequest.open('GET', `/changeorderslidedown?slidefolder=${datapath}&slideid=${slideId}`, true);

    slidechangerequest.onload = function () {
        const responseJson = JSON.parse(slidechangerequest.responseText);
        
        if (responseJson.fatal !== true) {
            slidesData = responseJson.slidesData;
            renderSlidesAdmin(slidesData);
        } else {
            closePopup('moveSlide', responseJson);
        };
    };

    slidechangerequest.send();
}