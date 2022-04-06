let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;
// width = width * .6;
let stateName = 'Nebraska';
let see = console.log;
let selectedCounty;
let usData,countyData,dropDown;
let queryParams = new URLSearchParams(window.location.search);
let stateId = queryParams.has('state') ? +queryParams.get('state'): 31;

let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('background', 'wheat')
let dashState = d3.select(".dashboard")
  .append("h3")
  .attr("class","state-header")
  .text(stateName);
let dashSelected = d3.select(".dashboard")
  .append("div")
  .attr("class", "selected")
  .text("Selected: ");
let dashHovered = d3.select('.dashboard')
  .append("div")
  .attr("class", "dash-hover")
  
color_domain = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000];
var color = d3.scaleThreshold()
  .domain(color_domain)
  .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#719782", "#5e8b73", "#4b7e64", "#387255", "#256546", "#125937", "#004d28"]);

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
let projection = d3.geoMercator()
// let projection = d3.geoAlbersUsa() // d3.geoEquirectangular()
  .precision(0)
  .scale(height * 2)
  .translate([width / 2, height / 2]);

let path = d3.geoPath()
  .projection(projection)

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
  
function stateById(states, id){
  let stateName = states.states.filter(function(s){
    return s.code == id;
  })[0].state; 
  dashState.text(stateName);
  return stateName;
}

stateById(dd, stateId);

function countyById(counties, ids){
  let countyName = counties.filter(function (c) {
    return c.id == ids.id;
  })[0];
  // see("cName", countyName);
  return countyName;
}

function hover(d){
    let county = countyById(countyData, d);
  dashHovered
    // d3.select(".dash-hover")    
      .text(`${county.name} ${county.rate}`)
}
  
function click(d){
  selectedCounty = countyById(countyData, d);
  d3.selectAll("path")
      .style("fill", null);
  d3.select(this)
      .style("fill", "orange");
  dashSelected
      .text(`Selected: ${selectedCounty.name} ${selectedCounty.rate}`);
}
  function colorWithRateById(d) {
    // see('color', countyData, d)
    d3.select(this)
      .style("fill", color(500));

    return color(countyById(countyData, d)).rate;
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
  // renderStates();
  //states borders
  function renderStatesBorders() {
    svg.append("path")
      .attr("class", "states-borders")
      .attr("d", path(topojson.mesh(data, data.objects.states, function (a, b) {
        return a != b;
      })));
    // see('states borders', data.objects.states);
  }
  // renderStatesBorders();
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
      .style("fill", colorWithRateById)
      .on("mouseover", hover)
      .on("click", click)
      // .on("mouseout", mouseOut)
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
      .style("fill", function(d){
        return color(countyById(countyData, d).rate)
      })

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