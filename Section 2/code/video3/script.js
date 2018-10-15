//Our same old plot function, now with axes!
function plot_function(npoints, fmt) {
    data = [...Array(npoints).keys()].map(Math.exp);

    yScale = d3.scaleLog()
    .domain([d3.min(data), d3.max(data)])
    .range([d3.select("#chart").style("height").replace("px","")-20, 0]);

    xScale = d3.scaleLinear()
    .domain([0,npoints])
    .range([0,700]);

    myLine = d3.line()
    .x(function (d,i) {return xScale(i);})
    .y(function (d,i) {return yScale(d);});

    markers = d3.select("#axisbox")
    .attr("transform", "translate(80,-20)")
    .append('path')
    .attr('d', myLine(data));

    //Add a left axis, with format given by the fmt argument, and 10 ticks
    laxis = d3.axisLeft(yScale)
    .ticks(10, fmt);

    //Bottom axis
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

//Here we'll use Date objects for our x values
function time_axis() {
    data = [10,100,1000]
    dates = [new Date("2006"), new Date("2007"), new Date("2008")]

    //Use the time scaling method
    xScale = d3.scaleTime()
    .domain([d3.min(dates), d3.max(dates)])
    .range([0,700]);

    yScale = d3.scaleLinear()
    .domain(d3.extent(data))
    .range([620, 00]);

    myLine = d3.line()
    .x(function (d,i) {return xScale(dates[i]);})
    .y(function (d,i) {return yScale(d);});
    markers = d3.select("#axisbox")
    .attr("transform", "translate(80,-20)")
    .append('path')
    .attr('d', myLine(data));

    laxis = d3.axisLeft(yScale)
    .ticks(10);

    //The time scale will automaticall format our tick labels.
    baxis = d3.axisBottom(xScale)

    d3.select("#axisbox")
    .append("g")
    .call(laxis);

    d3.select("#axisbox")
    .append("g")
    .attr("transform", "translate(0,620)")
    .call(baxis)
    .select(".domain")
}

//Here we will use ordinal labels with no obvious numerical values
function ordinal_axis() {
    data = [10,100,1000];
    names = ["foo", "bar", "baz"];

    xScale = d3.scaleOrdinal() //scaleOrdinal is used to map between our labels and positions
    .domain(["foo", "bar", "baz"])
    .range([0,350,700]);

    yScale = d3.scaleLinear()
    .domain(d3.extent(data))
    .range([620, 00]);

    myLine = d3.line()
    .x(function (d,i) {return xScale(names[i]);})
    .y(function (d,i) {return yScale(d);});
    markers = d3.select("#axisbox")
    .attr("transform", "translate(80,-20)")
    .append('path')
    .attr('d', myLine(data));

    laxis = d3.axisLeft(yScale)
    .ticks(30);

    baxis = d3.axisBottom(xScale)
    .ticks(30);

    d3.select("#axisbox")
    .append("g")
    .call(laxis);

    d3.select("#axisbox")
    .append("g")
    .attr("transform", "translate(0,620)")
    .call(baxis)
    .select(".domain")
}
