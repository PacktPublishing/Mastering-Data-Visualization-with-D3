// This simple function is used to plot a scatter plot
// of npoints random numbers, and color them
function plot_function(npoints) {
    data = [...Array(npoints).keys()].map(Math.random);

    //yScale for position
    yScale = d3.scaleLinear()
    .domain([d3.min(data), d3.max(data)])
    .range([d3.select("#chart").style("height").replace("px","")-20, 10]);

    //This range of continous scales can be colours!
    color = d3.scaleLog()
    .domain([d3.min(data), d3.mean(data), d3.max(data)])
    .range([1,0]);

    //Quantized colors can be used to.
    color = d3.scaleQuantize()
    .domain([d3.min(data), d3.max(data)])
    .range(d3.schemeCategory10);

    xScale = d3.scaleLinear()
    .domain([0,npoints])
    .range([0,700]);

    markers = d3.select("#axisbox")
    .attr("transform", "translate(80,-20)")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 2)
    .attr("cx", function(d,i) {return xScale(i);})
    .attr("cy", function(d,i) {return yScale(d);})
    .attr("fill", function(d,i) {return color(d);});

    laxis = d3.axisLeft(yScale)
    .ticks(10, 'f');

    baxis = d3.axisBottom(xScale)
    .ticks(10);

    d3.select("#axisbox")
    .append("g")
    .call(laxis);

    d3.select("#axisbox")
    .append("g")
    .attr("transform", "translate(0,620)")
    .call(baxis)
    .select(".domain")
}

