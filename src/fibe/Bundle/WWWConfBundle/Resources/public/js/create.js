$(document).ready(function() {

/**
 *Parses SimpleSchedule event query JSON file 
 * then shows it in the <table> element
 */
$("#createEvent").submit(){

    var $data = $("#linkPublication").serialize();	
	//Requete ajax
	$.ajax({
			url: "calendar.labs.idci.fr/admin/schedule/event/create",
			type : "POST",
			data : $data,
			datatype : 'json',
			succes : 'link()',
			error : 'error'
    });

};

function error(){
	echo("Probleme dans l'envoie de la requête ajax");
};

function link(){
	//Div de message disant que tous c'est bien passer 
	$("#linkPublication").submit(){
		var $auteur = $("#auteur"),
			  $titre = $("#titre"),
			  $ID = $("#ID");
			 //On souhaite rceuperer l'URI correspondante de la publication
			 
			 //On edit un evenement et on lui ajoute le x property en question 
	)};
};

var $prefix = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX dcterms: <http://purl.org/dc/terms/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX swrc: <http://swrc.ontoware.org/ontology#> PREFIX swrc-ext: <http://www.cs.vu.nl/~mcaklein/onto/swrc_ext/2005/05#> PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>';
var $conferenceYear = "http://data.semanticweb.org/conference/www/2012/proceedings";

//Valeur du champ autoCompleté
var  autoCompleteValue = "";
//Resultat XML de la requete sparql sur semantiqueweb
var xmlResult;
//Ensemble des valeurs retourner par la requete sparql pour l'autocompletion
var $titres =[ ];
var $auteurs = [ ];
var $querySuggestionAuthor = $prefix +'SELECT DISTINCT ?name WHERE  {     '+
					 '   ?author foaf:name ?name.         '+
					 '   ?author foaf:made ?uriPaper.     '+
                                         '   ?uriPaper swc:isPartOf  <'+$conferenceYear+'>.      '+
					 '   FILTER REGEX( ?name , "'+ autoCompleteValue +'","i").'+
                                         ' } LIMIT 5 ';
var $querySuggestionTitle = $prefix+'SELECT DISTINCT ?title WHERE {   ' +
                                     '  	 ?uriPaper swc:isPartOf  <'+$conferenceYear+'>.'+
                                     '  	 ?uriPaper dc:title     ?title.         ' +
                                     '   FILTER REGEX( ?title , "'+ autoCompleteValue +'","i").'+
                                     ' } LIMIT 5 ';



//AutoCompletion pour les titres
$('#titre').keyup(function(){
			autoCompleteValue = $(this).val();
			$titres=[];
			selectTitle(autoCompleteValue);
			console.log('titres='+$titres);
}).keyup();

//AutoCompletion pour les titres
$('#auteur').keyup(function(){
			autoCompleteValue = $(this).val();
			$auteurs=[ ];
			selectAuthor(autoCompleteValue);
			console.log('titres='+$auteurs);
}).keyup();

//Auto completion du champ auteur
$("#auteur").autocomplete({
					autoFocus: true,
                    source: $auteurs,
                    delay: 0,
                    minLength: 1,
                    maxLength: 10
});//Fin autocomplete auteur

//Auto completion du champ titre		
$("#titre").autocomplete({
					autoFocus: true,
                    source: $titres,
                    delay: 0,
                    minLength: 1,
                    maxLength: 10
});//Fin autocomplete titre

function selectTitle(val){
	 $.ajax({ 
			//On recupere les titres dans semantiqueWebfood en fonction de ce qui est entre dans le input :requete ajax
			type : "get",
            url: 'http://data.semanticweb.org/sparql',
            dataType: 'xml', 
			data :  {output:'xml' ,query : $querySuggestionTitle},
			global :'false',
			async:'false',
			success : function(xml){ 
					getXML(xml,$titres);
			}
		});//Fin Ajax		
};

function selectAuthor(val){
	 $.ajax({ 
			//On recupere les titres dans semantiqueWebfood en fonction de ce qui est entre dans le input :requete ajax
			type : "get",
            url: 'http://data.semanticweb.org/sparql',
            dataType: 'xml', 
			data :  {output : 'xml' ,query : $querySuggestionAuthor},
			global :'false',
			async:'false',
			success : function(xml){ 
					getXML(xml,$auteurs);
			}
		});//Fin Ajax		
};


function getXML(xml,tab){
	$(xml).find("sparql > results > result > binding").each(function(){
					var key          = $(this).attr("name");
					var value        = $(this).find(":first-child").text();    // Label ressource
					tab.push(value);
				});
				
};				

function getURIbyTitle(titre){
var $uri="";
		$(xmlResultTitle).find("sparql > results > result > binding[name='title'] ").each(function(){
						var value  = $(this).find(":first-child").text(); 
						if(value==titre){
							//On recupere la valeur de l'uri suivant diectement le titre correspondant dans le xml
							$uri = $('this').next().child().child().text();
							console.log($uri);
							alert("c'est bon");
						}else{
							$uri = 'Aucun Titre correspondant';
						}
						alert("j'y suis");
						
		 });
};





});








};