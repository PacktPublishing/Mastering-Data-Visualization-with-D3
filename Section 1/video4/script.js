//This function can draw a different shape, given by the
//first argument, and then scale it based on the next two
//arguments (length/height)
function draw_svg(shape, size1, size2) {
    data = [100,200,300]
    markers = d3.select("#chart")
    .append("svg")
    .selectAll(shape)
    .data(data)
    .enter()
    .append(shape);
    if(shape == "rect") {
        markers.attr("width", size1)
        .attr("height", size2)
        .attr("y", function(d) { return d;})
        .attr("x", function(d) { return 2*d;});
    }
    if(shape == "circle") {//with a circle, we of course ignore the second size
        markers.attr("r", size1)
        .attr("cy", function(d) { return d;})
        .attr("cx", function(d) { return 2*d;});
    }
    if(shape == "ellipse") {
        markers.attr("rx", size1)
        markers.attr("ry", size2)
        .attr("cy", function(d) { return d;})
        .attr("cx", function(d) { return 2*d;});
    }
    if(shape == "line") {
        markers.attr("x1", size1)
        markers.attr("y1", size2)
        .attr("y2", function(d) { return d;})
        .attr("x2", function(d) { return 2*d;});
    }
    if(shape == "polygon") { // we will use a simple fixed polygon here
        markers.attr("points", "50 50, 75 75, 100 50")
    }
}

//Draw a num simple random walks with npoints samples
function random_walk(num, npoints) {
    //with just a single line
    if (num == 1) {
        //generate an array with npoints random numbers
        data = [...Array(npoints).keys()].map(Math.random);
        myLine = d3.line() //this is our line generator
        .x(function (d,i) {return i*800/npoints;})
        .y(function (d,i) {return d*640;});
        markers = d3.select("#chart")
        .append("svg")
        .append('path') // we will use a path to show our line
        .attr('d', myLine(data));
    }
    else {
        // Generate a color scheme with 10 different colors
        colors = d3.scaleOrdinal(d3.schemeCategory10);
        //generate our 2d array of random numbers
        data = [...Array(npoints).keys()].map(x => [...Array(num).keys()].map(y => Math.random()));
        stack = d3.stack()//use the stack method to layer the different areas
        .keys([...Array(num).keys()])
        myArea = d3.area()
        .x(function (d,i) {return i*800/npoints;})
        .y0(function (d,i) {return 640-d[0]*640/num;})
        .y1(function (d,i) {return 640-d[1]*640/num;});
        markers = d3.select("#chart")
        .append("svg")
        .selectAll("path")
        .data(stack(data))
        .enter()
        .append('path')//unlike the simple line, we'll use the fill here to show different random walks
        .style("fill", function(d, i) {return colors(i);})
        .attr('d', myArea);
    }
}
