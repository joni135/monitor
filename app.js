// Laden aller benötigten Bibliotheken
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const url = require('url');


// Lesen der Konfigurationsdatei
const configFile = fs.readFileSync('index.conf');
const config = JSON.parse(configFile);


// Erstelle Webapp auf Port 8080 (wird über Docker umgeleitet) und gebe Ordner frei
const app = express();
const port = 8080;
app.use(express.static(path.join(__dirname, config.maininfos.system.publicfolder)));



// Erstelle Webcontent auf Abfrage
app.get('/', (req, res) => {
    Errors = [];

    // Parse die URL der Anfrage, um die Query-Parameter zu erhalten
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;

    // Setze (oder definiere) URL-Parameter
    const reqparam = {};
    monitorparams = {};

    if (queryParameters.monitor) { // parameter MONITOR (see Configfile)
        for (let monitor of config.monitors) {
            if (monitor.available === true) {
                if (monitor.id.toLowerCase() == queryParameters.monitor.toLowerCase()) {
                    // Gruppe gefunden
                    reqparam.monitor = queryParameters.monitor.toLowerCase();
                    monitorparams = monitor;
                    break;
                };
            }
        };
        if (reqparam.monitor) {
        } else {
            Errors.push ({
                'title': `Parameter "MONITOR" falsch angegeben`,
                'content': `Der URL-Parameter MONITOR ist falsch angegeben! "${queryParameters.monitor}" ist kein gültiger Kanal...`,
                'fatal': true
            });
        };
    } else {
        Errors.push ({
            'title': `Parameter "MONITOR" nicht angegeben`,
            'content': `Der URL-Parameter MONITOR ist nicht angegeben! Dieser Parameter ist ein Pflichtattribut...`,
            'fatal': true
        });
    };

    if (queryParameters.type) { // parameter TYPE (DISPLAY or ADMIN)
        if (['display', 'admin'].includes(queryParameters.type.toLowerCase())) {
            reqparam.type = queryParameters.type.toLowerCase();
        } else {
            reqparam.type = 'display';
            Errors.push ({
                'title': `Parameter "TYPE" falsch angegeben`,
                'content': `Der URL-Parameter TYPE ist falsch angegeben! Der Wert wurde auf "${reqparam.type}" gesetzt`,
                'fatal': false
            });
        };
    } else {
        reqparam.type = 'display';
        Errors.push ({
            'title': `Parameter "TYPE" nicht angegeben`,
            'content': `Der URL-Parameter TYPE ist nicht angegeben! Der Wert wurde auf "${reqparam.type}" gesetzt`,
            'fatal': false
        });
    };

    if (queryParameters.debug) { // parameter DEBUG (TRUE or FALSE)
        if (['true', 'false'].includes(queryParameters.debug.toLowerCase())) {
            reqparam.debug = queryParameters.debug.toLowerCase();
        } else {
            reqparam.debug = 'false';
            Errors.push ({
                'title': `Parameter "DEBUG" falsch angegeben`,
                'content': `Der URL-Parameter DEBUG ist falsch angegeben! Der Wert wurde auf "${reqparam.debug}" gesetzt`,
                'fatal': false
            });
        };
    } else {
        reqparam.debug = 'false';
        Errors.push ({
            'title': `Parameter "DEBUG" nicht angegeben`,
            'content': `Der URL-Parameter DEBUG ist nicht angegeben! Der Wert wurde auf "${reqparam.debug}" gesetzt`,
            'fatal': false
        });
    };


    // Ergänze Wetterdaten wenn benötigt
    try {
        if (monitorparams.weatherdata.weather) {
            weatherdata = fs.readFileSync(config.maininfos.weathercalculator.datapath+monitorparams.weatherdata.weather);
            app.use(express.static(path.join(__dirname, config.maininfos.weathercalculator.symbolpath)));
        } else {
            weatherdata = JSON.stringify({});
        };
    } catch(err) {
        Errors.push ({
            'title': `Wetterdaten konnte nicht gelesen werden`,
            'content': `Die Dateien für die Wetterdaten konnten nicht gelesen werden!\n${err.message}`,
            'fatal': false
        });
        weatherdata = JSON.stringify({});
    };


    // Ergänze Hydrodaten wenn benötigt
    try {
        if (monitorparams.weatherdata.hydro) {
            hydrodata = fs.readFileSync(config.maininfos.weathercalculator.datapath+monitorparams.weatherdata.hydro);
        } else {
            hydrodata = JSON.stringify({});
        };
    } catch(err) {
        Errors.push ({
            'title': `Hydrodaten konnte nicht gelesen werden`,
            'content': `Die Dateien für die Hydrodaten konnten nicht gelesen werden!\n${err.message}`,
            'fatal': false
        });
        hydrodata = JSON.stringify({});
    };


    // Erstelle Abfragenspezifisches CSS, dass dem Client im HTML gesendet wird
    var CSSAtributes = ''
    if (monitorparams.stylevariables) {
        for (const key in monitorparams.stylevariables) {
            if (monitorparams.stylevariables.hasOwnProperty(key)) {
                CSSAtributes += `--${key}: ${monitorparams.stylevariables[key]} !important;`;
            };
        };
    };
    customCSS = `<style>html {${CSSAtributes}}</style>`;


    // Erstelle Abfragenspezifisches Skript, dass dem Client im HTML gesendet wird
    customScript = `
        <script type="text/javascript">
            const reqparam = ${JSON.stringify(reqparam)};
            const errors = ${JSON.stringify(Errors)};
            const sitetitle = "${config.maininfos.sitetitleprefix+monitorparams.name}";
            const siteauthor = "${config.maininfos.siteauthor}";
            const favicon = "${monitorparams.favicon}";
            const slidepath = "${monitorparams.slides}";
            const slideduration = "${monitorparams.slideduration}";
            const weatherdata = ${weatherdata};
            const hydrodata = ${hydrodata};
        </script>`;
    

    // Prüfe Prozess auf fatale Fehler
    let fatalErrorCount = 0;
    for (let Error of Errors) {
        if (Error.fatal == true) {
            fatalErrorCount += 1;
        };
    };


    // Generiere Pfad des zu sendenden HTML-Files, abhängig von Fehlern und Konfiguration
    if (fatalErrorCount == 0) {
        if (reqparam.type === 'admin') {
            htmlFilePath = path.join(__dirname, config.maininfos.system.publicfolder, `admin.html`);
        } else {
            htmlFilePath = path.join(__dirname, config.maininfos.system.publicfolder, `${monitorparams.file}`);
        };
    } else {
        htmlFilePath = path.join(__dirname, config.maininfos.system.publicfolder, `error.html`);
    };


    // Lese die HTML-Datei und sende sie an Client
    fs.readFile(htmlFilePath, 'utf8', (err, data) => {
        if (err) {
            // Fehler beim Lesen der Datei
            res.status(500).send({
                'title': `HTML konnte nicht geladen werden`,
                'content': err,
                'fatal': true
            });
        };

        // Gelesenem HTML Skript mit Parameter hinzufügen
        data = data.replace('</head>', `${customScript}${customCSS}</head>`);

        // Sende die HTML-Datei als Antwort
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });

});



