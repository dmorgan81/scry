databaseVersion = 9
partnerKey = 'MAGCINFO'
pricesUrl = (name, set) -> "http://partner.tcgplayer.com/x3/phl.asmx/p?pk=#{partnerKey}&p=#{name}&s=#{set}"
vendorUrl = (name, set) -> "http://partner.tcgplayer.com/x3/pv.asmx/p?pk=#{partnerKey}&v=8&p=#{name}&s=#{set}"
splitName = (names) -> "#{names[0]} // #{names[1]}"

fix = (s) -> s.replace /&(lt|gt);/g, (m, n) -> if n == 'lt' then '<' else '>'
extract = (s) ->
    if typeof s == 'string' then s = /<link>(.*)<\/link>/.exec(s)[1]
    else s = s.lastChild.nodeValue
    $.trim(s.replace /amp;/g, '')

fetchPrices = (card, set) ->
    $.ajax {
        url : pricesUrl card, set
        dataType : 'text'
    }

fetchVendors = (card, set) ->
    $.ajax {
        url : vendorUrl card, set
        dataType : 'text'
    }

formatPrice = (data, selector) -> parseFloat($(selector, data).text()).toFixed(2)

chrome.runtime.onInstalled.addListener (details) ->
    return unless details.reason == 'install' or details.reason == 'update'
    $.getJSON 'prices.json', (sets) ->
        $.indexedDB 'prices', {
            version : databaseVersion,
            schema : {
                1 : (transaction) -> transaction.createObjectStore 'sets', { autoIncrement : false }
                3 : (transaction) -> transaction.objectStore('sets').clear()
            },
            upgrade : (transaction) ->
                store = transaction.objectStore 'sets'
                store.put name, code for code, name of sets
        }

chrome.runtime.onMessage.addListener (msg, sender, respond) ->
    return false unless msg.type == 'prices'
    card = msg.card
    name = card.name
    if card.layout == 'split' then name = splitName card.names
    promise = $.indexedDB('prices').objectStore('sets', false).get(card.setcode)
    promise.fail -> respond.apply
    promise.done (set) ->
        $.when(fetchPrices(name, set), fetchVendors(name, set)).done (presponse, vresponse) ->
            pdata = fix presponse[0]
            return respond.apply unless $('product', pdata).length > 0
            vdata = fix vresponse[0]
            prices = {
                link : extract pdata
                range : {
                    low : formatPrice pdata, 'lowprice'
                    mid : formatPrice pdata, 'avgprice'
                    high : formatPrice pdata, 'hiprice'
                }
                vendors : []
            }
            $('supplier', vdata).each (i, vendor) ->
                prices.vendors.push {
                    name : $('name', vendor).text()
                    condition : $('condition', vendor).text().match(/\b\w/g).join('')
                    quantity : parseInt $('qty', vendor).text()
                    price : formatPrice vendor, 'price'
                    link : extract vendor
                }
            respond.apply null, [ prices ]
    return true
