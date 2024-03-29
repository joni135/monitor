// Lade Bilder dynamisch
var slideshowContainer = document.getElementById('slideshow');

function loadImages() {
  var slideshowContainer = document.getElementById('slideshow');
    var imagerequest = new XMLHttpRequest();
    imagerequest.open('GET', `/listimages?specificfolder=${imagespath}`, true);

    imagerequest.onload = function () {
      if (imagerequest.status == 200) {
        var images = imagerequest.responseText.split('\n');
        for (var i = 0; i < images.length; i++) {
          if (images[i]) {
            var slide = document.createElement('div');
            slide.id = 'slide-' + (i + 1);
            slide.className = 'slideElement fade';
            var image = document.createElement('img');
            image.src = imagespath + images[i];
            image.alt = 'Slide ' + (i + 1);
            slide.appendChild(image);
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
    setTimeout(showSlides, slideduration);
  };