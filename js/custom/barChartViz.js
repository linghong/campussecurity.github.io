
BarChartViz = function(_theDiv,_eventHandler,_year,_crimeCategory){

    this.width = 750;
    this.height = 310;
    this.svg = null;
    this.states= [
        'AK',
        'AL',
        'AR',
        'AS',
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
        'VI',
        'VT',
        'WA',
        'WI',
        'WV',
        'WY'
    ];
    this.year = _year;
    this.crimeCateogry = _crimeCategory;
    this.init(_theDiv);
}

BarChartViz.prototype.init = function(_theDiv,_height,_width)
{
    var that=this;
    var bardata = [];
    // -------------------- test grabbing data ---------------
    var yearBucket = crimeAnalyzer.getCategoryCrimeData()[that.year];
    that.states.forEach(function(d,i){
        var stateData = yearBucket["state"+d];
        bardata.push({
            state:d,
            count:stateData.crimeCounts[that.crimeCateogry]
        });
    });

    var margin = { top: 30, right: 30, bottom: 40, left:50 }

    var height = that.height  - margin.top - margin.bottom,
        width = that.width - margin.left - margin.right,
        barWidth = 50,
        barOffset = 5;

    that.svg = d3.select('#'+ _theDiv).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)


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
            .domain(d3.range(0, bardata.length))
            .rangeBands([0, width], 0.2)

        var hAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickValues(xScale.domain().filter(function(d, i) {
                return !(i % (bardata.length/5));
            }))

        var vAxisGroup = that.svg.append("g")
            .attr("class",'axis')
            .attr("transform",
            "translate("+ 30 + ","+margin.top+")").call(vAxis)


        var hAxisGroup = that.svg.append("g")
            .attr("class",'axis')
            .attr("transform",
            //"translate("+ 0 + ","+height + margin.top + margin.bottom+")").call(hAxis)
            "translate(30,280)").call(hAxis)

        var tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 5px')
            .style('font-size', '10px')
            .style('background', 'white')
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
                console.log(xScale(d.count))
                return xScale(d.count);
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
                    .style('fill', tempColor)
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

BarChartViz.prototype.wrangleData = function() {

}