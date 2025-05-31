// Laden aller benötigten Bibliotheken
const express = require('express');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const url = require('url');
const { v4: uuidv4 } = require('uuid');


// Lesen der Konfigurationsdatei
const configFile = fs.readFileSync('index.conf');
const config = JSON.parse(configFile);


// Erstelle Webapp auf Port 8080 (wird über Docker umgeleitet) und gebe Ordner frei
const app = express();
const port = 8080;
app.use(express.static(path.join(__dirname, config.maininfos.system.publicfolder)));
app.use(express.static(path.join(__dirname, config.maininfos.system.monitorsfolder)));


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


    // Lese Monitorspezifische Konfigurationen
    try {
        monitorconfigFile = fs.readFileSync(path.join(__dirname, config.maininfos.system.monitorsfolder, monitorparams.datapath, config.maininfos.monitorconfigfile));
        monitorconfig = JSON.parse(monitorconfigFile);
    } catch(err) {
        Errors.push ({
            'title': `Monitorspezifische Konfigurationen konnten nicht gelesen werden`,
            'content': `Die Dateien für die Monitorspezifischen Konfigurationen konnten nicht gelesen werden!\n${err.message}`,
            'fatal': true
        });
        monitorconfig = {}
    }


    // Starte Backend-Skript für Plugin "weatherandhydrodata"
    try {
        if (monitorparams.plugins.includes("weatherandhydrodata")) {

            // Ergänze Wetterdaten wenn benötigt
            try {
                if (monitorconfig.weatherandhydrodata.json_weather) {
                    weatherdata = fs.readFileSync(config.plugins.weatherandhydrodata.datapath+monitorconfig.weatherandhydrodata.json_weather);
                    app.use(express.static(path.join(__dirname, config.plugins.weatherandhydrodata.symbolpath)));
                    weathersymboltype = monitorconfig.weatherandhydrodata.weathersymboltype;
                };
            } catch(err) {
                Errors.push ({
                    'title': `Wetterdaten konnte nicht gelesen werden`,
                    'content': `Die Dateien für die Wetterdaten konnten nicht gelesen werden!\n${err.message}`,
                    'fatal': false
                });
            };

            // Ergänze Hydrodaten wenn benötigt
            try {
                if (monitorconfig.weatherandhydrodata.json_hydro) {
                    hydrodata = fs.readFileSync(config.plugins.weatherandhydrodata.datapath+monitorconfig.weatherandhydrodata.json_hydro);
                };
            } catch(err) {
                Errors.push ({
                    'title': `Hydrodaten konnte nicht gelesen werden`,
                    'content': `Die Dateien für die Hydrodaten konnten nicht gelesen werden!\n${err.message}`,
                    'fatal': false
                });
            };
        };
    } catch(err) {
        Errors.push ({
            'title': `Wetter- und Hydrodaten konnte nicht gelesen werden`,
            'content': `Es gab ein unbekannter Fehler beim Lesen der Konfigurationen bzw. Daten oder im Plugin`,
            'fatal': true
        });
    };

    try {weatherdata} catch(err) {weatherdata = JSON.stringify({})};
    try {weathersymboltype} catch(err) {weathersymboltype = ''};
    try {hydrodata} catch(err) {hydrodata = JSON.stringify({})};


    // Laden der Plugins, die dem Client im HTML gesendet werden
    customPlugins = '';
    try {
        for (var i=0; i<monitorparams.plugins.length; i++) {
            customPlugins += `<script src=plugins/${monitorparams.plugins[i]}.js></script>`;
        };
    } catch(err) {};


    // Erstelle Abfragenspezifisches Skript, dass dem Client im HTML gesendet wird
    customScript = `
        <script type="text/javascript">
            const reqparam = ${JSON.stringify(reqparam)};
            const errors = ${JSON.stringify(Errors)};
            const sitetitle = "${config.maininfos.sitetitleprefix+monitorparams.name}";
            const siteauthor = "${config.maininfos.siteauthor}";
            const favicon = "${monitorparams.favicon}";
            const datapath = "${monitorparams.datapath}";
            const slideduration = "${monitorconfig.slideduration}";
            const weatherdata = ${weatherdata};
            const weathersymboltype = "${weathersymboltype}";
            const hydrodata = ${hydrodata};
        </script>`;
    

    // Erstelle Abfragenspezifisches CSS, dass dem Client im HTML gesendet wird
    var CSSAtributes = ''
    if (monitorconfig.stylevariables) {
        for (const key in monitorconfig.stylevariables) {
            if (monitorconfig.stylevariables.hasOwnProperty(key)) {
                CSSAtributes += `${key}: ${monitorconfig.stylevariables[key]} !important;`;
            };
        };
    };
    customCSS = `<style>html {${CSSAtributes}}</style>`;
    

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
            htmlFilePath = path.join(__dirname, config.maininfos.system.monitorsfolder, `${monitorparams.htmlfile}`);
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

        // Gelesenem HTML Skript mit Plugins und Parameter und CSS hinzufügen
        data = data.replace('</head>', `${customPlugins}${customScript}${customCSS}</head>`);

        // Sende die HTML-Datei als Antwort
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });

});



