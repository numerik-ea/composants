    /*
     * Changement de la page de recherche
     * @param {type} select
     */
    function _changeHitsIndex(elmt, select, addInHash){
        if (select)
            var opt = elmt.options[elmt.selectedIndex].value;
        else
            var opt = elmt.innerHTML;
        if (addInHash) {
            var hash = setHashParameter('i', opt);
            window.location.hash = encodeURIComponent(hash);
        } else {
            var url = setGetParameter("i",opt);
            window.location.href=url;
        }
    }

    /*
     * Changement du nombre d'offres par page
     * @param {type} select
     */
    function _changeHitsNumber(select, addInHash){
        var opt = select.options[select.selectedIndex].value;

        if (addInHash) {
            var hash = setHashParameter('n', opt);
            hash = setHashParameter('i', 1, hash);
            window.location.hash = encodeURIComponent(hash);

        } else {
            var url = setGetParameter("n",opt);
            url = removeParam("i", url);
            window.location.href=url;
        }
    }

    /*
     * Changement de l'ordonnancement des résultats
     * @param {type} select
     */

    function _changeSorter(select){
        var opt = select.options[select.selectedIndex].value;
        var url = setGetParameter('s', opt);
        window.location.href = url;
    }

    jQuery(document).ready(function($){
        if ($('.offers-col-results').length) {
            //Pagination par hash
            $('.pagination').on('click', '.previous, .next, .dizaine', function() {
                var i = $(this).data('value');
                var hash = setHashParameter('i', parseInt(i));
                window.location.hash = encodeURIComponent(hash);
            });
        } else {
            //Pagination
            $(".pagination .previous, .pagination .next, .pagination .dizaine").on('click', function() {
                    var i = $(this).data("value");
                    var url = setGetParameter("i",parseInt(i));
                    window.location.href=url;
            });
        }
    });


