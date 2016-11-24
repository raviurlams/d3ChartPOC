// Global Variables
var margin = { top: 20, right: 120, bottom: 20, left: 120 },
    padding = 100,
    yaxis_Max = 0,
    yaxis_Min = 0,
    width = $(document).width() - margin.right - margin.left,
    height = Math.round(width / ($(document).width() / $(document).height())) - margin.top - margin.bottom,
    links = [],
    nodes = {},
    link = {},
    node = {},
    force = {},
    tickDistance = 0,
    tickGap = 0,
    unitDiff = 0,
    languageWidth=0,
    xAxisLabels=[],
    tickArr = [],
    yearsPositionArray = [],
    languageStore={},
    tip = {};

var YAXIS_LABEL_TEXT = "Year";
var YAXIS_DATASOURCE_LABEL = "FIRST APPEARED";
var VERSIONS = "VERSIONS";
var DATASOURCE_DESCE_LABEL = "DIRECT DESCENDANT(S)";
var DATASOURCE_ANCE_LABEL = "DIRECT ANCESTOR(S)";
var NONE = "NONE";
var LANGUAGE = "LANGUAGE";
var YEAR_KEY = "year";
var FILE_PATH = "data/treeData.csv";
var color = d3.scale.category10();

// SVG Tag
var svg = d3.select("#chartContainer")
    .append("svg")
    .attr("id", "chart")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.top + "," + margin.top + ")")
    .attr("preserveAspectRatio", "xMinYMin");

// drawing chart area
function drawChartArea(data) {
    // Compute the distinct nodes from the links.
    links.forEach(function(link) {        
        link.source = nodes[link.source.trim().toUpperCase()] || (nodes[link.source.trim().toUpperCase()] = { name: link.source, year: link.source_object[YAXIS_DATASOURCE_LABEL], language: link.source_object[LANGUAGE] });
        link.target = nodes[link.target.trim().toUpperCase()] || (nodes[link.target.trim().toUpperCase()] = { name: link.target, year: languageStore[link.target][YAXIS_DATASOURCE_LABEL], language: languageStore[link.target][LANGUAGE] });
    });
    // console.log(nodes);
    // start chart rendering
    force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(30)
        .charge(-300);

    // calculating X/Y and px/py
    calulateXYCoOrdinates();

    // draw the lines
    d3.layout.force().on("tick", tick).start();

    // adding arrows to charts
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("refX", 6 + 3)
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z")
        .style("fill", function(d) {
            return color(1);
        });

    // adding links to charts   
    link = svg.selectAll(".link")
        .data(force.links())
        .enter().append("line")
        .attr("class", "link")
        .style("stroke", function(d) {
            return color(1);
        })
        .attr("marker-end", "url(#arrowhead)");

    node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(tip)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    node.append("circle")
        .attr("r", 9);

    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name;
        });

    function tick() {
        link.attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    } // end of tick func

}
//************* Helper Functions ***************//
function calulateXYCoOrdinates() {    
    force.nodes().forEach(function(data, i) {
        // console.log(data);
        if(data[YEAR_KEY]){
            data.y = (unitDiff * getUnitDistance(data[YEAR_KEY]));
            data.py = (unitDiff * getUnitDistance(data[YEAR_KEY]));
        }
        if(data.language){            
            var languageIndex = xAxisLabels.indexOf(data.language.trim());
            data.x = (languageIndex * languageWidth)+120;            
            data.px = (languageIndex * languageWidth)+120;
        }
        

        // console.log(data.y, " year ", data[YEAR_KEY]);
    });
}
var getYears = function(d) {
    return d[YAXIS_DATASOURCE_LABEL]
}

function refreshChartData() {
    d3.csv(FILE_PATH, function(error, treeData) {
        drawChart(treeData);
    });
}

function getUnitDistance(year) {
    if (year != undefined) {
        var prevTick = closest(tickArr, year);
        var res = (year - prevTick) + (tickGap * (tickArr.indexOf(prevTick)));
        return res;
    }
    // will plot at top of the chart if no target year found
    return 0;
}



function closest(array, num) {
    var i = 0;
    var minDiff = 1000;
    var ans;
    for (i in array) {
        var m = Math.abs(num - array[i]);
        if (m < minDiff) {
            minDiff = m;
            ans = array[i];
        }
    }
    return ans;
}


