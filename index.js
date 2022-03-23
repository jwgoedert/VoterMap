let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;
//You can reassign a value to width here to resize the map to your specs
let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
//Set a projection using the geoAlbersUsa to include Alaska and Hawaii 
//Scale sets the size, translate positions off the center point of the map 
let projection = d3.geoAlbersUsa()
  // .precision(0)
  .scale(height * 2)
  .translate([width / 2, height / 2]);

//Create a geoPath and specify it's projection
let path = d3.geoPath()
  .projection(projection)
  
//Load Data
d3.json('./data/us.json', function (error, data) {
// d3.json("https://d3js.org/us-10m.v1.json", function (error, data) {

  if (error) throw error;

  console.log('data', data);


  svg.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(data, data.objects.states).features)
    .enter()
    .append("path")
    .attr("d", path)
    

  svg.append("path")
    .attr("class", "state-borders")
    .attr("d", path(topojson.mesh(data, data.objects.states, function (a, b) {
      return a != b;
    })));

  })
