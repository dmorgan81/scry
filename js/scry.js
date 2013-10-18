(function($, _, undefined) {

    const TEMPLATE = $('<div></div>').load(_.extension.getURL('template.html') + ' .scry'),
          IMAGE_URL = 'http://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=';

    function prices(card) {
        return $.Deferred(function(dfd) {
            _.runtime.sendMessage({
                type : 'prices',
                card : card
            }, function(prices) {
                if (prices) dfd.resolve(prices);
                else dfd.reject();
            });
        }).promise();
    }

    function oracle(query) {
        return $.Deferred(function(dfd) {
            query.type = 'oracle';
            _.runtime.sendMessage(query, function(card) {
                if (card) dfd.resolve(card);
                else dfd.reject();
            });
        }).promise();
    }

    function show(e) {
        var scry = $(this).data('scry'),
            w = scry.width(), h = scry.height(),
            b = $(window).width(), s = $(window).scrollTop(),
            x = e.pageX, y = e.pageY,
            cl, ct;
        if (b - 15 >= w + x) cl = x + 5;
        else cl = b - w - 15;
        if (s + 20 >= y - h) ct = y + 10;
        else ct = y - h - 10;
        scry.css({ left : cl, top : ct }).fadeIn(300);
    }

    function hide() {
        $(this).data('scry').fadeOut(300);
    }

    function construct(card) {
        var scry = TEMPLATE.find('.scry').clone().data('card', card);
        scry.css({
            'background-image' : 'url(' + IMAGE_URL + card.multiverseid + ')',
            'border-color' : card.border
        });
        return scry.appendTo('body');
    }

    function attach(scry) {
        $(this).data('scry', scry); // replace scry data
        $(this).on('mouseenter.scry', show).on('mouseleave.scry', hide);
        return scry;
    }

    function init(e) {
        $(this).off('.scry');
        var query = $(this).data('scry').settings.query.apply(this);
        if (!query) return;
        if (typeof query === 'string') query = { name : query };
        else if (typeof query === 'number') query = { multiverseid : query };
        $(this).data('scry').query = query;
        $.when(oracle(query))
            .then(construct)
            .then($.proxy(attach, this))
            .done($.proxy(show, this, e));
    }

    $.fn.scry = function(options) {
        var settings = $.extend({
            query : function() { return $(this).text() }
        }, options);
        return this.each(function() {
            $(this).data('scry', { settings : settings }).on('mouseover.scry', init);
        });
    }

})(jQuery, chrome);
