//This method can be called to plot using divs
function plotDiv(data) {
    d3.select("#chart")
    .selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .attr("class", "bar") //width is all we need to change, since the divs will be placed one after the next
    .style("width", function(d) { return d.Population/1.e5;});
}

//This method can be called add SVG rects for each element in the bar chart
function plotSVG(data) {
    d3.select("#chart")
    .append("svg")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect") // we need to change the positions of the rectanges so they don't overlap
    .attr("y", function(d, i) { return 600-d.Population/1.e5;})
    .attr("x", function(d, i) { return i*40;})
    .attr("width", "40") // the height must be set based on the data
    .attr("height", function(d, i) { return d.Population/1.e5;});
}

// This method can be called to use the canvas to draw a bar chart
function plotCanvas(data) {
    d3.select("#chart")
    .append("canvas")
    .attr("width", 800)
    .attr("height", 640)
    .selectAll("canvas.rect")
    .data(data)
    .enter()
    .append("custom") //here we're going to add custom DOM elements
    .classed("rect", true)
    .attr("fillStyle", "green") //these attributes will be read by our draw() function
    .attr("y", function(d, i) { return 600-d.Population/1.e5;})
    .attr("x", function(d, i) { return i*45;})
    .attr("width", "40")
    .attr("height", function(d, i) { return d.Population/1.e5;});
    draw();
}

// With the canvas, we need to explicitly draw on the raster image
function draw() {
    // Start by clearing the screen
    var ctx = d3.select("canvas").node().getContext("2d");
    ctx.clearRect(0,0,800,640);

    // iterate through all of the custom rects, and draw them with fillRect
    var elements = d3.selectAll("custom.rect");
    elements.each(function(d) {
        var node = d3.select(this);
        ctx.fillStyle = node.attr("FillStyle");
        console.log(node.attr("height"));
        ctx.fillRect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
    });
}

// Load in the data, and use one of our plot functions.
function plot() {
    d3.csv("data.csv")
    .then(function(d) {
        plotCanvas(d);
    });
}

