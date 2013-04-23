
//PREPARE MODAL
 var modal='<!-- type "run()" in js console to import DB --><div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="myModalLabel">Import DB</h3></div><div class="modal-body"> <h3 class="text-warning">Be carefull ! this action isn\'t cancelable</h3><h4>Please, provide a complete Conf RDF File </h4> <h5 class="muted"><i>(such as : http://data.semanticweb.org/conference/www/2012/complete)</i></h5> <div class="input-append"><input type="text" id="DBURL" placeholder="Complete Conf rdf File"></input><button  id="DBURLBtn" data-dismiss="modal" class="btn"><i class="icon-download-alt"></i> import</button></div></div><div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Close</button> </div></div>';
 $('body').append($(modal).hide());
 function run(dbimportpath){ 
    $('#myModal').modal(); 
    $('#DBURLBtn').off('click').click({dbimportpath:dbimportpath},function(event){
    
        if( $('#DBURL').val()=="")return;
        var completeConfRdfURL =  $('#DBURL').val(); 
        
        var completeConfRdf=getRdfFromUrl(completeConfRdfURL) ;  
        if(completeConfRdf==undefined){alert('wrong URL');return;}
        if(!confirm("Are you sure you want to import "+$('#DBURL').val()+" file ? "))return;
        
        var events= []; 
        var locations= []; 
        var xproperties= [];
        var relations= [];
        var categories= [];
        
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
        console.log('-------locations--------');
        console.log(locations);
        
        
        
        //////////////////////////////////////////////////////////////////////////
        ///////////////////  second round for events  ////////////////////////////
        //////////////////////////////////////////////////////////////////////////
        
        $(completeConfRdf).children().children().each(function(index){
        
        /////////////////////         ROOT NODE         //////////////////
            if(this.nodeName=="swc:ConferenceEvent"){ alert("swc:ConferenceEvent"+index)
                doEvent(this);
                //console.log(events[events.length-1]);
                //console.log(xproperties[xproperties.length-1]); 
            }else if(this.nodeName.indexOf("swc:") !== -1 && this.nodeName.indexOf("Event")!== -1) { 
        /////////////////////         EVENT NODE         //////////////////
              
              doEvent(this);
              //console.log(events[events.length-1]);
              //console.log(xproperties[xproperties.length-1]);
              addRelation(this,events.length-1);
                
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
                    rtnArray['setSummary']=this.textContent.replace(/\x26/,"%26"); 
                }else if(this.nodeName=="swc:hasRelatedDocument"){ // RELATED PUBLICATION XPROP
                
                    var xproperty= {}; 
                    xproperty['setCalendarEntity']=events.length;
                    xproperty['setXNamespace']="publication_uri";
                    xproperty['setXValue']=$(this).attr('rdf:resource');
                    xproperties.push(xproperty);  
                    
                }else if(this.nodeName=="icaltzd:dtstart"){ // START AT
                
                    rtnArray['setStartAt']=$(this).text();
                    
                }else if(this.nodeName=="icaltzd:dtend"){   // END AT
                
                    rtnArray['setEndAt']=$(this).text(); 
                    
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
            var catName = event.nodeName.split("swc:").join("").split("Event").join("");
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
         
        //EVENT ADD BOTH PARENT AND CHILD RELATION BETWEEN 2 EVENTS
        function addRelation(event,currentEventId){
            $(event).children().each(function(){
                if(this.nodeName=="swc:isSubEventOf"||this.nodeName=="swc:isSuperEventOf"){ 
                    var relatedToEventId=getEventIdFromXProp($(this).attr('rdf:resource'));
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
        function getEventIdFromXProp(uri){ 
        
            for (var i=0;i<xproperties.length;i++){
                //alert(url+"\n"+xproperties[i]['setXValue']+"\n"+(xproperties[i]['setXValue']==url)+"\n"+i);
                if(xproperties[i]['setXValue']==uri){
                    return i; 
                }
            }
            return undefined;
        }
        
        // GET THE INDEX OF AN EVENT GIVEN ITS CHILD INDEX
        function getParentIndex(eventIndex){ 
            for(var i=0;i<relations.length;i++){  
                 if(relations[i]['setRelatedTo']==eventIndex && relations[i]['setRelationType']=="PARENT"){ 
                    return relations[i]['setCalendarEntity'];
                 }
            } 
            return undefined;
        }
        
        // GET RECURSIVELY PARENT DATETIME
        
        function getParentProp(eventIndex,parentProp){ 
            ctn++;
            if(ctn>maxCllStck)return defaultDate;
            var parentIndex=getParentIndex(eventIndex); 
            if( parentIndex==undefined || events[parentIndex]==undefined)return defaultDate;
            if( events[parentIndex][parentProp]!=undefined)return events[parentIndex][parentProp];
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
          console.log('---------dataArray---------' );
          console.log(dataArray );
          console.log( JSON.stringify(dataArray ));
          
          $.ajax({
            type: "POST",
            url: dbimportpath,
            data: "dataArray=" + JSON.stringify(dataArray, null),
            success:function(a, b, c) { 
                console.log(a, b, c);
            },
            error:function(a, b, c) { 
                console.log(a, b, c);
            }
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
