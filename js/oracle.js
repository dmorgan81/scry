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
            $.getJSON('oracle.json', function(sets) {
                $.indexedDB('oracle', {
                    version : 2,
                    schema : {
                        1 : function(transaction) {
                            transaction.createObjectStore('cards', {
                                autoIncrement : false,
                                keyPath : 'queryname'
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
                                card.queryname = card.name.toUpperCase();
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

    function select(setcode, card) {
        if (!setcode) return card.sets[0];
        return $.grep(card.sets, function(set) {
            return set.setcode === setcode;
        })[0];
    };

    function prune(card) {
        delete card.multiverseids;
        delete card.queryname;
        return card;
    };

    function other(card) {
        return $.Deferred(function(dfd) {
            if (!card.names) {
                dfd.resolve(card);
            } else {
                var other = $.grep(card.names, function(name) {
                    return name !== card.name;
                })[0];
                $.indexedDB('oracle').objectStore('cards', false).get(other.toUpperCase()).done(function(other) {
                    $.extend(true, other, select(card.setcode, other));
                    card.other = prune(other);
                    dfd.resolve(card);
                });
            }
        }).promise();
    }

    _.runtime.onMessage.addListener(function(msg, sender, respond) {
        if (msg.type !== 'oracle') return false;
        var store = $.indexedDB('oracle').objectStore('cards', false), query = msg.name.toUpperCase();
        if (SPLIT_REGEX.test(msg.name)) {
            query = SPLIT_REGEX.exec(msg.name)[1].toUpperCase();
        } else if (msg.multiverseid) {
            store = store.index('multiverseids');
            query = msg.multiverseid;
        }
        store.get(query).done(function(card) {
            if (!card) {
                respond.apply(null, [ ]);
                return;
            }
            $.extend(true, card, select(msg.setcode, card));
            $.when(other(card)).done(function(card) {
                respond.apply(null, [ prune(card) ]);
            });
        });
        return true;
    });

})(jQuery, chrome);
