// This function will be used to plot the volume of the stock
function fill_volume(data) {
    lmargin = 30;
    bmargin = 40;

    // add enough padding to fit the axis labels and ticks
    div = d3.select("#stock-volume")
    svg = div.append("svg")
    width = div.node().offsetWidth-lmargin
    height = div.node().offsetHeight-bmargin
    svg.attr("width", width)
    g = svg.append("g")
    .attr("id", "chartbox")
    .attr("transform", "translate("+lmargin+",0)");

    // IEX dates are formatted YYYY-MM-DD
    tp = d3.timeParse("%Y-%m-%d");

    // Set up a time scale
    xScale = d3.scaleTime()
    .domain(d3.extent(data, function(d) {return tp(d.date);}))
    .range([0, width])

    // Set the bottom of the scale based on the extent of the volume
    yScale = d3.scaleLinear()
    .domain(d3.extent(data, function(d) {return parseFloat(d.volume);}))
    .range([height, 0])

    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format("~s")); // Use SI formatting

    bottom_axis = svg.append("g") // Add the bottom axis 
    .attr("transform", "translate("+lmargin+","+height+")")
    .call(xAxis);

    left_axis = svg.append("g") // Add the left axis 
    .attr("transform", "translate("+lmargin+",0)")
    .call(yAxis);

    // Add a line generator *without* y set, so we can use if
    // for close, low, and high
    line = d3.line()
    .x(function(d) {return xScale(tp(d.date));});

    // Add a curve for the volume
    g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("d", line
        .y(function(d) {return yScale(parseFloat(d.volume));}));

}

// Make a JSON fetch request to IEX to get 5 years of stock data that will populate our charts
async function get_charts(symbol) {
    const d = await d3.json("https://api.iextrading.com/1.0/stock/"+symbol+"/chart/5y");
    fill_volume(d);
}

// Make a JSON fetch request to IEX to company information based on our stock
async function get_stats(symbol) {
    const d = await d3.json("https://api.iextrading.com/1.0/stock/"+symbol+"/company");
    fill_stats(d);
}

// Fetch all of the peers for our stock, we will want to plot them
async function get_peers(symbol) {
    const d = await d3.json("https://api.iextrading.com/1.0/stock/"+symbol+"/peers");
    fill_peers(d);
}

// Add div elements to add the stock charts for each of the peers of our given stock
function fill_peers(data) {
    console.log(data);
    d3.select("#peers-values") // We will use the peers-values div to put our children
    .selectAll(".plotbox") // these children will be classed as div.plotbox
    .data(data)
    .enter()
    .append("div")
    .attr("class", "plotbox col-3") // Let's have 4 3-column cells per 12-column row
    .text(function(d) {return d;})
}

// Fill in the basic information on the company based on what we read in from IEX
function fill_stats(data) {
    d3.select("#company-name")
    .text(data.companyName);

    d3.select("#company-ceo")
    .text(data.CEO);

    d3.select("#company-sector")
    .text(data.industry);

    d3.select("#company-exchange")
    .text(data.exchange);
}