// Liste alle Infos aus Konfigurationsdatei aus
app.get('/getinfos', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var monitorconfigPath = '';
    

    if (queryParameters.slidefolder) {
        monitorconfigPath = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder, config.maininfos.monitorconfigfile);
    } else {
        res.status(500).send({
            'title': `Infos konnten nicht gelistet werden`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    try {
        const monitorconfigFile = fs.readFileSync(monitorconfigPath);
        const monitorconfig = JSON.parse(monitorconfigFile);
        res.status(200).send(monitorconfig.infos);
    } catch(err) {
        res.status(500).send({
            'title': `Infoskonfigurationen konnten nicht geladen werden`,
            'content': err,
            'fatal': true
        });
    };
});


// POST-Anfrage für das Hochladen einer Info-Nachricht
app.post('/uploadinfo', (req, res) => {
    const uuid_v4 = uuidv4();

    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim erstellen der Info`,
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
        
        // Informationen in Infos ergänzen
        try {
            // ID generieren -> neu wird die UUID verwendet
            //var specialChars = "!@#$^'&%*()+=-_[]\\{}|;:<>?,./";
            //var infoid = fields.text[0];
            //for (var i=0; i < specialChars.length; i++) {
            //    infoid = infoid.replaceAll(specialChars[i], "");
            //};
            //infoid = infoid.replaceAll('"', "");
            //infoid = infoid.replaceAll(" ", "");

            // Daten in JSON abspeichern
            const newInfo = {
                "id": uuid_v4, //infoid.toLowerCase(),
                "text": fields.text[0],
                "comment": fields.comment[0],
                "starttime": fields.starttime[0],
                "endtime": fields.endtime[0]
            };

            // bestehende Info-Informationen lesen
            monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
            const monitorconfigFile = fs.readFileSync(monitorconfigPath);
            var monitorconfig = JSON.parse(monitorconfigFile);

            // neue Info anhängen und Datei speichern
            var infosData = monitorconfig.infos
            //infosData.unshift(newInfo);  // -> fügt Slide am Anfang ein
            infosData.push(newInfo);
            monitorconfig.infos = infosData
            let jsontext = JSON.stringify(monitorconfig, null, 4);
            fs.writeFile(monitorconfigPath, jsontext, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim abspeichern der Info-Nachricht`,
                        'content': err,
                        'fatal': true
                    });
                } else {

                    // Finale Bestätigungsmeldung
                    res.status(200).send({
                        'title': `Info-Nachricht erstellt`,
                        'content': `Info "${fields.text[0]}" erfolgreich erstellt`,
                        'fatal': false,
                        'infosData': infosData
                    });
                };
            });

        } catch (err) {
            res.status(500).send({
                'title': `Fehler beim abspeichern der Info-Nachrichten`,
                'content': err,
                'fatal': true
            });
        };
        
    });
    
});


