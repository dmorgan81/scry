(function(undefined) {

    String.prototype.format = function() {
        var a = arguments;
        return this.replace(/{(\d)}/g, function(m, n) {
            return typeof a[n] != 'undefined' ? a[n] : m;
        });
    };

})();
