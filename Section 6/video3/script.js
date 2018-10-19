// This function will be run and called to generate all of the plot elements for our dashboard
function setup(symbol) {
    get_stats(symbol); // Add the text-based statistics for our stock
    get_charts(symbol); // Generate volume & price plots for our stock chart
    get_peers(symbol); // Add plots for each of our peer stocks
}

// Very simple function, just returns the result of a d3.json async lookup
// from the IEX stock database
async function fetch_chart(symbol) {
    const d = await d3.json("https://api.iextrading.com/1.0/stock/"+symbol+"/chart/2y");
    return d;
}
// Make a JSON fetch request to IEX to get 5 years of stock data that will populate our charts
async function get_charts(symbol) {
    const d = await fetch_chart(symbol);
    var chart = stock_chart();
    d3.select("#stock-val")
    .datum(d)
    .call(chart.y0("close").y1("high").y2("low"));

    d3.select("#stock-volume")
    .datum(d)
    .call(chart.y0("volume"));
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
async function fill_peers(data) {
    var plot = d3.select("#peers-values") // We will use the peers-values div to put our children
    .selectAll(".plotbox") // these children will be classed as div.plotbox
    .data(data)
    .enter()
    .append("div")
    .attr("class", "plotbox col-3"); // Let's have 4 3-column cells per 12-column row

    plot.append("div") // Add a label for each one with the stock symbol
    .attr("class", "label") 
    .text(function(d) {return d;})
    .append("hr");

    plot.append("div") // This div will store each of our peer plots, and be identified using the symbol
    .attr("class", "peer")
    .attr("id", function(d) {return "peer-"+d;})

    var chart = stock_chart().y0("close").y1("high").y2("low"); // We'll use the same plot here, so we can set the keys once
    for(var i=0;i<data.length;i++) {
        // Grab chart data for each of our peers and plot it
        const d = await fetch_chart(data[i]);
        d3.select("#peer-"+data[i])
        .datum(d)
        .call(chart);
    }
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
