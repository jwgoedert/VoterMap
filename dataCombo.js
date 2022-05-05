
  function fipSan(code, el) {
    code = code.toString();
    let id, codeLength = code.length;
    if (codeLength == 5) {
      id = code.slice(0, 2);
    } else if (codeLength == 4) {
      id = `0${code.slice(0, 1)}`;
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
  
  
  
    let comboData = function(data1, data2, states) {
      console.log("states", states);
      let newData = data1;
      newData.map(function(el, i) {

        // console.log(el, i,  newData, data2);
        if (el.id == data2[i].id) {
        // if(fipSan(data1.id) == fipSan(data2.id)){
          console.log('I have been hit', el, data2[i])
          el.stateName = data2.state;
          el.stateId = data2.code;
          console.log(el)
        }
      })

      // console.log(data1, data2);
    }
    
    let state = topojson.feature(usData, usData.objects.states)
    .features.filter(d => d.id === stateId)[0];
    let stateCounties = topojson.feature(usData, usData.objects.counties)
    .features.filter(d => fipSan(d.id, d) == fipSan(stateId.toString()));
    let countyRatings = countyData.filter(d => fipSan(d.id, d) == fipSan(stateId.toString()));
    let domainMax = d3.max(countyRatings, d => +d.rate);
    color_domain = d3.range(0, domainMax, domainMax / 12);

  comboData(stateCounties, countyRatings, statesList);

}