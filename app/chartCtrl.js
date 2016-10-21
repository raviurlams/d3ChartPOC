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
    tip = {};

var YAXIS_LABEL_TEXT = "Year";
var YAXIS_DATASOURCE_LABEL = "FIRST APPEARED";
var VERSIONS = "VERSIONS";
var DATASOURCE_DESCE_LABEL = "DIRECT DESCENDANT(S)";
var DATASOURCE_ANCE_LABEL = "DIRECT ANCESTOR(S)";
var NONE = "NONE";
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
    links = [
        { source: "Fortran I", target: "Fortran II" },
        { source: "Fortran II", target: "Fortran IV" },
        { source: "Fortran IV", target: "Fortran 77" },
        { source: "Fortran 77", target: "Fortran 95" },
        { source: "Fortran 95", target: "Fortran 2003" },
        { source: "Fortran 2003", target: "Fortran 2008" }
    ];
    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    });

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
        if (i == 0) {
            data.x = 120;
            data.y = 0;
            data.px = 120;
            data.py = 0;
        } else if (i == 1) {
            data.x = 120;
            data.y = 50;
            data.px = 120;
            data.py = 50;
        } else if (i == 2) {
            data.x = 120;
            data.y = 150;
            data.px = 120;
            data.py = 150;
        } else if (i == 3) {
            data.x = 120;
            data.y = 250;
            data.px = 120;
            data.py = 250;
        } else if (i == 4) {
            data.x = 120;
            data.y = 250;
            data.px = 120;
            data.py = 250;
        } else if (i == 5) {
            data.x = 120;
            data.y = 350;
            data.px = 120;
            data.py = 350;
        } else if (i == 6) {
            data.x = 120;
            data.y = 450;
            data.px = 120;
            data.py = 450;
        }
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

function drawChart(data) {
    yaxis_Max = d3.max(data, getYears);
    yaxis_Min = d3.min(data, getYears);
    //links = prepareLinks(data);
    drawYAxis();
    drawChartArea(data);

}


var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<div><strong>Language :</strong> <span style='color:red'>" + d.name + "</span></div>";
    })

function drawYAxis() {
    // define the y scale  (vertical)
    var yScale = d3.scale.linear()
        .domain([yaxis_Max, yaxis_Min]) // values between yaxis_Min and yaxis_Max
        .range([height, 0])
        .nice();
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
    data.sort(function(a, b) {
        return a[YAXIS_DATASOURCE_LABEL] - b[YAXIS_DATASOURCE_LABEL];
    });
    var preparedObject = [];
    for (var i = 0; i < data.length; i++) {
        var languageData = data[i];
        var elementSource = languageData[VERSIONS];
        var descendentsArray = languageData[DATASOURCE_DESCE_LABEL].toUpperCase() != NONE ? languageData[DATASOURCE_DESCE_LABEL].split(",") : "";
        for (var desIndex = 0; desIndex < descendentsArray.length; desIndex++) {
            var element = {};
            var descItem = descendentsArray[desIndex];
            element["source"] = elementSource;
            element["target"] = descItem;
            preparedObject.push(element);
        }

        var ancestorsArray = languageData[DATASOURCE_ANCE_LABEL].toUpperCase() != NONE ? languageData[DATASOURCE_ANCE_LABEL].split(",") : "";
        for (var ancestorIndex = 0; ancestorIndex < ancestorsArray.length; ancestorIndex++) {
            var element = {};
            var descItem = ancestorsArray[ancestorIndex];
            element["source"] = descItem;
            element["target"] = elementSource;
            preparedObject.push(element);
        }
    }
    return preparedObject;
}
//************* End Helper Functions ***********//

refreshChartData();
