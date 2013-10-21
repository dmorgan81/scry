(function($, undefined) {

    function mutate(mutations) {
        $.each(mutations, function(i, mutation) {
            if (mutation.type !== 'childList') return;
            if (mutation.addedNodes.length === 0) return;
            $(mutation.addedNodes).remove('.qtip');
        });
    }

    $('a.card_popup').scry();

    new MutationObserver(mutate).observe($('body')[0], { childList : true });
})(jQuery);
