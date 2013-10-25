(function($, undefined) {

    $('#content').scry({
        query : function() {
            return $(this).attr('keyvalue').replace(/_|\[/g, function(m) {
                return m === '_' ? ' ' : '\'';
            });
        },
        selector : 'a.nodec'
    }).find('a.nodec').removeAttr('onmouseover');

    $('#content').scry({
        query : function() {
            return $(this).find('img.magic-card').attr('alt');
        },
        selector : 'div.revealer'
    });

})(jQuery);
