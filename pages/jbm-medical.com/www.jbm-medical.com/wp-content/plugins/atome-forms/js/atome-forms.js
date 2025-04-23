jQuery(document).ready(function($){

    // Ajouter verif Jquery.validate()
	if(typeof($.validator) !== 'undefined') {
		$.validator.addMethod("valueNotEquals", function(value, element, param){
                    return this.optional(element) || param !== value;
		}, "Veuillez sélectionner une option");

		$.validator.addMethod("exactlength", function(value, element, param) {
                    return this.optional(element) || value.length === param;
		}, $.validator.format("Le champ doit avoir exactement {0} caractères"));

		$.validator.addMethod("dateFR", function(value, element) {
		    return this.optional(element) || value.match(/^(0?[1-9]|[12][0-9]|3[0-2])\/(0?[1-9]|1[0-2])\/(19|20)?\d{2}$/);
		}, $.validator.format("La date doit être formatée JJ/MM/AAAA"));

                $.validator.addMethod("dateDebut", function(value, element, param){
                    return ($(param).val()==="" || (this.optional(element) || value <= $(param).val()));
		}, "La date de début doit être inférieure à celle de fin.");
                $.validator.addMethod("dateFin", function(value, element, param){
                    return ($(param).val()==="" || (this.optional(element) || value >= $(param).val()));
		}, "La date de fin doit être supérieure à celle de début.");

		$.validator.addMethod("mdp", function(value, element) {
		    return this.optional(element) || value.match((/^(?=.*\d)[0-9a-zA-Z\d=!\*!?#.\-_@$]{8,}$/));
		}, $.validator.format("Votre mot de passe doit comporter au moins 8 caractères, avec a minima 1 chiffre."));

		$.validator.addMethod("tel", function(value, element) {
	  		return this.optional(element) || /^0[0-9]{1}[ ]{0,1}[0-9]{2}[ ]{0,1}[0-9]{2}[ ]{0,1}[0-9]{2}[ ]{0,1}[0-9]{2}$/.test(value);
		}, $.validator.format("Le numéro de téléphone n'est pas valide"));

                $.validator.addMethod("uploadFile", function(value, element) {
                    if(element.files[0]){
                        var size = element.files[0].size;
                        var param = typeof param === "string" ? param.replace(/,/g, '|') : "doc|docx|pdf|rtf|jpg|jpeg|gif|png";
                        if (size > 2097152 || !value.match(new RegExp(".(" + param + ")$", "i")))
                        {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    else{
                        return true;
                    }
		}, $.validator.format("Formats acceptés : docx, doc, rtf, pdf, jpg, jpeg, gif, png 2 Mo max"));

		$.each($.validator.methods, function (key, value) {
	        $.validator.methods[key] = function () {
	            var el = $(arguments[1]);
	            if (el.is('[placeholder]') && arguments[0] === el.attr('placeholder'))
	                arguments[0] = '';

	            return value.apply(this, arguments);
	        };
	    });
	}
        /* SELECT HTML */
        if ($('form select[name="area"]').length) {

            $.each($('form select[name="area"]'), function(i,e) {
                var hasSelection = false;
                var preSelectedValue = $(e).val();
                var preSelectedTxt = $(e).find('option:selected').text();

                $(e).parent().append('<input type="hidden" id="'+$(e).attr('id')+'_name" name="area_name" />');
                if (preSelectedValue) {
                    $(e).parent().find('input[name="area_name"]').val(preSelectedTxt);
                }
                $(e).on('change', function() {
                    var value = $(e).val();
                    if (value) {
                        $(e).parent().find('input[name="area_name"]').val($(e).find('option:selected').text());
                    } else {
                        $(e).parent().find('input[name="area_name"]').val('');
                    }
                });
            });
        }



        /* SELECT JS */
	if($('.select-js').length){
            $('.select-js').show();
		$.each($('.select-js'),function(i,e){
                        var hasSelection = false;
                        var preSelectedValue;
                        var preSelectedTxt;

			$(e).wrap('<div class="select-js-container">');
			$(e).parent().append('<span class="placeholder"></span>');
			$(e).parent().append('<div class="c" style="height: 200px"><ul></ul></div>');

			$.each($(e).find('option'),function(j,o){
                                if ($(o).attr('selected')) {
                                    hasSelection = true;
                                    preSelectedValue = $(o).attr('value');
                                    preSelectedTxt = $(o).html();
                                }
				if ($(o).attr('value')){
					$(e).parent().find('.c ul').append('<li data-id="'+$(o).attr('value')+'">'+$(o).html()+'</li>');
				}else{
					$(e).parent().find('.c ul').append('<li>'+$(o).html()+'</li>');
				}
			});
                        $(e).parent().append('<input type="hidden" id="'+$(e).attr('id')+'" name="'+$(e).attr('name')+'"/>');
                        if ($(e).attr('name') == 'area') { // cas particulier pour le select d'un lieu dans le moteur de recherche d'offre
                            $(e).parent().append('<input type="hidden" id="'+$(e).attr('id')+'_name" name="area_name"/>');
                        }
                        if (hasSelection) {
                            $('.select-js-container .placeholder').html(preSelectedTxt);
                            if (preSelectedValue) {
                                $('.select-js-container .placeholder').addClass('filled');
                                $('input[name="' + $(e).attr('name') + '"]').val(preSelectedValue);
                                if ($('input[name="area_name"]').length) { // cas particulier pour le select d'un lieu dans le moteur de recherche d'offre
                                    $('input[name="area_name"]').val(preSelectedTxt);
                                }
                            } else { $('input[name="' + $(e).attr('name') + '"]').val(''); } // cas ou on choisi une option vide (=> suppresion de la selection)
                        } else {
                            $('.select-js-container .placeholder').html($(e).find('.placeholder').html());
                        }

			$span = $(e).parent().find('span');
			$c = $(e).parent().find('.c');
			$c.hide();
			$li = $(e).parent().find('li');
			$(e).remove();
			$span.on('click',function(event){
                                event.stopPropagation();
				if($span.hasClass('active')){
					$span.removeClass('active');
					$c.slideUp('fast');
				}else{
					$span.addClass('active');
					$c.slideDown('fast');
				}
			});
			$li.on('click',function(event){
                                if ($(this).data('id') != 'separator') {
                                    txt = $(this).html();
                                    value = $(this).data('id');
                                    if(value){
                                        $(this).parents('.select-js-container').find('input').val(value);
                                        // cas particulier pour le select d'un lieu dans le moteur de recherche d'offre
                                        $(this).parents('.select-js-container').find('input[name="area_name"]').val(txt);
                                    } else {
                                        $(this).parents('.select-js-container').find('input').val('');
                                    }
                                    $span.html(txt).removeClass('active').addClass('filled');
                                    $c.hide();
                                }
			});
                        $('body:not("div.select-js-container")').on('click', function(event) {
                            if ($span.hasClass('active')) {
                                $span.removeClass('active');
                                $c.slideUp('fast');
                            }
                        });
		});
	}

    /* AUTOCOMPLETE */
    createAutocomplete()
   /************************************************************************************************************/

   /*
   * ZIPCODE - CITY - COUNTRY
   * autoremplissage de la liste des villes
   * ATTENTION: ne fonctionne que s'il y a qu'un seul champ de ce type dans la page
   */
   $(document).on('blur',"input[name='zipcode_city_api']",function(){
       if ( $("select[name='city_country_api']").val() === 0
            && $("input[name='zipcode_city_api']").val().length === 5
            && $("select[name='city_country_api']").children().length === 1
         ){
             $(this).addClass('js-loading');
             getTownList();
        }
    });
    $(document).on('keyup',"input[name='zipcode_city_api']",function(){
        if ($(this).val().length === 5){
            $(this).addClass('js-loading');
            getTownList();
        }
    });

    $(document).on('blur',".zipcode_city_api_1 input",function(){
       if ( $(".city_country_api_1 select").val() === 0
            && $(".zipcode_city_api_1 input").val().length === 5
            && $(".city_country_api_1 select").children().length === 1
         ){
             $(this).addClass('js-loading');
             getTownListWithClass("zipcode_city_api_1","city_country_api_1");
        }
    });
    $(document).on('keyup',".zipcode_city_api_1 input",function(){
        if ($(this).val().length === 5){
            $(this).addClass('js-loading');
            getTownListWithClass("zipcode_city_api_1","city_country_api_1");
        }
    });

    $(document).on('blur',".zipcode_city_api_2 input",function(){
       if ( $(".city_country_api_2 select").val() === 0
            && $(".zipcode_city_api_2 input").val().length === 5
            && $(".city_country_api_2 select").children().length === 1
         ){
             $(this).addClass('js-loading');
             getTownListWithClass("zipcode_city_api_2","city_country_api_2");
        }
    });
    $(document).on('keyup',".zipcode_city_api_2 input",function(){
        if ($(this).val().length === 5){
            $(this).addClass('js-loading');
            getTownListWithClass("zipcode_city_api_2","city_country_api_2");
        }
    });
    $(document).on('keyup',".metiers_api input",function(){
        if ($(this).val().length > 2){
            $(this).addClass('js-loading');
            getMetiers("metiers_api","metiers_list_api");
        }
    });
    /************************************************************************************************************/

    function getTownList() {
         // Ajax GET request for autocompletion
         var postalcode = $("input[name='zipcode_city_api']").val();
         if (postalcode === "") {
              postalcode = "-";
         }

          $.ajax({
             url:atomeformsajax.ajax_url,
             data: {
                action: 'city',
                security: atomeformsajax.ajax_nonce,
                query:postalcode
             },
             dataType: "json",
             success: function( data ) {
                 if (data!==null && data.length>0) {
                     var options = '';
                     for (var i = 0;i < data.length; i++) {
                        options += '<option value="' + data[i].Key + '">' + data[i].Value + '</option>';
                     }
                     $("select[name='city_country_api']").html(options);
                 }
                 $("input[name='zipcode_city_api']").removeClass('js-loading');
                 jQuery("select[name='city_country_api']").trigger('change');
             },
             error:function(){
                $("input[name='zipcode_city_api']").removeClass('js-loading');
             }
          });
        }

        function getTownListWithClass(origin,target) {
         // Ajax GET request for autocompletion
         var postalcode = $("."+ origin + " input").val();
         if (postalcode === "") {
              postalcode = "-";
         }

          $.ajax({
             url: atomeformsajax.ajax_url,
             data: {
                action: 'city',
                security: atomeformsajax.ajax_nonce,
                query:postalcode
             },
             dataType: "json",
             success: function( data ) {
                 if (data!==null && data.length>0) {
                     var options = '';
                     for (var i = 0;i < data.length; i++) {
                        options += '<option value="' + data[i].Value + '">' + data[i].Value + '</option>';
                     }
                     $("."+ target +" select").html(options);
                 }
                 $("."+ origin + " input").removeClass('js-loading');
                 jQuery("."+ target +" select").trigger('change');
             },
             error:function(){
                $("."+ origin + " input").removeClass('js-loading');
             }
          });
        }
        
        function getMetiers(origin,target) {
         // Ajax GET request for autocompletion
         var metier = $("."+ origin + " input").val();
         if (metier === "") {
              metier = "-";
         }

          $.ajax({
             url: atomeformsajax.ajax_url,
             data: {
                action: 'metier_qualifications',
                security: atomeformsajax.ajax_nonce,
                query:metier
             },
             dataType: "json",
             success: function( data ) {
                 if (data!==null && data.length>0) {
                     var options = '';
                     for (var i = 0;i < data.length; i++) {
                        options += '<option value="' + data[i].Value + '">' + data[i].Value + '</option>';
                     }
                     $("."+ target +" select").html(options) ;
                 }
                 //$("."+ target +" select").attr('size', 200);                 
                 $("."+ origin + " input").removeClass('js-loading');                 
             },
             error:function(){
                $("."+ origin + " input").removeClass('js-loading');
             }
          });
        }
        

    });


    /* AUTOCOMPLETE */
    function createAutocomplete(){
            /* JOBS */

            $what_autocomplete = jQuery("input[name='qualifications_api'], input[name='What'].autocomplete, .qualifications_api input");
            $what_autocomplete.each(function(){
           
            var action = 'qualifications';
            var ajax_url = atomeformsajax.ajax_url;
            var isFreeInput = false;
            var cache = {};
            var autocomplete_values = [];
            var minLength = 2;
            if (jQuery(this).attr('name') == 'What') {
               action = 'metier_qualifications';
               ajax_url = atomeformsajax.autocomplete_qualif_url;
               isFreeInput = true;
            }
            jQuery(this).autocomplete({
                source: autocomplete_values,
                minLength: minLength,
                delay: 0,
                messages: {
                      noResults: '',
                      results: function() {}
                },

                focus:function (event,ui) {
                      var menu = jQuery(this).data("uiAutocomplete").menu.element;
                      menu.find("li").removeClass("selected");
                      var focused = menu.find("li:has(a.ui-state-focus)");
                      focused.addClass("selected");
                },
                select: function (event,ui) {
                     var suggestion = ui.item;
                     var result = suggestion.label;
                     jQuery(this).val(result);
                     if(jQuery("#QualificationID").length) {
                         jQuery("#QualificationID").val(suggestion.key);
                         jQuery("#QualificationID").trigger('change');
                     }
                     return false;
                },
                open: function() {
                     jQuery(this).data("ui-autocomplete").menu.element.addClass("autocomplete-suggestions");
                     jQuery(this).data("ui-autocomplete").menu.element.addClass("js-loading");
                     switch(jQuery('.wrapper').width()){
                          case 1172	:	$w = 312; break;
                          case 954	:	$w = 246; break;
                          case 748	:	$w = 262; break;
                          case 638	:	$w = 294; break;
                          case 638	:	$w = 294; break;
                          case 470	:	$w = 428; break;
                          case 307	:	$w = 266; break;
                     }
                     jQuery(this).data("ui-autocomplete").menu.element.css('width', $w, 'important');
                },
                close: function() {
                      jQuery(this).data("ui-autocomplete").menu.element.removeClass("js-loading");
                  },
                change: function( event, ui ) {
                      if ((ui.item === null || ui.item === undefined) && !isFreeInput) {
                        jQuery(this).val("");
                        if(jQuery("#QualificationID").length) {
                          jQuery("#QualificationID").val("");
                          jQuery("#QualificationID").trigger('change');
                        }
                        jQuery(this).data("ui-autocomplete").menu.element.removeClass("js-loading");
                      }
                 }
               })
               .data( "ui-autocomplete" )._renderItem =  function( ul, suggestion ) {

                     return jQuery( "<li>" )
                          .data( "ui-autocomplete-item", suggestion )
                          .attr( "class", "autocomplete-suggestion" )
                          .append(jQuery( "<a>" ).html( suggestion.value) )
                          .appendTo( ul );
               }

               jQuery(this).on('keypress', function() {
                   if ((jQuery(this).val().length + 1) == minLength) {
                       $what_autocomplete.autocomplete( "option", "source", []);
                   }
               }).on('keyup', function() {
                   var term = jQuery(this).val();
                   if (term.length == minLength) {
                       if (term in cache) {
                           autocomplete_values = jQuery.map(cache[term], function(item) {
                               return { value: item.Value, key: item.Key };
                           });
                           $what_autocomplete.autocomplete( "option", "source", autocomplete_values);
                       } else {
                           jQuery.ajax({
                               url: ajax_url,
                               data:{
                                   action: action,
                                   security: atomeformsajax.ajax_nonce,
                                   site_name:atomeformsajax.ajax_site_name,
                                   query: term
                               },
                               dataType: "json",
                               success: function( data ) {
                                   cache[term] = data;
                                   autocomplete_values = jQuery.map( data, function( item ) {
                                   return {
                                           value: item.Value,
                                           key:  item.Key
                                       };
                                   });
                                   $what_autocomplete.autocomplete( "option", "source", autocomplete_values);
                                   $what_autocomplete.autocomplete('search');
                               }
                           });
                       }
                   }
               });
            });

        /* LOCALISATIONS SELECT JS */
            jQuery("input[name='locations_api']").each(function(i, e){
                 var isFreeInput = true;
                 if (jQuery(this).hasClass('forceautocomplete')) {
                    isFreeInput = false;
                }
                jQuery(this).autocomplete({
                    source: function( request, response ) {
                            jQuery.ajax({
                                url: atomeformsajax.autocomplete_loc_url,
                                data:{
                                    security: atomeformsajax.ajax_nonce,
                                    query:request.term,
                                    site_name:atomeformsajax.ajax_site_name
                                },
                                dataType: "json",
                                success: function( data ) {
                                    response( jQuery.map( data, function( item ) {
                                        return {
                                            value: item.Name,
                                            data:  item
                                        };
                                    }));
                                }
                            });
                       },
                      minLength: 2,
                      delay: 0,
                      messages: {
                            noResults: '',
                            results: function() {}
                      },
                      focus:function (event,ui) {
                            var menu = jQuery(this).data("uiAutocomplete").menu.element;
                            menu.find("li").removeClass("selected");
                            var focused = menu.find("li:has(a.ui-state-focus)");
                            focused.addClass("selected");
                      },
                      select: function (event,ui) {
                                var suggestion = ui.item;
                                var result = suggestion.label;
                                var typesearch = jQuery(this).parents("form").find("input[name='typewhere']");

                                jQuery(this).parents("form").find('#id_area_id').val(suggestion.data.ID);
                                // Cas de la recherche
                                if (jQuery(this).hasClass("search")){
                                    switch(suggestion.data.TypeID) {
                                        case 3:
                                                result = suggestion.data.Name+' '+suggestion.data.Code;
                                                break;
                                        default:
                                                result = suggestion.data.Name;
                                                break;
                                    }
                                }else{
                                    switch(suggestion.data.TypeID) {
                                            //Ville
                                            case 3:
                                                    //result = suggestion.data.Name+' ('+suggestion.data.Code+'), '+suggestion.data.Parent+', '+suggestion.data.GrandParent;
                                                    result = suggestion.data.Name + ' ' + suggestion.data.Code;
                                                    break;
                                            //Département
                                            case 2:
                                                    //result = suggestion.data.Name+' ('+suggestion.data.Code+'), '+suggestion.data.Parent;
                                                    result = suggestion.data.Name;
                                                    break;
                                            //Région
                                            case 1:
                                                    result = suggestion.data.Name;
                                                    break;
                                    }
                                }
                                typesearch.val(suggestion.data.Type);
                                jQuery(this).val(result);
                                if(jQuery("#LocationsID").length) {
                                    jQuery("#LocationsID").val(suggestion.key);
                                    jQuery("#LocationsID").trigger('change');
                                }
                                return false;
                        },
                        open: function() {
                            jQuery(this).data("ui-autocomplete").menu.element.addClass("autocomplete-suggestions");
                            jQuery(this).data("ui-autocomplete").menu.element.addClass("js-loading");
                            switch(jQuery('.wrapper').width()){
                                 case 1172	:	$w = 312; break;
                                 case 954	:	$w = 246; break;
                                 case 748	:	$w = 262; break;
                                 case 638	:	$w = 294; break;
                                 case 638	:	$w = 294; break;
                                 case 470	:	$w = 428; break;
                                 case 307	:	$w = 266; break;
                            }
                            jQuery(this).data("ui-autocomplete").menu.element.css('width', $w, 'important');
                        },
                        close: function() {
                            jQuery(this).data("ui-autocomplete").menu.element.removeClass("js-loading");
                        },
                        change: function( event, ui ) {
                              if ((ui.item === null || ui.item === undefined) && !isFreeInput) {
                                jQuery(this).val("");
                                if(jQuery("#LocationsID").length) {
                                  jQuery("#LocationsID").val("");
                                  jQuery("#LocationsID").trigger('change');
                                }
                                jQuery(this).data("ui-autocomplete").menu.element.removeClass("js-loading");
                              } else if (ui.item === null || ui.item === undefined) {
                                  jQuery(this).parents("form").find('#id_area_id').val("");
                              }
                         }
                    })
                    .data( "ui-autocomplete" )._renderItem =  function( ul, suggestion ) {
                        var result;
                        var currentValue = this.element.val();
                         switch(suggestion.data.TypeID) {
                                 case 3:
                                         result = suggestion.data.Name+' ('+suggestion.data.Code+'), '+suggestion.data.Parent+ (suggestion.data.GrandParent != null ? ', '+suggestion.data.GrandParent : '');
                                         break;
                                 case 2:
                                         result = "<b>Département :</b> "+suggestion.data.Name+' ('+suggestion.data.Code+')' + (suggestion.data.Parent != null ? ', '+suggestion.data.Parent : '');
                                         break;
                                 case 1:
                                         result = "<b>Région :</b> "+suggestion.data.Name;
                                 break;
                                 case 4 : result = false; // HOOK : Pas de résultat
                                 break;
                         }
                         if(result) {
                                 var pattern = '(' + currentValue + ')';
                                 jQuery('.autocomplete-suggestions').css("border-width", "1px");
                                 result =  result.replace(new RegExp(pattern, 'gi'), '<span class="search">$1<\/span>');
                         } else {
                                 jQuery('.autocomplete-suggestions').css("border-width", "0");
                                 result = '';
                         }
                         return jQuery( "<li>" )
                             .data( "ui-autocomplete-item", suggestion )
                             .attr( "class", "autocomplete-suggestion" )
                             .append(jQuery( "<a>" ).html( result) )
                             .appendTo( ul );
                  };
            });




 jQuery("input[name='locations_api']").each(function(i, e){
                 var isFreeInput = true;
                 if (jQuery(this).hasClass('forceautocomplete')) {
                    isFreeInput = false;
                }
                jQuery(this).autocomplete({
                    source: function( request, response ) {
                            jQuery.ajax({
                                url: atomeformsajax.autocomplete_loc_url,
                                data:{
                                    security: atomeformsajax.ajax_nonce,
                                    query:request.term,
                                    site_name:atomeformsajax.ajax_site_name
                                },
                                dataType: "json",
                                success: function( data ) {
                                    response( jQuery.map( data, function( item ) {
                                        return {
                                            value: item.Name,
                                            data:  item
                                        };
                                    }));
                                }
                            });
                       },
                      minLength: 2,
                      delay: 0,
                      messages: {
                            noResults: '',
                            results: function() {}
                      },
                      focus:function (event,ui) {
                            var menu = jQuery(this).data("uiAutocomplete").menu.element;
                            menu.find("li").removeClass("selected");
                            var focused = menu.find("li:has(a.ui-state-focus)");
                            focused.addClass("selected");
                      },
                      select: function (event,ui) {
                                var suggestion = ui.item;
                                var result = suggestion.label;
                                var typesearch = jQuery(this).parents("form").find("input[name='typewhere']");

                                jQuery(this).parents("div").find('#id_area_id').val(suggestion.data.ID);
                                // Cas de la recherche
                                if (jQuery(this).hasClass("search")){
                                    switch(suggestion.data.TypeID) {
                                        case 3:
                                                result = suggestion.data.Name+' '+suggestion.data.Code;
                                                break;
                                        default:
                                                result = suggestion.data.Name;
                                                break;
                                    }
                                }else{
                                    switch(suggestion.data.TypeID) {
                                            //Ville
                                            case 3:
                                                    //result = suggestion.data.Name+' ('+suggestion.data.Code+'), '+suggestion.data.Parent+', '+suggestion.data.GrandParent;
                                                    result = suggestion.data.Name + ' ' + suggestion.data.Code;
                                                    break;
                                            //Département
                                            case 2:
                                                    //result = suggestion.data.Name+' ('+suggestion.data.Code+'), '+suggestion.data.Parent;
                                                    result = suggestion.data.Name;
                                                    break;
                                            //Région
                                            case 1:
                                                    result = suggestion.data.Name;
                                                    break;
                                    }
                                }
                                typesearch.val(suggestion.data.Type);
                                jQuery(this).val(result);
                                if(jQuery("#LocationsID").length) {
                                    jQuery("#LocationsID").val(suggestion.key);
                                    jQuery("#LocationsID").trigger('change');
                                }
                                return false;
                        },
                        open: function() {
                            jQuery(this).data("ui-autocomplete").menu.element.addClass("autocomplete-suggestions");
                            jQuery(this).data("ui-autocomplete").menu.element.addClass("js-loading");
                            switch(jQuery('.wrapper').width()){
                                 case 1172  :   $w = 312; break;
                                 case 954   :   $w = 246; break;
                                 case 748   :   $w = 262; break;
                                 case 638   :   $w = 294; break;
                                 case 638   :   $w = 294; break;
                                 case 470   :   $w = 428; break;
                                 case 307   :   $w = 266; break;
                            }
                            jQuery(this).data("ui-autocomplete").menu.element.css('width', $w, 'important');
                        },
                        close: function() {
                            jQuery(this).data("ui-autocomplete").menu.element.removeClass("js-loading");
                        },
                        change: function( event, ui ) {
                              if ((ui.item === null || ui.item === undefined) && !isFreeInput) {
                                jQuery(this).val("");
                                if(jQuery("#LocationsID").length) {
                                  jQuery("#LocationsID").val("");
                                  jQuery("#LocationsID").trigger('change');
                                }
                                jQuery(this).data("ui-autocomplete").menu.element.removeClass("js-loading");
                              } else if (ui.item === null || ui.item === undefined) {
                                  jQuery(this).parents("div").find('#id_area_id').val("");
                              }
                         }
                    })
                    .data( "ui-autocomplete" )._renderItem =  function( ul, suggestion ) {
                        var result;
                        var currentValue = this.element.val();
                         switch(suggestion.data.TypeID) {
                                 case 3:
                                         result = suggestion.data.Name+' ('+suggestion.data.Code+'), '+suggestion.data.Parent+ (suggestion.data.GrandParent != null ? ', '+suggestion.data.GrandParent : '');
                                         break;
                                 case 2:
                                         result = "<b>Département :</b> "+suggestion.data.Name+' ('+suggestion.data.Code+')' + (suggestion.data.Parent != null ? ', '+suggestion.data.Parent : '');
                                         break;
                                 case 1:
                                         result = "<b>Région :</b> "+suggestion.data.Name;
                                 break;
                                 case 4 : result = false; // HOOK : Pas de résultat
                                 break;
                         }
                         if(result) {
                                 var pattern = '(' + currentValue + ')';
                                 jQuery('.autocomplete-suggestions').css("border-width", "1px");
                                 result =  result.replace(new RegExp(pattern, 'gi'), '<span class="search">$1<\/span>');
                         } else {
                                 jQuery('.autocomplete-suggestions').css("border-width", "0");
                                 result = '';
                         }
                         return jQuery( "<li>" )
                             .data( "ui-autocomplete-item", suggestion )
                             .attr( "class", "autocomplete-suggestion" )
                             .append(jQuery( "<a>" ).html( result) )
                             .appendTo( ul );
                  };
            });
        

        }


