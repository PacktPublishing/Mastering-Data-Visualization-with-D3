function loadCSV() {
    // This function will load in the data from our CSV file, and append text from each stock to a new div
    d3.csv('data.csv', function (data) {
        d3.select('#divbox')
        .append('div')
        .attr('class','lildiv')
        .text('Stock: '+data.type + ' Count: ' + data.count + ' Cost: '+ data.cost);
    });
}
