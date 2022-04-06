let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;
let queryParams = new URLSearchParams(window.location.search);
let stateId = queryParams.has('state') ? +queryParams.get('state'): 31;

let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  
color_domain = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000];
color_domain = d3.range(0,1000, 200);
let color = d3.scaleThreshold()
  .domain(color_domain)
  .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#719782", "#5e8b73", "#4b7e64", "#387255", "#256546", "#125937", "#004d28"]);

queue()
  .defer(d3.json, "./Data/us.json")
  .defer(d3.csv, "./Data/data.csv")
  .defer(d3.json, "./Data/stateCodes.json")
  .await(loadData)

function loadData(error, usData, countyData, statesList) {
  if(error) throw error;
  
  d3.select(".state-header")
    .text(statesList.states.find(el => el.code == stateId).state)

  let projection = d3.geoMercator()
    .precision(0)
    .scale(height * 2)
    .translate([width / 2, height / 2]);

  let path = d3.geoPath()
    .projection(projection);

  let states = topojson.feature(usData, usData.objects.states);
  let counties = topojson.feature(usData, usData.objects.counties);
  let state = states.features.filter(function (d) { return d.id === stateId; })[0];
  let stateCounties = counties.features.filter(function (d) { return d.id.toString().slice(0, 2) === stateId.toString(); });
  
  projection
    .scale(1)
    .translate([0,0])
    
  let b = path.bounds(state),
    s = 1.0 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection 
    .scale(s)
    .translate(t)

  let countyById = county => countyData.find(el => el.id == county.id);

  let handleEvent = d => d3.select(".dash-hover").text(`${countyById(d).name} ${countyById(d).rate}`);
  
  function renderStateCounties(){
    svg.append("g")
      .attr("class", "state-counties")
      .selectAll("path")
      .data(stateCounties)
      .enter()
      .append("path")
      .attr("d", path)
      .on("mouseover", handleEvent)
      .on("click", handleEvent)
  }
    
  function renderStateCountiesBorders(){
    svg.append("g")
      .attr("class", "state-counties-borders")
      .selectAll("path")
      .data(stateCounties)
      .enter()
      .append("path")
      .attr("d", path)
      // .style("fill", d => color(countyById(d).rate))
      .style("fill", d => color(countyById(d).rate))
  }
  renderStateCounties();
  renderStateCountiesBorders();
    
}