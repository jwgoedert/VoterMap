let width = parseInt(d3.select(".map-box").style("width"));
let height = width;

console.log(width)

let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

let path = d3.geoPath();

// d3.json("./static/data/usRobust.json", function (error, data) {
    d3.json("./static/data/us-10m.v1.json", function (error, data) {

  if (error) throw error;

  console.log('data', data);


  svg.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(data, data.objects.states).features)
    .enter()
    .append("path")
    .style("fill", "lightblue")
    .attr("d", path)
    .style("stroke", "darkblue")
  svg.append("path")
    .attr("class", "state-borders")
    .attr("d", path(topojson.mesh(data, data.objects.states, function (a, b) {
      return a != b;
    })))
})

