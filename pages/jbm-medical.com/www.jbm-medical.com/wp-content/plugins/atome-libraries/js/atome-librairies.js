
function  go() {
		var id1=document.forms['form_frmproapplication2'].elements['id'].value;
                document.location.href =("?id=" + id1 +  "&pdf=1");
}

function setCookie(c_name,value,exdays,path)
{
    var exdate=new Date();
    exdate.setTime(exdate.getTime()+(exdays*24*60*60*1000));
    var c_value=escape(value) + ((exdays===null) ? "" : "; expires="+exdate.toGMTString());
    document.cookie=c_name + "=" + c_value+ ";path="+path;
}

function getCookie(name){
     if(document.cookie.length === 0)
       return null;

     var regSepCookie = new RegExp('(; )', 'g');
     var cookies = document.cookie.split(regSepCookie);

     for(var i = 0; i < cookies.length; i++){
       var regInfo = new RegExp('=', 'g');
       var infos = cookies[i].split(regInfo);
       if(infos[0] === name){
         return unescape(infos[1]);
       }
     }
     return null;
}


/*
     * Changement de la valeur d'un paramètre dans l'url
     */
    function setGetParameter(paramName, paramValue)
    {
        var url = decodeURIComponent(window.location.href);
        var hash = decodeURIComponent(window.location.hash);

        if (hash) {url = url.replace(hash, ''); }

        if (url.indexOf(paramName + "=") >= 0)
        {
            var prefix = url.substring(0, url.indexOf(paramName + "="));
            var suffix = url.substring(url.indexOf(paramName + "="));
            suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
            url = prefix + paramName + "=" + paramValue + suffix;
        }
        else
        {
            if (url.indexOf("?") < 0)
                url += "?" + paramName + "=" + paramValue;
            else
                url += "&" + paramName + "=" + paramValue;
        }
        if (hash) { url += hash; }
        return url;
    }


    /* Changement de la valeur du hash dans l'url */
    function setHashParameter(paramName, paramValue, hash) {
        var url = decodeURIComponent(window.location.href);
        if (hash == null || hash == undefined) {
            var hash = decodeURIComponent(window.location.hash);
        }

        hash = hash.replace('#', '');
        if (hash) {
            if (hash.indexOf(paramName + "=") >= 0) {
                var prefix = hash.substring(0, hash.indexOf(paramName + "="));
                var suffix = hash.substring(hash.indexOf(paramName + "="));
                suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
                hash = prefix + paramName + "=" + paramValue + suffix;
            } else {
                hash += "&" + paramName + "=" + paramValue;
            }
        } else {
            hash = paramName + "=" + paramValue;
        }
        return hash;
    }

    /* Renvoi la valeur d'un parametre dans le hash de l'url */
    function getHashParameter(key) {
        var hash = decodeURIComponent(window.location.hash);
        var results = new RegExp('[#&]?' + key + '=([^&]*)').exec(hash);
        if (results) { return results[1]; }
        return 0;
    }

    /*
     * Renvoi la valeur d'un parametre dans l'url
     */
    function getParamValue(key) {
        var results = new RegExp('[\\?&amp;]' + key + '=([^&amp;#]*)').exec(window.location.href);
        if (results) { return results[1]; }
        return "";
    }

    /*
     * Suppression d'un paramètre dans l'url
     */
    function removeParam(key, sourceURL) {
        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            rtn = rtn + "?" + params_arr.join("&");
        }
        return rtn;
    }



/**
 * Loading lors de l'upload d'un CV
 */
function loadingUploadFile(){
    jQuery('body,html').animate({scrollTop:0},300);
    $racine = jQuery('body');
    $racine.append('<div class="overlay"></div>');
    $racine.append('<div class="popin-loading shadow"><h3>Chargement en cours</h3><div class="c"><p class="update">Votre CV est en cours de téléchargement...</p><p class="wait">Veuillez patienter...</p></div></div>');
    var h = $racine.height();
    $racine.find('.overlay').css({
                        'display'		: 'none',
                        'position'		: 'absolute',
                        'background'	: '#ffffff',
                        'top'			: 0,
			'left'			: 0,
			'width'			: '100%',
			'height'		: h,
                        'z-index' : 80000
		}).fadeTo(500,0.8);
    $racine.find('.popin-loading').fadeIn(500);
}

jQuery(document).ready(function($){
    /* POPIN CNIL */
	if($('.popin-cnil').length && getCookie(atomelibraries.ccname) !== '1'){
		var h = $('.popin-cnil').height();
		$('.popin-cnil').css({
			left:0,
			bottom:'-'+h+24+'px'
		}).animate({
			bottom:0
		},1000);
		$('.hide-popin-cnil').click(function(event){
			event.preventDefault();
			$('.popin-cnil').hide();
            setCookie(atomelibraries.ccname,"1",atomelibraries.cclifetime,"/");

            // renvoie le consentement pour content square
            window._uxa = window._uxa || [];
            window._uxa.push(['trackConsentGranted']);
		});
	}

        /*** Popin CGU ***/
	if($(".popincgu").length) {
            $("a.popincgu").on("click", function(e){
			e.preventDefault(e);
                        var params = {
                               action: 'popincgu',
                               security: atomelibraries.ajax_nonce
                        };
                        $.get(
                           atomelibraries.ajax_url,
                           params
                         ).done(function(response) {
                            $.fancybox({
					openEffect  : 'none',
					closeEffect : 'none',
					margin: 0,
					padding: 0,
					closeBtn: false,
					content : response
				});
			});
		});
	}

    /*** Popin Réglement ***/
    if($(".popinreglement").length) {
            $("a.popinreglement").on("click", function(e){
            e.preventDefault(e);
                        var params = {
                               action: 'popinreglement',
                               security: atomelibraries.ajax_nonce
                        };
                        $.get(
                           atomelibraries.ajax_url,
                           params
                         ).done(function(response) {
                            $.fancybox({
                    openEffect  : 'none',
                    closeEffect : 'none',
                    margin: 0,
                    padding: 0,
                    closeBtn: false,
                    content : response
                });
            });
        });
    }

});