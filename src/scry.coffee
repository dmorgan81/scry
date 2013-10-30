templates = $('<div/>').load(chrome.extension.getURL('template.html'))
imageUrl = (id, ops) -> "url(http://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=#{id}&options=#{ops})"

prices = (card) ->
    $.Deferred((dfd) ->
        chrome.runtime.sendMessage {
            type : 'prices',
            card : card
        }, (result) ->
            if (result) then dfd.resolve result
            else dfd.reject
    ).promise()

oracle = (query) ->
    $.Deferred((dfd) ->
        query.type = 'oracle'
        chrome.runtime.sendMessage query, (card) ->
            if (card) then dfd.resolve card
            else dfd reject
    ).promise()

show = (e) ->
    this.clearQueue()
    return unless this.is ':hidden'
    $('.scry').not(this).fadeOut 300
    w = this.width()
    h = this.height()
    b = $(window).width()
    s = $(window).scrollTop()
    x = e.pageX
    y = e.pageY

    if (b - 15 >= w + x) then cl = x + 5
    else cl = b - w - 15
    if (s + 20 >= y - h) then ct = y + 10
    else ct = y - h - 10
    this.css({ left : cl, top : ct}).fadeIn 300

hide = ->
    $(this).delay(500).fadeOut(300).queue ->
        $(this).dequeue().find('.scry-info').hide()

flip = (card) ->
    flipped = this.data('scry').flipped ? false
    this.transition({ rotate : (if flipped then '-' else '+') + '=180' })
        .queue =>
            this.css({
                'background-image' : imageUrl card.multiverseid, if not flipped then 'rotate180'
                rotate : 0
            }).toggleClass('scry-flipped', !flipped).dequeue()
            oracleConstruct.call this.find('.scry-oracle'), if flipped then card else card.other
    this.data('scry').flipped = !flipped

transform = (card) ->
    transformed = this.data('scry').transformed ? false
    op = (if transformed then '-' else '+') + '=90'
    c = if transformed then card else card.other
    this.transition({
        duration : 200
        easing : 'in'
        perspective: 250
        rotateY : op
    }).queue(=>
        this.css({
            'background-image' : imageUrl c.multiverseid
            scale : [ (if transformed then 1 else -1), 1 ]
        }).dequeue()
        oracleConstruct.call this.find('.scry-oracle'), if transformed then card else card.other
    ).transition({
        duration : 200
        easing : 'out'
        perspective : 250
        rotateY : op
    }).data('scry').transformed = !transformed

content = (card) ->
    this.css({
        'background-image' : imageUrl card.multiverseid, (if card.layout == 'split' then 'rotate90')
        'border-color' : card.border
    }).toggleClass 'scry-alpha', card.setcode == 'LEA'
    $.when(prices(card)).done($.proxy pricesConstruct, this.find('.scry-prices'))
    this.find('.scry-oracle.scry-right').remove()
    oracleConstruct.call this.find('.scry-oracle').removeClass('scry-left'), card
    rulingsConstruct.call this.find('.scry-rulings'), card
    printingsConstruct.call this.find('.scry-printings'), card
    return unless card.layout == 'split'
    other = this.find('.scry-oracle').clone().addClass('scry-right')
    oracleConstruct.call other, card.other
    this.find('.scry-oracle').addClass('scry-left').after(other)

oracleConstruct = (card) ->
    this.find('div').empty()
    for prop, value of card
        do (prop, value) =>
            s = this.find ".scry-oracle-#{prop}"
            if (prop == 'text') then value = value.replace(/\n/g, '<BR/>').replace /(\(.*\))/g, (m) -> return "<i>#{m}</i>"
            s.html value
    for prop in [ 'power', 'toughness', 'loyalty' ]
        do (prop) => if !card[prop] then this.find(".scry-oracle-#{prop}").remove()

pricesConstruct = (prices) ->
    template = templates.find '.scry-vendor'
    this.find('.scry-vendor').empty()
    this.find('.scry-prices-link').on 'click.scry', -> window.open prices.link
    for prop, value of prices.range
        do (prop, value) =>
            this.find(".scry-prices-range .scry-prices-#{prop}").text value
    for vendor in prices.vendors
        do (vendor) =>
            v = template.clone()
            for prop, value of vendor
                do (prop, value) -> v.find(".scry-vendor-#{prop}").text value
            v.find('.scry-vendor-name').on 'click.scry', -> window.open vendor.link
            this.find('.scry-vendors').append(v)

rulingsConstruct = (card) ->
    return unless card.rulings
    rulings = this.find 'ul'
    template = templates.find '.scry-ruling'
    rulings.find('li').remove()
    for ruling in card.rulings
        do (ruling) ->
            r = template.clone()
            for prop, value of ruling
                do (prop, value) -> r.find(".scry-ruling-#{prop}").text value
            rulings.append r

printingsConstruct = (card) ->
    printings = this.find('ul').off '.scry'
    template = templates.find '.scry-printing'
    sets = [].concat card.sets
    if card.other then sets = sets.concat card.other.sets
    printings.find('li').remove()
    for set in sets
        do (set) ->
            p = template.clone().data 'scry', set
            for prop, value of set
                do (prop, value) -> p.find(".scry-printing-#{prop}").text value
            p.find('.scry-printing-number').toggle set.number != undefined
            printings.append p
    printings.on 'click.scry', '.scry-printing', (e) ->
        set = $(this).data('scry')
        return if set.setcode == card.setcode
        $.extend true, card, set
        content.call $(this).parents('.scry'), card

construct = (card) ->
    scry = templates.find('.scry').clone().data('scry', {})
    content.call scry, card

    switch card.layout
        when 'flip' then scry.find('.scry-flip').show().on 'click.scry', $.proxy(flip, scry, card)
        when 'double-faced' then scry.find('.scry-transform').show().on 'click.scry', $.proxy(transform, scry, card)

    scry.find('.scry-info-toggle').on 'click.scry', -> scry.find('.scry-info').slideToggle()
    scry.find('.scry-tabs>li').on 'click.scry', ->
        type = $(this).text().toLowerCase()
        $(this).addClass('scry-active').siblings().removeClass('scry-active')
        scry.find(".scry-panels .scry-#{type}").show().siblings().filter(":not(.scry-#{type})").hide()
    return scry.toggleClass('scry-split', card.layout == 'split').appendTo 'body'

attach = (scry) ->
    $(this).data('scry', true)
           .on('mouseenter.scry', $.proxy(show, scry))
           .on('mouseleave.scry', $.proxy(hide, scry))
    scry.on('mouseenter.scry', -> $(this).clearQueue())
        .on('mouseleave.scry', hide)
    return scry

init = (e) ->
    query = e.data.query.apply this
    return unless query
    if typeof query == 'string' then query = { name : query }
    else if typeof query == 'number' then query = { multiverseid : query }
    $.when(oracle(query))
        .then(construct)
        .then($.proxy(attach, this))
        .done((scry) -> show.call scry, e)

receive = (msg) ->
    temp = $('<div/>')
    e = $('body').data('scry')
    $.when(oracle(msg))
        .then(construct)
        .then($.proxy(attach, temp))
        .done((scry) -> show.call scry, e)

$.fn.scry = (options) ->
    settings = $.extend {
        query : -> $(this).text()
        selector : null
    }, options

    chrome.runtime.sendMessage { type : 'init' }
    chrome.runtime.onMessage.addListener receive
    $('body').on 'mouseup.scry', (e) -> $(this).data('scry', e)
    return this.each ->
        $(this).on 'mouseover.scry', settings.selector, settings, (e) ->
            return if $(this).data('scry')
            init.call this, e
