let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;

let createView = function(view){
  //us map-static-clickable-hover info
  //us map with counties-static-clickable-hover info
  //state map-static
  //state map with counties-static-hover info  
}
width = width/2;
height = height/2;
//You can reassign a value to width here to resize the map to your specs
let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background', 'wheat')

  
//Set a projection using the geoAlbersUsa to include Alaska and Hawaii
//Scale sets the size, translate positions off the center point of the map
// let projection = d3.geoEquirectangular()
let projection = d3.geoAlbersUsa()
  .precision(0)
  .scale(height * 2)
  .translate([width / 2, height / 2]);

//Create a geoPath and specify it's projection
let path = d3.geoPath()
  .projection(projection)

// const projection = d3.geoEquirectangular()
// var path = d3.geo.path().projection(projection);

//Load Data
d3.json('./data/us.json', function (error, data) {
  // d3.json("https://d3js.org/us-10m.v1.json", function (error, data) {

  if (error) throw error;
  let stateId = 08;
  let stateId2 = 04;
  let stateId3 = 21;

  console.log('data', data);
  let clicked = function (err, stateId, statePaths) {
    if (error) throw err;
    
    statePaths = statePaths.filter(function (d) {
      return d.__data__.id == stateId;
    })[0].__data__;
    console.log(stateId, statePaths);
    return statePaths;
    // var b = path.bounds(statePaths),
    //   s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    //   t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    
    // projection
    //   .scale(s)
    //   .translate(t);
    // return [b,s,t];
  }
//filter 
let states = topojson.feature(data, data.objects.states);
let counties = topojson.feature(data, data.objects.counties);
let state = states.features.filter(function (d) { return d.id === stateId || stateId2 || stateId3; })[0];
projection
.scale(1)
.translate([0,0])
  
  var b = path.bounds(state),
  // var b = path.bounds(states ),
  s = 1.0 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
  t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
  width = (b[1][0]-b[0][0]);
  console.log("w",width);
//zoom out to only state selected
  console.log("the", this.document.location.href.toString().slice(0,2));
  projection 
      .scale(s)
      .translate(t)
//add all states behind
  svg.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(data, data.objects.states).features)
    .enter()
    .append("path")
    .attr("d", path)
    .on('click', clicked)
    
//  add filled state path
  svg.append("path")
    .datum(state)
    .attr("d", path)
  
// add state borders without using multiple times
    svg.append("path")
    .attr("class", "state-borders")
    .attr("d", path(topojson.mesh(data, data.objects.states, function (a, b) {
      return a != b;
    })));
// counties-not working currently
  // svg.append("path")
  //   .attr("class", "county-borders")
  //   .attr("d", path.topojson.feature(data, data.objects.counties).features)
  //   .attr("d", path(topojson.mesh(data, data.objects.counties, function (a, b) {
  //     return a != b;
  //   })));

})