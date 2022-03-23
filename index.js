let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;

let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
let projection = d3.geoAlbersUsa()
  .precision(0)
  .scale(height * 2)
  .translate([width / 2, height / 2]);

let path = d3.geoPath()
  .projection(projection)
  

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
    })))
})
