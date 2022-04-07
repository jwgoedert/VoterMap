let width = parseInt(d3.select(".map-box").style("width"));
let height = width/2;
let queryParams = new URLSearchParams(window.location.search);
let stateId = queryParams.has('state') ? +queryParams.get('state'): 31;
let element = document.getElementById("fips_code");
let val = element.getAttribute('value');
stateId = +val || stateId;
let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  
  queue()
  .defer(d3.json, "/static/data/us.json")
  .defer(d3.csv, "/static/data/data.csv")
  .defer(d3.json, "/static/data/stateCodes.json")
  .await(loadData)
  function fipSan(code, el){
    code = code.toString();
    let id, codeLength = code.length;
      if(codeLength == 5){
        id = code.slice(0,2);
      } else if (codeLength == 4){
        id = `0${code.slice(0,1)}`;
      } else if (codeLength == 2) {
        id = code;
      } else if (codeLength == 1) {
        id = `0${code}`
      } else {
        return console.error(el, code, "invalid state code, codes must be two digits")
      }
      return id;
  }
  function loadData(error, usData, countyData, statesList) {
    if(error) throw error;
    console.log(countyData);
    d3.select(".state-header")
    .text(statesList.states.find(el => el.code == stateId).state)
    
    let projection = d3.geoMercator()
    // let projection = d3.geoEquirectangular()
    // let projection = d3.geoAlbers()
    .precision(0)
    .scale(height * 2)
    .translate([width / 2, height / 2]);
    
    let path = d3.geoPath()
      .projection(projection);
    
    
    let states = topojson.feature(usData, usData.objects.states);
    let counties = topojson.feature(usData, usData.objects.counties);
    let state = states.features.filter(function (d) { return d.id === stateId; })[0];
    let stateCounties = counties.features.filter(function (d) { return fipSan(d.id, d) == fipSan(stateId.toString()); });
    let countyRatings = countyData.filter(function (d) { return fipSan(d.id, d) == fipSan(stateId.toString()); });
    console.log(state, stateCounties, countyRatings, counties);
    // let countyRatings = countyData.filter(function (d) { return d.id.toString().slice(0, 2) === stateId.toString(); });
    let domainMax = d3.max(countyRatings, function(d){return +d.rate});
    color_domain = d3.range(0, domainMax, domainMax/12);
    let color = d3.scaleThreshold()
      .domain(color_domain)
      .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#719782", "#5e8b73", "#4b7e64", "#387255", "#256546", "#125937", "#004d28"]);


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

  function mouseOver(d){
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "orange")
      .style("stroke-width", 3)
    d3.select(".dash-hover")
      .text(`${countyById(d).name} ${countyById(d).rate}`);

  }

  function mouseOut(d){
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent")
  }
  
  function renderStateCounties(){

    svg.append("g")
      .attr("class", "state-counties")
      .selectAll("path")
      .data(stateCounties)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", d => color(countyById(d).rate))
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
  }

  renderStateCounties();
    
}