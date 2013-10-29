$('#content').scry({
    query : ->
        return $(this).attr('keyvalue').replace /_|\[/g, (m) -> return if m == '_' then ' ' else "'"
    selector : 'a.nodec'
}).find('a.nodec').removeAttr 'onmouseover'

$('#content').scry {
    query : -> return $(this).find('img.magic-card').attr('alt')
    selector : 'div.revealer'
}