// POST-Anfrage für das bearbeiten einer Info
app.post('/editinfo', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim bearbeiten der Info`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    if (queryParameters.infoid) {
        infoId = queryParameters.infoid;
    } else {
        res.status(500).send({
            'title': `Fehler beim bearbeiten der Info`,
            'content': `Der URL-Parameter INFOID ist nicht angegeben! Dieser ist pflicht...`,
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
        
        // Informationen in Infosdaten ergänzen
        try {
            // bestehende Infos-Informationen lesen
            monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
            const monitorconfigFile = fs.readFileSync(monitorconfigPath);
            var monitorconfig = JSON.parse(monitorconfigFile);

            // Info-Index extrahieren
            var infosData = monitorconfig.infos
            for (var i = 0; i < infosData.length; i++) {
                if (infosData[i].id === infoId) {
                    var infoPositionId = i;
                };
            };

            // Infodaten aktualisieren und Datei speichern
            infosData[infoPositionId].text = fields.text[0];
            infosData[infoPositionId].comment = fields.comment[0];
            infosData[infoPositionId].starttime = fields.starttime[0];
            infosData[infoPositionId].endtime = fields.endtime[0];
            monitorconfig.infos = infosData
            let jsontext = JSON.stringify(monitorconfig, null, 4);
            fs.writeFile(monitorconfigPath, jsontext, (err) => {
                if (err) {
                    res.status(500).send({
                        'title': `Fehler beim abspeichern der Info-Nachricht`,
                        'content': err,
                        'fatal': true
                    });
                } else {

                    // Finale Bestätigungsmeldung
                    res.status(200).send({
                        'title': `Info aktualisiert`,
                        'content': `Info "${queryParameters.infoid}" erfolgreich aktualisiert`,
                        'fatal': false,
                        'infosData': infosData
                    });
                };
            });

        } catch (err) {
            console.log(err)
            res.status(500).send({
                'title': `Fehler beim aktualisieren der Info-Nachrichten`,
                'content': err,
                'fatal': true
            });
        };
        
    });
    
});


// GET-Anfrage für das löschen einer Info
app.get('/deleteinfo', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
    } else {
        res.status(500).send({
            'title': `Fehler beim löschen der Info`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };
    if (queryParameters.infoid) {
        infoId = queryParameters.infoid;
    } else {
        res.status(500).send({
            'title': `Fehler beim löschen der Info`,
            'content': `Der URL-Parameter INFOID ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    try {
        // bestehende Infos-Informationen lesen
        monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
        const monitorconfigFile = fs.readFileSync(monitorconfigPath);
        var monitorconfig = JSON.parse(monitorconfigFile);

        // Info-Index extrahieren
        var infosData = monitorconfig.infos
        for (var i = 0; i < infosData.length; i++) {
            if (infosData[i].id === infoId) {
                var infoPositionId = i;
            };
        };

        // Infodaten löschen und Datei speichern
        infosData.splice(infoPositionId, 1);
        monitorconfig.infos = infosData
        let jsontext = JSON.stringify(monitorconfig, null, 4);
        fs.writeFile(monitorconfigPath, jsontext, (err) => {
            if (err) {
                res.status(500).send({
                    'title': `Fehler beim löschen der Info-Nachricht`,
                    'content': err,
                    'fatal': true
                });
            } else {

                // Finale Bestätigungsmeldung
                res.status(200).send({
                    'title': `Info gelöscht`,
                    'content': `Info "${queryParameters.infoid}" erfolgreich gelöscht`,
                    'fatal': false,
                    'infosData': infosData
                });
            };
        });

    } catch (err) {
        console.log(err)
        res.status(500).send({
            'title': `Fehler beim löschen der Info-Nachrichten`,
            'content': err,
            'fatal': true
        });
    };
    
});


