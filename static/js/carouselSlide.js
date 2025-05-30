$(document).ready(function(){
    $('.carousel-slide').slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 1,
      speed: 10000,
      cssEase: 'ease-in-out',
      arrows: true,
      infinite: true,
      pauseOnHover: true,
    });
  
    function styleSlides(slickObj) {
      const total = slickObj.options.slidesToShow;       
      const start = slickObj.currentSlide;               // index of the first visible slide
      slickObj.$slides.css({ opacity: 0.2, transform: 'scale(1)' });
  
      
      [1,2,3].forEach(offset => {
        const idx = start + offset;
        $(slickObj.$slides.get(idx)).css({
          opacity: 1,
          transform: 'scale(1.05)'
        });
      });
    }
  
    // Run at init, and after every slide transition
    $slider.on('init afterChange', (e, slick) => styleSlides(slick));
    // Force an initial style pass
    $slider.slick('refresh');
  });
  