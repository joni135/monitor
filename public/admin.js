// Alle Infos aus Datei auslesen (per API-Request)
function loadInfosAdmin() {  

    // HTML-API-Abfrage auf eigene Node.js-App machen, um alle 
    var inforequest = new XMLHttpRequest();
    inforequest.open('GET', `/getinfos?slidefolder=${datapath}`, true);

    inforequest.onload = function () {
      if (inforequest.status == 200) {
        infosData = JSON.parse(inforequest.responseText);
        if (reqparam.debug == 'true') {
          console.log('Infotexte: ', infosData);
        };

        renderInfosAdmin(infosData);
      }
    };

    inforequest.send();
  };


// Alle Infos auflisten
function renderInfosAdmin(infosData) {
    var infotableContainer = document.getElementById('infotable');
    infotableContainer.innerHTML = `
        <tr id="kopfzeile">
            <th>Text</th>
            <th>Informationen</th>
            <th>Bearbeiten</th>
        </tr>`;

    // Einzelne Infos in HTML einbetten
    for (var i = 0; i < infosData.length; i++) {
      if (infosData[i]) {
        var infoData = infosData[i];

        // Erstelle infoElement (Tabellenzeile)
        var info = document.createElement('tr');
        info.id = 'info-' + (i + 1);
        info.className = `infoElement`;
        
        // Erstelle Spalte Text
        var infoText = document.createElement('td');
        infoText.className = 'infoText';
        infoText.innerHTML = '<b>'+infoData.text+'</b>';
        info.appendChild(infoText);

        // Erstelle Spalte Beschreibung
        var infoDescription = document.createElement('td');
        infoDescription.className = 'infoDescription';
        infoDescription.innerHTML = `
            Bemerkung: ${infoData.comment}<br>
            Zeitrahmen: ${infoData.starttime} - ${infoData.endtime}`;
            info.appendChild(infoDescription);

        // Erstelle Spalte Buttons
        var infoButtons = document.createElement('td');
        infoButtons.className = 'infoButtons';
        infoButtons.innerHTML = `
            <!-- <button id="buttonUp" onclick="infoUp('${infoData.id}')"><i class="fa fa-arrow-up"></i></button> -->
            <!-- <button id="buttonDown" onclick="infoDown('${infoData.id}')"><i class="fa fa-arrow-down"></i></button> -->
            <button id="buttonEdit" onclick="openInfoEditPopup('${infoData.id}')"><i class="fa fa-pencil"></i></button>
            <button id="buttonDelete" onclick="infoDelete('${infoData.id}')"><i class="fa fa-trash"></i></button>
            `;
        info.appendChild(infoButtons);
        
        infotableContainer.appendChild(info);
      
      };
    };
  };


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
      }
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


// Popup-Fenster öffnen
function openPopup(PopupId) {
    document.getElementById(PopupId+'Form').reset(); // leert die Inputfelder
    document.getElementById('overlay').style.display = 'block';
    document.getElementById(PopupId).style.display = 'block';

    // setze Default- und Minimum-Wert bei Startdatum der Slides
    var datetimeNOW = new Date();
    var adjustedDatetime = new Date(datetimeNOW.getTime() - (datetimeNOW.getTimezoneOffset() * 60000)); // for Timezone
    var formatedDatetime = adjustedDatetime.toISOString().substring(0,16); // For minute precision

    var datetimeField = document.getElementById("InfoStarttimeInput");
        datetimeField.value = formatedDatetime;
        datetimeField.min = formatedDatetime;
    var datetimeField = document.getElementById("InfoEndtimeInput");
        datetimeField.min = formatedDatetime;

    var datetimeField = document.getElementById("EditInfoStarttimeInput");
        datetimeField.min = formatedDatetime;
    var datetimeField = document.getElementById("EditInfoEndtimeInput");
        datetimeField.min = formatedDatetime;

    var datetimeField = document.getElementById("ImageStarttimeInput");
        datetimeField.value = formatedDatetime;
        datetimeField.min = formatedDatetime;
    var datetimeField = document.getElementById("ImageEndtimeInput");
        datetimeField.min = formatedDatetime;

    var datetimeField = document.getElementById("IframeStarttimeInput");
        datetimeField.value = formatedDatetime;
        datetimeField.min = formatedDatetime;
    var datetimeField = document.getElementById("IframeEndtimeInput");
        datetimeField.min = formatedDatetime;

    var datetimeField = document.getElementById("SlideStarttimeInput");
        datetimeField.min = formatedDatetime;
    var datetimeField = document.getElementById("SlideEndtimeInput");
        datetimeField.min = formatedDatetime;
  };


