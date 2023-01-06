
/*Declare constants*/
let width = parseInt(d3.select(".map-box").style("width"));
let height = width;
let color;

/* Create SVG */

let svg = d3.select('.map-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
/* Load Data */
queue()
  .defer(d3.json, "/static/data/usRobust.json")
  // .defer(d3.csv, "https://back9.voterpurgeproject.org:8443/api/voterfile/tally/display?filename=/mnt/f/voterfiles/report-2022-09/counties_merged/ALL_Drop_County.csv")
  .defer(d3.csv, "static/data/ALL_Drop_County.csv")
  .await(loadData)
/* Boot Function */
function loadData(error, usData, AllDropCountyData) {
  AllDropCountyData = AllDropCountyData.filter(e => e.County !== "NOT_MATCHED" || undefined);
  console.log(AllDropCountyData);
  let stateData = AllDropCountyData.reduce(function(states, county){
    // console.log(states, county);
    return states;
  },[{
    "percents":[0],
    "00":"00",
    "total":0
  }])
  // console.log("stateData", stateData);
  if (error) throw error;
  /* Setup Projection */
  let projection = d3.geoAlbersUsa()
      .precision(0)
      .scale(height * 2)
      .translate([width / 2, height / 2]);
  let path = d3.geoPath()
      .projection(projection);
  let country = topojson.feature(usData, usData.objects.states).features.filter(d => d)[0];
  console.log("country", country);


  // let stateCounties = topojson.feature(usData, usData.objects.counties)
  //   .features.filter(d => d.properties.stateCode == filteredStateId);
  let stateBorders = topojson.feature(usData, usData.objects.states)
    .features.filter(d => d);
    console.log('stateBorders', stateBorders);
    console.log('stats', AllDropCountyData);
  // let domainMax = d3.max(countyDropData || [], d => +d.key_pct * 1000);
  // let domainMin = d3.min(countyDropData || [], d => +d.key_pct * 1000);
  let domainMax = 1160;
  let domainMin = 40;
  // console.log("domains", domainMax, domainMin);
  let colorArray = ['#d7191c','#ff3300','#dcac20', '#a6d96a', '#1a9641'];
  color_domain = d3.range(domainMin, domainMax, domainMax / colorArray.length).concat(domainMax).slice(1);
  color = d3.scaleThreshold()
    .domain(color_domain)
    .range(colorArray.reverse());


  projection
    .scale(1)
    .translate([0, 0])

  /* Create Final Projection params */

  let b = path.bounds(country),
    s = .2 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 4, (height - s * (b[1][1] + b[0][1])) / 2];

  projection
    .scale(s)
    .translate(t)

  let countyByView = function (county) {
    if (county) {
      return AllDropCountyData.find(function (el) {
        return el.id == county.id;
      });
    }
  };

  function click(d) {
    console.log("click", d);
    
    // .style("fill", d => color(countyByView(d)) ? color(countyByView(d).key_pct * 1000) : "white")
    d3.select(this)
      .style("fill", "orange");
    d3.selectAll("path")
      // .attr("xlink:href", e => window.location.href = `http://www.voterpurgeproject.org/stat/${e.id}`)

    // d3.select(".selected")
      // .text(`Selected: ${countyByView(d).County} ${countyByView(d).key_pct} % _  ${countyByView(d).count}`);
  }

  function mouseOver(d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "orange")
      .style("stroke-width", 3)
  }

  function mouseOut(d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke-width", 1)
      .style("stroke", "rgba(0, 0, 0)")
  }
  function renderStateBorders(v){
    svg.append("g")
    .attr("class", "mouse-out")
    .selectAll("path")
    .data(stateBorders)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill","lightblue")
    // .append("a")
    // .attr("xlink:href", "http://en.wikipedia.org/wiki/")
    // .style("fill", d => color(countyByView(d)) ? color(countyByView(d).key_pct * 1000) : "white")
    .style("stroke", "darkblue")
    // .style("stroke", "rgba(0,0,0,.75)")
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut)
    .on("click", click)
  }

    renderStateBorders();
}

