getMtgJsonVersion = ->
    return $.ajax {
        dataType : 'json',
        url : 'http://mtgjson.com/json/version-full.json',
        cache : false,
    }

chrome.runtime.onMessage.addListener (msg, sender) ->
    chrome.pageAction.show sender.tab.id if msg.type == 'init'

chrome.runtime.onStartup.addListener ->
    now = new Date()
    chrome.storage.local.get { lastUpdate : now.getTime(), version : 1, json : "0.0.0" }, (items) ->
        if (now - items.lastUpdate > 1209600000) # two weeks
            chrome.storage.local.set { lastUpdate : now.getTime() }
            $.when(getMtgJsonVersion()).done (data) ->
                return if data.version == items.json
                chrome.storage.local.set { version : version+1, json : data.version }
