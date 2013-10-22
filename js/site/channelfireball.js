(function($, undefined) {

    $('#mainContent').scry({
        query : function() { return $(this).attr('name'); },
        selector : 'a.productLink'
    }).find('span.jTip').contents().filter(function() {
        // Remove span.jTip but keep text nodes
        return this.nodeType === Node.TEXT_NODE;
    }).unwrap();

    $('span.cardname>a').scry();

})(jQuery);
