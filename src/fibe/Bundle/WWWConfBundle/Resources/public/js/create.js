$(document).ready(function() {

/*  $("#auteur").selectbox({
	onOpen: function (inst) {
		//console.log("open", inst);
	},
	onClose: function (inst) {
		//console.log("close", inst);
	},
	onChange: function (val, inst) {
		$.ajax({
			type: "GET",
			data: {country_id: val},
			url: "ajax.php",
			success: function (data) {
				$("#boxCity").html(data);
				$("#city_id").selectbox();
			}
		});
	},
	effect: "slide"
});

*/
/**
 *Parses SimpleSchedule event query JSON file 
 * then shows it in the <table> element
 */
$("#createEvent").submit(){

    var $data = $("#linkPublication").serialize();
			
	//Requete ajax
	$.ajax({
			url: "http://calendar.labs.idci.fr/admin/schedule/event/create",
			type : "POST",
			data : $data,
			datatype : 'json',
			succes : 'link()',
			error : 'error'
    });

};

function error(){
	echo("Probleme dans l'envoie de la requête ajax");
}

function link(){
		
	$("#linkPublication").submit(){

		var $auteur = $("#auteur"),
			  $titre = $("#titre"),
			  $ID = $("#ID");
		 
	/*Requete ajax => interrogation sparql sur semantique web food
	$.ajax({
			url: "http://calendar.labs.idci.fr/admin/schedule/event/create",
			type : "POST",
			data : $data,
			datatype : 'json',
			succes : 'link()',
			error : 'error'
  });
  
  };
 };
 
*/
	
}









};