function drawChart(data) {
    yaxis_Max = d3.max(data, getYears);
    yaxis_Min = d3.min(data, getYears);
    computeXAxis(data);
    links = prepareLinks(data);

    drawYAxis(data);
    drawChartArea(data);
    
}

// tickDistance = y(tickArr[2]) - y(tickArr[1]);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<div><strong>Language :</strong> <span style='color:red'>" + d.name + "</span></div>";
    })

function drawYAxis(data) {
    // define the y scale  (vertical)
    var yScale = d3.scale.linear()
        .domain([yaxis_Max, yaxis_Min]) // values between yaxis_Min and yaxis_Max
        .range([height, 0])
        .nice();


    tickArr = yScale.ticks();
    tickDistance = yScale(tickArr[1]) - yScale(tickArr[0]);
    tickGap = tickArr[1] - tickArr[0];
    unitDiff = (tickDistance / tickGap);
    // define the y axis
    var yAxis = d3.svg.axis()
        .orient("left")
        .scale(yScale).ticks(10).tickFormat(d3.format("04d")).tickPadding(8);

    // draw y axis with labels and move in from the size by the amount of padding
    svg.append("g")
        .attr('class', 'y axis')
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + margin.top)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(YAXIS_LABEL_TEXT);
}

function prepareLinks(data) {
    var result = this.groupBy(data, function(item) {
        return $.trim(item[LANGUAGE]);
    });
    data.sort(function(a, b) {
        return a[YAXIS_DATASOURCE_LABEL] - b[YAXIS_DATASOURCE_LABEL];
    });
    var preparedObject = [];
    for (var i = 0; i < data.length; i++) {
        var languageData = data[i];
        var elementSource = $.trim(languageData[VERSIONS]);
        var descendentsArray = languageData[DATASOURCE_DESCE_LABEL].toUpperCase() != NONE ? languageData[DATASOURCE_DESCE_LABEL].split(",") : "";
        for (var desIndex = 0; desIndex < descendentsArray.length; desIndex++) {
            var element = {};
            var descItem = $.trim(descendentsArray[desIndex]);
            element["is_deviated"] = setIsDeviated(data, result, elementSource, descItem);
            element["source"] = elementSource;
            element["target"] = descItem;
            element["childs"] = descendentsArray;            
            element["source_object"] = languageData;
            preparedObject.push(element);
        }

        var ancestorsArray = languageData[DATASOURCE_ANCE_LABEL].toUpperCase() != NONE ? languageData[DATASOURCE_ANCE_LABEL].split(",") : "";
        for (var ancestorIndex = 0; ancestorIndex < ancestorsArray.length; ancestorIndex++) {
            var element = {};
            var descItem = $.trim(ancestorsArray[ancestorIndex]);
            element["is_deviated"] = setIsDeviated(data, result, elementSource, descItem);
            element["source"] = descItem;
            element["target"] = elementSource;            
            element["source_object"] = languageData;
            preparedObject.push(element);
        }
    }
    console.log(preparedObject," preparedObject");
    return preparedObject;
}

function groupBy(array, f) {
    var groups = {};
    array.forEach(function(o) {
        var group = f(o);
        if (groups.hasOwnProperty(group)) {
            groups[group].push($.trim(o[VERSIONS]));
        } else {
            groups[group] = [];
            groups[group].push($.trim(o[VERSIONS]));
        }
    });
    return groups;
}

function setIsDeviated(data, result, elementSource, descItem) {
    var is_deviated = false;
    var languageArrays = Object.keys(result);
    var sourceKey;
    for (var keyIndex = 0; keyIndex < languageArrays.length; keyIndex++) {
        if (!(result[languageArrays[keyIndex]].indexOf(elementSource) < 0)) {
            sourceKey = languageArrays[keyIndex];
            break;
        }
    }
    if (result[sourceKey].indexOf(descItem) < 0) {
        is_deviated = true;
    }
    return is_deviated;
}
function computeXAxis(data){    
    data.forEach(function(eachLanguage){
        languageStore[eachLanguage[VERSIONS]] = eachLanguage;
    });

    var result = this.groupBy(data, function(item) {
        return $.trim(item[LANGUAGE]);
    });
    xAxisLabels = Object.keys(result);
    // width
    languageWidth = width/(xAxisLabels.length+1);
}
//************* End Helper Functions ***********//

refreshChartData();
