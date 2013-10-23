(function($, _, undefined) {

    _.runtime.onMessage.addListener(function(msg, sender) {
        if (msg.type !== 'init') return false;
        _.pageAction.show(sender.tab.id);
    });

})(jQuery, chrome);
