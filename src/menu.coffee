pricesUrl = (name) -> "http://store.tcgplayer.com/magic/product/show?ProductName=#{name}"

onContextMenu = (info, tab) ->
    switch info.menuItemId
        when "scry-info" then chrome.tabs.sendMessage tab.id, { name : info.selectionText }
        when "scry-prices" then chrome.tabs.create {
            index : tab.index + 1
            url : pricesUrl(info.selectionText)
        }

registerContextMenu = ->
    manifest = chrome.runtime.getManifest()
    matches = (script.matches for script in manifest.content_scripts)
    patterns = [].concat.apply([], matches)
    chrome.contextMenus.create {
        id : "scry-info"
        title : "Scry '%s'"
        contexts : [ "selection" ]
        documentUrlPatterns : patterns
    }
    chrome.contextMenus.create {
        id : "scry-prices"
        title : "Price '%s'"
        contexts : [ "selection" ]
    }

chrome.runtime.onInstalled.addListener registerContextMenu
chrome.runtime.onStartup.addListener registerContextMenu
chrome.contextMenus.onClicked.addListener onContextMenu
    
