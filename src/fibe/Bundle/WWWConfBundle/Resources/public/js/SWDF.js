function SWDF(SWDFUrl){
//private
    var self=this;
    var $qry=null;
    var $XMLresult=null;
    var $SWDFUrl=SWDFUrl; 
    var $prefix = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX dc: <http://purl.org/dc/elements/1.1/> PREFIX dcterms: <http://purl.org/dc/terms/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX swrc: <http://swrc.ontoware.org/ontology#> PREFIX swrc-ext: <http://www.cs.vu.nl/~mcaklein/onto/swrc_ext/2005/05#> PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> PREFIX ical: <http://www.w3.org/2002/12/cal/ical#> PREFIX swc: <http://data.semanticweb.org/ns/swc/ontology#>';
//public 
    //default Request : recover publication's uri,title, author(name)
    this.$select=            '   ?uriPaper ?title ?name        '; 
	  this.$whereClause=	     '   ?author        foaf:name       ?name.         '+
					                   '   ?author        foaf:made       ?uriPaper.     '+
					                   '   ?uriPaper      dc:title        ?title.        ';
    this.buildQry=buildQry;
    this.doQry=doQry;
    this.toArray=toArray;//export as array
                             
    function buildQry(){ 
        $qry=$prefix +' SELECT DISTINCT '+this.$select+'  WHERE  {  '+this.$whereClause+'} ';
    }
    
    function doQry(callback){  
        $.ajax({ 
		        type : "GET",
		        async : true,
            url: $SWDFUrl,
            dataType: 'xml', 
		        data :  {output : 'xml' ,query : $qry}, 
		        success : function(xml){ 
				          self.$XMLresult=xml;
                  console.log(xml);
                  if(callback)callback();
	              }
		    }); 
                  console.log('caca');
    }
	    
    //export as array
    function toArray(){
        var returnArray= [ ];
        var i=0; 
	    $(self.$XMLresult).find("sparql > results > result").each(function(){
	        if(i!=0 && $(this).find("binding[name='uriPaper'] :first-child").text()==returnArray[i-1]['uri']){ 
	            //si la publi a plusieurs auteurs, on concatène l'auteur
	            returnArray[i-1]['value']+=",  "+$(this).find("binding[name='name'] :first-child").text(); 
	        }else{
	            returnArray[i]={ value: "", uri: ""  }
	             $(this).find("binding").each(function(){
	                if($(this).attr("name")=="uriPaper"){
	                    returnArray[i]['uri']=$(this).find(":first-child").text();
	                }else if($(this).attr("name")=="title"){
	                    returnArray[i]['value'] = $(this).find(":first-child").text();
	                }else if($(this).attr("name")=="name"){
	                    returnArray[i]['value']+=" BY : "+$(this).find(":first-child").text();
	                }
	             }); 
	             i++; 
	         }
        });
        //console.log(self.returnArray);
        return returnArray;
    }
}
