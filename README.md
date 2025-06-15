# monitor
Node.js-App to show the content on a monitor


## Funktionsweise



## Installation

### Konfigurationsdatei

### Monitor


## Plugins
Folgende Plugins sind verfügbar:
* [Infokarusell (infocarousel)](#infocarousel)
* [Slideshow (slideshow)](#slideshow)
* [Wetter- und Hydrodaten (weatherandhydrodata)](#weatherandhydrodata)
* [Kalender (callendar)](#callendar)

Plugins müssen in den Konfigurationen des Monitors (im index.conf) unter "plugins": [] als Array angegeben werden. Dementsprechend werden dann die zusätzlichen Javascripts geladen.

### infocarousel
Mit diesem Plugin lassen sich Info-Texte als Fussnote als Karusell darstellen. Die Info-Elemente können im Admin-Portal verwaltet werden und werden in den Projektkonfigurationen gespeichert.

Plugin-Name: infocarousel\
Backend-Konfigurationen: keine\
Monitor-Konfigurationen: keine\
Javascript-Funktion: loadInfos();\
Javascript-Parameter: keine

### slideshow
Mit diesem Plugin lassen sich Folien (Slides) als Diashow anzeigen. Die Slides können im Admin-Portal verwaltet werden und werden in den Projektkonfigurationen gespeichert. Als Slide-Typen werden aktuell nur Bilder (img) und Iframes unterstützt, Iframes werden zum Teil aber noch nicht richtig angezeigt.

Plugin-Name: slideshow\
Backend-Konfigurationen: keine\
Monitor-Konfigurationen:
- "slideduration": (Ganzzahl) legt die Anzeigedauer der einzelnen Folien in Sekunden fest. Die einzelnen Folien können diesen Wert aber auch individuell überschreiben.

Javascript-Funktion: loadSlides();\
Javascript-Parameter: keine

### weatherandhydrodata
Wetterdaten und Hydrodaten werden in vordefinierte HTML-Elemente mit bestimmten ID's gesetzt. Die Daten werden mit einem separaten Backend-Prozess ([Weathercalculator auf Github](https://github.com/joni135/weathercalculator)) aufbereitet und als JSON gespeichert. Dieser Prozess muss separat installiert werden.
Verfügbar sind die Wetterdaten der aktuellen Stunde und denen in zwei Stunden (Quelle SRF Meteo) sowie die aktuellen Hydrodaten vom Bundesamt für Umwelt
Die Funktion "displayRuderverbot();" berechnet zudem anhand der Wetter- und Hydrodaten ob ein Ruderverbot besteht oder nicht. Diese Funktion ist jedoch erst auf den Ruderclub Baden abgestimmt.

Plugin-Name: weatherandhydrodata\
Backend-Konfigurationen: in "plugins": {"weatherandhydrodata": {}}
- "processpath": (Ordnerpfad ab app.js) Ablage des separaten Prozesses
- "datapath": (Ordnerpfad ab app.js) Ablage der Daten (JSON-Files)
- "symbolpath": (Ordnerpfad ab app.js) Ablage der SVG's der Wettersymbole von SRF Meteo

Monitor-Konfigurationen: in "weatherandhydrodata": {}
- "json_weather": (JSON-Datei) JSON-File der Wetterdaten
- "json_hydro": (JSON-Datei) JSON-File der Hydrodaten
- "weathersymboltype": ("svg_light", "svg_dark" oder "svg_color") Farbtyp der SVG-Wettersymbole von SRF Meteo

Javascript-Funktion: weatherandhydrodata_init();\
Javascript-Parameter:
- customweathersymboltype = ("svg_light", "svg_dark" oder "svg_color") Farbtyp der SVG-Wettersymbole von SRF Meteo (überschreibt Monitor-Konfigurationsparameter "weathersymboltype")

### callendar
Über einen Backend-Prozess ([calendarcalculator auf Github](https://github.com/joni135/calendarcalculator))werden Kalenderdaten in ein JSON (und zusätzlich in ein CSV) gespeichert und auf dem Monitor angezeigt. Anhand von Parameter werden im Frontent eine Maximale Anzahl Events angezeigt.\
Alles weitere zu diesem Prozess inklusive dessen Konfigruationen ist separat geregelt.

Plugin-Name: calendar\
Backend-Konfigurationen: in "plugins": {"calendar": {}}
- "processpath": (Ordnerpfad ab app.js) Ablage des separaten Prozesses
- "datapath": (Ordnerpfad ab app.js) Ablage der Daten (JSON- und CSV-Files)
- "symbolpath": (Ordnerpfad ab app.js) Ablage der Kalendersymbole (wird nicht verwendet)

Monitor-Konfigurationen: in "calendar": {}
- "json_events": (JSON-Datei) JSON-File der Kalenderdaten
- "max_entries": (Ganzzahl) Maximale Anzahl Kalendereinträge, die angezeigt werden (um die Anzeige nicht zu überhäufen)
- "maxhour_future": (Ganzzahl) Anzahl Stunden, wo der Starttermin des Events in der Zukunft sein darf. Falls weniger Events als "max_entries" in der angegebenen Zeit existieren, werden nur diese angezeigt.

Javascript-Funktion: calendar_init();\
Javascript-Parameter:
- calendar_max_entries = (Ganzzahl) überschreibt Monitor-Konfigurationsparameter "max_entries"
- calendar_maxhour_future = (Ganzzahl) überschreibt Monitor-Konfigurationsparameter "maxhour_future"
