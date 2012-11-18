var teachersAdded = false,
    communicationPort = null;


function messageHandler(msg) {
    switch(msg["ID"]) {
        case "add_teachers":
            if (!teachersAdded) {
                var header = $($("#reg_srch_results > table > tbody > tr")[0]),
                    newHeaderItem = $("<th>Teacher(s)</th>");
                header.append(newHeaderItem);
                
                //only allow this functionality to occur once
                teachersAdded = true;
                iterateSectionRows();
            }
            break;
        case "add_teacher_data":
            var sectionRowIndex = msg["sectionRowIndex"],
                fullTextName = msg["fullTextName"],
                rateMyProfessorID = msg["rateMyProfessorID"],
                rows = $('#reg_srch_results>table>tbody>tr'),
                specifiedRow = $(rows[sectionRowIndex]),
                column = null,
                html = "";
            if (specifiedRow.find("td[class='teacher_column']").length) {
                column = $(specifiedRow.find("td[class='teacher_column']")[0]),
                html = "<br>";
            } else {
                column = $("<td class='teacher_column'></td>");
                specifiedRow.append(column);
            }    
            if (rateMyProfessorID === null) {
                //no ratemyprofessor id found
                html += "<span>" + fullTextName + "</span>"
            } else {
                html += "<a href='http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + rateMyProfessorID + "' target='_blank'>" + fullTextName + "</a>";
            }
            column.append($(html));
    }
}

function iterateSectionRows() {
    var rows = $('#reg_srch_results>table>tbody>tr');
    rows.each(function(rowIndex, row){
        var submitButton = $(row).find('td>form>input[type="submit"]'),
            btnText = $(submitButton[0]).val();
        if (btnText) {
            var sectionLocation = btnText.indexOf(" ") + 1,
                section = btnText.substr(sectionLocation);
            communicationPort.postMessage({
                "ID": "section_iterator",
                "section": section,
                "rowIndex": rowIndex
            });
        }
    })
}

chrome.extension.onConnect.addListener(function(thePort) {
    //user clicked context menu item
    //set up the message passing interface
    communicationPort = thePort;
    communicationPort.onMessage.addListener(messageHandler);
});
