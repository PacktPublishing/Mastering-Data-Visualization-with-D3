// This is our new, generic and reusable time
// series plotting function.  It can plot between 1 
// and 3 curves, with the first line highlighted in orange
function stock_chart() {
    // These are the state variables for our chart
    var margin={top:0,right:0,bottom:40,left:30},//margins for the axes
        width = 300,//default height
        height = 150,//defualt width
        tp = d3.timeParse("%Y-%m-%d"),//IEX time format
        xValue = function(d) {return tp(d.date);},//Get the x value
        yk0 = "",//Key for primary curve
        yk1 = "",//Key for secondary curve
        yk2 = "",//Key for tertiary curve
        xScale = d3.scaleTime(),//A basic time scale
        yScale = d3.scaleLinear(),//Linear scale is fine here
        xAxis = d3.axisBottom(xScale),//x-axis
        yAxis = d3.axisLeft(yScale).tickFormat(d3.format("~s")),//y-axis, use SI units
        line = d3.line().x(function(d) {return xScale(xValue(d));}),//Line generator
        t = d3.transition().duration(750), //transition for zooming
        brush = d3.brushX(), //brush to select zoom
        g = null; //group which holds chartbox

    // This function is what we will be able to call subsequently to
    // actually draw the chart
    function chart(selection) {
        selection.each(function (data) {
            // We can use the boundingClientRect to get a computed width and height
            // (even if this isn't explicitly set)
            width = this.getBoundingClientRect().width;
            height = this.getBoundingClientRect().height;

            // Set the scale domain & range based on the data extent
            xScale.domain(d3.extent(data, xValue))
            .range([0, width-margin.left-margin.right]);

            yScale.domain(d3.extent(data, function(d) {return yValue(d, yk0);}))
            .range([height-margin.top-margin.bottom, 0]);

            // Let's append the SVG object that will be our plot
            var svg = d3.select(this)
                .append("svg")
                .attr("height", height)
                .attr("width", width)

            // Add a group with margins to hold the plot curve
            g = svg.append("g")
            .attr("id", "chartbox")
            .attr("transform", "translate("+margin.left+","+margin.top+")");

            var bottom_axis = svg.append("g") // Add the bottom axis 
            .datum(data)
            .attr("class", "axis--x")
            .attr("transform", "translate("+margin.left+","+(height-margin.bottom-margin.top)+")")
            .call(xAxis);

            var left_axis = svg.append("g") // Add the left axis 
            .attr("transform", "translate("+margin.left+",0)")
            .call(yAxis);
                
            // Draw our primary line
            g.append("path")
            .datum(data)
            .attr("class", "curve primary")
            .attr("stroke", "#f2aa1f")
            .attr("d", line
            .y(function(d) {return yScale(yValue(d, yk0));}));
            
            // Add extra lines if the two extra keys are set
            if (yk1 != "") {
                g.append("path")
                .datum(data)
                .attr("class", "curve secondary")
                .attr("stroke", "#767a88")
                .attr("d", line
                .y(function(d) {return yScale(yValue(d, yk1));}));
            }
            if (yk2 != "") {
                g.append("path")
                .datum(data)
                .attr("class", "curve tertiary")
                .attr("stroke", "#767a88")
                .attr("d", line
                .y(function(d) {return yScale(yValue(d, yk2));}));
            }

            // Make sure the brush only covers the chart area
            brush.extent([[0,0], [width-margin.right-margin.left, height-margin.top-margin.bottom]]);
            
            // Add a brush event
            g.append("g")
            .attr("class", "brush")
            .call(brush
                .on("end", function() {
                    var s = d3.event.selection; // Grab the area selected
                    if(s) {
                        // Convert the selected area into a domain
                        var domain = s.map(xScale.invert, xScale);
                        // Scale the x domain
                        xScale.domain(domain);
                        // Scale the x axis
                        g.select('.axis--x')
                        .transition(t)
                        .call(xAxis);

                        // Scale the three curves
                        g.select(".primary")
                        .transition(t)
                        .attr("d", line
                        .y(function(d) {return yScale(yValue(d, yk0));}));
                        g.select(".secondary")
                        .transition(t)
                        .attr("d", line
                        .y(function(d) {return yScale(yValue(d, yk1));}));
                        g.select(".tertiary")
                        .transition(t)
                        .attr("d", line
                        .y(function(d) {return yScale(yValue(d, yk2));}));
                        
                        // Reset the brush
                        g.select('.brush').call(brush.move, null)
                    }
            }));
        });
    }

    // In order to link charts, we need to have getter/setters for the scales,
    // axis, chart, and brush objects
    chart.g = function(_) {
        if (!arguments.length) return g;//getter
        g = _;//setter
        return chart;
    }

    chart.xScale = function(_) {
        if (!arguments.length) return xScale;//getter
        xScale = _;//setter
        return chart;
    }

    chart.yScale = function(_) {
        if (!arguments.length) return yScale;//getter
        yScale = _;//setter
        return chart;
    }

    chart.xAxis = function(_) {
        if (!arguments.length) return xAxis;//getter
        xAxis = _;//setter
        return chart;
    }

    chart.yAxis = function(_) {
        if (!arguments.length) return yAxis;//getter
        yAxis = _;//setter
        return chart;
    }

    chart.yValue = function(_) {
        if (!arguments.length) return yValue;//getter
        yValue= _;//setter
        return chart;
    }

    chart.brush = function(_) {
        if (!arguments.length) return brush;//getter
        brush = _;//setter
        return chart;
    }

    chart.t = function(_) {
        if (!arguments.length) return t;//getter
        t = _;//setter
        return chart;
    }

    chart.line = function(_) {
        if (!arguments.length) return line;//getter
        line = _;//setter
        return chart;
    }

    // These getter-setter methods will let us decide what we will actually
    // plot.  If we wanted this plot to be fully re-useable, we can add 
    // getter-setters for all of the components.
    chart.x = function(_) {
        if (!arguments.length) return xValue;//getter
        xValue = _;//setter
        return chart;
    };

    // The y values here are actually keys to the data object, since
    // it may contain many values we may want to plot.
    chart.y0 = function(_) {
        if (!arguments.length) return yk0;
        yk0 = _;
        return chart;
    };

    chart.y1 = function(_) {
        if (!arguments.length) return yk1;
        yk1 = _;
        return chart;
    };

    chart.y2 = function(_) {
        if (!arguments.length) return yk2;
        yk2 = _;
        return chart;
    };

    // Return the plot function so we can call it!
    return chart;
}

// Select an element from d with key k
function yValue(d,k) {
    return parseFloat(d[k]);
}

// Loop through all of the charts on the page and zoom them to the same domain.
function zoom(domain) {
    for(i=0;i<chartset.length;i++) {
        c = chartset[i];
        c.xScale().domain(domain);
        c.g().select('.axis--x').transition(c.t()).call(c.xAxis());
        c.g().select(".primary")
        .transition(c.t())
        .attr("d", c.line()
        .y(function(d) {return c.yScale()(yValue(d, c.y0()));}));
        c.g().select(".secondary")
        .transition(c.t())
        .attr("d", c.line()
        .y(function(d) {return c.yScale()(yValue(d, c.y1()));}));
        c.g().select(".tertiary")
        .transition(c.t())
        .attr("d", c.line()
        .y(function(d) {return c.yScale()(yValue(d, c.y2()));}));
    }
}
