
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
  
/* Very longhanded way of gleaning average percentages of states from county data--needs refactoring */  
  let stateArray = [];
  //populate stateArray with totals of key_pcts located at the index related to their FIPS_State Code
  AllDropCountyData.map(el =>
    stateArray[el.FIPS_State]? stateArray[el.FIPS_State]+=(+el.key_pct): stateArray[el.FIPS_State]=+el.key_pct);
  //calculate number of county elements per state to calculate avg from stateArray totals
  const countyNumbersByState = 
    AllDropCountyData.reduce((acc, v, i) => {
      acc[v.FIPS_State] === undefined ? acc[v.FIPS_State] = 1 : acc[v.FIPS_State]++
      return acc;
    },{});
  //create new array with values from totals in stateArray and countyNumbersByState  
  const stateAverages = stateArray.map((el, i, col) => el? +el/+countyNumbersByState[i] : 0);

  //throw error if any of the data sources don't load or are wrongly formatted
  if (error) throw error;

  /* Setup Projection */
  let projection = d3.geoAlbersUsa()
      .precision(0)
      .scale(height * 2)
      .translate([width / 2, height / 2]);
  let path = d3.geoPath()
      .projection(projection);
  let country = topojson.feature(usData, usData.objects.states).features.filter(d => d)[0];

  let stateBorders = topojson.feature(usData, usData.objects.states)
    .features.filter(d => d);
    /* Domains can be set off new aggragate data for state percents or use existing but slow 
    calculations for the stateAverages Array(needs refactoring) */
  let domainMax = d3.max(stateAverages || [], d => +d * 10000);
  let domainMin = d3.min(stateAverages || [], d => +d * 10000);
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
    //for county maps this is set to 1.0 rather that .2, you can mess with this value to adjust size
    s = .2 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    //for positioning, the divisor can be adjusted minutely (the 4 and 2 in this case)
    t = [(width - s * (b[1][0] + b[0][0])) / 4, (height - s * (b[1][1] + b[0][1])) / 2];
  
  //apply final projection params  
  projection
    .scale(s)
    .translate(t)

  /*On click navigate to the FIPS_State code, backend needs to be adjusted to accept FIPS rather 'AZ' etc.  
    uncomment the '.attr' line below when ready to activate hyperlinks
  */
  function click(d) {
    d3.selectAll("path")
      // .attr("xlink:href", e => window.location.href = `http://www.voterpurgeproject.org/stat/${e.id}`)
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
    .style("fill", d => color(stateArray[+d.id]) ? color(stateArray[+d.id] * 1000) : "lightgray")
    .style("stroke", "rgba(0,0,0,.75)")
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut)
    .on("click", click)
  }

    renderStateBorders();
}

