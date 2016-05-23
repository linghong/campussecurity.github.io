/*
* bar chart Viz
*/

BarChartViz = function(_theDiv,_eventHandler,_year,_crimeCategory){

    this.width = $('#usStatesDiv').width();
    this.height = 310;
    this.svg = null;
    this.states= [
        'AK',
        'AL',
        'AR',
        'AZ',
        'CA',
        'CO',
        'CT',
        'DC',
        'DE',
        'FL',
        'GA',
        'HI',
        'IA',
        'ID',
        'IL',
        'IN',
        'KS',
        'KY',
        'LA',
        'MA',
        'MD',
        'ME',
        'MI',
        'MN',
        'MO',
        'MS',
        'MT',
        'NC',
        'ND',
        'NE',
        'NH',
        'NJ',
        'NM',
        'NV',
        'NY',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VA',
        'VT',
        'WA',
        'WI',
        'WV',
        'WY'
    ];

    this.year = _year;
    this.crimeCateogry = _crimeCategory;
    this.theDiv = _theDiv;
    this.theData = this.prepData();
    this.init();
}

BarChartViz.prototype.prepData = function()
{
    var that=this;
    var bardata = [];
    // -------------------- test grabbing data ---------------
    var yearBucket = crimeAnalyzer.getCategoryCrimeData()[that.year];
    that.states.forEach(function (d, i) {
        var crimeCount = 0;
        var stateData = yearBucket["state" + d];
        if(stateData){
            if (that.crimeCateogry){
                crimeCount= stateData.crimeCounts[that.crimeCateogry];
            }
            else{
                crimeCount += stateData.crimeCounts.aggravatedAssault;
                crimeCount += stateData.crimeCounts.arson;
                crimeCount += stateData.crimeCounts.burglary;
                crimeCount += stateData.crimeCounts.drugViolations;
                crimeCount += stateData.crimeCounts.forcibleSexOffense;
                crimeCount += stateData.crimeCounts.liquorViolations;
                crimeCount += stateData.crimeCounts.murderCount;
                crimeCount += stateData.crimeCounts.negligentManSlaughter;
                crimeCount += stateData.crimeCounts.robbery;
                crimeCount += stateData.crimeCounts.vehicleTheft;
                crimeCount += stateData.crimeCounts.weaponOffence;
            }
        }
        bardata.push({
            state: d,
            count: crimeCount
        });
    });
    return bardata;
}

BarChartViz.prototype.init = function()
{
    var that=this;
    var bardata = [];

    d3.select('.toolTip').style('opacity',0);
    bardata = this.theData;

    var margin = { top: 30, right: 5, bottom: 40, left:60 }

    var height = that.height  - margin.top - margin.bottom,
        width = that.width - margin.left - margin.right,
        barOffset = 5;

    d3.select('#'+ that.theDiv).select('svg').remove();

    that.svg = d3.select('#'+ that.theDiv).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)


    this.svg.append("text")
        .attr("y", 20)
        .attr("x", this.width/2)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Overall Crime Counts by States");

    var extent = d3.extent(bardata, function(d){
        return d.count;
    })

    var vGuideScale = d3.scale.linear()
        .domain(extent)
        .range([height, 0])

    var vAxis = d3.svg.axis()
        .scale(vGuideScale)
        .orient('left')
        .ticks(10)


    var tempColor;

    var colors = d3.scale.linear()
        .domain([0, bardata.length*.33, bardata.length*.66, bardata.length])
        .range(['#B58929','#C61C6F', '#268BD2', '#85992C'])

        var yScale = d3.scale.linear()
            .domain(extent)
            .range([0, height]);

        var xScale = d3.scale.ordinal()
            .domain(that.states)
            .rangeBands([0, width], 0.2)

        var hAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

        var vAxisGroup = that.svg.append("g")
            .attr("class",'stateAxes')
            .attr("transform",
            "translate("+ 49 + ","+margin.top+")").call(vAxis)


        var hAxisGroup = that.svg.append("g")
            .attr("class",'stateAxes')
            .attr("transform",
            //"translate("+ 0 + ","+height + margin.top + margin.bottom+")").call(hAxis)
            "translate(40, "+ (margin.top + height) +")").call(hAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", (1.5 * xScale.rangeBand()))
            .attr("transform", function(d) {
                return "rotate(-90)"
            });

        d3.select('body').select('.toolTip').remove();

        var tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 5px')
            .style('font-size', '10px')
            .style('background', 'white')
            .style('class', 'toolTip')
            .style('opacity', 0)

        var myChart = that.svg
            .append('g')
            .attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
            .selectAll('rect')
            .data(bardata)
            .enter()
            .append('rect')
            .style('fill', function(d,i) {
                return 'blue';
            })
            .attr('width', xScale.rangeBand())
            .attr('x', function(d,i) {
                return xScale(d.state);
            })
            .attr('height', 0)
            .attr('y', height)

            .on('mouseover', function(d) {

                tooltip.transition()
                    .style('opacity', .9)

                tooltip.html(d.count)
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top',  (d3.event.pageY - 30) + 'px')


                tempColor = this.style.fill;
                d3.select(this)
                    .style('opacity', .2)
            })

            .on('mouseout', function(d) {
                d3.select(this)
                    .style('opacity', 1)
                tooltip.style('opacity',0)
            })

        myChart.transition()
            .attr('height', function(d) {
                return yScale(d.count);
            })
            .attr('y', function(d) {
                return height - yScale(d.count);
            })
            .delay(function(d, i) {
                return i * 20;
            })
            .duration(1000)
            .ease('elastic')

        var vGuide = myChart.append('g')
        vAxis(vGuide)
        vGuide.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        vGuide.selectAll('path')
            .style({ fill: 'none', stroke: "#000"})
        vGuide.selectAll('line')
            .style({ stroke: "#000"})



        var hGuide = myChart.append('g')
        hAxis(hGuide)
        hGuide.attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
        hGuide.selectAll('path')
            .style({ fill: 'none', stroke: "#000"})
        hGuide.selectAll('line')
            .style({ stroke: "#000"})
    //});

}

BarChartViz.prototype.wrangleDataYear = function(_year) {
    this.year = _year;
    this.theData = this.prepData();
    this.init();
}

BarChartViz.prototype.wrangleDataCrimeCategory = function(_crimeCategory) {
    this.crimeCateogry = _crimeCategory;
    this.theData = this.prepData();
    this.init();
}

BarChartViz.prototype.resize = function(){
    this.width = $('#usStatesDiv').width();
    this.height = 310;
    this.init();
}
