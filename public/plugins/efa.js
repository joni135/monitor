function gesperrteboote_init() {
    console.log(efadata);
    console.log(efadata.gesperrte_boote);
    console.log(efadata.gesperrte_boote.data);
    if (document.getElementById('gesperrte-boote') && efadata.gesperrte_boote.data && efadata.gesperrte_boote.data.length > 0) {
        if (efa_max_entries === undefined || efa_max_entries === null || efa_max_entries < 1) {
            efa_max_entries = 5; // Standardwert, wenn nicht gesetzt
        }
        loadgesperrteboote(efa_max_entries);
    } else {
        console.warn('Fehler: Gesperrte Boote nicht gefunden oder keine Kalendereinträge vorhanden.');
        document.getElementById('gesperrte-boote').style.display = 'none';
    }
}

// Setze EFA-Daten in HTML ein
function loadgesperrteboote(max_entries) {
    var Container = document.getElementById('gesperrte-boote');
    var data = efadata.gesperrte_boote.data

    var entrie_count = 0
    for (var i = 0; entrie_count < max_entries && i < data.length; i++) {
        if (data[i]) {
            var boot = data[i];

            if (boot.einschraenkung === 'Boot nicht benutzbar' || boot.einschraenkung === 'Boot eingeschränkt benutzbar') {

                // Erstelle BootList (li)
                var BootList = document.createElement('li');
                BootList.id = `BootList-${i}`;
                BootList.className = `BootList`;

                // Bootsname
                var title = document.createElement('h6');
                title.id = `BootTitle-${i}`;
                title.className = `BootTitle BootDetails BootList-${i}`;
                title.innerHTML = boot.bootsname;
                BootList.appendChild(title);

                // Beschreibung
                var beschreibung = document.createElement('p');
                beschreibung.id = `BootBeschreibung-${i}`;
                beschreibung.className = `BootBeschreibung BootDetails BootList-${i}`;
                beschreibung.innerHTML = boot.beschreibung;
                BootList.appendChild(beschreibung);

                // Schweere / Einschränkung
                var einschraenkung = document.createElement('p');
                einschraenkung.id = `BootEinschraenkung-${i}`;
                einschraenkung.className = `BootEinschraenkung BootDetails BootList-${i}`;
                einschraenkung.innerHTML = boot.einschraenkung;
                BootList.appendChild(einschraenkung);
                if (boot.einschraenkung === 'Boot nicht benutzbar') {
                    einschraenkung.classList.add('warning');
                }

                Container.appendChild(BootList);
                entrie_count = entrie_count+1

            } else {
                console.log(`Boot "${boot.bootsname}" (Einschränkung: ${einschraenkung}) ist nicht tragisch und wird nicht angezeigt`)
            };
        };
    };

    if (Container.innerHTML === '') {
        console.warn('Die EFA-Funktion hat keine gesperrten Boote zum anzeigen, Element wird deaktiviert.');
        document.getElementById('gesperrte-boote').style.display = 'none';
    };
};