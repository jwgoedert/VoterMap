let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;
width = width * .6;
let stateId = 31;
let see = console.log;
let usData,countyData,dropDown;
let query = window.location.search.substring(1);
let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background', 'wheat')
let dash = d3.select('.dashboard')
  .append('svg')
  .attr('width', width)
  .attr('height', '4rem')
  .style('background-color','lightblue')

queue()
  .defer(d3.json, "./Data/us.json")
  .defer(d3.csv, "./Data/data.csv")
  .defer(d3.json, "./Data/stateCodes.json")
  .await(loadData)

function loadData(error, us, data, dd){
  if(error) throw error;
  usData = us;
  countyData = data;
  dropDown = dd;


// let projection = d3.geoEquirectangular()
let projection = d3.geoAlbersUsa() // d3.geoEquirectangular()
  .precision(0)
  .scale(height * 2)
  .translate([width / 2, height / 2]);

let path = d3.geoPath()
  .projection(projection)

  stateId = parseInt(query) || stateId;

let states = topojson.feature(usData, usData.objects.states);
let counties = topojson.feature(usData, usData.objects.counties);
let state = states.features.filter(function (d) { return d.id === stateId; })[0];
let stateCounties = counties.features.filter(function (d) { return d.id.toString().slice(0, 2) === stateId.toString(); });
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
function hover(d){
  // see('params', params);
  see('hover', d);
  let county = countyData.filter( function(c){
    return c.id == d.id })[0];
  d3.select('.dashboard')
    .text(`${county.name} ${county.rate}`)
}
function click(d){
  see("clicked", d);
  
}
  //states
  function renderStates() {
    svg.append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(states.features)
      .enter()
      .append("path")
      .attr("d", path)
    // see("state", states.features)
  }
  //states borders
  function renderStatesBorders() {
    svg.append("path")
      .attr("class", "states-borders")
      .attr("d", path(topojson.mesh(data, data.objects.states, function (a, b) {
        return a != b;
      })));
    // see('states borders', data.objects.states);
  }
  //states counties
  function renderStatesCounties(){
    svg.append("g")
      .attr("class", "states-counties")
      .selectAll("path")
      .data(counties.features)
      .enter()
      .append("path")
      .attr("d", path)
      // see("all counties", counties.features);
  }    
  //county borders
  function renderStatesCountiesBorders(){  
    svg.append("g")
      .attr("class", "states-counties-borders")
      .selectAll("path")
      .data(counties.features)
      .enter()
      .append("path")
      .attr("d", path)
      // see("counties borders", counties.features);
  }  

  function renderState() {
    svg.append("path")
      .attr("class", "state")
      .datum(state)
      .attr("d", path)
      // see('state', state);
  }

  function renderStateBorders() {
    svg.append("path")
      .attr("class", "state-borders")
      .datum(state)
      .attr("d", path)
      // see("state borders", state);
  }

  function renderStateCounties(){
    svg.append("g")
      .attr("class", "state-counties")
      .selectAll("path")
      .data(stateCounties)
      .enter()
      .append("path")
      .attr("d", path)
      .on("mouseover", hover)
      .on("click", click)
      // see("state counties", stateCounties);
  }
  

  function renderStateCountiesBorders(){
    svg.append("g")
      .attr("class", "state-counties-borders")
      .selectAll("path")
      .data(stateCounties)
      .enter()
      .append("path")
      .attr("d", path)
      // see("state counties borders", stateCounties)
    }
    // renderStates();
    // renderStatesBorders();
    
    // renderStatesCounties();
    // renderStatesCountiesBorders();
    
    // renderState();
    // renderStateBorders();

    renderStateCounties();
    renderStateCountiesBorders();
  
}