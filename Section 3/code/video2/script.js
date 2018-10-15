function prepare(data) {
    // Find all the unique provinces
    provinces = d3.map(data, function(d){return d.Province;}).keys();
    
    // Generate a new array
    locations = [{name:"Canada",inside:"",population:""}]

    for(i=0;i<provinces.length;i++) {
        locations.push({name:provinces[i],inside:"Canada",population:""});
    }
    for(i=0;i<data.length;i++) {
        locations.push({name:data[i].City,inside:data[i].Province,population:parseInt(data[i].Population)});
    }
    return locations;
}
// We can use an asynchronous function to greatly simplify loading the CSV
async function loadCSV() {
    const data = await d3.csv('canada.csv');
    dset = prepare(data); // set the global dataset object
}

function stratify(data) {
    return d3.stratify()
    .id(function(d){return d.name;})
    .parentId(function(d){return d.inside;})
    (data);
}

// Build a hierarchical tree layout
function tree() {
    // Build the root node of our hierarchy
    root = d3.tree()
    .size([640,800])
    (stratify(dset));

    svg = d3.select("svg")
    width = +svg.attr("width")
    height = +svg.attr("height");

    //This group will hold our tree
    g = svg.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);
    
    //Edges are the lines connecting points
    edge = g.append("g")
    .attr("fill", "none")
    .attr("stroke","grey") // color the lines grey
    .attr("stroke-width",1)
    .selectAll("path")
    .data(root.links()) // links() gets the edges between nodes
    .enter().append("path")
    .attr("d", d3.linkHorizontal() // use the linkHorizontal() method to get us our path
        .x(function(d){return d.y;})
        .y(function(d){return d.x;}));

    node = g.append("g")
    .selectAll("g")
    .data(root.descendants().reverse()) // descendents are all of the children
    .enter().append("g") // add a group for each node
    .attr("transform", function(d){ 
        return `translate(${d.y},${d.x})`;});

    node.append("circle")
    .attr("fill", function(d) { return d.children ? "black" : "blue";}) // color the cities blue, otherwise black
    .attr("r", 2);

    node.append("text")
    .attr("dy", "1em")
    .attr("x", 0)
    .attr("text-anchor", function(d){return d.children ? "start" : "end";}) // we need our text to flow left or right depending on root or leaf
    .text(function(d){ return d.data.name;});

}

// This will generate a nice treemap chart, and color the cities based on their province
function treeMap() {
    // Get rid of the SVG element, we're using divs here!
    d3.select("svg").remove;

    scale = d3.scaleOrdinal() // nice little color map
    .range(d3.schemeCategory10);

    root = stratify(dset) // stratify our data, and sum up the total population
    .sum(function(d) { return d.population});

    treemap = d3.treemap() // build a treemap object
    .size([640,480])
    .padding(1)
    (root)

    d3.select("body") // Nice, plain d3 selectAll().data().enter() syntax
    .selectAll(".node")
    .data(root.leaves())
    .enter().append("div")
    .attr("class", "node") // Next, set the size of the squares
    .style("left", function(d) { return d.x0 + "px"; })
    .style("top", function(d) { return d.y0 + "px"; })
    .style("width", function(d) { return d.x1 - d.x0 + "px"; })
    .style("height", function(d) { return d.y1 - d.y0 + "px"; })
    .style("background", function(d){ while(d.depth > 1) d = d.parent; return scale(d.id);})  // Color based on province
    .append("div")
    .attr("class", "node-label") // Add city name
    .text(function(d) { return d.id})
    .append("div")
    .attr("class", "node-value") // Add city population
    .text(function(d) { return d.value});
}
