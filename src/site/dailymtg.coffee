$('.content').scry {
    selector : 'a.autocard-link'
}

observer = new MutationObserver (records) ->
    for record in records
        do (record) =>
            return unless record.addedNodes
            $(record.addedNodes).filter('.qtip').remove()

observer.observe $('body')[0], { childList : true }