// Popup-Fenster schliessen
function closePopup(PopupId) {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('confirmationMessage').style.color = 'black';
    document.getElementById(PopupId).style.display = 'none';
  };


// Funktion zum hinzufügen eines Info-Textes
function addInfo() {

    // Prüfe ob überhaupt ein Text angegeben wurde
    var textInput = document.getElementById('InfoTextInput');

    if (textInput.value) {
        // Info-Daten hochladen und antwort behandeln
        const form = document.getElementById('addInfoForm');
        const formData = new FormData(form);

        fetch(`/uploadinfo?slidefolder=${datapath}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            return response.text();
        })
        .then(data => {
            const responseJson = JSON.parse(data);
        
            document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
            document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
            if (responseJson.fatal === true) {
                document.getElementById('confirmationMessage').style.color = 'red';
            } else {
                renderInfosAdmin(responseJson.infosData)
            };
        
            document.getElementById('addInfo').style.display = 'none';
            document.getElementById('confirmationMessage').style.display = 'block';
        });
    } else {
        // Keine URL angegeben
        document.getElementById('confirmationMessageTitel').innerHTML = 'Info-Text konnte nicht erstellt werden';
        document.getElementById('confirmationMessageText').innerHTML = 'Es ist kein Text für die Info angegeben.';
        document.getElementById('confirmationMessage').style.color = 'red';
        document.getElementById('addIframeSlide').style.display = 'none';
        document.getElementById('confirmationMessage').style.display = 'block';
    };
  };


// Popup-Fenster für das Bearbeiten der Info öffnen
function openInfoEditPopup(infoId) {
    document.getElementById('editInfoTitel').innerHTML = `Info "${infoId}" bearbeiten`;
    document.getElementById('infoId').innerHTML = infoId;
    openPopup('editInfo');

    // setze aktuelle Werte in Formular
    for (var i = 0; i < infosData.length; i++) {
        if (infosData[i].id === infoId) {
            var infoPositionId = i;
        };
    };
    var EditInfoTextInput = document.getElementById('EditInfoTextInput');
        EditInfoTextInput.value = infosData[infoPositionId].text;
    var EditInfoCommentInput = document.getElementById('EditInfoCommentInput');
        EditInfoCommentInput.value = infosData[infoPositionId].comment;
    var EditInfoStarttimeInput = document.getElementById('EditInfoStarttimeInput');
        EditInfoStarttimeInput.value = infosData[infoPositionId].starttime;
    var EditInfoEndtimeInput = document.getElementById('EditInfoEndtimeInput');
        EditInfoEndtimeInput.value = infosData[infoPositionId].endtime;
    
  };


// Funktion zum bearbeiten einer Info
function editInfo() {
    const infoId = document.getElementById('infoId').innerHTML;

    // Neue Daten hochladen und antwort behandeln
    const form = document.getElementById('editInfoForm');
    const formData = new FormData(form);

    fetch(`/editinfo?slidefolder=${datapath}&infoid=${infoId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.text();
    })
    .then(data => {
        const responseJson = JSON.parse(data);
    
        document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
        document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
        if (responseJson.fatal === true) {
            document.getElementById('confirmationMessage').style.color = 'red';
        } else {
            renderInfosAdmin(responseJson.infosData)
        };
    
        document.getElementById('editInfo').style.display = 'none';
        document.getElementById('confirmationMessage').style.display = 'block';
    });
  };


// Funktion zum löschen einer Info
function infoDelete(infoId) {

    var infodeleterequest = new XMLHttpRequest();
    infodeleterequest.open('GET', `/deleteinfo?slidefolder=${datapath}&infoid=${infoId}`, true);
    
    infodeleterequest.onload = function () {

        if (infodeleterequest.status == 200) {
            responseJson = JSON.parse(infodeleterequest.responseText);
            renderInfosAdmin(responseJson.infosData);
        } else {
            document.getElementById('confirmationMessage').style.color = 'red';
        };
        
        document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
        document.getElementById('confirmationMessageText').innerHTML = responseJson.content;

        document.getElementById('overlay').style.display = 'block';
        document.getElementById('confirmationMessage').style.display = 'block';
    };
  
    infodeleterequest.send();
  };


// Funktion zum hinzufügen einer Bilder-Slide
function addImageSlide() {

    // Prüfe ob überhaupt ein Bild angegeben wurde
    var fileInput = document.getElementById('ImageFileInput');
    var file = fileInput.files[0];

    if (file) {
        if (file.type.startsWith('image/')) {

            // Bild hochladen und antwort behandeln
            const form = document.getElementById('addImageSlideForm');
            const formData = new FormData(form);

            fetch(`/uploadimage?slidefolder=${datapath}`, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                return response.text();
            })
            .then(data => {
                const responseJson = JSON.parse(data);
                //console.log(`${responseJson.title}:\n${responseJson.content}`);
            
                document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
                document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
                if (responseJson.fatal === true) {
                    document.getElementById('confirmationMessage').style.color = 'red';
                } else {
                    renderSlidesAdmin(responseJson.slidesData)
                };
            
                document.getElementById('addImageSlide').style.display = 'none';
                document.getElementById('confirmationMessage').style.display = 'block';
            });
        } else {
            // Datei ist kein Bild
            document.getElementById('confirmationMessageTitel').innerHTML = 'Bilder-Slide konnte nicht erstellt werden';
            document.getElementById('confirmationMessageText').innerHTML = 'Die hochgeladene Datei ist kein Bild.';
            document.getElementById('confirmationMessage').style.color = 'red';
            document.getElementById('addImageSlide').style.display = 'none';
            document.getElementById('confirmationMessage').style.display = 'block';
        };
    } else {
        // Keine Datei ausgewählt
        document.getElementById('confirmationMessageTitel').innerHTML = 'Bilder-Slide konnte nicht erstellt werden';
        document.getElementById('confirmationMessageText').innerHTML = 'Es ist keine Bild-Datei zum hochladen angegeben.';
        document.getElementById('confirmationMessage').style.color = 'red';
        document.getElementById('addImageSlide').style.display = 'none';
        document.getElementById('confirmationMessage').style.display = 'block';
    };
  };


