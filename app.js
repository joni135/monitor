// Laden aller benötigten Bibliotheken
const express = require('express');
const path = require('path');
const fs = require('fs');
const url = require('url');


// Lesen der Konfigurationsdatei
const configfile = fs.readFileSync('index.conf');
const config = JSON.parse(configfile);


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
            weatherdata = JSON.stringify({})
        };
    } catch(err) {
        Errors.push ({
            'title': `Wetterdaten konnte nicht gelesen werden`,
            'content': `Die Dateien für die Wetterdaten konnten nicht gelesen werden!\n${err.message}`,
            'fatal': false
        });
        weatherdata = JSON.stringify({})
    };


    // Ergänze Hydrodaten wenn benötigt
    try {
        if (monitorparams.weatherdata.hydro) {
            hydrodata = fs.readFileSync(config.maininfos.weathercalculator.datapath+monitorparams.weatherdata.hydro);
        } else {
            hydrodata = JSON.stringify({})
        };
    } catch(err) {
        Errors.push ({
            'title': `Hydrodaten konnte nicht gelesen werden`,
            'content': `Die Dateien für die Hydrodaten konnten nicht gelesen werden!\n${err.message}`,
            'fatal': false
        });
        hydrodata = JSON.stringify({})
    };


    // Ergänze Titel der Slides wenn vorhanden
    try {
        slidetitles = fs.readFileSync(config.maininfos.system.publicfolder+monitorparams.images+config.maininfos.slideshow.slidetitlefile);
    } catch(err) {
        Errors.push ({
            'title': `Slidetitel konnten nicht gelesen werden`,
            'content': `Die Datei, die Informationen zu den Slides beinhaltet, konnten nicht gelesen werden!\n${err.message}`,
            'fatal': false
        });
        slidetitles = JSON.stringify({})
    };


    // Prüfe Prozess auf fatale Fehler
    let fatalErrorCount = 0
    for (let Error of Errors) {
        if (Error.fatal == true) {
            fatalErrorCount += 1
        };
    };

    // Erstelle Abfragenspezifisches Skript, dass dem Client im HTML gesendet wird
    customScript = `
        <script type="text/javascript">
            const reqparam = ${JSON.stringify(reqparam)};
            const errors = ${JSON.stringify(Errors)};
            const sitetitle = "${config.maininfos.sitetitleprefix+monitorparams.name}";
            const siteauthor = "${config.maininfos.siteauthor}";
            const favicon = "${monitorparams.favicon}";
            const imagespath = "${monitorparams.images}";
            const slideduration = "${monitorparams.slideduration}";
            const slidetitles = ${slidetitles};
            const weatherdata = ${weatherdata};
            const hydrodata = ${hydrodata};
        </script>`;


    // Generiere Pfad des zu sendenden HTML-Files, abhängig von Fehlern und Konfiguration
    if (fatalErrorCount == 0) {
        htmlFilePath = path.join(__dirname, config.maininfos.system.publicfolder, `${monitorparams.file}`);
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
            return;
        }

        // Gelesenem HTML Skript mit Parameter hinzufügen
        data = data.replace('</head>', `${customScript}</head>`);

        // Sende die HTML-Datei als Antwort
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
    });

});


// Liste alle Bilder aus Ordner aus (wird von App intern verwendet)
app.get('/listimages', (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryParameters = parsedUrl.query;
    var imagesPath = ''

    if (queryParameters.specificfolder) {
        imagesPath = path.join(__dirname, config.maininfos.system.publicfolder, queryParameters.specificfolder);
    } else {
        res.status(500).send({
            'title': `Bilder konnten nicht gelistet werden`,
            'content': `Der URL-Parameter SPECIFICFOLDER ist nicht angegeben! Dieser ist pflicht...`,
            'fatal': true
        });
        return;
    };

    fs.readdir(imagesPath, (err, files) => {
        if (err) {
            res.status(500).send({
                'title': `Bilder konnten nicht gelistet werden`,
                'content': err,
                'fatal': true
            });
            return;
        } else {
            const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.JPG'));
            res.send(images.join('\n'));
        };
    });
});


// debug listen port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