// Liste alle Slides aus Konfigurationsdatei aus
app.get('/getslides', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var slidesConfigPath = '';
    

    if (queryParameters.slidefolder) {
        slidesConfigPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, config.maininfos.slidesconfig);
    } else {
        res.status(500).send({
            'title': `Slides konnten nicht gelistet werden`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    try {
        const slidesConfigFile = fs.readFileSync(slidesConfigPath);
        const slides = JSON.parse(slidesConfigFile);
        res.status(200).send(slides);
    } catch(err) {
        res.status(500).send({
            'title': `Slideskonfigurationen konnten nicht geladen werden`,
            'content': err,
            'fatal': true
        });
    };
});


// POST-Anfrage für das Hochladen einer Bilder-Slide
app.post('/uploadimage', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim erstellen der Slide`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    // Formular parsen und Daten verarbeiten
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(500).send({
                'title': `Fehler beim parsen des HTML-Formulars`,
                'content': err,
                'fatal': true
            });
        };
        
        // Hochgeladenes Bild ablegen
        const imageData = files.file[0];
        const oldPath = imageData.filepath;
        const newPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, imageData.originalFilename);
        fs.copyFile(oldPath, newPath, (err) => {
            if (err) {
                res.status(500).send({
                   'title': `Fehler beim abspeichern der Datei auf dem Server`,
                    'content': err,
                    'fatal': true
                });
            /*} else {
                res.status(200).send({
                    'title': `Datei hochgeladen`,
                    'content': `Datei "${imageData.originalFilename}" erfolgreich hochgeladen`,
                    'fatal': false
                });*/
            };
        });

        // Informationen in Slidesdaten ergänzen
        try {
            // Daten in JSON abspeichern
            const newSlide = {
                "id": imageData.originalFilename,
                "type": "img",
                "path": `${queryParameters.slidefolder}/${imageData.originalFilename}`,
                "title": fields.title[0],
                "comment": fields.comment[0],
                "starttime": fields.starttime[0],
                "endtime": fields.endtime[0]
            };

            // bestehende Slides-Informationen lesen
            slidesConfigPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, config.maininfos.slidesconfig);
            const slidesConfigFile = fs.readFileSync(slidesConfigPath);
            var slidesData = JSON.parse(slidesConfigFile);

            // neue Slide anhängen und Datei speichern
            slidesData.unshift(newSlide);
            let jsontext = JSON.stringify(slidesData, null, 4);
            fs.writeFile(slidesConfigPath, jsontext, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim abspeichern der Informationen zu dem hochgeladenen Bild`,
                        'content': err,
                        'fatal': true
                    });
                } else {

                    // Finale Bestätigungsmeldung
                    res.status(200).send({
                        'title': `Datei hochgeladen`,
                        'content': `Datei "${imageData.originalFilename}" erfolgreich hochgeladen`,
                        'fatal': false,
                        'slidesData': slidesData
                    });
                };
            });

        } catch (err) {
            res.status(500).send({
                'title': `Fehler beim abspeichern der Informationen zu dem hochgeladenen Bild`,
                'content': err,
                'fatal': true
            });
        };
        
    });
    
});


