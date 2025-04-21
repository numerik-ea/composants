    jQuery(document).ready( function($) {
// SEARCH
$('.click').click(function(e){
    var str = $('#id_What').val();    
    var placeholder = $('#id_area option:selected').attr('class')
    var brandId= $('#brand').val()
    var url = $('#url').val()
    var id_area_id = $('#id_area_id').val();
    //var nlc =$("#id_area option:selected").text();
    //var nlc =$('#id_area_id').val();
    //var nlc =$(".id_locations_api option:selected").text();
    var nlc =$("#id_locations_api").val();
    var valuSwitch = str.substring(0,3);

    switch(valuSwitch){
        case '001':
        case '307':
        case '398':
        case '010':
        case '128':
        case '286':
        case '091':
        case '054':
            window.location.href=window.origin+'/'+url+'/'+str+'/';
            break;
        default:

        var map = {      
            '-' : '_',
            '_' : ' ',
            ''  : ',',  
            ''  : "'",
            'a' : 'á|à|ã|â|À|Á|Ã|Â',
            'e' : 'é|è|ê|É|È|Ê',
            'i' : 'í|ì|î|Í|Ì|Î',
            'o' : 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
            'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
            'c' : 'ç|Ç',
            'n' : 'ñ|Ñ'
        };
        str = str.toLowerCase();
        nlc = nlc.toLowerCase();
        url = url.toLowerCase();
        if(brandId == 3 || brandId == 6){
            var location = $('input[name=locations_api]').val()
            var where_name = location.toString()+'/'
        }else{
            var location = $('#id_area').val()
            var where_name = nlc.toString()+'/'
        }
        for (var pattern in map) {

             str = str.replace(new RegExp(map[pattern], 'g'), pattern);
             nlc = nlc.replace(new RegExp(map[pattern], 'g'), pattern);
             location = location.replace(new RegExp(map[pattern], 'g'), pattern);
             where_name = where_name.replace(new RegExp(map[pattern], 'g'), pattern);


                        if( (nlc != "" || location != "" )&& placeholder != "placeholder" )
                          {                         
                             $('#nlc').val(nlc)                                 
                             where_name=where_name.replace(/["'()]/g,"");

                         }else{
                             where_name = ""
                         }
                         if( location != "")
                         {                               
                                if(brandId == 3 || brandId == 6){
                                        var  where=id_area_id+'/';
                                 }else{
                                        var  where = location.toString()+"/";
                                 }
                         }else{
                             where = ""
                         }
                   if(str != "")
                   {
                        $('#id_What').val(str)
                        $('#id_What').val(" ")

                        if(str.charAt(str.length - 1)==" " || str.charAt(str.length - 1)=="_" )
                        {
                         str = str.substring(0, str.length - 1); 
                        }
                        if(str.charAt(0)==" " || str.charAt(0)=="_"){
                         str = str.substring(1); 
                        }
                   }else{
                         str = "all"
                         $('#id_What').val(str)
                         $('#id_What').val(" ") 
                   }
          };

         str=str.replace(/["'()]/g,"_");
         str=str.replace(/["'-]/g,"_");
         str=str.replace(/["'/]/g,"_");
         str=str.replace(/["'.]/g,"");
         str=str.replace(/["',]/g,"");
         url= url.substring(1);
                window.location.href=window.origin+'/'+url+'/'+str+'/'+where+where_name;
    }
});

$(document).on("keyup", function(e) {
    var key = e.which;
    if (key == 13) {
        var str = $('#id_What').val();

        var nlc =$("#id_area option:selected").text();
        var placeholder = $('#id_area option:selected').attr('class');
        var brandId= $('#brand').val();
        var url = $('#url').val();
        url = url.substring(1);
        var id_area_id = $('#id_area_id').val();
        var valuSwitch = str.substring(0,3);

        switch(valuSwitch){
            case '001':
            case '307':
            case '398':
            case '010':
            case '128':
            case '286':
            case '091':
                window.location.href=window.origin+'/'+url+'/'+str+'/';
            break;
            default:

              var map = {      
                '-' : '_',
                '_' : ' ',
                ''  : ',',  
                ''  : "'",
                'a' : 'á|à|ã|â|À|Á|Ã|Â',
                'e' : 'é|è|ê|É|È|Ê',
                'i' : 'í|ì|î|Í|Ì|Î',
                'o' : 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
                'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
                'c' : 'ç|Ç',
                'n' : 'ñ|Ñ'
            };
            str = str.toLowerCase();
            nlc = nlc.toLowerCase();           
            if(brandId == 3 || brandId == 6){
                var location = $('input[name=locations_api]').val();
                var where_name = location.toString()+'/';
            }else{
                var location = $('#id_area').val();
                var where_name = nlc.toString()+'/';
            }
            for (var pattern in map) {
                str = str.replace(new RegExp(map[pattern], 'g'), pattern);
                nlc = nlc.replace(new RegExp(map[pattern], 'g'), pattern);
                location = location.replace(new RegExp(map[pattern], 'g'), pattern);
                where_name = where_name.replace(new RegExp(map[pattern], 'g'), pattern);
                if( (nlc != "" || location != "" )&& placeholder != "placeholder" )
                  {
                       $('#nlc').val(nlc)
                       where_name=where_name.replace(/["'()]/g,"");
                }else{
                     where_name = ""
                }
                if(  location != "")
                {
                        if(brandId == 3 || brandId == 6){
                             var  where=id_area_id+'/';
                         }else{
                           var  where = location.toString()+"/";
                         }
                }else{
                    where = ""
                }
                if(str != "")
                {
                     $('#id_What').val(str)
                     $('#id_What').val(" ")

                     if(str.charAt(str.length - 1)==" " || str.charAt(str.length - 1)=="_" )
                     {
                      str = str.substring(0, str.length - 1); 
                     }
                     if(str.charAt(0)==" " || str.charAt(0)=="_"){
                      str = str.substring(1); 
                     }
                }else{
                      str = "all"
                      $('#id_What').val(str)
                      $('#id_What').val(" ") 
                }
             };
            str=str.replace(/["'()]/g,"");
            str=str.replace(/["'-]/g,"_");
            str=str.replace(/["',]/g,"");
            str=str.replace(/["'.]/g,"");
            window.location.pathname = url+'/'+str+'/'+where+where_name
            }
        }
  })
  
  })

//function touch enter
function linkPress(){
$(document).on("keypress", function(e) {
    var key = e.which;
    if (key == 13) {
        var str = $('#id_What').val();

        var nlc =$("#id_area option:selected").text();
        var placeholder = $('#id_area option:selected').attr('class');
        var brandId= $('#brand').val();
        var url = $('#url').val();
        url = url.substring(1);
        var id_area_id = $('#id_area_id').val();
        var valuSwitch = str.substring(0,3);

        switch(valuSwitch){
            case '001':
            case '307':
            case '398':
            case '010':
            case '128':
            case '286':
            case '091':
                window.location.href=window.origin+'/'+url+'/'+str+'/';
            break;
            default:

              var map = {      
                '-' : '_',
                '_' : ' ',
                ''  : ',',  
                ''  : "'",
                'a' : 'á|à|ã|â|À|Á|Ã|Â',
                'e' : 'é|è|ê|É|È|Ê',
                'i' : 'í|ì|î|Í|Ì|Î',
                'o' : 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
                'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
                'c' : 'ç|Ç',
                'n' : 'ñ|Ñ'
            };
            str = str.toLowerCase();
            nlc = nlc.toLowerCase();           
            if(brandId == 3 || brandId == 6){
                var location = $('input[name=locations_api]').val();
                var where_name = location.toString()+'/';
            }else{
                var location = $('#id_area').val();
                var where_name = nlc.toString()+'/';
            }
            for (var pattern in map) {
                str = str.replace(new RegExp(map[pattern], 'g'), pattern);
                nlc = nlc.replace(new RegExp(map[pattern], 'g'), pattern);
                location = location.replace(new RegExp(map[pattern], 'g'), pattern);
                where_name = where_name.replace(new RegExp(map[pattern], 'g'), pattern);
                if( (nlc != "" || location != "" )&& placeholder != "placeholder" )
                  {
                       $('#nlc').val(nlc)
                       where_name=where_name.replace(/["'()]/g,"");
                }else{
                     where_name = ""
                }
                if(  location != "")
                {
                        if(brandId == 3 || brandId == 6){
                             var  where=id_area_id+'/';
                         }else{
                           var  where = location.toString()+"/";
                         }
                }else{
                    where = ""
                }
                if(str != "")
                {
                     $('#id_What').val(str)
                     $('#id_What').val(" ")

                     if(str.charAt(str.length - 1)==" " || str.charAt(str.length - 1)=="_" )
                     {
                      str = str.substring(0, str.length - 1); 
                     }
                     if(str.charAt(0)==" " || str.charAt(0)=="_"){
                      str = str.substring(1); 
                     }
                }else{
                      str = "all"
                      $('#id_What').val(str)
                      $('#id_What').val(" ") 
                }
             };
            str=str.replace(/["'()]/g,"");
            str=str.replace(/["'-]/g,"_");
            str=str.replace(/["',]/g,"");
            str=str.replace(/["'.]/g,"");
            window.location.pathname = url+'/'+str+'/'+where+where_name
            }
        }
  })
  }