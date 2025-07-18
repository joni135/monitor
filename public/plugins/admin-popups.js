// Datum für die Formularfelder anpassen
function formatedDatetime() {
    const datetimeNOW = new Date();
    const adjustedDatetime = new Date(datetimeNOW.getTime() - (datetimeNOW.getTimezoneOffset() * 60000)); // for Timezone
    return adjustedDatetime.toISOString().substring(0, 16); // For minute precision
}

// Popup-Fenster öffnen
function openPopup(PopupId) {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById(PopupId).style.display = 'block';

    const formated = formatedDatetime();

    const setField = (id, setValue = false) => {
        const el = document.getElementById(id);
        if (el) {
            el.min = formated;
            if (setValue) el.value = formated;
        }
    };

    setField("InfoStarttimeInput", true);
    setField("InfoEndtimeInput");
    setField("EditInfoStarttimeInput");
    setField("EditInfoEndtimeInput");
    setField("ImageStarttimeInput", true);
    setField("ImageEndtimeInput");
    setField("VideoStarttimeInput", true);
    setField("VideoEndtimeInput");
    setField("IframeStarttimeInput", true);
    setField("IframeEndtimeInput");
    setField("SlideStarttimeInput");
    setField("SlideEndtimeInput");
}

// Popup-Fenster schliessen
function closePopup(PopupId, confirmationMessage) {
    const form = document.getElementById(PopupId + 'Form');
    if (form) {
        form.reset();
        document.getElementById(PopupId).style.display = 'none';
        console.log(`Formular mit der ID "${PopupId}Form" zurückgesetzt!`);
    }

    if (confirmationMessage) {
        document.getElementById('confirmationMessageTitel').innerHTML = confirmationMessage.title;
        document.getElementById('confirmationMessageText').innerHTML = confirmationMessage.content;
        document.getElementById('confirmationMessage').style.color = confirmationMessage.fatal === true ? 'red' : 'black';
        document.getElementById('confirmationMessage').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    } else {
        closeConfirmationMessage();
    }
}

// ConfirmationMessage-Popup-Fenster schliessen
function closeConfirmationMessage() {
    document.getElementById('confirmationMessage').style.color = 'black';
    document.getElementById('confirmationMessageTitel').innerHTML = '';
    document.getElementById('confirmationMessageText').innerHTML = '';
    document.getElementById('confirmationMessage').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}