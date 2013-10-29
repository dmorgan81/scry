mutate = (mutations) ->
    $(mutation.addedNodes).remove('.qtip') for mutation in mutations when mutation.type == 'childList'
new MutationObserver(mutate).observe($('body')[0], { childList : true })

$('#content').scry {
    selector : 'a.card_popup, .deck_card_wrapper a[rel]'
}
