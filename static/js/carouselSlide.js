$(document).ready(function(){
    const $slider = $('.carousel-slide').slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      speed: 1000,
      cssEase: 'ease-in-out',
      arrows: true,
      infinite: true,
      pauseOnHover: true,
    });
  
    function styleSlides(slickObj) {
      const total = slickObj.options.slidesToShow;       // 5
      const start = slickObj.currentSlide;               // index of the first visible slide
      // First, fade _all_ slides
      slickObj.$slides.css({ opacity: 0.2, transform: 'scale(1)' });
  
      // Then “pop” only the middle three of the five
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
  