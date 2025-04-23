    /*
     * Changement de la page de recherche
     * @param {type} select
     */
    function _chargeNouvellePage(select){
        var opt = select.options[select.selectedIndex].value;
        window.location.href=opt;
    }
    
    
jQuery(document).ready(function(){
  jQuery("#field_dossier").attr("readonly","true");
  jQuery("#field_datecrea").attr("readonly","true");        
  jQuery("#field_dossier").attr("readonly","true");
});

function gopdf($j) {		
    var id1=document.forms['form_frmproapplication2'].elements['field_dossier'].value;	              
    document.location.href =("/dossier-de-candidature   ?id=" + id1 +  "&pdf="+ $j);                                 
}

function chqgopdf() {		
    var id1=document.forms['form_frmproapplication2'].elements['field_dossier'].value;	              
    document.location.href =("/dossier-de-candidature   ?id=" + id1 +  "&chpdf=1");                                 
}