(function($, undefined) {

    const AUTOCARD_REGEX = /AutoCard(?:Gatherer)?\('(.*?)'(?:,\s?'.*')?\)/;

    $('#posts').scry({
        query : function() {
            var match = AUTOCARD_REGEX.exec($(this).attr('onclick'));
            return unescape(match[1]);
        },
        selector : 'a.autocardhref'
    });
})(jQuery);
