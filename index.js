let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;

let createView = function(view){
  //us map-static-clickable-hover info
  //us map with counties-static-clickable-hover info
  //state map-static
  //state map with counties-static-hover info  
}
let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background', 'wheat')

let projection = d3.geoEquirectangular()
// let projection = d3.geoAlbersUsa() // d3.geoEquirectangular()
  .precision(0)
  .scale(height * 2)
  .translate([width / 2, height / 2]);

let path = d3.geoPath()
  .projection(projection)

d3.json('./data/us.json', function (error, data) {
  if (error) throw error;
  let stateId = 12;

  // let clicked = function (err, stateId, statePaths) {
    // if (error) throw err;
    
    // statePaths = statePaths.filter(function (d) {
    //   return d.__data__.id == stateId;
    // })[0].__data__;
    // console.log(stateId, statePaths);
    // return statePaths;
  // }
//filter 
let states = topojson.feature(data, data.objects.states);
let counties = topojson.feature(data, data.objects.counties);
let state = states.features.filter(function (d) { return d.id === stateId;})[0];
projection
.scale(1)
.translate([0,0])
  
let b = path.bounds(state),
  s = 1.0 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
  t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

projection 
  .scale(s)
  .translate(t)
//states
svg.append("g")
  .attr("class", "states")
  .selectAll("path")
  .data(states.features)
  .enter()
  .append("path")
  .attr("d", path)
  // .on('click', clicked)
  
//state borders
svg.append("path")
    .attr("class", "state-borders")
    .attr("d", path(topojson.mesh(data, data.objects.states, function (a, b) {
      return a != b;
    })));
//county    
svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(counties.features)
    .enter()
    .append("path")
    .attr("d", path)
//county borders
svg.append("g")
  .attr("class", "county-borders")
  .selectAll("path")
  .data(counties.features)
  .enter()
  .append("path")
  .attr("d", path)
  // .on('click', clicked)
  
  
var optionsData = [{
      value: '0',
    text: '1970'
}, {
      value: '1',
    text: '1971'
}];
let stateList = d3.json("./Data/stateCodes.json", function(error, d){
  if(error) throw error;
  console.log(d);
  optionsData = d.states;
  // return optionsData;
  var selectTag = d3.select("select");
  
  //we have select all options tags from inside select tag (which there are 0 atm)
  //and assigned data as to be the base of modelling that selection.
  var options = selectTag.selectAll('option')
  // .data(optionsData);
  .data(optionsData);
  
  //d3 sees we have less elements (0) than the data (2), so we are tasked to create
  //these missing inside the `options.enter` pseudo selection.
  //if we had some elements from before, they would be reused, and we could access their
  //selection with just `options`
  options.enter()
  .append('option')
  .attr('value', function(d) {
    console.log(d.code);
  return d.code;
  })
  .text(function(d) {
  return d.state;
  })
})

    // county
    // svg.append("path")
    // .attr("class", "county-borders")
    // .data(counties.features)
    // // .attr("d", path.topojson.feature(data, data.objects.counties).features)
    // .attr("d", path(topojson.mesh(data, data.objects.counties, function (a, b) {
    //   return a != b;
    // })));
    // svg.append("path")
    //   .datum(state)
    //   .attr("d", path)

})