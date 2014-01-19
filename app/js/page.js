'use strict';


(function( $, blueimp ) {
  var gallery;

  // Extent jquery object properties.
  $.fn.cdlFonts = function(fontRatio) {
    var maxFontRatio = fontRatio;
    var $this = $(this);

    /**
     * Calculate the font size that adjust to the parent box.
     *
     * @param fontRatio
     */
    function calculateFontSize(fontRatio) {
      $this.fitText(1, { minFontSize: fontRatio + 'px', maxFontSize: maxFontRatio + 'px' });
      if ($this.height() > $this.parent().height()) {
        calculateFontSize(--fontRatio);
      }
    }

    calculateFontSize(fontRatio);
  };

  // Apply resize to the circle titles.
  $('.inner-text-title').cdlFonts(50);

  // Add listener to button more to load the gallery and open in the image #5
  $('.button-more').each( function() {
    $(this).bind('click', function() {
      var selector = '.data-gallery-' + $(this).data('id');
      var gallery = blueimp.Gallery($(selector));
      // Move and open to the 5th. image of the gallery.
      gallery.slide(4);
    });
  });

  gallery = $('#blueimp-gallery');

  gallery
    .on('open', function(event) {
      var images = gallery.data('gallery').list;

      for (var i = 0; i<gallery.data('gallery').num;i++) {
        console.log(images[i].title);
        if (/(.*)[\..{3}$|\..{4}$]/.test(images[i].title)) {
          images[i].title = images[i].title.match(/(.*)[\..{3}$|\..{4}$]/)[1];
        }
      }

    });


})(window.jQuery, window.blueimp);
