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
    
    //This range of continous scales can be colours!
    color = d3.scaleLinear()
    .domain([d3.min(data, function(d){return d.vel;}), d3.max(data, function(d){return d.vel;})]) // Color based on velocity
    .range([1,0]);

    g.append("g") // Add the bottom axis and label
    .attr("transform", "translate(0,"+height+")")
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", width/2)
    .attr("y", 32)
    .text("x (kpc)");

    g.append("g") // Ad the left axis and label
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -35)
    .attr("x", bmargin-height/2)
    .attr("text-anchor", "end")
    .text("y (kpc)");

    // We will need to make a Deluanay object
    del = new d3.Delaunay(positions(data));
    vor = del.voronoi([0,0,700,700-bmargin]); // also make the Voronoi double
}

// Use a simple scatter plot, coloured by velocity, to show the rotation
function plot_points() {
    d3.select("#chartbox")
    .selectAll("circle")
    .data(dset) // load our dataset
    .enter()
    .append("circle")
    .attr("r", 4) // use a constant size of r=4 pix
    .attr("cx", function(d,i) {return xScale(d.x);}) // x axis (position)
    .attr("cy", function(d,i) {return yScale(d.y);}) // y axis (position)
    .attr("fill", function(d,i) {return d3.interpolateRdYlBu(color(d.vel));}); // Color based on velocity
}

// Connect all of the points with their nearest neighbours to make a Delaunay Tesselation
function plot_delaunay() {
    // Use the simple render() method to dump out an SVG path.
    d3.select("#chartbox")
    .append("path")
    .attr("d", del.render())
    .attr("fill", "none")
    .attr("stroke", "black");

    // Add points as well
    d3.select("#chartbox")
    .append("path")
    .attr("d", del.renderPoints())
    .attr("fill", "black");
}

// Plot the dual to the Delaunay Tesselation, a Voronoi Tesselation
function plot_voronoi() {
    d3.select("#chartbox")
    .append("path")
    .attr("d", vor.render())
    .attr("fill", "none")
    .attr("stroke", "black");

    d3.select("#chartbox")
    .append("path")
    .attr("d", del.renderPoints())
    .attr("fill", "black");
}

// Colour in the cells of the Voronoi diagram based on the velocity of the generator point.
function fill_voronoi() {
    for(i=0;i<dset.length;i++) {
        d3.select("#chartbox")
        .append("path")
        .attr("d", vor.renderCell(i))
        .attr("fill", function() {return d3.interpolateRdYlBu(color(dset[i].vel));});
    }
    plot_voronoi();
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
}
