$('a.crystalHelper').scry()
$('.crystalProd').remove()

$('a.crystal-catalog-helper, a.crystal-catalog-helper-list-item').scry {
    query : ->
        return $(this).data('name')
}
