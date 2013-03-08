
function FormXproperty(id){
alert(id)
	$("#idci_bundle_simpleschedulebundle_xpropertytype_calendarEntity").val(id);//Put the id of the last Event create in CalendarEntity
	 $.post("../schedule/xproperty/"+id+ "/add", $("#uriLink").serialize(),function(data){ 
				$(".alert-success").append("<p>Link created</p>").show(500,function(){
				    $(".alert-success").fadeOut(3000,function(){
	                    location.reload();
	                });
				});
				
			})
}

