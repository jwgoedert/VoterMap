let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;
let stateId = 01;

let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background', 'wheat')

d3.json("./Data/stateCodes.json", function (error, d) {
  let options = d.states;
  options.forEach(function (d, i) {
    d3.select("#selectOptions")
      .append("option")
      .attr("value", d.code)
      .text(d.state)
      .on("change", change)
  })
  d3.select("#selectOptions")
    .on("change", change)
  function change() {
    let res = this.options[this.selectedIndex].value;
    let node = d3.select("#selectOptions").node();
    stateId =  node;
    console.log(res, node);
  }

});

// let projection = d3.geoEquirectangular()
let projection = d3.geoAlbersUsa() // d3.geoEquirectangular()
  .precision(0)
  .scale(height * 2)
  .translate([width / 2, height / 2]);

let path = d3.geoPath()
  .projection(projection)

d3.json('./data/us.json', function (error, data) {
  if (error) throw error;
  let stateId = 31;

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
    // let b = path.bounds(states),
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
  
  
//  d3.json("./Data/stateCodes.json", function(error, d){
//       let options = d.states;
//   options.forEach(function(d, i){
//     d3.select("#selectOptions")
//     .append("option")
//     .attr("value", d.code)
//     .text(d.state)
//     .on("change", change)
//   })
//   d3.select("#selectOptions")
//     .on("change", change)
//   function change() {
//     let res = this.options[this.selectedIndex].value;
//     let node = d3.select("#selectOptions").node();
//     console.log(res, node);
//   }

// })

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