
 function run(dbimportpath,modalId){ 
    $('#'+modalId).modal(); 
    $('#DBURLBtn').off('click').click({dbimportpath:dbimportpath},function(event){
        
        if( $('#DBURL').val()=="")return;
        var completeConfRdfURL =  $('#DBURL').val(); 
        
        var completeConfRdf=getRdfFromUrl(completeConfRdfURL) ;   
        
        // run www2012 conf sample with ../../../complete4.rdf 
        
        if(completeConfRdf==undefined){alert('wrong URL');return;}
        if(!confirm("Are you sure you want to import "+$('#DBURL').val()+" file ? "))return;
        
        var events= []; 
        var locations= []; 
        var xproperties= [];
        var relations= [];
        var categories= [];
        var proceedings= [];
        
        //call stack for parent inheritance 
        var defaultDate='1980-01-01T00:00:00+00:00'
        //////////////////////////////////////////////////////////////////////////
        ///////////////////////  first round for locations  //////////////////////
        //////////////////////////////////////////////////////////////////////////
        
        $(completeConfRdf).children().children().each(function(index){
          if(this.nodeName=="swc:MeetingRoomPlace"){
              /////////////////////         LOCATION NODE         //////////////////
              
                var location={setDescription:""};
                
                $(this).children().each(function(){ 
                
                    if(this.nodeName=="rdfs:comment"){
                    
                      location['setDescription']= location.setDescription+$(this).text()+", ";
                      
                    }else if(this.nodeName=="rdfs:label"){ 
                    
                      location['setName']=$(this).text();
                      
                    }
                    
                });
                
                //temporary attribute / flag
                location['uri']=$(this).attr('rdf:about');
                
                locations.push(location);
          }
        });
        //console.log('-------locations--------');
        //console.log(locations);
        
        
        
        //////////////////////////////////////////////////////////////////////////
        ///////////////////  Event  ////////////////////////////
        //////////////////////////////////////////////////////////////////////////
        
        $(completeConfRdf).children().children().each(function(index){
            if( this.nodeName.indexOf("Event")!== -1 ) { 
            /////////////////////         EVENT NODE         //////////////////
                   
              doEvent(this); 
              
              //addRelation(this);
              //console.log(events);
              //console.log(relations);
            }
        });
        
        
        //////////////////////////////////////////////////////////////////////////
        //////////////////////////////  relations  ///////////////////////////////
        //////////////////////////////////////////////////////////////////////////
        
        var j=0;
        $(completeConfRdf).children().children().each(function(index){ 
            if( this.nodeName.indexOf("Event")!== -1 ) { 
         
              addRelation(this,j);
              j++; 
              //console.log(events);
              //console.log(relations);
            }  
        });
        
        
        //////////////////////////////////////////////////////////////////////////
        ///////////////////  fourth round for publication title  //////////////////
        //////////////////////////////////////////////////////////////////////////
        
        $(completeConfRdf).children().children().each(function(index){
            
            if(this.nodeName=="swrc:InProceedings"){
                //for each proceeding
                var uri = $(this).attr('rdf:about'); 
                for (var i=0;i<xproperties.length;i++){ 
                
                    if(xproperties[i]['setXValue']==uri){
                    // if we find the corresponding xproperty  
                        $(this).children().each(function(){
                            //we look for the title
                            if(this.nodeName=="dce:title"){  
                              //to finally store it in the setXKey !
                              xproperties[i]['setXKey']=$(this).text();
                            }
                        });
                    }
                }
            }
        }); 
         
        //////////////////////////////////////////////////////////////////////////
        ////////////////////////  INHERIT PARENT DATE  ///////////////////////////
        //////////////////////////////////////////////////////////////////////////
        var maxCllStck=20;
        var ctn;
        for(var i=0;i<events.length;i++){
            if(events[i]['setStartAt']==undefined){
                ctn=0;
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
        
        
        send(event.data.dbimportpath);
        return 1; 
        //////////////////////////////////////////////////////////////////////////
        ////////////////////////  run() workflow end  ////////////////////////////
        //////////////////////////////////////////////////////////////////////////
        
        
        //EVENT PARSE : CATCH START, END AT, LOCATION
        // THEN ADD 2 XPROPERTIES RELATED TO ITS EVENT AND PUBLICATION
        function doEvent(event){
            var rtnArray={}; 
            $(event).children().each(function(){
                if(this.nodeName=="rdfs:label"){   // LABEL 
                    // replace & caractere,  f*** JSON.stringify() ... 
                    rtnArray['setSummary']=this.textContent.split(/\x26/).join("%26").split(/\x3D/).join("%3D");;
                }else if(this.nodeName=="icaltzd:dtstart"){ // START AT
                
                    rtnArray['setStartAt']=$(this).text();
                    
                }else if(this.nodeName=="dce:description"){ // DESCRIPTION
                
                    rtnArray['setDescription']=this.textContent.split(/\x26/).join("%26").split(/\x3D/).join("%3D");
                    
                }else if(this.nodeName=="swrc:abstract"){ // ABSTRACT
                
                    rtnArray['setComment']=this.textContent.split(/\x26/).join("%26").split(/\x3D/).join("%3D");;
                    
                }else if(this.nodeName=="icaltzd:dtend"){   // END AT
                
                    rtnArray['setEndAt']=$(this).text(); 
                    
                }else if(this.nodeName=="swc:hasRelatedDocument"){ // RELATED PUBLICATION XPROP
                
                    var xproperty= {}; 
                    xproperty['setCalendarEntity']=events.length;
                    xproperty['setXNamespace']="publication_uri";
                    xproperty['setXValue']=$(this).attr('rdf:resource');
                    xproperties.push(xproperty);  
                    
                }else if(this.nodeName=="icaltzd:location"){   // LOCATION XPROP
                
                    var xproperty= {}; 
                    xproperty['setCalendarEntity']=events.length;
                    xproperty['setXNamespace']="location_uri";
                    xproperty['setXValue']=$(this).attr('rdf:resource');
                    xproperties.push(xproperty);
                    
                    var locationId = getLocationIdFromUri($(this).attr('rdf:resource'));
                    rtnArray['setLocation']=locationId;
                    
                }
                
                /*else if(this.nodeName="event:time" && rtnArray['setStartAt']==undefined){
                    var interval=$(this).attr("rdf:resource").split("/");
                    interval=interval[interval.length-1].split("_");
                    
                    rtnArray['setStartAt']=interval[0];
                    rtnArray['setEndAt']=interval[0];  
                    
                }else if(this.nodeName=="dce:description"){  
                    rtnArray['setDescription']=$(this).text();
                }*/ 
                
            });  
            
              // EVENT CAT
            var catName = event.nodeName.split("swc:").join("").split("event:").join("");
            var tmp=catName;
            if(tmp.split("Event").join("")!="")catName=tmp;
            var catId = getCategoryIdFromName(catName);
            if(catId==undefined){ 
              var category= {}; 
              category['setName']=catName;
              categories.push(category);
              catId = categories.length-1;
            }
            rtnArray['addCategorie']=catId;
            
            events.push( rtnArray );
            
              // EVENT XPROP
            var xproperty= {}; 
            xproperty['setCalendarEntity']=events.length-1;
            xproperty['setXNamespace']="event_uri";
            xproperty['setXValue']=$(event).attr('rdf:about');
            xproperties.push(xproperty);
            
             
         }
         
        //ADD BOTH PARENT AND CHILD RELATION BETWEEN 2 EVENTS
        function addRelation(event,currentEventId){ 
            $(event).children().each(function(){
                if(this.nodeName=="swc:isSubEventOf"||this.nodeName=="swc:isSuperEventOf"){ 
                    var relatedToEventId=getEventIdFromURI($(this).attr('rdf:resource'));
                    if(relatedToEventId!=undefined && events[relatedToEventId]!=undefined ){
                    
                        var relationId = getRelationIdFromCalendarEntityId(currentEventId,relatedToEventId); 
                        //console.log("---------------------");
                        //console.log(currentEventId);
                        //console.log(events[currentEventId]['setSummary']);
                        //console.log(this.nodeName);
                        //console.log(relatedToEventId);
                        //console.log(events[relatedToEventId]['setSummary']);
                        //console.log(relations[relationId]);
                        
                        if(!relations[relationId]){
                          var relationType = this.nodeName.indexOf("swc:isSubEventOf")!== -1?"PARENT":"CHILD";
                          var relation= {}; 
                          relation['setCalendarEntity']=parseInt(relatedToEventId); 
                          relation['setRelationType']=relationType;
                          relation['setRelatedTo']=parseInt(currentEventId);
                          //console.log("----------   PUSHED    -----------");
                          //console.log(relation);
                          relations.push(relation);
                          
                          var relationType = (relationType=="PARENT"?"CHILD":"PARENT");
                          var relation= {};
                          relation['setCalendarEntity']=parseInt(currentEventId);
                          relation['setRelationType']=relationType;
                          relation['setRelatedTo']=parseInt(relatedToEventId);
                          //console.log(relation);
                          relations.push(relation); 
                        }
                        return true;
                    }else{
                      //alert( event['setSummary']+", "+$(this).attr('rdf:resource'));
                      //console.log("Unknown parent");
                      
                    }
                }  
            });
            return false;
        }
        
        // GET THE INDEX OF A CATEGORY GIVEN ITS NAME
        function getCategoryIdFromName(name){
        
            for (var i=0;i<categories.length;i++){
                //alert(url+"\n"+xproperties[i]['setXValue']+"\n"+(xproperties[i]['setXValue']==url)+"\n"+i);
                if(categories[i]['setName']==name){
                    return i; 
                }
            }
            return undefined;
        }
        
        // GET THE INDEX OF A LOCATION GIVEN ITS URI
        function getLocationIdFromUri(uri){
        
            for (var i=0;i<locations.length;i++){
                //alert(url+"\n"+xproperties[i]['setXValue']+"\n"+(xproperties[i]['setXValue']==url)+"\n"+i);
                if(locations[i]['uri']==uri){
                    return i; 
                }
            }
            return undefined;
        }
        
        // GET THE INDEX OF AN EVENT GIVEN ITS URI
        function getEventIdFromURI(uri){ 
        
            for (var i=0;i<xproperties.length;i++){
                //alert(url+"\n"+xproperties[i]['setXValue']+"\n"+(xproperties[i]['setXValue']==url)+"\n"+i);
                if(xproperties[i]['setXValue']==uri){
                    return xproperties[i]['setCalendarEntity'];
                }
            }
            return undefined;
        }
        
        // GET THE INDEX OF AN EVENT GIVEN ITS CHILD INDEX
        function getParentIndex(eventIndex){ 
            for(var i=0;i<relations.length;i++){  
                 if(relations[i]['setRelatedTo'] == eventIndex  && relations[i]['setRelationType'].indexOf("PARENT") ){ 
                    return relations[i]['setCalendarEntity'];
                 }
            } 
            return undefined;
        }
        
        // GET THE INDEX OF AN EVENT GIVEN ITS PARENT INDEX
        function getChildIndex(eventIndex){ 
            for(var i=0;i<relations.length;i++){  
                 if(relations[i]['setRelatedTo'] == eventIndex  && relations[i]['setRelationType'].indexOf("CHILD") ){ 
                    return relations[i]['setCalendarEntity'];
                 }
            } 
            return undefined;
        }
         
        
        
        function getRelationIdFromCalendarEntityId(eventId,relatedToEventId){
            for(var i=0;i<relations.length;i++){  
                 
                 if(relations[i]['setCalendarEntity'] === eventId && relations[i]['setRelatedTo'] === relatedToEventId){  
                    return i;
                 }
            } 
            return undefined;
            
        }
        
        function getTrackEventFromInProceedingsUri(ProceedingsUri){
            
            for(var trackEvent in proceedings){  
                 
                for(var j=0;j<proceedings[trackEvent].length;j++){  
                     
                     if(proceedings[trackEvent][j] === ProceedingsUri){  
                        return trackEvent;
                     }
                } 
            } 
            return undefined;
            
        }
        
        
        // GET RECURSIVELY PARENT PROP
        
        function getParentProp(eventIndex,parentProp){ 
            ctn++;
            if(ctn>maxCllStck)
                return defaultDate;
            
            var parentIndex=getParentIndex(eventIndex); 
            
            if( !parentIndex || !events[parentIndex])
                return defaultDate;
                
            if( events[parentIndex][parentProp])
                return events[parentIndex][parentProp];
                
            return getParentProp(getParentIndex(eventIndex),parentProp);
        }
        
        
        // SEND TO IMPORT PHP SCRIPT
        function send(dbimportpath){
          
          for (var i=0;i<locations.length;i++){
            delete locations[i]["uri"];
          }
          var dataArray={}; 
          dataArray['categories']=categories;
          dataArray['events']=events;
          dataArray['xproperties']=xproperties;
          dataArray['relations']=relations;  
          dataArray['locations']=locations;  
                
          if(events.length<1 && xproperties.length<1 && relations.length<1 && locations.length<1){
            alert('nothing imported');
            return;
          }
          console.log('---------sending---------' );
          console.log(dataArray ); 
          
          $.ajax({
            type: "POST",
            url: dbimportpath,
            data: "dataArray=" + JSON.stringify(dataArray, null),
            success:function(a,b,c){console.log(a,b,c)},
            error:function(a,b,c){console.log(a,b,c)},
          });
          
       }
     });
}


function getRdfFromUrl(completeConfRdfURL){
    var returnVar;
        $.ajax({
          url: completeConfRdfURL ,  
          async:false,
          cache:false,
          success:function(data){
            returnVar=data; 
          }
        });
    return returnVar;
} 
