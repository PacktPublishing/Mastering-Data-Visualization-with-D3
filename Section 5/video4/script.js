// Use the d3.brush() to add a box selector to our SVG object
function add_brush() {
    svg.append("g")
    .call(d3.brush()
        .on("brush", function() {
            filter_voronoi(d3.event);

    }));
}

function filter_voronoi(e) {
    // Remove any previous diagram
    d3.selectAll('.voronoi')
    .remove();

    // if we haven't selected anything, just return
    if(e.selection == null)
        return;

    // Select the bounding box of our brush
    x0 = xScale.invert(e.selection[0][0]-lmargin);
    x1 = xScale.invert(e.selection[1][0]-lmargin);
    y0 = yScale.invert(e.selection[1][1]);
    y1 = yScale.invert(e.selection[0][1]);
    // We will need to be careful here: if we select < 2 points, we can't draw a delaunay,
    // and d3.Delaunay will throw an exception.
    try {
        // Filter only the points within our selection
        del = new d3.Delaunay(positions(dset.filter(p => ((p.x > x0) && (p.x < x1) && (p.y > y0) && (p.y < y1)))))
        plot_voronoi(del.voronoi([0,0,700,700-bmargin])); 
    }
    catch {
        return;
    }
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

    d3.select("#chartbox")
    .selectAll("circle")
    .data(data) // load our dataset
    .enter()
    .append("circle")
    .attr("r", 2) // use a constant size of r=4 pix
    .attr("cx", function(d,i) {return xScale(d.x);}) // x axis (position)
    .attr("cy", function(d,i) {return yScale(d.y);}) // y axis (position)
    .attr("fill", function(d,i) {return d3.interpolateRdYlBu(color(d.vel));}); // Color based on velocity

}

// Plot the dual to the Delaunay Tesselation, a Voronoi Tesselation
function plot_voronoi(vor) {
    d3.select("#chartbox")
    .append("path")
    .classed('voronoi', true)
    .attr("d", vor.render())
    .attr("fill", "none")
    .attr("stroke", "black");
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
