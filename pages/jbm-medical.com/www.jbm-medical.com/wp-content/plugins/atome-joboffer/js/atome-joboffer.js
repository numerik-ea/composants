jQuery(document).ready(function($) {

    /* PRINT */
    $('.a-print').on('click',function(event){
	event.preventDefault();
	window.print();
    });
    /* SEND OFFER */
    $('#send-offer').on('click',function(event){
            event.preventDefault();
            window._uxa = window._uxa || [];
            window._uxa.push(['trackPageview', window.location.pathname+window.location.hash.replace('#','?__')+'?cs-popin-envoyer-par-mail']);
            $this = $(this);
            var id = $(this).data('id-offer');
            var ref = $(this).data('ref-offer');
             var params = {
                               action: 'sendofferpopin',
                               security: atomejoboffer.ajax_nonce,
                               id:id,
                               ref:ref
                        };
            jQuery.get(
                 atomejoboffer.ajax_url,
                 params
                ).done(function(response) {
                     jQuery.fancybox({
			openEffect  : 'none',
			closeEffect : 'none',
			margin: 0,
			padding: 0,
			closeBtn: false,
			content : response
                    });
            });
	});

    /* SEND PAGE */
    $('body').delegate('#form-send-offer .action button','click',function(event){
		$('#form-send-offer').validate({
			submitHandler: function(form) {
				event.preventDefault();
				$.ajax({
                                    url: atomejoboffer.ajax_url,
                                    dataType:"json",
                                    type:"POST",
                                    data : {
                                        action:'sendoffer',
                                        security: atomejoboffer.ajax_nonce,
                                        data:$('#form-send-offer').serialize()
                                    },
                                    success : function(cb){
                                        if(cb.ok){
                                            $('#action').remove();
                                            $('#form-send-offer').before('<div class="box-confirmation" style="display:none;"><p>'+cb.message+'</p></div>');
                                            $('#form-send-offer').remove();
                                            $('.box-confirmation').slideDown(250).delay(3000).slideUp(250,function(){
                                                $('.box-confirmation').remove();
                                                jQuery.fancybox.close();
                                            });
                                        }else{
                                            $('#form-send-offer').before('<div class="box-alert"><h2>L\'offre n\'a pas pu être envoyée.</h2><br>'+cb.message+'</div>');
                                        }
                                    }
				});
			},
			errorElement : 'small',
			rules : {
				LastName : {required : true},
				FirstName : {required : true},
				Email : {
					required: true,
					email : true
				},
				EmailFriend : {
					required: true,
					email : true
				},
                                cptch_number : {
					required: true,
				}

			},
			messages : {
				LastName : {required : 'Votre nom est obligatoire'},
				FirstName : {required : 'Votre prénom est obligatoire'},
				Email : {
					required: "L'email est obligatoire",
					email: "L'email n'est pas valide"
				},
				EmailFriend : {
					required: "L'email est obligatoire",
					email: "L'email n'est pas valide"
				},
                                cptch_number : {
                                    required: "Le Captcha est obligatoire"
				}
			}
		});
	});

        /* SAVED SEARCHES */

        if($('.a-saved-searches').length){
                $('form.offers-search, li.searchrequestBlock').on('click', '.a-saved-searches', function(event){
                        event.preventDefault();
                        $(this).toggleClass('active');
                        $(this).parent().find('ul').slideToggle('fast');
                });
        }
        /*candidature par téléphone*/
        $('.a-apply-with-phone').on('click',function(event){
			   event.preventDefault();
			   $(this).parent().toggleClass('li-phone-active');
			   $(this).parent().find('.c').toggle();
			   $('.li-cv').removeClass('li-cv-active').find('.c').hide();
        });
        $('.a-apply-with-cv').on('click',function(event){
         event.preventDefault();
         $(this).parent().toggleClass('li-cv-active');
         $(this).parent().find('.c').toggle();
         $('.li-phone').removeClass('li-phone-active').find('.c').hide();
        });
        /* VALIDATION DU FORMULAIRE Candidature par téléphone */
	$('#form-fill-cv').validate({
		errorElement : 'small',
		errorPlacement : function(error, element){
                    if($(element).parents().hasClass('row-skills')){
				$('.skills-required').after(error);
			}else{
				$(element).parent().append(error);
			}
		},
		rules: {
		LastName: {
			required: true
		},
		FirstName: {
			required: true
		},
		Phone: {
			required: true,
			minlength: 10,
			tel: true
                       },
                },
		messages:  {
                            LastName: {
                                required: "Le nom est obligatoire"
                            },
                            FirstName: {
                                required: "Le prénom est obligatoire"
                            },
                            Phone: {
                                required: "Le téléphone est obligatoire",
                                minlength: "Le téléphone est formaté d'au moins 10 chiffres",
                            },
                            Email: {
                                required: "L'email est obligatoire",
                                email: "L'email n'est pas valide"
                            },
                },
                invalidHandler: function(event, validator) {
                    // 'this' refers to the form
                    var errors = validator.numberOfInvalids();
                    if (errors) {
                        $(".box-alert#error").show();
                    }
                },
                submitHandler: function() {
                    $(".box-alert#error").remove();
                    formValidation($('#form-fill-cv').serialize());
                }
	});

        /*
        * Première étape de la validation
        */
        function formValidation(params){

          addLoadingCandidatureTelephone();

            $.ajax({
               url: atomejoboffer.ajax_url,
               type:"POST",
               data: {
                action: 'jobapplicationtelephonevalidate',
                security: 'atomejoboffer.ajax_nonce',
                post:params
               },
               dataType: "json",
               success: function( data ) {
                  $('.box-alert').hide();
                  // Code d'erreur interne
                   if(data.Code){
                         switch(data.Code){
                           // l'utilisateur a déjà postulé à cette offre
                           case "013":
                               $('#form-fill-cv').before('<div class="box-alert"><h2>Vous avez déjà postulé à cette offre.</h2></div>');
                               break;
                           // erreur FTP
                           case "550":
                               $('#form-fill-cv').before('<div class="box-alert"><h2>Une erreur technique est survenue, veuillez reprendre votre candidature depuis le début.</h2></div>');
                               break;
                           default:
                               $('#form-fill-cv').before('<div class="box-alert"><h2>Une erreur technique est survenue</h2></div>');
                               break;
                         }
                         removeLoadingCandidatureTelephone();
                         $('body,html').animate({scrollTop:0},800);
                     }
                         //removeLoadingCandidatureTelephone();
                         // Redirection (cas Ok ou page d'erreur)
                     if(data.nextstep){
                             window.location.href = window.location.href.replace(data.step.toLowerCase(),data.nextstep);
                     }
               }
            });
            /* OFFER RESUME */
            if($('.widget-offer-resume').length){
		$('.widget-offer-resume .offer-rte').hide();
		$('.widget-offer-resume .bt-more').on('click',function(event){
			event.preventDefault();
			if($(this).hasClass('active')){
				$('.widget-offer-resume .offer-rte').slideUp('fast');
				$(this).removeClass('active');
			}else{
				$('.widget-offer-resume .offer-rte').slideDown('fast');
				$(this).addClass('active');
			}
		});
            }
            $('.a-apply-with-cv').on('click',function(event){
			event.preventDefault();
			$(this).parent().toggleClass('li-cv-active');
			$(this).parent().find('.c').toggle();
			$('.li-phone').removeClass('li-phone-active').find('.c').hide();
	    });
    }
    //message de chargement
    function addLoadingCandidatureTelephone(){
        jQuery('body,html').animate({scrollTop:0},300);
        $racine = jQuery('body');
        $racine.append('<div class="overlay"></div>');
        $racine.append('<div class="popin-loading shadow"><h3>Traitement en cours</h3><div class="c"><p class="update">Votre candidature est en cours de traitement...</p><p class="wait">Veuillez patienter...</p></div></div>');
        var h = $racine.height();
        $racine.find('.overlay').css({
                            'display'   : 'none',
                            'position'    : 'absolute',
                            'background'  : '#ffffff',
                            'top'     : 0,
          'left'      : 0,
          'width'     : '100%',
          'height'    : h,
                            'z-index' : 80000
        }).fadeTo(500,0.8);
        $racine.find('.popin-loading').fadeIn(500);
    }

    function removeLoadingCandidatureTelephone(){
      $( '.overlay' ).fadeOut();
      $( '.popin-loading' ).fadeOut();
      $('li').removeClass('li-phone-active li-cv-active');
      $('.c').hide();
    }

 });