// POST-Anfrage für das Hochladen einer Iframe-Slide
app.post('/uploadiframe', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim erstellen der Slide`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    // Formular parsen und Daten verarbeiten
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
        if (err) {
            res.status(500).send({
                'title': `Fehler beim parsen des HTML-Formulars`,
                'content': err,
                'fatal': true
            });
        };
        
        // Informationen in Slidesdaten ergänzen
        try {
            // Daten in JSON abspeichern
            const newSlide = {
                "id": fields.url[0],
                "type": "iframe",
                "path": fields.url[0],
                "title": fields.title[0],
                "comment": fields.comment[0],
                "starttime": fields.starttime[0],
                "endtime": fields.endtime[0]
            };

            // bestehende Slides-Informationen lesen
            slidesConfigPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, config.maininfos.slidesconfig);
            const slidesConfigFile = fs.readFileSync(slidesConfigPath);
            var slidesData = JSON.parse(slidesConfigFile);

            // neue Slide anhängen und Datei speichern
            slidesData.unshift(newSlide);
            let jsontext = JSON.stringify(slidesData, null, 4);
            fs.writeFile(slidesConfigPath, jsontext, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim abspeichern der Slide-Informationen`,
                        'content': err,
                        'fatal': true
                    });
                } else {

                    // Finale Bestätigungsmeldung
                    res.status(200).send({
                        'title': `Slide erstellt`,
                        'content': `Slide für die URL "${fields.url[0]}" erfolgreich erstellt`,
                        'fatal': false,
                        'slidesData': slidesData
                    });
                };
            });

        } catch (err) {
            res.status(500).send({
                'title': `Fehler beim abspeichern der Slide-Informationen`,
                'content': err,
                'fatal': true
            });
        };
        
    });
    
});