// Liste alle Slides aus Konfigurationsdatei aus
app.get('/getslides', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var monitorconfigPath = '';
    

    if (queryParameters.slidefolder) {
        monitorconfigPath = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder, config.maininfos.monitorconfigfile);
    } else {
        res.status(500).send({
            'title': `Slides konnten nicht gelistet werden`,
            'content': `Der URL-Parameter SLIDEFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
    };

    try {
        const monitorconfigFile = fs.readFileSync(monitorconfigPath);
        const monitorconfig = JSON.parse(monitorconfigFile);
        res.status(200).send(monitorconfig.slides);
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
    const uuid_v4 = uuidv4();

    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
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

        const newFilename = uuid_v4+path.extname(imageData.originalFilename)
        const newPath = path.join(uploadDirectory, newFilename);
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
                "id": uuid_v4,
                "type": "img",
                "path": `${queryParameters.slidefolder}/${newFilename}`,
                "title": fields.title[0],
                "comment": fields.comment[0],
                "starttime": fields.starttime[0],
                "endtime": fields.endtime[0]
            };

            // bestehende Slides-Informationen lesen
            monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
            const monitorconfigFile = fs.readFileSync(monitorconfigPath);
            var monitorconfig = JSON.parse(monitorconfigFile);

            // neue Slide anhängen und Datei speichern
            var slidesData = monitorconfig.slides
            //slidesData.unshift(newSlide);  // -> fügt Slide am Anfang ein
            slidesData.push(newSlide);
            monitorconfig.slides = slidesData
            let jsontext = JSON.stringify(monitorconfig, null, 4);
            fs.writeFile(monitorconfigPath, jsontext, (err) => {
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
    const uuid_v4 = uuidv4();

    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var uploadDirectory = '';
    
    if (queryParameters.slidefolder) {
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
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
                "id": uuid_v4,
                "type": "iframe",
                "path": fields.url[0],
                "title": fields.title[0],
                "comment": fields.comment[0],
                "starttime": fields.starttime[0],
                "endtime": fields.endtime[0]
            };

            // bestehende Slides-Informationen lesen
            monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
            const monitorconfigFile = fs.readFileSync(monitorconfigPath);
            var monitorconfig = JSON.parse(monitorconfigFile);

            // neue Slide anhängen und Datei speichern
            var slidesData = monitorconfig.slides
            //slidesData.unshift(newSlide);  // -> fügt Slide am Anfang ein
            slidesData.push(newSlide);
            monitorconfig.slides = slidesData
            let jsontext = JSON.stringify(monitorconfig, null, 4);
            fs.writeFile(monitorconfigPath, jsontext, (err) => {
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
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
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
            monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
            const monitorconfigFile = fs.readFileSync(monitorconfigPath);
            var monitorconfig = JSON.parse(monitorconfigFile);

            // Slide-Index extrahieren
            var slidesData = monitorconfig.slides
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
            monitorconfig.slides = slidesData
            let jsontext = JSON.stringify(monitorconfig, null, 4);
            fs.writeFile(monitorconfigPath, jsontext, (err) => {
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
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
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
        monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
        const monitorconfigFile = fs.readFileSync(monitorconfigPath);
        var monitorconfig = JSON.parse(monitorconfigFile);

        // Slide-Index extrahieren
        var slidesData = monitorconfig.slides
        for (var i = 0; i < slidesData.length; i++) {
            if (slidesData[i].id === slideId) {
                var slidePositionId = i;
            };
        };

        // Falls Slide ein Bild ist, Datei löschen
        if (slidesData[slidePositionId].type === 'img') {
            slideImagePath = path.join(__dirname, config.maininfos.system.monitorsfolder, slidesData[slidePositionId].path);
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
        monitorconfig.slides = slidesData
        let jsontext = JSON.stringify(monitorconfig, null, 4);
        fs.writeFile(monitorconfigPath, jsontext, (err) => {
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
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
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
        monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
        const monitorconfigFile = fs.readFileSync(monitorconfigPath);
        var monitorconfig = JSON.parse(monitorconfigFile);

        // Slide-Index extrahieren
        var slidesData = monitorconfig.slides
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

            monitorconfig.slides = slidesData
            let jsontext = JSON.stringify(monitorconfig, null, 4);
            fs.writeFile(monitorconfigPath, jsontext, (err) => {
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
        uploadDirectory = path.join(__dirname, config.maininfos.system.monitorsfolder, queryParameters.slidefolder);
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
        monitorconfigPath = path.join(uploadDirectory, config.maininfos.monitorconfigfile);
        const monitorconfigFile = fs.readFileSync(monitorconfigPath);
        var monitorconfig = JSON.parse(monitorconfigFile);

        // Slide-Index extrahieren
        var slidesData = monitorconfig.slides
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

            monitorconfig.slides = slidesData
            let jsontext = JSON.stringify(monitorconfig, null, 4);
            fs.writeFile(monitorconfigPath, jsontext, (err) => {
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
