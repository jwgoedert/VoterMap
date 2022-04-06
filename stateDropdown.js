//State Dropdown
d3.json("./Data/stateCodes.json", function (error, d) {
    let options = d.states;
    options.forEach(function (d, i) {
        d3.select("#selectOptions")
            .append("option")
            .attr("value", d.code)
            .text(d.state)
            .on("change", change)
    })
    d3.select("#selectOptions")
        .on("change", change)
    function change() {
        let res = this.options[this.selectedIndex].value;
        let node = d3.select("#selectOptions").node();
        stateId = res;
        see(res, node);
    }

});