let width = parseInt(d3.select(".map-box").style("width"));
let height = width;
let queryParams = new URLSearchParams(window.location.search);
let stateId = queryParams.has('state') ? +queryParams.get('state') : 31;
let element = document.getElementById("fips_code");
let val = element.getAttribute('value');
stateId = +val || stateId;
let filteredStateId = stateId.toString().length == 2? stateId : `0${stateId}`;
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
  .defer(d3.csv, "/static/data/data.csv")
  .defer(d3.csv, "/static/data/County_Previous_2021.csv")
  .defer(d3.csv, "/static/data/County_Current_2022.csv")
  .defer(d3.csv, "/static/data/County_Drop_2022.csv")
    .await(loadData)

function loadData(error, usData, countyData, countyPrev, countyCurrent, countyDrop) {
  view = countyPrev;
  console.log('county data', view);
  let stateName = usData.objects.counties.geometries.find(el => el.properties.stateCode == stateId).properties.stateName;
  if (error) throw error;
  d3.select(".state-header")
    .text(stateName);
  let projection = stateId == 2 ?
    d3.geoAlbers() : d3.geoMercator()
      // let projection = d3.geoEquirectangular()
      .precision(0)
      .scale(height * 2)
      .translate([width / 2, height / 2]);

  let path = d3.geoPath()
    .projection(projection);

  let state = topojson.feature(usData, usData.objects.states)
    .features.filter(d => d.id === stateId)[0];
  let stateCounties = topojson.feature(usData, usData.objects.counties)
    .features.filter(d => d.properties.stateCode == filteredStateId);
  let countyRatings = view.filter(d => stateFromCounty(d.id) == filteredStateId.toString());
  let countyRatingsPrev = countyPrev.filter(d => stateFromCounty(d.id).toString() == filteredStateId.toString());
  let countyRatingsCurrent = countyCurrent.filter(d => stateFromCounty(d.id) == filteredStateId.toString());
  let countyRatingsDrop = countyDrop.filter(d => stateFromCounty(d.id) == filteredStateId.toString());
  let maxCheck = countyRatingsDrop;
  // console.log('numbers', d3.max(countyRatingsPrev, d => +d.count), d3.max(countyRatingsCurrent, d => +d.count), d3.max(countyRatingsDrop, d => +d.count));
  // console.log('maxCheck', maxCheck);
  let countyByView = county => view.find(el => el.id == county.id);
  setColor =  function(v){
    console.log('setcolor',v);
    let domainMax = d3.max(v || [], d => +d.count);
    // let domainMax = d3.max(countyRatingsCurrent, d => +d.count);
    // let domainMax = d3.max(countyRatings, d => +d.rate);
    console.log('max', domainMax);
    color_domain = d3.range(0, domainMax, domainMax / 12);
    console.log('colorDomain', color_domain);
    color = d3.scaleThreshold()
      .domain(color_domain)
      .range(["#dcdcdc", "#d0d6cd", "#bdc9be", "#aabdaf", "#97b0a0", "#84a491", "#719782", "#5e8b73", "#4b7e64", "#387255", "#256546", "#125937", "#004d28"]);
  }
  // setColor(countyRatingsPrev);
  projection
    .scale(1)
    .translate([0, 0])

  let b = path.bounds(state),
    s = 1.0 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  projection
    .scale(s)
    .translate(t)

  let countyById = county => countyData.find(el => el.id == county.id);
  // let countyByView = county => view.find(el => el.id == county.id);
  let countyByIdCurr = county => countyCurrent.find(el => el.id == county.id);
  let countyByIdPrev = county => countyPrev.find(el => el.id == county.id);
  let countyByIdDrop = county => countyDrop.find(el => el.id == county.id);
  function mouseOver(d) {
    console.log(d, countyByIdPrev(d), countyByIdCurr(d), countyByIdDrop(d));
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "orange")
      .style("stroke-width", 3)
    this.parentNode.appendChild(this);
    d3.select(".dash-hover")
      .text(`${countyByIdPrev(d).County}`)
      .text(`2021/2022/Dropped: ${countyByIdPrev(d).count}/${countyByIdCurr(d).count}/${countyByIdDrop(d).count}-${countyByIdDrop(d).count/countyByIdPrev(d).count}%`)
      // .text(`${countyByIdPrev(d).County} ${countyByIdDrop(d).count / countyByIdPrev(d).count}`)
      // .text(`${countyByIdPrev(d).County} ${countyByIdDrop(d).count / countyByIdPrev(d).count}`)
      // .text(`${countyById(d).name} ${countyById(d).rate}`);
  }

  function mouseOut(d) {
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke-width", .5)
      .style("stroke", "rgba(13, 106, 106, 0.5)")
  }

  function renderStateCounties(view) {

    svg.append("g")
      .attr("class", "mouse-out")
      .selectAll("path")
      .data(stateCounties)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", d => color(countyByView(d)) ? color(countyByView(d).count) : "white")
      // .style("fill", d => color(countyById(d)) ? color(countyById(d).rate) : "white")
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
  }
  setColor();
  renderStateCounties();
  setView = function (v) {
    // view = v;
    if (v == "current"){
      view = countyCurrent; 
            // maxCheck = countyRatingsCurrent;
            setColor(countyRatingsCurrent);
      // renderStateCounties();
    } else if (v == "previous"){
      view = countyPrev;
            // maxCheck = countyRatingsPrev;
            setColor(countyRatingsPrev);
      // renderStateCounties();
    } else if (v == "dropped"){
      view = countyDrop;
            // maxCheck = countyRatingsDrop;
            setColor(countyRatingsDrop);
      renderStateCounties();
    } else if (v == "percentage-dropped"){
      view = countyDrop / countyPrev;
            // maxCheck = countyRatingsDrop/countyRatingsPrev;
            setColor(countyRatingsDrop/countyRatingsPrev);
      // renderStateCounties();
    } else {
      view = countyCurrent;
            // maxCheck = countyRatingsPrev;
            setColor(countyRatingsPrev);
      // renderStateCounties();
    }
    renderStateCounties();
    console.log("view btn", view, v);
  };
  selectView
    .append("input").attr("type", "button")
    .attr("value", "previous")
    .attr("onclick", "setView('previous')");
  
  selectView
    .append("input").attr("type", "button")
    .attr("value", "current")
    .attr("onclick", "setView('current')");
  
  selectView
    .append("input").attr("type", "button")
    .attr("value", "dropped")
    .attr("onclick", "setView('dropped')");
  
  selectView
    .append("input").attr("type", "button")
    .attr("value", "percentage-dropped")
    .attr("onclick", "setView('percentage-dropped')");
  
  console.log('view', view);
}
