var communicationPort;

function addProfessorNames(info, tab) {
    var tabID = tab.id;
    
    communicationPort = chrome.tabs.connect(tabID);
    communicationPort.onMessage.addListener(handleMessage);
    communicationPort.postMessage({"ID": "add_teachers"});
}

function handleMessage(msg) {
    switch(msg["ID"]) {
        case "section_iterator":
            var section = msg["section"],
                rowIndex = msg["rowIndex"];
                
            lookupSection(section, rowIndex);
    }
}

function lookupSection(section, rowIndex) {
    $.get("http://www.bsd.ufl.edu/textadoption/studentview/displayadoption1sect.aspx?SECT=" + section + "&YEAR=13&TERM=1", {}, function(results){
        var content = $(results),
            instructorsData = $(content.find("#formArea td[class='h2 instructor']", results)[0]).text(),
            instructorsText = $.trim(instructorsData),
            allInstructors = instructorsText.split(";");
        $(allInstructors).each(function(index, instructor) {
            var fullName = $.trim(instructor);
            if (fullName.indexOf(",") >= 0) {
                var nameParts = fullName.split(","),
                    lastName = nameParts[0];
                    
                getBestRateMyProfessorTID(lastName, fullName, rowIndex);
            }
        });
    }, "html");
}

//levenstein distance from http://www.dzone.com/snippets/javascript-implementation
//based on: http://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Levenshtein_distance
//and: http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
function levenshtein( a, b )
{
    var i;
    var j;
    var cost;
    var d = new Array();
 
    if ( a.length == 0 )
    {
        return b.length;
    }
 
    if ( b.length == 0 )
    {
        return a.length;
    }
 
    for ( i = 0; i <= a.length; i++ )
    {
        d[ i ] = new Array();
        d[ i ][ 0 ] = i;
    }
 
    for ( j = 0; j <= b.length; j++ )
    {
        d[ 0 ][ j ] = j;
    }
 
    for ( i = 1; i <= a.length; i++ )
    {
        for ( j = 1; j <= b.length; j++ )
        {
            if ( a.charAt( i - 1 ) == b.charAt( j - 1 ) )
            {
                cost = 0;
            }
            else
            {
                cost = 1;
            }
 
            d[ i ][ j ] = Math.min( d[ i - 1 ][ j ] + 1, d[ i ][ j - 1 ] + 1, d[ i - 1 ][ j - 1 ] + cost );
            
            if(
                 i > 1 && 
                 j > 1 &&    
                 a.charAt(i - 1) == b.charAt(j-2) && 
                 a.charAt(i-2) == b.charAt(j-1)
                 ){
                    d[i][j] = Math.min(
                        d[i][j],
                        d[i - 2][j - 2] + cost
                    )
                 
            }
        }
    }
 
    return d[ a.length ][ b.length ];
}

function sendTeachDataToPage(sectionRowIndex, fullTextName, rateMyProfessorID) {
    communicationPort.postMessage({
        "ID": "add_teacher_data",
        "sectionRowIndex": sectionRowIndex,
        "fullTextName": fullTextName,
        "rateMyProfessorID": rateMyProfessorID
    });
}


function getBestRateMyProfessorTID(lastName, fullTextName, sectionRowIndex) {
    //find the teacher with the name closest to the one specified, as determined by the levenshtein distance
    //not perfect, but should suffice for most cases. the disclaimer will make up for the other cases ;)
    var url = "http://ec2-23-22-84-14.compute-1.amazonaws.com/findteacher.php?lastname=" + lastName;
    $.get(url, {}, function(teachers){
        var i = 0;
            teacherCount = teachers.length,
            bestGuess = null,
            lowestLevenshteinDistance = 100000;
        for (var i = 0; i < teacherCount; i++) {
            var teacherEntry = teachers[i],
                currentFullName = teacherEntry["FullTextName"],
                ld = levenshtein(fullTextName, currentFullName);
            if (bestGuess == null || ld < lowestLevenshteinDistance) {
                lowestLevenshteinDistance = ld;
                bestGuess = teacherEntry;
            }
        }
        if (bestGuess == null) {
            sendTeachDataToPage(sectionRowIndex, fullTextName, null);
        } else {
            sendTeachDataToPage(sectionRowIndex, fullTextName, bestGuess["RateMyProfessorID"]);
        }
    }, "json");
}


var id = chrome.contextMenus.create({
    "title": "Add professor names", 
    "contexts": ["page"], 
    "documentUrlPatterns": ["*://*.isis.ufl.edu/cgi-bin/nirvana"],
    "onclick": addProfessorNames
});

