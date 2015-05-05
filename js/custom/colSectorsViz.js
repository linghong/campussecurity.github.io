/**
 * @param _data -- the data array
 * @constructor
 */
ColSectorsViz = function(_data){
    this.data = _data;
    // defines constants
    this.padding= {top: 30, right:-60, bottom: 15, left: 70};
    this.width = $("#yearsectors").width();
    this.height = 0.75*this.width;
    this.displayData={};
    this.crimeKeyData={};
    this.xAxisGroup = null;
    this.yAxisGroup = null;
    this.labels = ['','Public 4 yr',
        'Private 4 yr',
        'For-profit 4 yr',
        'Public 2 yr',
        'Private 2 yr',
        'For-profit 2 yr',
        'Public < 2 yr',
        'Private < 2 yr',
        'For-profit < 2 yr','']
    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
ColSectorsViz.prototype.initVis = function(){
    var that = this; // read about the this

    // constructs SVG layout
    this.svg = d3.select("#yearsectors").append("svg")
        .attr("width", this.width)
        .attr("height", this.height+100)
        .append("g");

    // Add the text label for the Y axis
    this.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30)
        .attr("x", -122)
        .attr("dy", "0.07em")
        .style("text-anchor", "middle")
        .text("Crime Number/College");

    this.crimeYear=[2008,2009,2010,2011,2012,2013];
    this.wrangleData("weaponOffence");
    // call the update method


    this.xAxisGroup = this.svg
        .append("g")
        .attr("class", "scatterPlotAxis scatterPlotAxisX")
        .attr("transform", "translate(0," + (this.height - this.padding.bottom-this.padding.top) + ")")


    this.yAxisGroup = this.svg
        .append("g")
        .attr("class", "scatterPlotAxis")
        .attr("transform", "translate("+this.padding.left+",0)")


    this.updateViz();    
}

/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
ColSectorsViz.prototype.wrangleData= function(_crimekey){

    //get aggregated data
    var dataPrepare = new DataPrepare(this.data, "year", "sectorCd");

    //make a data object used for the multi-series scatterplot
    var firstKeyArray=[];
    for (var y=0; y<aggregatedData.length;y++){

        for (var s=0; s<aggregatedData[y].values.length;s++){
            firstKeyArray.push({
                "aggKey2": aggregatedData[y].values[s].key,
                "crimeData":aggregatedData[y].values[s].values[_crimekey],
            });
        }
    }

    for (i=0;i<aggregatedData.length;i++){
      this.crimeKeyData[aggregatedData[i].key]=firstKeyArray.slice(i*9,i*9+9);
  }
}

/**
 * Method to updata Viz.
 */
ColSectorsViz.prototype.updateViz = function(){
   //for check boxes
    var that = this;
//this.displayData=this.crimeKeyData;
// a data series
    this.displayData={};

    this.crimeYear.forEach(function(d,i){
        that.displayData[d] = that.crimeKeyData[d];
    })

    var dataSeries = d3.values(this.displayData);
    console.log(this.displayData)

    var flatData = [];
    var yMax = null;
    dataSeries.forEach(function (d,i){
        var crimeDataYear = that.crimeYear[i];
        d.forEach( function(dd,i){
            if(!yMax){
                yMax = dd.crimeData;
            }
            else if(yMax<dd.crimeData){
                yMax = dd.crimeData;
            }
            flatData.push({
                year:crimeDataYear,
                sectorCode:dd.aggKey2,
                crimeData:dd.crimeData
            })
        });
    });

    console.log(flatData);

//scales
    var x =d3.scale.ordinal()
        .domain(["",1,2,3,4,5,6,7,8,9,"."])
        .rangePoints([this.padding.left, this.width-this.padding.left-this.padding.right]);


    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([this.height-this.padding.bottom-this.padding.top, this.padding.top]);


    for(var i=1;i<that.labels.length; i++){
        this.svg.selectAll('text')
            .data(this.labels)
            .enter()
            .append('text')
            .attr('x', -y(0))
            .attr('y', function(d,i){return x(i);})
            .attr("dy", "0.07em")
            .attr("dx", "-1em")
            .attr('class', 'scatterPlotLabel')
            .attr("text-anchor", "end")
            .text(function(d,i){return d})
            .attr('transform', 'rotate(-90)')
    }

    //x and y axis

    this.xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left");

    // Add axes visual elements
    this.xAxisGroup
        .call(this.xAxis);

    this.yAxisGroup
        .call(this.yAxis);


    var circles = this.svg.selectAll("circle")
        .data(flatData)

        circles
        .enter()
        .append('circle')
        .attr('r', 6)
        .attr('class', function(d,i){
            return ('series-'+ d.year)
        })
        .attr('cx', function(d,i){
            return x(d.sectorCode)
        })
        .attr('cy',function(d,i){
            return y(d.crimeData)
        })

    circles
        .attr('cx', function(d,i){
            return x(d.sectorCode)
        })
        .attr('cy',function(d,i){
            return y(d.crimeData)
        })
        .attr('class', function(d,i){
            return ('series-'+ d.year)
        })

    this.selectData();

}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 */
ColSectorsViz.prototype.onCrimeChange= function (_crimekey){
    this.wrangleData(_crimekey);
    this.updateViz();

}

ColSectorsViz.prototype.onYearChange= function (_slideryear){
    console.log(".series-" + _slideryear);
//$(".series-" + _slideryear).css({"background-color":"blue"});
//$(".series-" + _slideryear).classed('clicked', true);
}

ColSectorsViz.prototype.selectData=function(){
    var that=this;



    //function for checking which boxes are checked
    var  cbxYear=0;
    d3.selectAll('.yearSelector').each(function (d) {
        var cbx = d3.select(this);

        cbxYear = cbx.attr('id');

        if(cbxYear && cbx.property('checked')){
            d3.selectAll('.'+cbxYear).attr('r',6)
        }
        else{
            d3.selectAll('.'+cbxYear).attr('r',0)
        }

  });

}