// Plot a world map using the projection specified 
// in the argument
function plot(projection) {
    // build a d3.geo* projection based on which one
    // we specify
    switch(projection) {
        case 'AzimuthalEqualArea':
            proj = d3.geoAzimuthalEqualArea();
        case 'ConicConformal':
            proj = d3.geoConicConformal();
        case 'Equirectangular':
            proj = d3.geoEquirectangular();
        case 'Gnomonic':
            proj = d3.geoGnomonic();
        case 'Mercator':
            proj = d3.geoMercator();
        case 'Orthographic':
            proj = d3.geoOrthographic();
        case 'Stereographic':
            proj = d3.geoStereographic();
    }
    // Use our projection to build a path generator
    path = d3.geoPath(proj);

    g = d3.select('svg')
        .append('g');

    color = d3.scaleOrdinal() // nice little color map
    .range(d3.schemePaired);


    g.selectAll('path.country')
    .data(countries.features) // select the features from our GeoJSON  object
    .enter().append('path')
    .classed('country', true)
    .attr('d', path) // use the path generator to convert the features
    .attr('fill', function(d,i){return color(i);});

    // Draw lat-lon lines
    show_latlon();
}

// Use the geoGraticule10() method to add 10 degree latitude
// and longitude lines to our plot.
function show_latlon() {
    g.append("path")
    .datum(d3.geoGraticule10())
    .classed("graticule", true)
    .attr("d", path); // use the path generator to convert the lines to paths

}

// Load in our country data
async function loadMap() {
    const data = await d3.json('world-countries.json');
    countries = data;
}
