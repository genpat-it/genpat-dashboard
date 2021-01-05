import $ from 'jquery';
import Tabulator from 'tabulator-tables';

const createTable = (metadata) => {

    if (metadata) {

        var tableData = [];

        $.getJSON(metadata, (md) =>{
            console.log(md);
            md.elements.forEach(element => {
                tableData.push(element);
            });
        });

        var tableheight = $("#map").height() - 1;
    
        var table = new Tabulator("#metadata-grid", {
            height: tableheight,
            data: tableData,
            layout: "fitColumns",
            placeholder: "No Metadata Available",
            autoColumns: true,
        });

        setTimeout(() => {
            table.setData(tableData);
        }, 1000)
        

    } else {
        console.log('No metadata')
    }

}

export { createTable }