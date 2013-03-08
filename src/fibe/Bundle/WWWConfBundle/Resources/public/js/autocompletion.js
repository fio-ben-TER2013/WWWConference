   $(document).ready(function() {
   
   var $prefix = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX dcterms: <http://purl.org/dc/terms/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX swrc: <http://swrc.ontoware.org/ontology#> PREFIX swrc-ext: <http://www.cs.vu.nl/~mcaklein/onto/swrc_ext/2005/05#> PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>';
 var $conferenceYear = "http://data.semanticweb.org/conference/www/2012/proceedings";

  
  //Request for recover publication's uri,title, author(name)
    var $querySuggestionAuthorTitle = $prefix +'SELECT DISTINCT ?uriPaper ?title ?name   WHERE  {     '+
					         '   ?author        foaf:name       ?name.         '+
					         '   ?author        foaf:made       ?uriPaper.     '+
					         '   ?uriPaper      dc:title        ?title.        '+
                             '   ?uriPaper      swc:isPartOf    <'+$conferenceYear+'>.'+
                             '} '; 
			
 //Autocomplete input val 
    var autoCompleteValue = "";
 
    //Set of all publication recover with the request define in PubliConfig.js [index][attributPubli]
    var $publications= [ ];

//Pick autocomplete input value each keyup
 $('#titreAuteur').keyup(function(){ 
			    autoCompleteValue = $(this).val();  
    }).keyup();

	 var  $sourcePubli =  'http://data.semanticweb.org/sparql';
 //Ajax request on publication source, defined by PubliConfig
     $.ajax({ 
		    type : "get",
            url: $sourcePubli,
            dataType: 'xml', 
		    data :  {output : 'xml' ,query : $querySuggestionAuthorTitle},
		    global :'false',
		    async:'false',
		    success : function(xml){ 
				          storePoster(xml);
		              } 
	    }); 
	    
//Storage of all Publication recover by the previous ajax, in the $publications array (function call in ajax)
function storePoster(xml){
        var i=0;
	    $(xml).find("sparql > results > result").each(function(){
	        if(i!=0 && $(this).find("binding[name='uriPaper'] :first-child").text()==$publications[i-1]['uri']){ 
	            //si la publi a plusieurs auteurs
	            $publications[i-1]['value']+=",  "+$(this).find("binding[name='name'] :first-child").text(); 
	        }else{
	            $publications[i]={ value: "", uri: ""  }
	             $(this).find("binding").each(function(){
	                if($(this).attr("name")=="uriPaper"){
	                    $publications[i]['uri']=$(this).find(":first-child").text();
	                }else if($(this).attr("name")=="title"){
	                    $publications[i]['value'] = $(this).find(":first-child").text();
	                }else if($(this).attr("name")=="name"){
	                    $publications[i]['value']+=" BY : "+$(this).find(":first-child").text();
	                }
	             });
	             
	             i++; 
	         }
        }); 
    }

  //Autocompletion in the input with id="titreAuteur".
    $("#titreAuteur").autocomplete({
					    autoFocus: true,
                        source: $publications,
                        delay: 0,
                        minLength: 1,
                        maxLength: 10,
                        select: function (event, ui) { 
                            $("#idci_bundle_simpleschedulebundle_xpropertytype_xvalue").val(ui.item.uri).addClass("inputSuccess");
							$('#form_xvalue').val(ui.item.uri);
                            $("#uriLink div").removeClass("warning").addClass("success");
                            $("#submitLinkButton").removeAttr("disabled").removeClass("disabled") ;
                        }
    });
   
 });
