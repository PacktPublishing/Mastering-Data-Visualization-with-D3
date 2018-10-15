//Apply function f to values from 0 to npoints, and use yScale to translate them to screen coordinates
function plot_function(npoints, f, yScale) {
    data = [...Array(npoints).keys()].map(f);

    yScale.domain([d3.min(data), d3.max(data)])
    .range([d3.select("#chart").style("height").replace("px",""), 0]);

    myLine = d3.line()
    .x(function (d,i) {return i*800/npoints;})
    .y(function (d,i) {return yScale(d);});
    markers = d3.select("#chart")
    .append('path')
    .attr('d', myLine(data));
}

// turn our number into a string
function stringy(n) {
    return "This number is: "+n;
}
