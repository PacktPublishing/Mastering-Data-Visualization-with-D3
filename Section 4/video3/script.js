// Plot the provinces and territories of canada with an ordinal colormap
function plot_provinces() {
    color = d3.scaleOrdinal() // nice little color map
    .range(d3.schemePaired);


    g.selectAll('path.province')
    .data(canada.features) // select the features from our GeoJSON  object
    .enter().append('path')
    .classed('province', true)
    .attr('d', path) // use the path generator to convert the features
    .attr('id', function(d,i){return d.properties.name;})
    .attr('fill', function(d,i){return color(i);});

}

// Add little black points for the largest cities in Canada
function plot_cities() {
    g.selectAll('path.city')
    .data(cities)
    .enter().append('path')
    .classed('city', true)
    .attr('d', path.pointRadius(1.5));
}

// Color the provinces based on their population
function choropleth() {
    // Use our hierarchy object of large cities to build a population of provinces
    root = stratify(prepare(city_size))
    .sum(function(d) { return d.population});

    // We'll need a continous colormap to color based on population
    color = d3.scaleLog()
    .domain([d3.min(root.children.map(function(d){return d.value;})), d3.max(root.children.map(function(d){return d.value;}))])
    .range([1,0]);
    
    // Generate a map connecting the names of provinces to their populations
    pops = new Map(root.children.map(function(d) {
        return [d.id,d.value];}));

    g.selectAll('path.province')
    .data(canada.features) // select the features from our GeoJSON  object
    .enter().append('path')
    .classed('province', true)
    .attr('d', path) // use the path generator to convert the features
    .attr('id', function(d,i){return d.properties.name;})
    .attr('fill', function(d,i){return d3.interpolateViridis(color(pops.get(d.properties.name)));});//color based on population

}

function prepare(data) {
    // Find all the unique provinces
    provinces = d3.map(data, function(d){return d.Province;}).keys();
    
    // Generate a new array
    locations = [{name:"Canada",inside:"",population:""}]

    for(i=0;i<provinces.length;i++) {
        locations.push({name:provinces[i],inside:"Canada",population:""});
    }
    for(i=0;i<data.length;i++) {
        locations.push({name:data[i].City,inside:data[i].Province,population:parseInt(data[i].Population)});
    }
    return locations;
}

function stratify(data) {
    return d3.stratify()
    .id(function(d){return d.name;})
    .parentId(function(d){return d.inside;})
    (data);
}

// Load in our data and build our projection
async function loadData() {
    proj = d3.geoAlbers()
    .scale(900)
    .translate([350,600]);
    // Use our projection to build a path generator
    path = d3.geoPath(proj);

    g = d3.select('svg')
        .append('g');

    const data = await d3.json('canada.json');
    canada = data;
    const data1 = await d3.json('cities.json');
    all_cities = data1;
    const data2 = await d3.csv('canada.csv');
    city_size = data2;
    cities = data1.features.filter(function(d){
        names = data2.map(function(x){return x.City;});
        return names.includes(d.properties.name);
    });
}
