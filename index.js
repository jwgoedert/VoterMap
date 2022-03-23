console.log('Voter Map Test');

let svg = d3.select('.map-box')
    .append('svg')
    .attr('width', 100)
    .attr('height', 100)
    
svg.append('rect')
    .attr('width', 75)
    .attr('height', 75)
    .style('fill', 'pink')

console.log('svg', svg)