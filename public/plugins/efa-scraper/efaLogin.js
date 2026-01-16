async function login(account, password) {
  try {
    // 1. Login-Seite laden, fseq extrahieren
    let resp = await fetch(`${$_apiLoginURI}&urlpath=/forms/login.php`, {
      method: "GET",
      credentials: "include" // wichtig für Cookies
    });
    let html = await resp.text();

    // fseq aus action-Attribut holen
    let match = html.match(/action="\?fseq=([A-Za-z0-9]+)"/);
    if (!match) throw new Error("fseq nicht gefunden!");
    let fseq = match[1];
    console.log("gefundenes fseq:", fseq);

    // 2. Login-Request mit POST
    let loginResp = await fetch(`${$_apiLoginURI}&urlpath=/forms/login.php&fseq=${fseq}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        Account: account,
        Passwort: password,
        submit: "Anmelden"
      })
    });

    let loginText = await loginResp.text();
    console.log("Login Antwort:", loginResp.status, loginText);

    // // 3. Geschützte Seite abrufen
    // let protectedResp = await fetch("https://efa.rcbaden.ch/pages/efaWeb.php", {
    //   method: "GET",
    //   credentials: "include"
    // });
    // let protectedHtml = await protectedResp.text();
    // console.log("Seite geladen:", protectedResp.status);
    // console.log(protectedHtml);

  } catch (err) {
    console.error("Fehler:", err);
  }
}

// Beispiel-Aufruf

