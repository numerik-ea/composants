jQuery(document).ready(function($){
    /* MOBILE ACCOUNT MENU */
    if($('.account-menu').length){
            var tpl = '';
            $.each($('.account-menu li a'),function(i,e){
			var url = $(e).attr('href');
			var a = $(e).html();
			var selected = '';
			if($(e).hasClass('active')){
				selected = ' selected="selected"';
			}
			tpl+='<option value="'+url+'" '+selected+'>'+a+'</option>';
            });
            $('.account-menu').after('<select class="account-menu-mobile">'+tpl+'</select>');
            $('.account-menu-mobile').on('change',function(event){
            window.location.href = $(this).val();
	});
    }

    $('.a-account').on('click',function(event){
            $menu = $('.menu-account li ul');
                if($('.wrapper').width() <= 638 && $menu.length){
                        event.preventDefault();
			if($(this).hasClass('active')){
				$(this).removeClass('active');
				$menu.slideUp('fast');
			}else{
				$(this).addClass('active');
				$menu.slideDown('fast');
			}
			if($('.a-mobile-menu').hasClass('active')){
				$('.a-mobile-menu').removeClass('active');
				$('.nav .menu').slideUp('fast');
			}
		}
	});

    /*** Formulaire de création de compte avec validation des champs ***/
    if($('#form-create-account').length){
                $rules = {
			TitleID: {
				required: true,
				valueNotEquals: "0"
			},
			LastName: {required: true},
			FirstName: {required: true},
			Email: {
				required: true,
				email: true
			},
			ConfirmEmail : {equalTo: '#id_Email'},
			Password: {
				required: true,
				mdp:true
			},
			ConfirmPassword: {equalTo: '#id_Password'},
			CGU: {required: true}
		};
		$messages = {
			TitleID: "La civilité est obligatoire",
			LastName: {required: "Le nom est obligatoire"},
			FirstName: {required: "Le prénom est obligatoire"},
			Email: {
				required: "L'email est obligatoire",
				email: "L'email n'est pas valide"
			},
			ConfirmEmail: {equalTo: 'Les emails ne sont pas identiques'},
			Password : {required: 'Le mot de passe est obligatoire'},
			ConfirmPassword : {equalTo: 'Les mots de passe ne sont pas identiques'},
			CGU: {required: "Vous devez accepter les Conditions Générales d'Utilisation"}
		};
                $('body').delegate('form#form-create-account button','click',function(e){
                    $('#form-create-account').validate({
                            submitHandler: function() {
                                $(".box-alert").remove();
                                $.ajax({
                                url: atomeuserajax.ajax_url,
                                type:"POST",
                                data: {
                                   action: 'register',
                                   security: atomeuserajax.ajax_nonce,
                                   post:$('#form-create-account').serialize()
                                },
                                dataType: "json",
                                success: function( data ) {
                                    // Redirection (cas Ok ou page d'erreur)
                                    if(data.redirect){
                                        window.location.href=data.redirect;
                                    }else if (data.reload) {
                                        window.location.reload();
                                    }else{
                                        // Code d'erreur interne
                                        if(data.Code){
                                            switch(data.Code){
                                                // Email déjà existant
                                                case "002":
                                                    $('#id_Email').addClass("error");
                                                    $('#id_Email').after('<small class="error" for="id_Email">'+data.Message+'</small>');
                                                    break;
                                                // Autre, message d'alerte
                                                default:
                                                    $('#form-create-account').before('<div class="box-alert"><h2>'+data.Message+'</h2></div>');
                                                break;
                                            }
                                        }
                                    }
                                }
                             });
                            },
                            errorElement : 'small',
                            errorPlacement : function(error, element){
                                    if($(element).parents().hasClass('row-skills')){
                                            $('.skills-required').after(error);
                                    }else{
                                            $(element).parent().append(error);
                                    }
                            },
                            rules: $rules,
                            messages: $messages
                    });
                });
	}

        /*** Popin de connexion ***/
	if($(".popinlogin").length) {$("a.popinlogin").on("click", function(e){
			e.preventDefault(e);
			var slug = $(this).data("slug");
                        // Cas "définir comme mon agence"
                        var idagency=null;
                        if($(this).hasClass('a-define-agency')) {
                            idagency = $(this).data('id-agency');
                        }
                        popinlogin(slug,idagency);
		})
	}

        /*** Formulaire de connexion avec validation des champs ***/
        $('body').delegate('form#login button','click',function(event){
            $('form#login').validate({
                    submitHandler: function() {
                        $(".box-alert").remove();
                        $.ajax({
                        url: atomeuserajax.ajax_url,
                        type:"POST",
                        data: {
                           action: 'login',
                           security: atomeuserajax.ajax_nonce,
                           email:$("form#login #id_Email").val(),
                           password:$("form#login #id_Password").val(),
                           auto:$("form#login #id_AutoConnexion:checked").val(),
                           onlogin:($("form#login #onlogin").length?$("form#login #onlogin").val():''),
                           idagency:($("form#login #idagency").length?$("form#login #idagency").val():'')
                        },
                        dataType: "json",
                        success: function( data ) {
                            if(data.redirect){
                                // Plusieurs CVs
                                if(data.multiplecv){
                                    $.fancybox({
					openEffect  : 'none',
					closeEffect : 'none',
					margin: 0,
					padding: 0,
					closeBtn: false,
					content : data.popin,
                                        afterClose:function(event){
                                            window.location.href=data.redirect;
                                        }
                                    });
                                }else {
                                    window.location.href=data.redirect;
                                }
                            } else if(data.onlogin) {
                                if (data.onlogin === 'popin-save-search') {
                                    document.location.reload();
                                    /*$('a.a-save-search, button.a-save-search').data('slug', '');
                                    $('a.a-save-search').trigger('click');*/
                                }
                            }
                            else{
                               // Code d'erreur interne
                               if(data.Code){
                                    $('#login').before('<div class="box-alert"><h2>'+data.Message+'</h2></div>');
                               }
                            }
                        }
                     });
                    },
                    errorElement : 'small',
                    rules : {
                            Email : {
                                    required: true,
                                    email : true
                            },
                            Password : {required: true}
                    },
                    messages : {
                            Email : {
                                    required: "L'email est obligatoire",
                                    email: "L'email n'est pas valide"
                            },
                            Password : {required: "Le mot de passe est obligatoire"}
                    }
            });
        });

        /* Changement de password */
        if($('#form-retrieve-password').length){
		$rules = {
			Email: {
				required: true,
				email: true
			}
		};
		$messages = {
			Email: {
				required: "L'email est obligatoire",
				email: "L'email n'est pas valide"
			}
		};
		$('#form-retrieve-password').validate({
			errorElement : 'small',
			errorPlacement : function(error, element){
				$(element).parent().append(error);
			},
			rules: $rules,
			messages: $messages,
                        submitHandler: function() {
                            $(".box-alert").remove();
                            $(".box-confirmation").hide();
                            $.ajax({
                                url: atomeuserajax.ajax_url,
                                type:"POST",
                                data: {
                                   action: 'newpassword',
                                   security: atomeuserajax.ajax_nonce,
                                   data : $('#form-retrieve-password').serialize()
                                },
                                dataType: "json",
                                success: function( data ) {
                                    if(data!== null && data.ok){
                                        $(".box-confirmation").show();
                                    }else{
                                       // Code d'erreur interne
                                       if(data!== null && data.Code){
                                           $('#form-retrieve-password').before('<div class="box-alert"><h2>'+data.Message+'</h2></div>');
                                       }else{
                                           $('#form-retrieve-password').before('<div class="box-alert"><h2>Une erreur s\'est produite</h2></div>');
                                       }
                                    }
                                }
                         });
                        }
		});
	}

        /* DEFINE AS MY AGENCY */
        $('.a-define-agency').on('click',function(event){
            event.preventDefault();
            $this = $(this);
            if(!$(this).hasClass('a-login-required') && !$(this).hasClass('defined-agency')){
                var id = $(this).data('id-agency');
                var userid = $(this).data('id-user');
                $.ajax({
                    url: atomeuserajax.ajax_url,
                    dataType:"json",
                    type:"POST",
                    data : {
                        action:'defineagency',
                        security: atomeuserajax.ajax_nonce,
                        user:userid,
                        idagency:id
                    },
                    success : function(cb){
                        if(cb.code===1){
                            $this.blur().html('Mon agence').addClass('defined-agency');
                            $('.agency-sheet .title').before('<div class="box-confirmation" style="display:none;"><p>'+cb.message+'</p></div>');
                            $('.box-confirmation').slideDown(250).delay(4000).slideUp(250,function(){
                                $('.box-confirmation').remove();
                            });
                        }
                    }
                });
               }
	});

        /* AJOUT A LA SELECTION */
	$('body').delegate('.a-add-to-selection','click',function(event){
        
		event.preventDefault();
		if(!$(this).hasClass('added-to-selection')){
                        var site = null;
                        if ($(this).data('site') !== undefined) {
                            site = $(this).data('site');
                        }
			var e = $(this).parents('.item');
			if(!e.length){
				var e = $(this).parents('main').find('.offer-title');
				var css = 'offer-title';
			}else{
				var css = e.parents('ul').attr('class');
			}
			$this = $(this);
			var id = $(this).data('id');
                        var type = $(this).data('type');
                        var action = ($(this).data('type') === 'candidat') ? 'addcandidattoselection' : 'addtoselection';
			var clone = e.clone();
			var pos = e.offset();
			var w = e.width();
			var tpl = '<div id="clone-'+id+'" class="'+css+'" style="position:absolute; left:'+pos.left+'px; top:'+pos.top+'px;width:'+w+'px; margin:0; background:#ffffff;">'+clone.html()+'</div>';
			$('body').append(tpl);
			var target = $('#target-selection');
			var posTarget = target.offset();
			$('#clone-'+id).animate({
				top : posTarget.top,
				left : posTarget.left - (w/2),
				opacity : 0
			},{
				duration : 1000,
				complete:function(){
					$('#clone-'+id).remove();
					$.ajax({
						url: atomeuserajax.ajax_url,
						dataType:"json",
						data : {
                                                    action:action,
                                                    security: atomeuserajax.ajax_nonce,
                                                    id:id,
                                                    site:site
                                                },
						context: document.body,
						success : function(cb){
                                                    if(cb.code===1){
                                                        if($this.data('type') =='candidat') {
                                                            $this.blur().html('dans ma sélection').addClass('added-to-selection');
                                                        } else {
                                                            $this.blur().html('Dans ma sélection').addClass('added-to-selection');
                                                        }

                                                        $('#count-selection').html("("+cb.total+")");
                                                        if($('.wrapper').width() > 307){ $('#count-selection').html('('+cb.total+')').css('display', 'inline-block').blink(2,125); }
							if($('.offers-list').length){
								$(e).find('.c').append('<div class="box-confirmation"><p>'+cb.message+'</p></div>');
								$(e).find('.box-confirmation').animate({
									bottom : 0
								},250).delay(4000).animate({
									bottom : '-100px'
								},250,function(){
									$(e).find('.box-confirmation').remove();
								});
							}else{
								var box = '<div class="box-confirmation" style="display:none;"><p>'+cb.message+'</p></div>';
								if($(e).find('.c').length){
									$(e).find('.c').after(box);
								}else{
									$('.offer-title').before(box);
								}
								$('.box-confirmation').slideDown(250).delay(4000).slideUp(250,function(){
									$('.box-confirmation').remove();
								});
							}
                                                    }else{
                                                        var box = '<div class="box-alert" style="display:none;"><h2>'+cb.message+'</h2></div>';
								if($(e).find('.c').length){
									$(e).find('.c').after(box);
								}else{
									$('.offer-title').before(box);
								}
								$('.box-alert').slideDown(250).delay(4000).slideUp(250,function(){
									$('.box-alert').remove();
								});
                                                    }
						}
					});
				}
			});
		}
	});

        /* SUPPRESSION DE LA SELECTION */
	$('.offers-list-offer .a-delete-selection, .offers-list .a-delete-selection').on('click',function(event){
            if (confirm('Êtes-vous certain de vouloir retirer cette offre de votre sélection ?')) {
                event.preventDefault();
                var offerId = $(this).data('id-offer');
                var site = null;

                if ($(this).data('site') !== undefined) {
                    site = $(this).data('site');
                }
                $.ajax({
                    url: atomeuserajax.ajax_url,
                    dataType: "json",
                    type: "POST",
                    data : {
                        action: 'deleteUserOffer',
                        security: atomeuserajax.ajax_nonce,
                        offerId: offerId,
                        site: site
                    },
                    success : function(data) {
                        if (data.ok) {
                            window.location.reload();
                        }
                        else if(data.redirect) {
                            window.location.href = data.redirect;
                        }
                        // Code d'erreur interne
                        else if(data.Code) {
                            $('.col-account-selection').before('<div class="box-alert"><h2>' + data.Message + '</h2></div>');
                        }
                    }
                });
            } else {
                    event.preventDefault();
            }
	});

    $('.offers-list-clients .a-delete-selection').unbind( "click" );

        /* SUPPRESSION D'UN CANDIDAT DE LA SELECTION */
        $('.offers-list-clients .a-delete-selection').on('click',function(event){

            var nbCandidates = $( '.results-title-1 h1' ).text();
            nbCandidates = nbCandidates.search( '13');

            if (confirm('Êtes-vous certain de vouloir supprimer ce candidat ?')) {
                event.preventDefault();
                var candidatId = $(this).data('id-candidat');
                var site = null;
                if ($(this).data('site') !== undefined) {
                    site = $(this).data('site');
                }
                $.ajax({
                    url: atomeuserajax.ajax_url,
                    dataType: "json",
                    type: "POST",
                    data : {
                        action: 'deleteUserCandidat',
                        security: atomeuserajax.ajax_nonce,
                        candidatId: candidatId,
                        site: site
                    },
                    success : function(data) {
                        if (data.ok) {
                            if( nbCandidates == 0 )
                            {
                                var url = window.location.href;
                                url = url.replace( '2', '1' );

                                window.location.href = url;
                            }
                            else
                            {
                                window.location.reload();
                            }
                        }
                        else if(data.redirect) {
                            window.location.href = data.redirect;
                        }
                        // Code d'erreur interne
                        else if(data.Code) {
                            $('.col-account-selection').before('<div class="box-alert"><h2>' + data.Message + '</h2></div>');
                        }
                    }
                });
            } else {
                event.preventDefault();
            }
        });

});

function popinlogin(slug, idagency, onlogin){
    var params = {
        action: 'popinlogin',
        security: atomeuserajax.ajax_nonce,
        slug : slug
    };
    if (idagency!==null) params.idagency = idagency;
    if (onlogin !== null) params.onlogin = onlogin;
    jQuery.get(
            atomeuserajax.ajax_url,
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
}