// Alle Bilder aus Ordner auslesen (per API-Request) und in HTML ergänzen
function loadImages() {  
    var slideshowContainer = document.getElementById('slideshow');

    // HTML-API-Abfrage auf eigene Node.js-App machen, um alle 
    var imagerequest = new XMLHttpRequest();
    imagerequest.open('GET', `/listimages?specificfolder=${imagespath}`, true);

    imagerequest.onload = function () {
      if (imagerequest.status == 200) {
        var images = imagerequest.responseText.split('\n');

        // Einzelne Bilder in HTML einbetten
        for (var i = 0; i < images.length; i++) {
          if (images[i]) {

            // Erstelle slideElement (div)
            var slide = document.createElement('div');
            slide.id = 'slide-' + (i + 1);
            slide.className = 'slideElement fade';

            // Erstelle Bild von slideElement
            var image = document.createElement('img');
            image.src = imagespath + images[i];
            image.alt = 'Slide ' + (i + 1);
            image.className = 'slideImage';
            slide.appendChild(image);

            // Erstelle Titel von slideElement wenn vorhanden
            if (slidetitles[images[i]]) {
              var title = document.createElement('div');
              title.innerHTML = slidetitles[images[i]];
              title.className = 'slideTitle';
              slide.appendChild(title);
            }

            slideshowContainer.appendChild(slide);
          
          };
        };
        showSlides();
      }
    };

    imagerequest.send();
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