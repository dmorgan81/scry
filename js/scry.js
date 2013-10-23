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
                console.log(card);
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
        var timeout = window.setTimeout($.proxy(function() {
            $(this).data('scry').fadeOut(300).queue(function() {
                $(this).find('.scry-info').hide();
                $(this).dequeue();
            });
        }, this), 500);
        $(this).data('scry-timeout', timeout);
    }

    function clearTimeout() {
        window.clearTimeout($(this).data('scry-timeout'));
    }

    function flip() {
        var flipped = this.data('scry-flipped');
        this.transition({ rotate : (flipped ? '-' : '+') + '=180' })
            .data('scry-flipped', !flipped);
    }

    function transform(card) {
        var transformed = this.data('scry-transformed');
        this.transition({
            duration : 300,
            perspective : 150,
            rotateY : (transformed ? '-' : '+') + '=180',
            complete : function() {
                this.css({
                    rotateY : 0,
                    'background-image' : 'url(' + IMAGE_URL +
                        (transformed ? card.multiverseid : card.other.multiverseid) + ')'
                });
            }
        }).data('scry-transformed', !transformed);
    }

    function content(card) {
        this.css({
            'background-image' : 'url(' + IMAGE_URL + card.multiverseid +
                (card.layout === 'split' ? '&options=rotate90' : '') + ')',
            'border-color' : card.border
        }).toggleClass('scry-alpha', card.setcode === 'LEA');
        this.find('.scry-info').slideUp();
        $.when(prices(card)).done($.proxy(pricesConstruct, this.find('.scry-prices')));
    }

    function set(card) {
        if (card.sets.length === 0) return;
        var index = this.data('scry-set-index') || 1;
        if (index >= card.sets.length) index = 0;
        $.extend(card, card.sets[index]);
        content.apply(this, [ card ]);
        this.data('scry-set-index', ++index);
    }

    function pricesConstruct(prices) {
        var self = this;
        self.find('.scry-vendor').filter(':not(.scry-template)').empty();
        self.find('.scry-prices-link').on('click.scry', function() {
            window.open(prices.link);
        });
        $.each(prices.range, function(prop, value) {
            self.find('.scry-prices-range .scry-prices-' + prop).text(value);
        });
        $.each(prices.vendors, function(i, vendor) {
            var v = self.find('.scry-vendor.scry-template')
                .clone().removeClass('scry-template');
            $.each(vendor, function(prop, value) {
                v.find('.scry-vendor-' + prop).text(value);
            });
            v.find('.scry-vendor-name').on('click.scry', function() {
                window.open(vendor.link);
            });
            self.find('.scry-vendors').append(v);
        });
    }

    function construct(card) {
        var scry = TEMPLATE.find('.scry').clone().data('card', card);
        content.apply(scry, [ card ]);

        if (card.layout === 'flip')
            scry.find('.scry-flip').on('click.scry', $.proxy(flip, scry)).show();
        else if (card.layout === 'double-faced')
            scry.find('.scry-transform').on('click.scry', $.proxy(transform, scry, card)).show();

        scry.find('.scry-info-toggle').on('click.scry', function() {
            scry.find('.scry-info').slideToggle();
        });
        scry.find('.scry-tabs>li').on('click.scry', function() {
            $(this).addClass('scry-active').siblings().removeClass('scry-active');
            scry.find('.scry-panels .scry-' + $(this).text().toLowerCase()).show()
                .siblings().hide();
        });
        return scry.toggleClass('scry-split', card.layout === 'split').appendTo('body');
    }

    function attach(scry) {
        $(this).data('scry', scry);
        $(this).on('mouseenter.scry', show).on('mouseleave.scry', hide);
        scry.on('mouseenter.scry', $.proxy(clearTimeout, this))
            .on('mouseleave.scry', $.proxy(hide, this));
        return scry;
    }

    function init(e) {
        var query = e.data.query.apply(this);
        if (!query) return;
        if (typeof query === 'string') query = { name : query };
        else if (typeof query === 'number') query = { multiverseid : query };
        $.when(oracle(query))
            .then(construct)
            .then($.proxy(attach, this))
            .done($.proxy(show, this, e));
    }

    function receive(msg) {
        var temp = $('<div></div>'),
            e = $('body').data('scry-event');
        $.when(oracle(msg))
            .then(construct)
            .then($.proxy(attach, temp))
            .done($.proxy(show, temp, e));
    }

    $.fn.scry = function(options) {
        var settings = $.extend({
            query : function() { return $(this).text() },
            selector : null
        }, options);

        _.runtime.sendMessage({ type : 'init' });
        _.runtime.onMessage.addListener(receive);
        $('body').on('mouseup', function(e) {
            $(this).data('scry-event', e);
        });
        return this.each(function() {
            $(this).on('mouseover.scry', settings.selector, settings,
                function(e) {
                    if ($(this).data('scry')) return;
                    init.apply(this, [ e ]);
                });
        });
    }


})(jQuery, chrome);
