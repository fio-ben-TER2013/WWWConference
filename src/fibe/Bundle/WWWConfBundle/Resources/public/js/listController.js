/**
 * Gets the event entities 
 */


$(document).ready(function() {
    var config=new JSONconfig();
    var columns = ["name","start_at","location"];
     
    jQuery.ajax({ 
        url: config.simpleScheduleApiUrl,
        data: 'format=jsonp',
        dataType: 'jsonp',
        success: function(data) { 
            JSONEventListToHTMLArray(data,columns);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("une erreur s'est produite :\ntextStatus ="+textStatus+"\njqXHR.getAllResponseHeaders() ="+jqXHR.getAllResponseHeaders()+"\njqXHR.status ="+jqXHR.status+"\nerrorThrown ="+errorThrown);
        }
    });
});

/**
 *Parses SimpleSchedule event query JSON file 
 * then shows it in the <table> element
 */
function JSONEventListToHTMLArray(json,columns){

    
    var theadtr = $('<thead><tr></tr></thead>'); 
    var tbodye = $('<tbody>');
    var tbodyp = $('<tbody>');
    
    for(i in columns) { 
        theadtr.append('<th>'+columns[i]+'</th>');  
    }
    
    
    $.each(json, function(i,event){
        $.each(event.xproperties, function(j,xproperty){
            var namespace =xproperty.xNamespace.toLowerCase(); 
            //if the event has actually a link  
            if (namespace.indexOf("publication") >= 0 && namespace.indexOf("uri") >= 0){ 
                var tre = $('<tr>');
                for(key in event) {
                    if($.inArray(key, columns)!=-1){
                        tre.append('<td>'+event[key]+'</td>');  
                    }else if(key=='id'){ 
                        tre.attr('onClick',"$(location).attr('href','app_dev.php/admin/link/"+xproperty.id+"/edit');")
                           .css('cursor','pointer');
                    }
                }
                tbodye.append(tre);
                
                tbodyp.append('<tr><td>'+xproperty.xValue+'</td></tr>');
            }
        });
    });
    $("#eventlist").append(theadtr).append(tbodye);
    $("#paperlist").append('<thead><tr><th>publication uri</th></tr></thead>').append(tbodyp);
}
