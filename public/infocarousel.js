// Alle Infos aus Datei auslesen (per API-Request) und in HTML ergänzen
function loadInfos(additionalText) {  
    var infocarouselTextElements = document.querySelectorAll('.carousel-text');
    var finalInfoText = ''

    // HTML-API-Abfrage auf eigene Node.js-App machen, um alle Infos abzurufen
    var inforequest = new XMLHttpRequest();
    inforequest.open('GET', `/getinfos?slidefolder=${datapath}`, true);

    inforequest.onload = function () {
        if (inforequest.status == 200) {
            infosData = JSON.parse(inforequest.responseText);
            if (reqparam.debug == 'true') {
                console.log('Infotexte: ', infosData);
            };

            for (var i = 0; i < infosData.length; i++) {
                if (infosData[i]) {
                    var infoData = infosData[i];

                    var starttimeDate = new Date(infoData.starttime);
                    var endtimeDate = new Date(infoData.endtime);
                    var currentDate = new Date();
                    if ((starttimeDate < currentDate | infoData.starttime === "") && (endtimeDate > currentDate | infoData.endtime === "")) {

                        finalInfoText += ' > '+infoData.text

                        //slideshowContainer.appendChild(slideContainer);

                    } else {
                        console.log(`Info "${infoData.id}" ist ausserhalb der angegebenen Zeitspanne und wird nicht angezeigt`)
                    };

                };
            };

            const statusRuderverbot = checkRuderverbot();
            if (statusRuderverbot != undefined && statusRuderverbot.urgency > 1) {
                finalInfoText += ' > '+statusRuderverbot.text;
            };

            if (additionalText != "" && additionalText != undefined) {
                finalInfoText += ' > '+additionalText;
            };


            if (finalInfoText != "") {
                infocarouselTextElements.forEach(element => {
                    element.textContent = finalInfoText+' > ';
                });
            };

        };
    };

    inforequest.send();
};