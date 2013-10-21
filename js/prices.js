(function($, _, undefined) {

    const PRICES_URL = 'http://partner.tcgplayer.com/x/phl.asmx/p?pk=MAGCINFO&p={0}&s={1}',
          VENDOR_URL = 'http://partner.tcgplayer.com/x/pv.asmx/p?pk=MAGCINFO&v=8&p={0}&s={1}',
          SPLIT_FORMAT = "{0} // {1}";

    function fix(s) {
        return s.replace(/&(lt|gt);/g, function(m, n) {
            return n === 'lt' ? '<' : '>';
        });
    }

    function extract(s) {
        if (typeof s === 'string') s = /<link>(.*)<\/link>/.exec(s)[1];
        else s = s.lastChild.nodeValue;
        return $.trim(s.replace(/amp;/g, ''));
    }

    function prices(card, set) {
        return $.ajax({
            url : PRICES_URL.format(card, set),
            dataType : 'text'
        });
    }

    function vendors(card, set) {
        return $.ajax({
            url : VENDOR_URL.format(card, set),
            dataType : 'text'
        });
    }

    function price(data, selector) {
        return parseFloat($(selector, data).text()).toFixed(2);
    }

    _.runtime.onInstalled.addListener(function(details) {
        if (!(details.reason === 'install' || details.reason === 'update')) return;
        $.getJSON('prices.json', function(sets) {
            $.indexedDB('prices', {
                version : 0,
                schema : {
                    1 : function(transaction) {
                        transaction.createObjectStore('sets', { autoIncrement : false });
                    }
                },
                upgrade : function(transaction) {
                    var store = transaction.objectStore('sets');
                    $.each(sets, function(code, name) {
                        store.put(name, code);
                    });
                }
            });
        });
    });

    _.runtime.onMessage.addListener(function(msg, sender, respond) {
        if (msg.type !== 'prices') return false;
        var card = msg.card, name = card.name;
        if (card.layout === 'split') name = String.prototype.format.apply(SPLIT_FORMAT, card.names);
        $.indexedDB('prices').objectStore('sets', false).get(card.setcode).always(function(set) {
            $.when(prices(name, set), vendors(name, set)).done(function(presponse, vresponse) {
                var pdata = fix(presponse[0]), vdata = fix(vresponse[0]),
                    prices = {
                        link : extract(pdata),
                        range : {
                            low : price(pdata, 'lowprice'),
                            mid : price(pdata, 'avgprice'),
                            high : price(pdata, 'hiprice')
                        },
                        vendors : []
                    };
                $('supplier', vdata).each(function(i, vendor) {
                    prices.vendors.push({
                        name : $('name', vendor).text(),
                        condition : $('condition', vendor).text(),
                        quantity : parseInt($('qty', vendor).text()),
                        price : price(vendor, 'price'),
                        link : extract(vendor)
                    });
                });
                respond.apply(null, [ prices ]);
            }).fail(function() {
                response.apply(null);
            });
        });
        return true;
    });

})(jQuery, chrome);
