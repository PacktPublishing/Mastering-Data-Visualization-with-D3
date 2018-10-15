function build_axis(data) {
    lmargin = 50;
    bmargin = 40;

    // add enough padding to fit the axis labels and ticks
    svg = d3.select("svg")
    width = +svg.attr("width") - lmargin;
    height = +svg.attr("height") - bmargin;
    g = svg.append("g")
    .attr("id", "chartbox")
    .attr("transform", "translate("+lmargin+",0)");

    xScale = d3.scaleLinear() // horizontal scale
    .domain(d3.extent(data, function(d) {return parseFloat(d.g_bar);}))
    .rangeRound([0, width])
    .nice();

    yScale = d3.scaleLinear() // vertical scale
    .domain(d3.extent(data, function(d) {return parseFloat(d.g_obs);}))
    .rangeRound([height, 0])
    .nice();

    g.append("g") // Add the bottom axis and label
    .attr("transform", "translate(0,"+height+")")
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width/2)
    .attr("y", 32)
    .text("log g")
    .append("tspan")
    .attr("baseline-shift", "sub")
    .text("bar")
    .append("tspan")
    .attr("baseline-shift", "baseline")
    .text("(m/s")
    .append("tspan")
    .attr("baseline-shift", "super")
    .text("2")
    .append("tspan")
    .attr("baseline-shift", "baseline")
    .text(")")

    g.append("g") // Ad the left axis and label
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -35)
    .attr("x", bmargin-height/2)
    .attr("text-anchor", "end")
    .text("log g")
    .append("tspan")
    .attr("baseline-shift", "sub")
    .text("obs")
    .append("tspan")
    .attr("baseline-shift", "baseline")
    .text("(m/s")
    .append("tspan")
    .attr("baseline-shift", "super")
    .text("2")
    .append("tspan")
    .attr("baseline-shift", "baseline")
    .text(")")

    g.append("line") // Add a simple 1-to-1 line
    .attr("style", "stroke:red")
    .attr("x1", xScale(d3.min(data, function(d) {return 1.5+Math.floor(d.g_bar);})))
    .attr("x2", xScale(d3.max(data, function(d) {return 1.5+Math.floor(d.g_bar);})))
    .attr("y1", yScale(d3.min(data, function(d) {return 1.5+Math.floor(d.g_bar);})))
    .attr("y2", yScale(d3.max(data, function(d) {return 1.5+Math.floor(d.g_bar);})))

}

function plot_points() {
    d3.select("#chartbox")
    .selectAll("circle")
    .data(dset) // load our dataset
    .enter()
    .append("circle")
    .attr("r", 2) // use a constant size of r=2 pix
    .attr("cx", function(d,i) {return xScale(d.g_bar);}) // Baryonic mass on the x-axis
    .attr("cy", function(d,i) {return yScale(d.g_obs);}); // Observed mass on the y-axis
}

function plot_contour() {
    // Colours for the contours
    colour = d3.scaleSequential(d3.interpolateInferno)
    .domain([0,0.1]);

    contours = d3.contourDensity() // Build a contourDensity object
    .x(function(d,i) {return xScale(d.g_bar);})
    .y(function(d,i) {return yScale(d.g_obs);})
    .size([width, height])
    .bandwidth(20); // This sets how "tight" our contours are"

    d3.select("#chartbox")
    .selectAll("path")
    .data(contours(dset)) // Use the contours as our data set
    .enter()
    .append("path")
    .attr("class", "contour")
    .attr("stroke", "green")
    .attr("fill", function(d) {return colour(d.value);})
    .attr("d", d3.geoPath()); // geoPath will be important later :)
}

// We can use an asynchronous function to greatly simplify loading the CSV
async function loadCSV() {
    const data = await d3.csv('rar.csv');
    build_axis(data); // add axes labels
    dset = data; // set the global dataset object
}
