/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6365555555555555, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.735, 500, 1500, "Choose room from some hotel-1"], "isController": false}, {"data": [0.803, 500, 1500, "Choose room from some hotel-0"], "isController": false}, {"data": [0.3635, 500, 1500, "Visit homepage"], "isController": false}, {"data": [0.717, 500, 1500, "Visit homepage-1"], "isController": false}, {"data": [0.7945, 500, 1500, "Explore pokhara package-0"], "isController": false}, {"data": [0.741, 500, 1500, "Visit homepage-0"], "isController": false}, {"data": [0.782, 500, 1500, "Explore pokhara package-1"], "isController": false}, {"data": [0.4075, 500, 1500, "Explore pokhara package"], "isController": false}, {"data": [0.3855, 500, 1500, "Choose room from some hotel"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9000, 0, 0.0, 928.041111111109, 277, 15668, 616.0, 1709.0, 2532.7999999999956, 6415.599999999991, 75.08447002878238, 442.39222250031287, 17.988987611062445], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["Choose room from some hotel-1", 1000, 0, 0.0, 914.7830000000005, 305, 15358, 456.5, 1396.6, 2303.8999999999996, 10888.140000000001, 8.729964730942488, 72.47405290795125, 1.6453937432342773], "isController": false}, {"data": ["Choose room from some hotel-0", 1000, 0, 0.0, 555.3199999999996, 277, 3617, 400.5, 1057.8, 1494.6999999999996, 2133.8900000000003, 8.711787920234869, 4.321863538554017, 1.6419678404348923], "isController": false}, {"data": ["Visit homepage", 1000, 0, 0.0, 1550.2199999999996, 579, 15591, 919.0, 3165.9, 4490.75, 9661.910000000003, 8.432556413802407, 74.18014470266806, 1.926970899247816], "isController": false}, {"data": ["Visit homepage-1", 1000, 0, 0.0, 872.6360000000003, 286, 13185, 448.0, 1849.2999999999997, 2536.849999999997, 6761.880000000001, 8.525948724944369, 71.40482057140908, 0.9741562507993077], "isController": false}, {"data": ["Explore pokhara package-0", 1000, 0, 0.0, 575.7580000000002, 281, 3631, 397.0, 1108.9999999999998, 1595.85, 2146.95, 8.668215387815957, 4.715035127942859, 2.048543089698693], "isController": false}, {"data": ["Visit homepage-0", 1000, 0, 0.0, 677.2549999999999, 281, 5664, 443.5, 1334.1, 1867.3999999999992, 3526.4100000000017, 8.454586190278915, 3.566778549023918, 0.9660025236939779], "isController": false}, {"data": ["Explore pokhara package-1", 1000, 0, 0.0, 580.0809999999999, 289, 3653, 407.0, 1162.2999999999997, 1577.5499999999993, 2175.78, 8.670394936489357, 72.61455759309837, 2.049058178350024], "isController": false}, {"data": ["Explore pokhara package", 1000, 0, 0.0, 1156.024000000002, 579, 5649, 855.5, 2187.5, 3047.7499999999995, 4521.010000000001, 8.645209257290071, 77.1061485808889, 4.0862121880160105], "isController": false}, {"data": ["Choose room from some hotel", 1000, 0, 0.0, 1470.293000000001, 601, 15668, 908.5, 2738.5, 3891.59999999999, 11175.140000000001, 8.683193678635002, 76.39344907306906, 3.2731569921417094], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9000, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
