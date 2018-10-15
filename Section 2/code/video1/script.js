//Draw a random-walk line plot with npoints samples
function random_walk(npoints) {
    data = [...Array(npoints).keys()].map(Math.random);

    //This will scale our data in the y-axis
    yScale = d3.scaleLinear()
    .domain([0, d3.max(data)]) // data range
    .range([0,d3.select("#chart").style("height").replace("px","")]) // screen range
    .clamp(true);

    myLine = d3.line()
    .x(function (d,i) {return i*800/npoints;})
    .y(function (d,i) {return yScale(d);}); 
    markers = d3.select("#chart")
    .append('path')
    .attr('d', myLine(data));
}
