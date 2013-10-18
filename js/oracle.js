(function($, _, undefined) {

    var SPLIT_REGEX = /(.*?)\s?\/\/?\s?(.*)/;

    _.runtime.onInstalled.addListener(function(details) {
        if (!(details.reason === 'install' || details.reason === 'update')) return;
        _.notifications.create('', {
            type : 'basic',
            title : 'Updating Card Database',
            message : 'Please wait...',
            iconUrl : 'img/icon-128.png'
        }, function (nid) {
            $.getJSON('sets.json', function(sets) {
                $.indexedDB('oracle', {
                    version : 0,
                    schema : {
                        1 : function(transaction) {
                            transaction.createObjectStore('cards', {
                                autoIncrement : false,
                                keyPath : 'name'
                            }).createIndex('multiverseids', {
                                multiEntry : true
                            });
                        }
                    },
                    upgrade : function(transaction) {
                        var cards = {}, store;
                        $.each(sets, function(i, set) {
                            $.each(set.cards, function (j, card) {
                                var existing = cards[card.name] || {};
                                card.sets = existing.sets || [];
                                card.sets.unshift({
                                    artist : card.artist,
                                    border : card.border || set.border,
                                    flavor : card.flavor,
                                    multiverseid : card.multiverseid,
                                    number : card.number,
                                    rarity : card.rarity,
                                    setcode : set.code,
                                    setname : set.name
                                });
                                card.multiverseids = existing.multiverseids || [];
                                card.multiverseids.unshift(card.multiverseid);
                                // delete properties we either aren't interested in
                                // or shouldn't be on the card object itself
                                delete card.artist;
                                delete card.border;
                                delete card.flavor;
                                delete card.foreignNames;
                                delete card.imageName;
                                delete card.multiverseid;
                                delete card.number;
                                delete card.printings;
                                delete card.rarity;
                                delete card.variations;
                                delete card.watermark;
                                cards[card.name] = card;
                            });
                        });
                        store = transaction.objectStore('cards');
                        $.each(cards, function(i, card) {
                            store.put(card);
                        });
                    }
                }).done(function() {
                    _.notifications.clear(nid, $.noop);
                });
            });
        });
    });

    _.runtime.onMessage.addListener(function(msg, sender, respond) {
        function select(card) {
            var set = card.sets[0];
            if (msg.setcode) {
                $.each(card.sets, function(i, s) {
                    if (s.setcode === msg.setcode) {
                        set = s;
                        return false;
                    }
                });
            }
            return set;
        };
        function prune(card) {
            delete card.multiverseids;
            return card;
        };

        if (msg.type !== 'oracle') return false;
        var store = $.indexedDB('oracle').objectStore('cards', false), query = msg.name;
        if (SPLIT_REGEX.test(msg.name)) {
            query = SPLIT_REGEX.exec(msg.name)[1];
        } else if (msg.multiverseid) {
            store = store.index('multiverseids');
            query = msg.multiverseid;
        }
        store.get(query).done(function(card) {
            if (!card) respond.apply(null, [ ]);
            else {
                $.extend(true, card, select(card));
                respond.apply(null, [ prune(card) ]);
            }
        });
        return true;
    });

})(jQuery, chrome);
