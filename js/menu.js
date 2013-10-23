(function($, _, undefined) {

    function contextMenu(info, tab) {
        _.tabs.sendMessage(tab.id, { name : info.selectionText });
    }

    $(function() {
        var manifest = _.runtime.getManifest(), patterns = [];
        $.each(manifest.content_scripts, function(i, script) {
            $.merge(patterns, script.matches);
        });
        _.contextMenus.create({
            id : 'scry',
            title : 'Scry \'%s\'',
            contexts : [ 'selection' ],
            documentUrlPatterns : patterns
        });
        _.contextMenus.onClicked.addListener(contextMenu);
    });

})(jQuery, chrome);
