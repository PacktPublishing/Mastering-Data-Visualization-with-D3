
// We can use an asynchronous function to greatly simplify loading the CSV
async function loadCSV() {
    const data = await d3.csv('canada.csv');
    dset = data; // set the global dataset object
}

function parse(data) {
    newdata = []
    for(i=0;i<data.length;i++)
    {
        // use parseFloat to convert our strings to floats
        newdata.push(data[i].map(parseFloat));
    }
    return newdata;
}

function plotChord() {

    chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);

    // Use parse to remove the labels from the CSV and return an adjacency matrix
    chords = chord(parse(dset.map(Object.values)));

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
    .attr("d", arc);

    svg.append("g")
    .selectAll("path")
    .data(chords)
    .enter().append("path")
    .attr("d", trade)
    .attr("fill", function(d){return scale(d.target.index);})
}

// Add labels to the arcs
function plotLabels() {
    // The names of the labels
    provinces = Object.keys(dset[0]);

    g.append("text")
    .attr("x", 6)
    .attr("dy", 15)
    .append("textPath")// Textpath will let our text curve to fit the arc
    .attr("xlink:href", function(d){return `#group${d.index}`;})
    .text(function(d, i){return provinces[i];});

}
