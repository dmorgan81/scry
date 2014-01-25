autoCardRegex = /AutoCard(?:Gatherer)?\('(.*?)'(?:,\s?'.*')?\)/

$('a.autocardhref').scry {
    query : ->
        match = autoCardRegex.exec $(this).attr('onclick')
        return unescape match[1]
}
