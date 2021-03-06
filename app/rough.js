//************* CONSTANTS ***************//
var margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = 960 - margin.right - margin.left,
    padding = 100,
    height = 500 - margin.top - margin.bottom,
    yaxis_Max = 0,
    yaxis_Min = 0;
 var color = d3.scale.category10();

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

function drawChartArea() {
    var links = [
        { source: "Microsoft", target: "Amazon"},
        { source: "Microsoft", target: "HTC"},
        { source: "Samsung", target: "Apple"},
        { source: "Motorola", target: "Apple"},
        { source: "Nokia", target: "Apple"},
        { source: "HTC", target: "Apple"},
        { source: "Kodak", target: "Apple"},
        { source: "Microsoft", target: "Barnes & Noble"},
        { source: "Microsoft", target: "Foxconn"},
        { source: "Oracle", target: "Google"},
        { source: "Apple", target: "HTC"},
        { source: "Microsoft", target: "Inventec"},
        { source: "Samsung", target: "Kodak"},
        { source: "LG", target: "Kodak"},
        { source: "RIM", target: "Kodak"},
        { source: "Sony", target: "LG"},
        { source: "Kodak", target: "LG"},
        { source: "Apple", target: "Nokia"},
        { source: "Qualcomm", target: "Nokia"},
        { source: "Apple", target: "Motorola"},
        { source: "Microsoft", target: "Motorola"},
        { source: "Motorola", target: "Microsoft"},
        { source: "Huawei", target: "ZTE"},
        { source: "Ericsson", target: "ZTE"},
        { source: "Kodak", target: "Samsung"},
        { source: "Apple", target: "Samsung"},
        { source: "Kodak", target: "RIM"},
        { source: "Nokia", target: "Qualcomm"}
    ];

    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    });
    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-300)
        .on("tick", tick)
        .start();

    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z")
        // .style("fill", function(d) {
        //     console.log(d)
        //   return color(1);
        // });

    var link = svg.selectAll(".link")
        .data(force.links())
        .enter().append("line")
        .attr("class", "link")
        .attr("marker-end", "url(#arrowhead)");

    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        //.call(force.drag);

    node.append("circle")
        .attr("r", 4.5);

    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name;
        });

    function tick() {
        link
            .attr("x1", function(d) {
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

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    function mouseover() {
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 6);
    }

    function mouseout() {
        d3.select(this).select("circle").transition()
            .duration(750)
            .attr("r", 4.5);
    }

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
