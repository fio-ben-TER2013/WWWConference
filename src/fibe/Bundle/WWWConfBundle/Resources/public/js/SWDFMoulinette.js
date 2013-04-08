 function run(){
 $('#myModal').modal(); 
     $('#DBURLBtn').click(function(){
      if( $('#DBURL').val()=="")return;
        var completeConfRdfURL =  $('#DBURL').val();
        
        
        
        var completeConfRdf=getRdfFromUrl(completeConfRdfURL) ;  
        
        var events= []; 
        var xproperties= [];
        var relations= [];
        
        $(completeConfRdf).children().children().each(function(index){
            if(this.nodeName=="swc:ConferenceEvent"){//root event   
                doEvent(this);
                //console.log(events[events.length-1]);
                //console.log(xproperties[xproperties.length-1]);
            }else if(this.nodeName=="swc:TrackEvent" ||this.nodeName=="swc:TalkEvent" || this.nodeName=="swc:SessionEvent"){ 
            
                doEvent(this);
                //console.log(events[events.length-1]);
                //console.log(xproperties[xproperties.length-1]);
                addRelation(this,events.length-1);
            }
        });
        for(var i=0;i<events.length;i++){
            if(events[i]['setStartAt']==undefined){
                var parentStartAt= getParentProp(i,'setStartAt');
                if(parentStartAt!=undefined){
                    events[i]['setStartAt']=parentStartAt;
                    events[i]['setEndAt']=getParentProp(i,'setEndAt');
                }else{
                    events[i]['setStartAt']=events[0]['setStartAt'];
                    events[i]['setEndAt']=events[0]['setEndAt'];
                }
            }
        } 
        send();
         function doEvent(event){
            var rtnArray={};
            $(event).children().each(function(){  
                if(this.nodeName=="rdfs:label"){  
                    rtnArray['setSummary']=$(this).text(); 
                }else if(this.nodeName=="swc:hasRelatedDocument"){
                    var xproperty= {}; 
                    xproperty['setCalendarEntity']=events.length;
                    xproperty['setXNamespace']="publication_uri";
                    xproperty['setXValue']=$(this).attr('rdf:resource');
                    xproperties.push(xproperty);  
                    
                }else if(this.nodeName=="icaltzd:dtstart"){ 
                    rtnArray['setStartAt']=$(this).text();
                    
                }else if(this.nodeName=="icaltzd:dtend"){  
                    rtnArray['setEndAt']=$(this).text(); 
                }/*else if(this.nodeName="event:time" && rtnArray['setStartAt']==undefined){
                    var interval=$(this).attr("rdf:resource").split("/");
                    interval=interval[interval.length-1].split("_");
                    
                    rtnArray['setStartAt']=interval[0];
                    rtnArray['setEndAt']=interval[0]; 
                    
                }else if(this.nodeName=="dce:description"){  
                    rtnArray['setDescription']=$(this).text();
                }*/ 
            });  
            events.push( rtnArray );
            
            var xproperty= {}; 
            xproperty['setCalendarEntity']=events.length-1;
            xproperty['setXNamespace']="event_uri";
            xproperty['setXValue']=$(event).attr('rdf:about');
            xproperties.push(xproperty);
             
         }
        function addRelation(event,currentEventId){
            $(event).children().each(function(){
                if(this.nodeName=="swc:isSubEventOf"||this.nodeName=="swc:isSuperEventOf"){ 
                    var relatedToEventId=getEventIdFromUrl($(this).attr('rdf:resource'));
                    if(relatedToEventId!=undefined){
                        var relationType = this.nodeName=="swc:isSubEventOf"?"PARENT":"CHILD";
                        var relation= {}; 
                        relation['setCalendarEntity']=relatedToEventId;
                        relation['setRelationType']=relationType;
                        relation['setRelatedTo']=currentEventId;
                        relations.push(relation);  
                        var relationType = this.nodeName=="swc:isSubEventOf"?"CHILD":"PARENT";
                        var relation= {};
                        relation['setCalendarEntity']=currentEventId;
                        relation['setRelationType']=relationType;
                        relation['setRelatedTo']=relatedToEventId;
                        relations.push(relation);
                        return true;
                    }else{
                        //alert("undefined parentEventId of events["+(events.length-1)+"] : "+$(this).attr('rdf:resource')); 
                    }
                }  
            });
            return false;
        }
        function getEventIdFromUrl(url){ 
        
            for (var i=0;i<xproperties.length;i++){
                //alert(url+"\n"+xproperties[i]['setXValue']+"\n"+(xproperties[i]['setXValue']==url)+"\n"+i);
                if(xproperties[i]['setXNamespace']=="event_uri" && xproperties[i]['setXValue']==url){
                    return i; 
                }
            }
            return undefined;
        }
        
        function getParentProp(eventIndex,parentProp){
            var parentIndex=getParentIndex(eventIndex); 
            if( parentIndex==undefined || events[parentIndex]==undefined)return undefined;
            if( events[parentIndex][parentProp]!=undefined)return events[parentIndex][parentProp];
            return getParentProp(getParentIndex(eventIndex),parentProp);
        }
        function getParentIndex(eventIndex){ 
            for(var i=0;i<relations.length;i++){  
                 if(relations[i]['setRelatedTo']==eventIndex && relations[i]['setRelationType']=="PARENT"){ 
                    return relations[i]['setCalendarEntity'];
                 }
            } 
            return undefined;
        }
        
        
        function send(){
            var dataArray={};
            dataArray['events']=events;
            dataArray['xproperties']=xproperties;
            dataArray['relations']=relations; 
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
         }
        return 1;
     });
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
