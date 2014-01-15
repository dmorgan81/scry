autoCardRegex = /AutoCard(?:Gatherer)?\('(.*?)'(?:,\s?'.*')?\)/

$('body').scry {
    query : ->
        match = autoCardRegex.exec $(this).attr('onclick')
        return unescape match[1]
    selector : 'a.autocardhref'
}
