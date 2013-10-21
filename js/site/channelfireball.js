(function($, undefined) {

    $('a.productLink').scry({
        query : function() { return $(this).attr('name'); }
    }).find('span.jTip').contents().filter(function() {
        // Remove span.jTip but keep text nodes
        return this.nodeType === Node.TEXT_NODE;
    }).unwrap();

    $('span.cardname>a').scry();

})(jQuery);
