// ************** Generate the tree diagram	 *****************
var margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = 960 - margin.right - margin.left,
    padding = 100,
    height = 500 - margin.top - margin.bottom;

var i = 0;
var max_n = 0;
var min_n = 0;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) {
        return [d.y, d.x];
    });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var getYears = function(d) {
        return d['FIRST APPEARED']
    }
    // load the external data
d3.csv("data/treeData.csv", function(error, treeData) {
    updateProperties(treeData);
});

function updateProperties(data) {
    max_n = d3.max(data, getYears);
    min_n = d3.min(data, getYears);
    drawYAxis();
    drawChartArea();
}

function drawYAxis() {
    // define the y scale  (vertical)
    var yScale = d3.scale.linear()
        .domain([min_n, max_n]) // values between min_n and max_n
        .range([height, 0]);
    // define the y axis
    var yAxis = d3.svg.axis()
        .orient("left")
        .scale(yScale).ticks(10).tickPadding(8);
    // draw y axis with labels and move in from the size by the amount of padding
    svg.append("g")
        .attr('class', 'y axis')
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Year");
}

function drawChartArea(){
	
}
