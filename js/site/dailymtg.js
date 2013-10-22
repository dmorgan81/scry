(function($, undefined) {

    $('a.nodec').scry({
        query : function() {
            return $(this).attr('keyvalue').replace(/_|\[/g, function(m) {
                return m === '_' ? ' ' : '\'';
            });
        }
    }).removeAttr('onmouseover');

})(jQuery);
