/**
 * Created by suhas on 5/1/2015.
 */
BarChartViz = function(_theDiv,_eventHandler){

    this.width = 800;
    this.height = 200;
    this.svg = d3.select('#'+_theDiv)
        .append("svg")
        .attr('height', this.height)
        .attr('width', this.width);

    this.svg.append("rect")
        .attr('height', '100%')
        .attr('width', '100%')
        .style('fill', 'red');

    this.init();
}

BarChartViz.prototype.init = function()
{
    console.log(crimeAnalyzer.getCategoryCrimeData());

}

BarChartViz.prototype.wrangleData = function() {

}