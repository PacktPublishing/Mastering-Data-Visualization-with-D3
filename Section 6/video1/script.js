// Plot a stock based on a set of IEX data fed in from get_stock
function plot_stock(data) {
    lmargin = 50;
    bmargin = 40;

    // add enough padding to fit the axis labels and ticks
    svg = d3.select("svg")
    width = +svg.attr("width") - lmargin;
    height = +svg.attr("height") - bmargin;
    g = svg.append("g")
    .attr("id", "chartbox")
    .attr("transform", "translate("+lmargin+",0)");

    // IEX dates are formatted YYYY-MM-DD
    tp = d3.timeParse("%Y-%m-%d");

    // Set up a time scale
    xScale = d3.scaleTime()
    .domain(d3.extent(data, function(d) {return tp(d.date);}))
    .range([0, width])

    // Set the bottom of the scale based on the low and the top based on the high
    yScale = d3.scaleLinear()
    .domain([0.9*d3.min(data, function(d){return parseFloat(d.low);}), 1.1*d3.max(data, function(d){return parseFloat(d.high);})])
    .range([height, 0])

    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale);

    bottom_axis = svg.append("g") // Add the bottom axis 
    .attr("transform", "translate("+lmargin+","+height+")")
    .call(xAxis);

    left_axis = svg.append("g") // Add the left axis 
    .attr("transform", "translate("+lmargin+",0)")
    .call(yAxis);

    bottom_axis.append("text")
    .attr("x", width/2)
    .attr("y", 32)
    .text("Date");
    left_axis.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -35)
    .attr("x", bmargin-height/2)
    .attr("text-anchor", "end")
    .text("Price");

    //Add a line generator *without* y set, so we can use if
    //for close, low, and high
    line = d3.line()
    .x(function(d) {return xScale(tp(d.date));});

    g.append("path")
    .datum(data)
    .attr("stroke", "black")
    .attr("fill", "none")
    .attr("d", line
        .y(function(d) {return yScale(parseFloat(d.close));}));

    // Add a curve for the low
    g.append("path")
    .datum(data)
    .attr("stroke", "red")
    .attr("opacity", "0.5")
    .attr("fill", "none")
    .attr("d", line
        .y(function(d) {return yScale(parseFloat(d.low));}));

    //Add a curve for the high
    g.append("path")
    .datum(data)
    .attr("stroke", "blue")
    .attr("opacity", "0.5")
    .attr("fill", "none")
    .attr("d", line
        .y(function(d) {return yScale(parseFloat(d.high));}));

}

//Make a JSON fetch request to IEX to get stock data.
async function get_stock(symbol) {
    const d = await d3.json("https://api.iextrading.com/1.0/stock/"+symbol+"/chart/5y");
    plot_stock(d);
}
