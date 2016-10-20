//************* CONSTANTS ***************//
var margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = 960 - margin.right - margin.left,
    padding = 100,
    height = 500 - margin.top - margin.bottom,
    yaxis_Max = 0,
    yaxis_Min = 0;

var YAXIS_LABEL_TEXT = "Year";
var YAXIS_DATASOURCE_LABEL = "FIRST APPEARED";
var FILE_PATH = "data/treeData.csv";

//************* END of CONSTANTS ***************//

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



function drawChart(data) {
    yaxis_Max = d3.max(data, getYears);
    yaxis_Min = d3.min(data, getYears);
    
    drawYAxis();
    drawChartArea();
}

function drawYAxis() {
    // define the y scale  (vertical)
    var yScale = d3.scale.linear()
        .domain([yaxis_Max, yaxis_Min]) // values between yaxis_Min and yaxis_Max
        .range([height, 0]);
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

function drawChartArea() {
    
}
//************* Helper Functions ***************//
var getYears = function(d) {
    return d[YAXIS_DATASOURCE_LABEL]
};

function refreshChartData() {
    d3.csv(FILE_PATH, function(error, treeData) {
        drawChart(treeData);
    });
}
//************* End Helper Functions ***********//


refreshChartData();
