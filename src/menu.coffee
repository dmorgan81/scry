onContextMenu = (info, tab) -> chrome.tabs.sendMessage tab.id, { name : info.selectionText }

registerContextMenu = ->
    manifest = chrome.runtime.getManifest()
    matches = (script.matches for script in manifest.content_scripts)
    patterns = [].concat.apply([], matches)
    chrome.contextMenus.create {
        id : "scry"
        title : "Scry '%s'"
        contexts : [ "selection" ]
        documentUrlPatterns : patterns
    }
    chrome.contextMenus.onClicked.addListener onContextMenu

chrome.runtime.onInstalled.addListener registerContextMenu
chrome.runtime.onStartup.addListener registerContextMenu
    
