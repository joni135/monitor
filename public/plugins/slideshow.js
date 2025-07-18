// Alle Slides aus Datei auslesen (per API-Request) und in HTML ergänzen
function loadSlides() {  
    var slideshowContainer = document.getElementById('slideshow');
    slideshowContainer.innerHTML = '';

    // HTML-API-Abfrage auf eigene Node.js-App machen, um alle Slides abzurufen
    var sliderequest = new XMLHttpRequest();
    sliderequest.open('GET', `/getslides?slidefolder=${datapath}`, true);

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
                    if ((starttimeDate < currentDate | slideData.starttime === '') && (endtimeDate > currentDate | slideData.endtime === '')) {
        
                        // Erstelle slideContainer (div)
                        var slideContainer = document.createElement('div');
                        slideContainer.id = 'slide-' + (i);
                        slideContainer.className = `slideContainer fade ${slideData.type}`;
                        if (slideData.displayduration) {
                            slideContainer.dataset.userslideduration = slideData.displayduration;
                        };
        
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
                            } else if (slideData.type === 'video') { // Erstelle Videoelement
                                var video = document.createElement('video');
                                video.id = slideData.id;
                                video.muted = true;  // wichtig für Autoplay
                                video.setAttribute('muted', '');  // fallback für alte Browser
                                var videosrc = document.createElement('source');
                                videosrc.id = 'src-' + slideData.id;
                                videosrc.src = slideData.path;
                                videosrc.type = 'video/mp4';
                                videosrc.content = 'Dein Browser unterstützt dieses Video nicht.';
                                video.appendChild(videosrc);
                                video.className = 'slideVideo';
                                content.appendChild(video);
                                var bgvideo = document.createElement('video');
                                bgvideo.id = 'bg-' + slideData.id;
                                bgvideo.muted = true;  // wichtig für Autoplay
                                bgvideo.setAttribute('muted', '');  // fallback für alte Browser
                                var bgvideosrc = document.createElement('source');
                                bgvideosrc.id = 'bg-src-' + slideData.id;
                                bgvideosrc.src = slideData.path;
                                bgvideosrc.type = 'video/mp4';
                                bgvideosrc.content = 'Dein Browser unterstützt dieses Video nicht.';
                                bgvideo.appendChild(bgvideosrc);
                                bgvideo.className = 'slideBackground slideBackgroundVideo';
                                content.appendChild(bgvideo);
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
                        console.log(`Slide "${slideData.id}" ist ausserhalb der angegebenen Zeitspanne und wird nicht angezeigt`);
                    };

                };
            };
            showSlides();
        };
    };

    sliderequest.send();
};


var slideIndex = 0;
function showSlides() {
    try {
        
        // Alle Slides deaktivieren
        var slides = document.getElementsByClassName('slideContainer');
        for (var i = 0; i < slides.length; i++) {
            slides[i].classList.remove('active');
            slides[i].classList.remove('next');
            slides[i].style.display = 'none';

            // Falls Video, pausieren
            var video = slides[i].querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            };
        };

        // Aktuelle Slide aktivieren
        var currentSlide = slides[slideIndex];
        currentSlide.classList.add('active');
        currentSlide.style.display = 'block';
        var slidedisplayduration;

        // Prüfen ob Slide ein Video ist
        var video = currentSlide.querySelector('video');
        if (video) {
            if (video.readyState >= 1) {
                let videoduration = video.duration;
                console.log('Videolänge (videoduration): ' + videoduration);
                video.play();
                if (currentSlide.dataset.userslideduration) {
                    slidedisplayduration = currentSlide.dataset.userslideduration;
                } else {
                    slidedisplayduration = videoduration;
                };
                if (reqparam.debug == 'true') {
                    console.log(`Slide "slide-${slideIndex}" wird für ${slidedisplayduration} Sekunden angezeigt`)
                }
                setTimeout(showSlides, slidedisplayduration * 1000);
            } else {
                // Falls nicht, warten bis Metadaten geladen sind
                video.onloadedmetadata = function () {
                    let videoduration = video.duration;
                    console.log('Videolänge (videoduration): ' + videoduration);
                    video.play();
                    if (currentSlide.dataset.userslideduration) {
                        slidedisplayduration = currentSlide.dataset.userslideduration;
                    } else {
                        slidedisplayduration = videoduration;
                    };
                    if (reqparam.debug == 'true') {
                        console.log(`Slide "slide-${slideIndex}" wird für ${slidedisplayduration} Sekunden angezeigt`)
                    }
                    setTimeout(showSlides, slidedisplayduration * 1000);
                };
            };
        } else {
            // Dauer aus Attribut oder Standard nehmen
            if (currentSlide.dataset.userslideduration) {
                slidedisplayduration = currentSlide.dataset.userslideduration;
            } else {
                slidedisplayduration = slideduration;
            };

            if (reqparam.debug == 'true') {
                console.log(`Slide "slide-${slideIndex}" wird für ${slidedisplayduration} Sekunden angezeigt`)
            }
            setTimeout(showSlides, slidedisplayduration * 1000);
        };

        // Nächsten Slide vorbereiten
        slideIndex++;
        if (slideIndex >= slides.length) {
            slideIndex = 0;
        };
        slides[slideIndex].classList.add('next');

    } catch (err) {
        console.error(`Fehler beim Anzeigen der Slide "slide-${slideIndex}": ${err}`);
        slideIndex = 0;
        showSlides();
    };
};