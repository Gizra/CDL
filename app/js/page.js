'use strict';
(function( $, blueimp ) {
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

})(jQuery, blueimp);
