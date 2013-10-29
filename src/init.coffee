chrome.runtime.onMessage.addListener (msg, sender) ->
    chrome.pageAction.show sender.tab.id if msg.type == 'init'
