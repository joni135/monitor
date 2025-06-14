let infosData = {}

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


// Funktion zum hinzufügen eines Info-Textes
async function addInfo() {
    const textInput = document.getElementById('InfoTextInput');
    let confirmationMessage;

    if (textInput.value) {
        const form = document.getElementById('addInfoForm');
        const formData = new FormData(form);

        try {
            const response = await fetch(`/uploadinfo?slidefolder=${datapath}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.text();
            const responseJson = JSON.parse(data);

            confirmationMessage = responseJson;

            if (responseJson.fatal !== true) {
                infosData = responseJson.infosData;
                renderInfosAdmin(infosData);
            }
        } catch (error) {
            confirmationMessage = {
                'title': 'Fehler beim Hinzufügen der Info',
                'content': error.message,
                'fatal': true
            };
        }
    } else {
        confirmationMessage = {
            'title': 'Info-Text konnte nicht erstellt werden',
            'content': 'Es ist kein Text für die Info angegeben.',
            'fatal': true
        };
    }

    closePopup('addInfo', confirmationMessage);
}

// Popup-Fenster für das Bearbeiten der Info öffnen
function openInfoEditPopup(infoId) {
    document.getElementById('editInfoForm').reset();
    document.getElementById('editInfoTitel').innerHTML = `Info "${infoId}" bearbeiten`;
    document.getElementById('infoId').innerHTML = infoId;

    let infoPositionId = -1;
    for (let i = 0; i < infosData.length; i++) {
        if (infosData[i].id === infoId) {
            infoPositionId = i;
            break;
        }
    }
    if (infoPositionId === -1) return;

    document.getElementById('EditInfoTextInput').value = infosData[infoPositionId].text;
    document.getElementById('EditInfoCommentInput').value = infosData[infoPositionId].comment;
    document.getElementById('EditInfoStarttimeInput').value = infosData[infoPositionId].starttime;
    document.getElementById('EditInfoStarttimeInput').min = formatedDatetime();
    document.getElementById('EditInfoEndtimeInput').value = infosData[infoPositionId].endtime;
    document.getElementById('EditInfoEndtimeInput').min = formatedDatetime();

    openPopup('editInfo');
}

// Funktion zum bearbeiten einer Info
function editInfo() {
    const infoId = document.getElementById('infoId').innerHTML;
    const form = document.getElementById('editInfoForm');
    const formData = new FormData(form);

    fetch(`/editinfo?slidefolder=${datapath}&infoid=${infoId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        const responseJson = JSON.parse(data);

        if (responseJson.fatal !== true) {
            infosData = responseJson.infosData;
            renderInfosAdmin(infosData);
        }

        closePopup('editInfo', responseJson);
    });
}

// Funktion zum löschen einer Info
function infoDelete(infoId) {
    const infodeleterequest = new XMLHttpRequest();
    infodeleterequest.open('GET', `/deleteinfo?slidefolder=${datapath}&infoid=${infoId}`, true);

    infodeleterequest.onload = function () {
        const responseJson = JSON.parse(infodeleterequest.responseText);
        
        if (responseJson.fatal !== true) {
            infosData = responseJson.infosData;
            renderInfosAdmin(infosData);
        };

        closePopup('deleteSlide', responseJson);
    };

    infodeleterequest.send();
}