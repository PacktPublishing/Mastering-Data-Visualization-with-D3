// This simple function here can be used to turn on pan & zoom
function mouse_zoom() {
    // We just need to call the d3.zoom() object, and feed it a function to apply when zooming
    svg.call(d3.zoom()
        .on("zoom", function(){
            g.attr("transform", d3.event.transform);//Use the transform from the event to scale our SVG
            zoom_scale(d3.event);
    }));
}

// This function can be called with an argument (a d3.event)
// to scale the axis labels for the bottom and top
function zoom_scale(e) {
    // we need to use the event's transform to rescale each of the 
    // scales, with rescaleX and rescaleY, and then call those
    // scaled axes on the SVG groups that hold them
    bottom_axis.call(xAxis.scale(e.transform.rescaleX(xScale)));
    left_axis.call(yAxis.scale(e.transform.rescaleY(yScale)));
}

// Draw our galaxy data
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
    .domain(d3.extent(data, function(d) {return parseFloat(d.x);}))
    .rangeRound([0, width])
    .nice();

    yScale = d3.scaleLinear() // vertical scale
    .domain(d3.extent(data, function(d) {return parseFloat(d.y);}))
    .rangeRound([height, 0])
    .nice();

    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);
    
    //This range of continous scales can be colours!
    color = d3.scaleLinear()
    .domain([d3.min(data, function(d){return d.vel;}), d3.max(data, function(d){return d.vel;})]) // Color based on velocity
    .range([1,0]);

    bottom_axis = svg.append("g") // Add the bottom axis 
    .attr("transform", "translate("+lmargin+","+height+")")
    .call(xAxis);

    left_axis = svg.append("g") // Add the left axis 
    .attr("transform", "translate("+lmargin+",0)")
    .call(yAxis);

    bottom_axis.append("text")
    .attr("x", width/2)
    .attr("y", 32)
    .text("x (kpc)");
    left_axis.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -35)
    .attr("x", bmargin-height/2)
    .attr("text-anchor", "end")
    .text("y (kpc)");

    // We will need to make a Deluanay object
    del = new d3.Delaunay(positions(data));
    vor = del.voronoi([0,0,700,700-bmargin]); // also make the Voronoi double
}

// Plot the dual to the Delaunay Tesselation, a Voronoi Tesselation
function plot_voronoi() {
    d3.select("#chartbox")
    .append("path")
    .attr("d", vor.render())
    .attr("fill", "none")
    .attr("opacity", 0.1)
    .attr("stroke", "black");

    d3.select("#chartbox")
    .selectAll("circle")
    .data(dset) // load our dataset
    .enter()
    .append("circle")
    .attr("r", 2) // use a constant size of r=4 pix
    .attr("cx", function(d,i) {return xScale(d.x);}) // x axis (position)
    .attr("cy", function(d,i) {return yScale(d.y);}) // y axis (position)
    .attr("fill", function(d,i) {return d3.interpolateRdYlBu(color(d.vel));}); // Color based on velocity

}

// Convert the data into positions that can be fed into the Delaunay Tesselation
function positions(data) {
    pos = [];
    for(i=0;i<data.length;i++) {
        pos.push(xScale(parseFloat(data[i].x)));
        pos.push(yScale(parseFloat(data[i].y)));
    }
    return pos;
}


// We can use an asynchronous function to greatly simplify loading the CSV
async function loadCSV() {
    const data = await d3.csv('galaxy.csv');
    build_axis(data); // add axes labels
    dset = data; // set the global dataset object
    plot_voronoi();
}
