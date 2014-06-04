getMtgJsonVersion = ->
    return $.ajax {
        dataType : 'json',
        url : 'http://mtgjson.com/json/version-full.json',
        cache : false,
    }

createStorage = ->
    $.when(getMtgJsonVersion()).done (data) ->
        chrome.storage.local.clear -> chrome.storage.local.set { version : 1, lastUpdate : new Date().getTime(), json : data.version }

chrome.runtime.onInstalled.addListener (details) ->
    return unless details.reason == 'install' or (details.reason == 'update' and details.previousVersion.indexOf('3.6') == 0)
    if (details.reason == 'install') then createStorage() else $.indexedDB('oracle').deleteDatabase().done createStorage
