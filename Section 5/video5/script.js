// Add a drag event using d3.drag()
function enable_drag() {
    svg.call(d3.drag()
        .on('drag', function() {
            move_point(d3.event);
        }));
}

function move_point(e) {
    // Clear out the tooltip to prevent smearing it
    d3.selectAll('.tooltip')
    .remove();

    // Find the Delaunay generator point nearest to the drag event
    target = del.find(e.subject.x-lmargin,e.subject.y);

    // Move the generator
    dset[target].x = xScale.invert(xScale(dset[target].x)+e.dx);
    dset[target].y = yScale.invert(yScale(dset[target].y)+e.dy);

    // Append a nice little tooltip indicator
    g.append('circle')
    .classed('tooltip', true)
    .attr('cx', xScale(dset[target].x))
    .attr('cy', yScale(dset[target].y))
    .attr('r', 4)
    .attr('fill', 'red');
    draw();
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

}

// Plot the dual to the Delaunay Tesselation, a Voronoi Tesselation
function plot_voronoi() {
    d3.select("#chartbox")
    .append("path")
    .classed('voronoi', true)
    .attr("d", vor.render())
    .attr("fill", "none")
    .attr("stroke", "black");

    d3.select("#chartbox")
    .append("path")
    .classed('generator', true)
    .attr("d", del.renderPoints())
    .attr("fill", "black");
}

// Colour in the cells of the Voronoi diagram based on the velocity of the generator point.
function fill_voronoi() {
    for(i=0;i<dset.length;i++) {
        d3.select("#chartbox")
        .append("path")
        .classed("cell", true)
        .attr("d", vor.renderCell(i))
        .attr("fill", function() {return d3.interpolateRdYlBu(color(dset[i].vel));});
    }
    plot_voronoi();
}

// Convert the data into positions that can be fed into the Delaunay Tesselation
function positions(data) {
    pos = [];
    for(i=0;i<data.length;i++) {
        pos.push(xScale(data[i].x));
        pos.push(yScale(data[i].y));
    }
    return pos;
}

// Make all our positions floats
function floatify(data) {
    for(i=0;i<data.length;i++) {
        data[i].x = parseFloat(data[i].x);
        data[i].y = parseFloat(data[i].y);
    }
    return data;
}

function draw() {
    d3.selectAll('.voronoi')
    .remove();
    d3.selectAll('.cell')
    .remove();
    d3.selectAll('.generator')
    .remove();
    d3.selectAll('.tooltip')
    .remove();

    // We will need to make a Deluanay object
    del = new d3.Delaunay(positions(dset));
    vor = del.voronoi([0,0,700,700-bmargin]); // also make the Voronoi double
    plot_voronoi();
}


// We can use an asynchronous function to greatly simplify loading the CSV
async function loadCSV() {
    const data = await d3.csv('galaxy.csv');
    dset = floatify(data); // set the global dataset object
    build_axis(dset); // add axes labels
    draw();
}
