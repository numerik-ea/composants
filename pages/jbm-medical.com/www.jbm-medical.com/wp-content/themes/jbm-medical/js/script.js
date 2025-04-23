jQuery(document).ready(function($) { // DOM ready
        var count = 1;
	$( '#add-filleul' ).click(function(){
            count++;		
            $( '.filleul'+count).show();  
            return false;
	});        
        $( "#add-filleul" ).hover(
            function() {
                $( this ).append( $( "<span>&nbsp;&nbspAJouter un filleul</span>" ) );
            }, function() {
                $( this ).find( "span" ).last().remove();
            }
        );
    
    
    
    
	$('a[href="#top"]').click(function(e) {
		e.preventDefault();
		$('body,html').animate({scrollTop:0},800);
	});

	/* chargement du footer */
	// if ( $( '.footer .footer-1' ).length ) {
	// 	$.ajax({
	// 		url: themescript.ajax_footer_url,
	// 		type:"GET",
	// 		data: {
	// 			security: themescript.ajax_nonce
	// 		},
	// 		success: function( data ) {
	// 			$( '.footer .footer-1' ).html(data);
	// 		}
	// 	});
	// }

	/* Placeholder IE8- */
	if(!Modernizr.input.placeholder) {
		function fakePlaceholder($inputs) {
			$("input, textarea").each(function(e){
				var $this = $(this);
				if($this.attr("placeholder") && $this.val() == "") {
					$this.val($this.attr("placeholder")).addClass("placeholder");
				}
				$this
				.on("focus", function(e){
					if($this.val() == $this.attr("placeholder")) {
						$this.val("").removeClass("placeholder");
					}
				})
				.on("blur", function(e){
					if($this.val() == "") {
						$this.val($this.attr("placeholder")).addClass("placeholder");
					}
				});
			});
		}
		fakePlaceholder($("input, textarea"));
	}

	/* MOSAIC */
	$.each($('.mosaic aside'),function(i,e){
		if(i%2){
			$(e).after('<div class="clearfix"></div>');
		}else{

		}
	});

	/* MENU SITE MOBILE */
	if($('.menu-site').length){
		var tpl = '<div class="top-menu"><nav class="wrapper clearfix"><ul>';
		$.each($('.menu-site a'),function(i,e){
			$txt = $(e).html();
			$a = $(e).attr('href');
			$css = '';
			if($(e).hasClass('active')){
				$css = ' class="active"';
			}
			tpl+= '<li><a href="'+$a+'"'+$css+'>'+$txt+'</a></li>';
		});
		tpl+= '</ul></nav></div>';
		$('.header').before(tpl);
	}

	/* SUBMENU FOR IPAD */
	/* SUBMENU FOR IPAD */
	if($('.sub-menu').length){
		$(window).on('load resize',function(event){
			if($('.wrapper').width() == 748){
				var a = Array();
				$.each($('.menu-item'),function(i,e){
					a.push($(e).width());
					var l = 0;
					if($(e).find('.sub-menu') && i!= 0){
						for(cpt=0;cpt<i;cpt++){
							l = l+a[cpt];
						};
						$(e).find('.sub-menu').css({
							'left' : '-'+l+'px',
							'width' : '706px'
						});
					}
				});
			}else{
				$('.sub-menu').css({
					'left' : '',
					'width' : ''
				});
			}
		});
	}

	/* FIXING NAV LEFT */
	if($('.subnav-left.fixable').length){
		$menu = $('.subnav-left');
		posMenu = $menu.offset().top;
		$(window).on('scroll',function(event){
			if($('.wrapper').width() > 748){
				w = $menu.width();
				posBody = $('body').scrollTop();
				if(posBody > posMenu){
					$menu.css({
						width : w+'px',
						position : 'fixed',
						top:'10px'
					});
					$('.rte').parent().css({
						paddingLeft: w+parseInt($('.gp').css('margin-left'))+'px'
					});
				}else{
					$menu.css({
						position : 'relative',
						width : 'auto'
					});
					$('.rte').parent().css({
						paddingLeft: 0
					});
				}
			}else{
				$menu.css('width','auto');
			}
		});
		$(window).on('resize',function(event){
			if($('.wrapper').width() <= 748){
				$menu.css({
					position : 'relative',
					width : 'auto'
				});
				$('.rte').parent().css({
					paddingLeft: 0
				});
			}
		});
	}

	/* MOBILE MENU */
	$('.a-mobile-menu').on('click',function(event){
		event.preventDefault();
		$menu = $('.nav .menu');
		if($(this).hasClass('active')){
			$('.nav').removeClass('nav-active');
			$(this).removeClass('active');
			$menu.slideUp('fast');
		}else{
			$('.nav').addClass('nav-active');
			$(this).addClass('active');
			$menu.slideDown('fast');
		}
		if($('.wrapper').width() <= 638 && $('.a-account').hasClass('active')){
			$('.a-account').removeClass('active');
			$('.menu-account li ul').slideUp('fast');
		}
	});
	$('.a-mobile-smenu').on('click',function(event){
		event.preventDefault();
		$menu = $('.selectify');
		if($(this).hasClass('active')){
			$(this).removeClass('active');
			$menu.slideUp('fast');
		}else{
			$(this).addClass('active');
			$menu.slideDown('fast');
		}
	});
	$(window).on('resize load',function(){
		if($('.wrapper').width() >= 748){
			$('.nav .menu').show();
		}
		if($('.wrapper').width() <= 748){
			$('.subnav-blog .selectify').removeClass('subnav').addClass('subnav-left');
			$('.a-mobile-smenu').removeClass('active');
			$('.selectify').hide();
		}else{
			$('.selectify').show();
			$('.subnav-blog .selectify').removeClass('subnav-left').addClass('subnav');
		}
		if($('.wrapper').width() <= 638){
			$('.nav').removeClass('nav-active');
			$('.a-mobile-menu').removeClass('active');
			$('.nav .menu').hide();
		}
		if($('.wrapper').width() > 638 && $('.menu-account li ul:visible').length){
			$('.a-account').removeClass('active');
			$('.menu-account li ul').hide();
		}
	});

	/* SLIDER */
	$.each($('.slider-container'),function(i,container){
		var pager = $(container).find('.slider-pager').attr('id');
		var prev = $(container).find('.previous').attr('id');
		var next = $(container).find('.next').attr('id');
		$(container).find('.slider').carouFredSel({
			circular : true,
			responsive	: true,
			padding : 0,
			items : {
				visible		: 1,
				width		: 766,
				height		: '45%'
			},
			scroll : {
				duration : 1000
			},
			auto : true,
			pagination	: {
				container : '#'+pager,
				anchorBuilder : function( nr ) {
					var alt = $('img', this).attr('alt');
					return '<li><span>'+alt+'</span></li>';
				}
			},
			prev : {
				button	: '#'+prev,
				key		: 'left'
			},
			next : {
				button	: '#'+next,
				key		: 'right'
			},
			onCreate : function(data){
				resizeSlider();
			}
		});
		$(window).resize(function(){
			resizeSlider();
		});
		function resizeSlider(){
			var w = $('.slider-container').width();
			if($('.wrapper').width() > 638){
				var new_h = w*0.45;
			}
			if($('.wrapper').width() == 954){
				var new_h = 344;
			}
			if($('.wrapper').width() == 638){
				var new_h = 470;
			}
			if($('.wrapper').width() == 470){
				var new_h = 400;
			}
			if($('.wrapper').width() == 307){
				var new_h = 340;
			}
			if(new_h){
				$('.slider').css({
					height:new_h
				});
				$('.slider-container').find('.caroufredsel_wrapper, .slider, .item').css({
					height:new_h
				});
			}
		};

	});

	// Compteur textarea
	$(".count-area").each(function(i,e){
		var $this = $(this);
		var msg =  "<strong>0</strong> sur "+$this.data("count-max")+" caractères max.";
		if($this.data("count-min") > 1)
			msg += " ("+$this.data("count-min")+" caractères min.)";
		$this.append(msg);

		var $textarea = $("#"+$this.attr("id").substring(0, $this.attr("id").indexOf("-")));

		$textarea.on("keyup focus blur", function(e){
			var $text = $(this);
			$this.children().html(parseInt($text.val().length));
		});
	});

	/* LINKS */
	if($('.links-list').length){
		$('.links-list .items').hide();
		$('.links-list .action').on('click',function(event){
			if(!$(this).hasClass('active')){
				$('.links-list .action').removeClass('active');
				$(this).addClass('active');
				$('.links-list .items').slideUp('fast');
				$(this).next('.items').slideDown('fast');
			}else{
				$(this).removeClass('active');
				$(this).next('.items').slideUp('fast');
			}
		});
	}
    
        /* SCROLL */
        $('.scroll-to').click(function(event){
        event.preventDefault();
        url = $(this).attr('href');
        hash = url.substring(url.indexOf('#'));
        var t = $(hash).offset().top;
        $('body,html').animate({scrollTop:t+'px'},800);
        });
        
	/* Shortcodes onglets*/
	if($(".sc-tabs").length){
		$(".sc-tabs .sc-tabs-list a").on("click", function(e){
			e.preventDefault();
			$this = $(this);
			$this.addClass("active").parent().siblings().children().removeClass("active");
			$($this.attr("href")).addClass("active").siblings().removeClass("active");
		})
	}

	/* POPIN LAUNCH CHATBOT */
	$(document).delegate('.a-launch-chatbot','click',function(event){
		event.preventDefault();
		$('.popin-launch-chatbot').fadeIn('fast',function(){
			$('.popin-launch-chatbot').delay(5000).fadeOut('fast');
		});
	});
        
        $(document).delegate(".popin .close", "click", function(e)
        {            
            $.fancybox.close();
            e.preventDefault();
        });    
        /* AUTOPOPIN */
        if($('.auto-popin').length){
            slug = $('.auto-popin').data('slug');
            if($('#'+slug).length){
                $.fancybox({
                    openEffect  : 'none',
                    closeEffect : 'none',
                    margin: 0,			
                    padding: 0,
                    closeBtn: false,
                    content:$('#'+slug)
                });
            }
        }

});
/* EXTEND JQUERY */
(function($){
	/* BLINK */
	$.fn.blink = function(nb,duree){
		for(i=0;i<nb;i++){
			$(this).fadeOut(duree).fadeIn(duree);
		}
	};

})(jQuery);
