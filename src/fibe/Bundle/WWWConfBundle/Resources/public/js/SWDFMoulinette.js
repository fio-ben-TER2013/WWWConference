 function run(completeConfRdfURL){ 
    completeConfRdfURL = completeConfRdfURL==undefined ? "/complete.xml":completeConfRdfURL; 
    if (confirm("lancer la moulinette ?")){
    var completeConfRdf=$(getRdfFromUrl(completeConfRdfURL));  
    
    var events= {};
    var event= {};
    
    event['setSummary']=completeConfRdf.find('rdf').attr('bibo');
    event['setDescription']="Description1";
    event['setStartAt']="startAT";
    events[0]=event;
    console.log(event);
    
    var event= {};
    event['setSummary']="Titre2";
    event['setDescription']="Description2";
    event['setStartAt']="startAT";
    events[1]=event;
    
    var xproperties= {};
    var xproperty= {};
    
    xproperty['setCalendarEntity']=0;
    xproperty['setXNamespace']="publication_uri";
    xproperty['setXValue']="http://superURI.fr/publication/00000";
    xproperties[0]=xproperty; 
    
    var xproperty= {};
    xproperty['setCalendarEntity']=0;
    xproperty['setXNamespace']="event_uri";
    xproperty['setXValue']="http://superURI.fr/event/11111";
    xproperties[1]=xproperty; 
    
    var xproperty= {};
    xproperty['setCalendarEntity']=1;
    xproperty['setXNamespace']="publication_uri";
    xproperty['setXValue']="http://superURI.fr/publication/2222";
    xproperties[2]=xproperty; 
    
    
    var relations= {};
    var relation= {};
    relation['setRelationType']="PARENT";
    relation['setCalendarEntity']=0;
    relation['setRelatedTo']=1;
    relations[0]=relation;
    
    
    var dataArray={};
    dataArray['events']=events;
    dataArray['xproperties']=xproperties;
    dataArray['relations']=relations;
    /*
    console.log(dataArray);
    
    //TODO do this url portative
    $.ajax({
        type: "POST",
        url:"DBimport",
        data: "dataArray=" + JSON.stringify(dataArray),
        success:function(data, textStatus, jqXHR) { 
            console.log(data, textStatus, jqXHR);
        }
    }); 
    */
}
function getRdfFromUrl(completeConfRdfURL){
    var returnVar;
        $.ajax({
          url: completeConfRdfURL ,  
          async:false,
          success:function(data){
            returnVar=data; 
          }
        });
        return returnVar;
    }
}

/*EVENT*/
//setCreatedAt($createdAt) @param: /Datetime 
//setStartAt($startAt)
//setSummary($summary)
//setDescription($description)
//setOrganizer($organizer)
//setContacts($contacts)

/*CalendarEntityRelation*/
//setRelationType($relationType) {CHILD|SIBLING|PARENT}
//setCalendarEntity(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntity = null)
//setRelatedTo(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $relatedTo = null)

/*XPROPERTY*/
//setCalendarEntity(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntity = null)
//setXNamespace($string); {publication_uri|event_uri}
//setXKey(rand (0,9999999999));//todo AUTO_INCREMENT ??  
//setXValue($xValue) uri....

/*CATEGORIES*/
//setName($name)
//setDescription($description)
//setLevel($level) int
//addCalendarEntitie(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntities)