// POST-Anfrage für das bearbeiten einer Slide
app.post('/editslide', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim bearbeiten der Slide`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    if (queryParameters.slideid) {
        slideId = queryParameters.slideid;
    } else {
        res.status(500).send({
            'title': `Fehler beim bearbeiten der Slide`,
            'content': `Der URL-Parameter SLIDEID ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    // Formular parsen und Daten verarbeiten
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields) => {
        if (err) {
            res.status(500).send({
                'title': `Fehler beim parsen des HTML-Formulars`,
                'content': err,
                'fatal': true
            });
        };
        
        // Informationen in Slidesdaten ergänzen
        try {
            // bestehende Slides-Informationen lesen
            slidesConfigPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, config.maininfos.slidesconfig);
            const slidesConfigFile = fs.readFileSync(slidesConfigPath);
            var slidesData = JSON.parse(slidesConfigFile);

            // Slide-Index extrahieren
            for (var i = 0; i < slidesData.length; i++) {
                if (slidesData[i].id === slideId) {
                    var slidePositionId = i;
                };
            };

            // Slidedaten aktualisieren und Datei speichern
            slidesData[slidePositionId].title = fields.title[0];
            slidesData[slidePositionId].comment = fields.comment[0];
            slidesData[slidePositionId].starttime = fields.starttime[0];
            slidesData[slidePositionId].endtime = fields.endtime[0];
            let jsontext = JSON.stringify(slidesData, null, 4);
            fs.writeFile(slidesConfigPath, jsontext, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim abspeichern der Slide-Informationen`,
                        'content': err,
                        'fatal': true
                    });
                } else {

                    // Finale Bestätigungsmeldung
                    res.status(200).send({
                        'title': `Slide aktualisiert`,
                        'content': `Slide "${queryParameters.slideid}" erfolgreich aktualisiert`,
                        'fatal': false,
                        'slidesData': slidesData
                    });
                };
            });

        } catch (err) {
            console.log(err)
            res.status(500).send({
                'title': `Fehler beim aktualisieren der Slide-Informationen`,
                'content': err,
                'fatal': true
            });
        };
        
    });
    
});


// GET-Anfrage für das löschen einer Slide
app.get('/deleteslide', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim löschen der Slide`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    if (queryParameters.slideid) {
        slideId = queryParameters.slideid;
    } else {
        res.status(500).send({
            'title': `Fehler beim löschen der Slide`,
            'content': `Der URL-Parameter SLIDEID ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    try {
        // bestehende Slides-Informationen lesen
        slidesConfigPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, config.maininfos.slidesconfig);
        const slidesConfigFile = fs.readFileSync(slidesConfigPath);
        var slidesData = JSON.parse(slidesConfigFile);

        // Slide-Index extrahieren
        for (var i = 0; i < slidesData.length; i++) {
            if (slidesData[i].id === slideId) {
                var slidePositionId = i;
            };
        };

        // Falls Slide ein Bild ist, Datei löschen
        if (slidesData[slidePositionId].type === 'img') {
            slideImagePath = path.join(__dirname, config.maininfos.system.publicfolder, slidesData[slidePositionId].path);
            fs.unlink(slideImagePath, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim löschen des Slide-Bildes`,
                        'content': err,
                        'fatal': true
                    });
                };
            });
        };

        // Slidedaten löschen und Datei speichern
        slidesData.splice(slidePositionId, 1);
        let jsontext = JSON.stringify(slidesData, null, 4);
        fs.writeFile(slidesConfigPath, jsontext, (err) => {
            if (err) {
                res.status(500).send({
                    'title': `Fehler beim löschen der Slide-Informationen`,
                    'content': err,
                    'fatal': true
                });
            } else {

                // Finale Bestätigungsmeldung
                res.status(200).send({
                    'title': `Slide gelöscht`,
                    'content': `Slide "${queryParameters.slideid}" erfolgreich gelöscht`,
                    'fatal': false,
                    'slidesData': slidesData
                });
            };
        });

    } catch (err) {
        console.log(err)
        res.status(500).send({
            'title': `Fehler beim löschen der Slide-Informationen`,
            'content': err,
            'fatal': true
        });
    };
    
});


