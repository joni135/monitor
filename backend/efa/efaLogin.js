async function login(url, account, password) {
  const cookieJar = {};

  function storeCookies(res) {
    const setCookie = res.headers.raw()["set-cookie"];
    if (setCookie) {
      setCookie.forEach(c => {
        const [cookie] = c.split(";");
        const [name, value] = cookie.split("=");
        cookieJar[name] = value;
      });
    }
  }

  function cookieHeader() {
    return Object.entries(cookieJar).map(([k,v]) => `${k}=${v}`).join("; ");
  }

  // 1. Login-Seite abrufen
  let resp = await fetch("https://efa.rcbaden.ch/forms/login.php?goto=pages/efaWeb.php");
  storeCookies(resp);
  let html = await resp.text();
  let match = html.match(/action="\?fseq=([A-Za-z0-9]+)"/);
  if (!match) throw new Error("fseq nicht gefunden!");
  let fseq = match[1];

  // 2. Login POST
  let loginResp = await fetch(`https://efa.rcbaden.ch/forms/login.php?fseq=${fseq}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader()
    },
    body: new URLSearchParams({ Account: account, Passwort: password, submit: "Anmelden" })
  });
  storeCookies(loginResp);

  // 3. Geschützte Seite laden
  let protectedResp = await fetch("https://efa.rcbaden.ch/pages/efaWeb.php", {
    method: "GET",
    headers: { "Cookie": cookieHeader() }
  });
  let protectedHtml = await protectedResp.text();

  // Ergebnisse zurückgeben
  return { loginStatus: loginResp.status, pageHtml: protectedHtml };
}
