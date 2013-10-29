$('#mainContent').scry({
    query : -> return $(this).attr('name')
    selector : 'a.productLink'
}).find('span.jTip').contents().filter(-> return this.nodeType == Node.TEXT_NODE).unwrap()

$('span.cardname>a').scry()