// GET-Anfrage für das ändern der Slide-Reihenfolge (Slide eine Position nach oben)
app.get('/changeorderslideup', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim anpassen der Slide-Reihenfolge`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    if (queryParameters.slideid) {
        slideId = queryParameters.slideid;
    } else {
        res.status(500).send({
            'title': `Fehler beim anpassen der Slide-Reihenfolge`,
            'content': `Der URL-Parameter SLIDEID ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    
    try {
        // bestehende Slides-Informationen lesen
        slidesConfigPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, config.maininfos.slidesconfig);
        const slidesConfigFile = fs.readFileSync(slidesConfigPath);
        var slidesData = JSON.parse(slidesConfigFile);

        // Slide-Index extrahieren
        for (var i = 0; i < slidesData.length; i++) {
            if (slidesData[i].id === slideId) {
                var slidePositionId = i;
            };
        };

        // Slidedaten anpassen und Datei speichern
        if (slidePositionId !== 0) {
            var mySlideData = slidesData[slidePositionId];
            var preSlideData = slidesData[slidePositionId - 1];
    
            slidesData[slidePositionId - 1] = mySlideData;
            slidesData[slidePositionId] = preSlideData;

            let jsontext = JSON.stringify(slidesData, null, 4);
            fs.writeFile(slidesConfigPath, jsontext, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim anpassen der Slide-Reihenfolge`,
                        'content': err,
                        'fatal': true
                    });
                } else {

                    // Finale Bestätigungsmeldung
                    res.status(200).send({
                        'title': `Slidereihenfolge angepasst`,
                        'content': `Slide "${queryParameters.slideid}" neu auf Position ${slidePositionId - 1}`,
                        'fatal': false,
                        'slidesData': slidesData
                    });
                };
            });
        } else {

            // Die Reihenfolge kann/wird nicht angepasst
            res.status(200).send({
                'title': `Slidereihenfolge nicht angepasst`,
                'content': `Slide "${queryParameters.slideid}" ist bereits an oberster Position`,
                'fatal': false,
                'slidesData': slidesData
            });
        };

    } catch (err) {
        console.log(err)
        res.status(500).send({
            'title': `Fehler beim anpassen der Slide-Reihenfolge`,
            'content': err,
            'fatal': true
        });
    };
    
});


// GET-Anfrage für das ändern der Slide-Reihenfolge (Slide eine Position nach unten)
app.get('/changeorderslidedown', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim anpassen der Slide-Reihenfolge`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    if (queryParameters.slideid) {
        slideId = queryParameters.slideid;
    } else {
        res.status(500).send({
            'title': `Fehler beim anpassen der Slide-Reihenfolge`,
            'content': `Der URL-Parameter SLIDEID ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    
    try {
        // bestehende Slides-Informationen lesen
        slidesConfigPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.slidefolder, config.maininfos.slidesconfig);
        const slidesConfigFile = fs.readFileSync(slidesConfigPath);
        var slidesData = JSON.parse(slidesConfigFile);

        // Slide-Index extrahieren
        for (var i = 0; i < slidesData.length; i++) {
            if (slidesData[i].id === slideId) {
                var slidePositionId = i;
            };
        };

        // Slidedaten anpassen und Datei speichern
        if (slidePositionId !== slidesData.length-1) {
            var mySlideData = slidesData[slidePositionId];
            var nextSlideData = slidesData[slidePositionId + 1];

            slidesData[slidePositionId + 1] = mySlideData;
            slidesData[slidePositionId] = nextSlideData;

            let jsontext = JSON.stringify(slidesData, null, 4);
            fs.writeFile(slidesConfigPath, jsontext, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim anpassen der Slide-Reihenfolge`,
                        'content': err,
                        'fatal': true
                    });
                } else {

                    // Finale Bestätigungsmeldung
                    res.status(200).send({
                        'title': `Slidereihenfolge angepasst`,
                        'content': `Slide "${queryParameters.slideid}" neu auf Position ${slidePositionId + 1}`,
                        'fatal': false,
                        'slidesData': slidesData
                    });
                };
            });
        } else {

            // Die Reihenfolge kann/wird nicht angepasst
            res.status(200).send({
                'title': `Slidereihenfolge nicht angepasst`,
                'content': `Slide "${queryParameters.slideid}" ist bereits an unterster Position`,
                'fatal': false,
                'slidesData': slidesData
            });
        };

    } catch (err) {
        console.log(err)
        res.status(500).send({
            'title': `Fehler beim anpassen der Slide-Reihenfolge`,
            'content': err,
            'fatal': true
        });
    };
    
});


// debug listen port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
