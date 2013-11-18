mutate = (mutations) ->
    $(mutation.addedNodes).remove('#JT') for mutation in mutations when mutation.type == 'childList'
new MutationObserver(mutate).observe($('body')[0], { childList : true })

$('#left-area').scry {
    selector : 'a.jTip, span.cardname>a'
}