// Funktion zum hinzufügen einer Iframe-Slide
function addIframeSlide() {

    // Prüfe ob überhaupt eine URL angegeben wurde
    var urlInput = document.getElementById('IframeUrlInput');

    if (urlInput.value) {
        // Iframe-Daten hochladen und antwort behandeln
        const form = document.getElementById('addIframeSlideForm');
        const formData = new FormData(form);

        fetch(`/uploadiframe?slidefolder=${datapath}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            return response.text();
        })
        .then(data => {
            const responseJson = JSON.parse(data);
            //console.log(`${responseJson.title}:\n${responseJson.content}`);
        
            document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
            document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
            if (responseJson.fatal === true) {
                document.getElementById('confirmationMessage').style.color = 'red';
            } else {
                renderSlidesAdmin(responseJson.slidesData)
            };
        
            document.getElementById('addIframeSlide').style.display = 'none';
            document.getElementById('confirmationMessage').style.display = 'block';
        });
    } else {
        // Keine URL angegeben
        document.getElementById('confirmationMessageTitel').innerHTML = 'Iframe-Slide konnte nicht erstellt werden';
        document.getElementById('confirmationMessageText').innerHTML = 'Es ist keine URL für das Iframe angegeben.';
        document.getElementById('confirmationMessage').style.color = 'red';
        document.getElementById('addIframeSlide').style.display = 'none';
        document.getElementById('confirmationMessage').style.display = 'block';
    };
  };


// Popup-Fenster für das Bearbeiten der Slide öffnen
function openSlideEditPopup(slideId) {
    document.getElementById('editSlideTitel').innerHTML = `Slide "${slideId}" bearbeiten`;
    document.getElementById('slideId').innerHTML = slideId;
    openPopup('editSlide');

    // setze aktuelle Werte in Formular
    for (var i = 0; i < slidesData.length; i++) {
        if (slidesData[i].id === slideId) {
            var slidePositionId = i;
        };
    };
    var SlideTitleInput = document.getElementById('SlideTitleInput');
        SlideTitleInput.value = slidesData[slidePositionId].title;
    var SlideCommentInput = document.getElementById('SlideCommentInput');
        SlideCommentInput.value = slidesData[slidePositionId].comment;
    var SlideDisplaydurationInput = document.getElementById('SlideDisplaydurationInput');
        SlideDisplaydurationInput.value = slidesData[slidePositionId].displayduration;
    var SlideStarttimeInput = document.getElementById('SlideStarttimeInput');
        SlideStarttimeInput.value = slidesData[slidePositionId].starttime;
    var SlideEndtimeInput = document.getElementById('SlideEndtimeInput');
        SlideEndtimeInput.value = slidesData[slidePositionId].endtime;
    
  };


// Funktion zum bearbeiten einer Slide
function editSlide() {
    const slideId = document.getElementById('slideId').innerHTML;

    // Neue Daten hochladen und antwort behandeln
    const form = document.getElementById('editSlideForm');
    const formData = new FormData(form);

    fetch(`/editslide?slidefolder=${datapath}&slideid=${slideId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.text();
    })
    .then(data => {
        const responseJson = JSON.parse(data);
        //console.log(`${responseJson.title}:\n${responseJson.content}`);
    
        document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
        document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
        if (responseJson.fatal === true) {
            document.getElementById('confirmationMessage').style.color = 'red';
        } else {
            renderSlidesAdmin(responseJson.slidesData)
        };
    
        document.getElementById('editSlide').style.display = 'none';
        document.getElementById('confirmationMessage').style.display = 'block';
    });
  };


// Funktion zum löschen einer Slide
function slideDelete(slideId) {

    var slidedeleterequest = new XMLHttpRequest();
    slidedeleterequest.open('GET', `/deleteslide?slidefolder=${datapath}&slideid=${slideId}`, true);
    
    slidedeleterequest.onload = function () {

        if (slidedeleterequest.status == 200) {
            responseJson = JSON.parse(slidedeleterequest.responseText);
            renderSlidesAdmin(responseJson.slidesData);
        } else {
            document.getElementById('confirmationMessage').style.color = 'red';
        };
        
        document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
        document.getElementById('confirmationMessageText').innerHTML = responseJson.content;

        document.getElementById('overlay').style.display = 'block';
        document.getElementById('confirmationMessage').style.display = 'block';
    };
  
    slidedeleterequest.send();
  };


// Slide eine Position nach oben verschieben
function slideUp(slideId) {

    var slidechangerequest = new XMLHttpRequest();
    slidechangerequest.open('GET', `/changeorderslideup?slidefolder=${datapath}&slideid=${slideId}`, true);
    
    slidechangerequest.onload = function () {

        if (slidechangerequest.status == 200) {
            responseJson = JSON.parse(slidechangerequest.responseText);
            renderSlidesAdmin(responseJson.slidesData);
        } else {
            document.getElementById('confirmationMessage').style.color = 'red';
            document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
            document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
    
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('confirmationMessage').style.display = 'block';
        };
    
    };
  
    slidechangerequest.send();
  };


// Slide eine Position nach unten verschieben
function slideDown(slideId) {

    var slidechangerequest = new XMLHttpRequest();
    slidechangerequest.open('GET', `/changeorderslidedown?slidefolder=${datapath}&slideid=${slideId}`, true);
    
    slidechangerequest.onload = function () {

        if (slidechangerequest.status == 200) {
            responseJson = JSON.parse(slidechangerequest.responseText);
            renderSlidesAdmin(responseJson.slidesData);
        } else {
            document.getElementById('confirmationMessage').style.color = 'red';
            document.getElementById('confirmationMessageTitel').innerHTML = responseJson.title;
            document.getElementById('confirmationMessageText').innerHTML = responseJson.content;
    
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('confirmationMessage').style.display = 'block';
        };
    
    };
  
    slidechangerequest.send();
  };
