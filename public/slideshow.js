// Alle Slides aus Datei auslesen (per API-Request) und in HTML ergänzen
function loadSlides() {  
    var slideshowContainer = document.getElementById('slideshow');
    slideshowContainer.innerHTML = '';

    // HTML-API-Abfrage auf eigene Node.js-App machen, um alle Slides abzurufen
    var sliderequest = new XMLHttpRequest();
    sliderequest.open('GET', `/getslides?slidefolder=${slidepath}`, true);

    sliderequest.onload = function () {
      if (sliderequest.status == 200) {
        slidesData = JSON.parse(sliderequest.responseText);
        if (reqparam.debug == 'true') {
          console.log('Slidedaten: ', slidesData);
        };

        // Einzelne Slides in HTML einbetten
        for (var i = 0; i < slidesData.length; i++) {
          if (slidesData[i]) {
            var slideData = slidesData[i];

            var starttimeDate = new Date(slideData.starttime);
            var endtimeDate = new Date(slideData.endtime);
            var currentDate = new Date();
            if ((starttimeDate < currentDate | slideData.starttime === "") && (endtimeDate > currentDate | slideData.endtime === "")) {

              // Erstelle slideElement (div)
              var slide = document.createElement('div');
              slide.id = 'slide-' + (i + 1);
              slide.className = `slideElement fade ${slideData.type}`;

              if (slideData.type === 'img') { // Erstelle Bildelement
                var image = document.createElement('img');
                image.src = slideData.path;
                image.alt = slideData.id;
                image.id = slideData.id;
                image.className = 'slideImage slideContent';
                slide.appendChild(image);
              } else if (slideData.type === 'iframe') { // Erstelle Iframeelement
                var iframe = document.createElement('iframe');
                iframe.src = slideData.path;
                iframe.style = 'width: 99vw;'
                iframe.id = slideData.id;
                iframe.className = 'slideIframe slideContent';
                slide.appendChild(iframe);
              };

              // Erstelle Titel von slideElement wenn vorhanden
              if (slideData.title && slideData.title !== '') {
                var title = document.createElement('div');
                title.innerHTML = slideData.title;
                title.className = 'slideTitle';
                slide.appendChild(title);
              };

              slideshowContainer.appendChild(slide);
            } else {
              console.log(`Slide "${slideData.id}" ist ausserhalb der angegebenen Zeitspanne und wird nicht angezeigt`)
            };

          };
        };
        showSlides();
      }
    };

    sliderequest.send();
  };

var slideIndex = 0;

function showSlides() {
    var slides = document.getElementsByClassName("slideElement");
    for (var i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
        slides[i].style.display = "none";  
    };
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    };
    slides[slideIndex - 1].classList.add('active');
    slides[slideIndex-1].style.display = "block"; 
    setTimeout(showSlides, slideduration*1000);
  };