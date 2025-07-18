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
                const image = document.createElement('img');
                image.src = slideData.path;
                image.id = slideData.id;
                image.className = 'slideImage';
                slidePreview.appendChild(image);
            } else if (slideData.type === 'video') { // Erstelle Vorschauelement Video
                const video = document.createElement('video');
                video.id = slideData.id;
                video.muted = true;  // wichtig für Autoplay
                video.setAttribute('muted', '');  // fallback für alte Browser
                const videosrc = document.createElement('source');
                videosrc.id = 'src-' + slideData.id;
                videosrc.src = slideData.path;
                videosrc.type = 'video/mp4';
                videosrc.content = 'Dein Browser unterstützt dieses Video nicht.';
                video.appendChild(videosrc);
                video.className = 'slideVideo';
                slidePreview.appendChild(video);
                video.onloadedmetadata = function () {
                    const videoduration = video.duration;
                    video.play();
                    displayduration_text_element = document.getElementById(video.id+'-displayduration_text');
                    if (displayduration_text_element && displayduration_text_element.innerHTML.includes('Standard')) {
                        displayduration_text = `Gesamtlänge (${videoduration}s)`;
                        displayduration_text_element.innerHTML = displayduration_text;
                    }
                };
            } else if (slideData.type === 'iframe') { // Erstelle Vorschauelement Iframe
                const iframe = document.createElement('iframe');
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
                Titel: <span id="${slideData.id}-title">${slideData.title}</span><br>
                Bemerkung: <span id="${slideData.id}-comment">${slideData.comment}</span><br>
                Pfad: <span id="${slideData.id}-path><a href="${slideData.path}" target="_blank">${slideData.path}</a></span><br>
                Anzeigedauer: <span id="${slideData.id}-displayduration_text">${slideData.displayduration_text}</span><br>
                Zeitrahmen: <span id="${slideData.id}-startend">${slideData.starttime} - ${slideData.endtime}</span>`;
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

            document.getElementById('loadingspinner').style.display = 'block';
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
            fetch(`/uploadimage?slidefolder=${datapath}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                document.querySelectorAll('button').forEach(btn => btn.disabled = false);
                document.getElementById('loadingspinner').style.display = 'none';
                const responseJson = JSON.parse(data);
                confirmationMessage = responseJson;

                if (responseJson.fatal !== true) {
                    slidesData = responseJson.slidesData;
                    renderSlidesAdmin(slidesData);
                }
                closePopup('addImageSlide', confirmationMessage);
            })
            .catch(error => {
                document.querySelectorAll('button').forEach(btn => btn.disabled = false);
                document.getElementById('loadingspinner').style.display = 'none';
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

// Funktion zum Hinzufügen einer Video-Slide
function addVideoSlide() {
    const fileInput = document.getElementById('VideoFileInput');
    const file = fileInput.files[0];
    let confirmationMessage;

    if (file) {
        if (file.type.startsWith('video/')) {
            const form = document.getElementById('addVideoSlideForm');
            const formData = new FormData(form);

            document.getElementById('loadingspinner').style.display = 'block';
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
            fetch(`/uploadvideo?slidefolder=${datapath}`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                document.querySelectorAll('button').forEach(btn => btn.disabled = false);
                document.getElementById('loadingspinner').style.display = 'none';
                const responseJson = JSON.parse(data);
                confirmationMessage = responseJson;

                if (responseJson.fatal !== true) {
                    slidesData = responseJson.slidesData;
                    renderSlidesAdmin(slidesData);
                }
                closePopup('addVideoSlide', confirmationMessage);
            })
            .catch(error => {
                document.querySelectorAll('button').forEach(btn => btn.disabled = false);
                document.getElementById('loadingspinner').style.display = 'none';
                confirmationMessage = {
                    'title': 'Fehler beim Hochladen des Videos',
                    'content': error.message,
                    'fatal': true
                };
                closePopup('addVideoSlide', confirmationMessage);
            });
            return;
        } else {
            confirmationMessage = {
                'title': 'Video-Slide konnte nicht erstellt werden',
                'content': 'Die hochgeladene Datei ist kein Video.',
                'fatal': true
            };
        }
    } else {
        confirmationMessage = {
            'title': 'Video-Slide konnte nicht erstellt werden',
            'content': 'Es ist keine Video-Datei zum hochladen angegeben.',
            'fatal': true
        };
    }
    closePopup('addVideoSlide', confirmationMessage);
}

// Funktion zum hinzufügen einer Iframe-Slide
function addIframeSlide() {
    const urlInput = document.getElementById('IframeUrlInput');
    let confirmationMessage;

    if (urlInput.value) {
        const form = document.getElementById('addIframeSlideForm');
        const formData = new FormData(form);

        document.getElementById('loadingspinner').style.display = 'block';
        document.querySelectorAll('button').forEach(btn => btn.disabled = true);
        fetch(`/uploadiframe?slidefolder=${datapath}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            document.querySelectorAll('button').forEach(btn => btn.disabled = false);
            document.getElementById('loadingspinner').style.display = 'none';
            const responseJson = JSON.parse(data);

            if (responseJson.fatal !== true) {
                slidesData = responseJson.slidesData;
                renderSlidesAdmin(slidesData);
            }
            closePopup('addIframeSlide', responseJson);
        })
        .catch(error => {
            document.querySelectorAll('button').forEach(btn => btn.disabled = false);
            document.getElementById('loadingspinner').style.display = 'none';
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