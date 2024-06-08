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

              // Erstelle slideContainer (div)
              var slideContainer = document.createElement('div');
              slideContainer.id = 'slide-' + (i + 1);
              slideContainer.className = `slideContainer fade ${slideData.type}`;

              // Erstelle Inhalt von slideContainer wenn vorhanden
              if (slideData.type && slideData.type !== '') {
                var content = document.createElement('div');
                content.className = 'slideContent';

                if (slideData.type === 'img') { // Erstelle Bildelement
                  var image = document.createElement('img');
                  image.src = slideData.path;
                  image.alt = slideData.id;
                  image.id = slideData.id;
                  image.className = 'slideImage';
                  content.appendChild(image);
                  var bgimage = document.createElement('div');
                  bgimage.style = `background-image: url(${slideData.path});`
                  bgimage.id = 'bg-' + slideData.id;
                  bgimage.className = 'slideBackground';
                  content.appendChild(bgimage);
                } else if (slideData.type === 'iframe') { // Erstelle Iframeelement
                  var iframe = document.createElement('iframe');
                  iframe.src = slideData.path;
                  iframe.style = 'width: 99vw;'
                  iframe.id = slideData.id;
                  iframe.className = 'slideIframe';
                  content.appendChild(iframe);
                };
                
                slideContainer.appendChild(content);
              };

              // Erstelle Titel von slideContainer wenn vorhanden
              if (slideData.title && slideData.title !== '') {
                var title = document.createElement('div');
                title.innerHTML = slideData.title;
                title.className = 'slideTitle';
                slideContainer.appendChild(title);
              };

              slideshowContainer.appendChild(slideContainer);
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
    var slides = document.getElementsByClassName("slideContainer");
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