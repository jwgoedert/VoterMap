let width = parseInt(d3.select(".map-box").style("width"));
let height = width;
let queryParams = new URLSearchParams(window.location.search);
let stateId = queryParams.has('state') ? +queryParams.get('state') : 31;
let element = document.getElementById("fips_code");
let val = element.getAttribute('value');
stateId = +val || stateId;
let filteredStateId = stateId.toString().length == 2 ? stateId : `0${stateId}`;
let stateFromCounty = countyId => countyId.length == 5 ? countyId.slice(0, 2) : `0${countyId[0]}`;
let view = '';
let setView;
let selectView = d3.select("#nav-select-view")
let color;

let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

queue()
  .defer(d3.json, "/static/data/usRobust.json")
  .defer(d3.csv, "https://back9.voterpurgeproject.org:8443/api/voterfile/tally/display?filename=/mnt/f/voterfiles/report-2022-09/counties_merged/ALL_New_County.csv")
  .defer(d3.csv, "https://back9.voterpurgeproject.org:8443/api/voterfile/tally/display?filename=/mnt/f/voterfiles/report-2022-09/counties_merged/ALL_Drop_County.csv")
  .await(loadData)

function loadData(error, usData, AllNewCountyData, AllDropCountyData) {
  view = AllDropCountyData;
  let stateName = usData.objects.counties.geometries.find(el => el.properties.stateCode == stateId).properties.stateName;
  if (error) throw error;
  d3.select(".state-header")
    .text(stateName);
  let projection = stateId == 2 ?
    d3.geoAlbers() : d3.geoMercator()
      .precision(0)
      .scale(height * 2)
      .translate([width / 2, height / 2]);
  let path = d3.geoPath()
    .projection(projection);
  let state = topojson.feature(usData, usData.objects.states)
    .features.filter(d => d.id === stateId)[0];
  let stateCounties = topojson.feature(usData, usData.objects.counties)
    .features.filter(d => d.properties.stateCode == filteredStateId);
  let countyDropData = AllDropCountyData.filter(d => stateFromCounty(d.id) == filteredStateId.toString());
  let countyPrev = countyDropData.map(e => +e.count);
  let countyPercents =countyDropData.map(e => +e.key_pct*1000);
  // console.log(countyPrev, countyPercents);
  function setColor (v, viewName) {
    // let selection = viewName == 'percent'? 
    // let domainMax = d3.max(v || [], d => viewName == 'percent' ? +d.key_pct : +d.count);
    let domainMax = d3.max(v || [], d => +d);
    let domainMin = d3.min(v || [], d => +d);
    console.log(domainMax, domainMin);
    color_domain = d3.range(0, domainMax, domainMax / 12);
    color = d3.scaleThreshold()
      .domain(color_domain)
      .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#719782", "#5e8b73", "#4b7e64", "#387255", "#256546", "#125937", "#004d28"]);
  };

  projection
    .scale(1)
    .translate([0, 0])

  let b = path.bounds(state),
    s = 1.0 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection
    .scale(s)
    .translate(t)

  let countyByView = county => view.find(el => el.id == county.id);
  
  function mouseOver(d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "orange")
      .style("stroke-width", 3)
  }

  function click(d) {
    d3.selectAll("path")
      .style("fill", d => color(countyByView(d)) ? color(countyByView(d).key_pct*1000) : "white")
    d3.select(this)
      .style("fill", "orange");
    d3.select(".selected")
      .text(`Selected: ${ countyByView(d).County } ${ countyByView(d).key_pct } % -${countyByView(d).count}`);
  }

  function mouseOut(d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke-width", .5)
      .style("stroke", "rgba(13, 106, 106, 0.5)")
  }

  function renderStateCounties(v) {
    let select = v == 'percent'? 'key_pct*1000' : 'count';
    svg.append("g")
      .attr("class", "mouse-out")
      .selectAll("path")
      .data(stateCounties)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", d => color(countyByView(d)) ? (v == 'percent' ? 
        color(countyByView(d).key_pct * 1000) : color(countyByView(d).count)) : "white")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", click)
  }

  setColor(countyDropData, 'percent');
  renderStateCounties();
  console.log(countyDropData);
  console.log(countyDropData.map(e => e.key_pct));
  
  setView = function (v) {
    if (v == "previous") {
      // view = countyDropData;
      setColor(countyPrev, 'count');
      renderStateCounties();
    } else if (v == "percentage-dropped") {
      // view = countyDropData;
      setColor(countyPercents, 'percent');
      renderStateCounties('percent');
    } else {
      view = countyPrev;
      setColor(countyPercents, 'percent');
      renderStateCounties();
    }
    renderStateCounties();
  };




  selectView
    .append("input")
    .attr("class", "button")
    .attr("type", "button")
    .attr("value", "previous")
    .attr("onclick", "setView('previous')");
  selectView
    .append("input")
    .attr("class", "button")
    .attr("type", "button")
    .attr("value", "percentage")
    .attr("onclick", "setView('percentage-dropped')");

  // console.log('view', view);
  setView('percent');
}
