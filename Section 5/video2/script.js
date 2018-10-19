function plotChord(data) {
    chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);

    // Use parse to remove the labels from the CSV and return an adjacency matrix
    chords = chord(parse(data.map(Object.values)));

    // Set up our SVG object to center the viewbox
    svg = d3.select("svg")
    .attr("viewBox", [-400,-400,800,800])
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)

    scale = d3.scaleOrdinal() // nice little color map
    .range(d3.schemeCategory10);

    // Each arc will show a province.  Arcs are circle segments
    arc = d3.arc()
    .innerRadius(380)
    .outerRadius(400);

    // Ribbons are the d3 objects that will connect our arcs
    // showing trade between provinces
    trade = d3.ribbon()
    .radius(380);

    // This group will hold our chord layout
    g = svg.append("g")
    .selectAll("g")
    .data(chords.groups)
    .enter().append("g");

    g.append("path")
    .attr("id", function(d){return `group${d.index}`;})
    .attr("fill", function(d){return scale(d.index);})
    .attr("d", arc)
    .append("title")
    .text(function(d, i){return provinces[i];});

    //Add ribbon arcs for all our trade values
    svg.append("g")
    .selectAll("path")
    .data(chords)
    .enter().append("path")
    .classed("trade", true)
    .attr("d", trade)
    .attr("fill", function(d){return scale(d.target.index);})
}

// This method adds a title element to the SVG for each ribbon
function title_tooltip() {
    d3.selectAll('.trade')
    .on("mouseover", function(){
        d3.selectAll('.trade')
        .attr('opacity', 0.2);// Set all ribbons transparent

        elem = d3.select(this);
        elem.attr('opacity', 1);// Set This element opaque
        elem.append("title")//Add a title element
        .text(function(d, i){
            return `Trade from ${provinces[d.target.index]} to ${provinces[d.target.subindex]}\n ${d.target.value} Million CAD`;
        });
    })
    .on("mouseout", function(){
        d3.selectAll('.trade') // reset the opacity
        .attr('opacity', 1);
    });

}

// Build a more sophisticated tooltip using SVG rects
function svg_tooltip() {
    d3.selectAll('.trade')
    .on("mouseover", function(){
        elem = d3.select(this);
        d = elem.data()[0];
        // Get the bounding box of the ribbon
        // we will use this to set where our tooltip lives
        bbox = elem.node().getBBox();

        // Make an SVG group for our tooltip
        tt = svg.append("g")
        .classed("tooltip", true);

        // This rect will be the background of the tooltip
        box = tt.append('rect')
        .attr('x', bbox.x+0.375*bbox.width)
        .attr('y', bbox.y+0.375*bbox.height)
        .attr('rx', 5) // round the corners
        .attr('ry', 5)
        .attr('opacity', 0.5)
        .attr('fill', 'black');
        
        // This text will be the information of the tooltip.
        label = tt.append('text')
        .attr('x', 5+bbox.x+0.375*bbox.width)
        .attr('y', 15+bbox.y+0.375*bbox.height)
        .attr('fill', 'white')
        .text(`Trade from ${provinces[d.target.index]} to ${provinces[d.target.subindex]}:`)
        .append('tspan')// Use a tspan to make a multi-line tooltip.
        .attr('x', 5+bbox.x+0.375*bbox.width)
        .attr('dy', 15)
        .text(`${d.target.value} Million CAD`);

        // We will now use the bounding box of the text to 
        // scale the box itself
        box.attr('width', 10+label.node().getBBox().width)
        .attr('height', 10+label.node().getBBox().height);

        // Set all the other ribbons transparent
        d3.selectAll('.trade')
        .attr('opacity', 0.2);
        elem.attr('opacity', 1);
    })
    .on("mouseout", function(){
        d3.selectAll('.trade')
        .attr('opacity', 1);

        // Destroy the SVG g for our tooltip on mouseout.
        d3.selectAll('.tooltip')
        .remove();
    });

}

// Add labels to the arcs
function plotLabels(data) {

    g.append("text")
    .attr("x", 6)
    .attr("dy", 15)
    .append("textPath")// Textpath will let our text curve to fit the arc
    .attr("xlink:href", function(d){return `#group${d.index}`;})
    .text(function(d, i){return provinces[i];});

}

// We can use an asynchronous function to greatly simplify loading the CSV
async function loadCSV() {
    const data = await d3.csv('canada.csv');
    provinces = Object.keys(data[0]);
    plotChord(data);
    plotLabels(data);
}

function parse(data) {
    newdata = []
    for(i=0;i<data.length;i++)
    {
        // use parseFloat to convert our strings to floats
        newdata.push(data[i].map(parseFloat));
    }
    // The names of the labels
    return newdata;
}

