/**
 * scatter plots for crime pattern categorized by college type
 * @param _data -- the data array
 * @constructor
 * Created by Linghong 
 */
ColSectorsViz = function(_data){
    this.data = _data;
    // defines constants
    this.padding= {top:30, right:20, bottom: 100, left: 52};
    this.width = $("#yearsectors").width();
    this.height = 310;
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
    this.initViz();
}


/**
 * Method that sets up the SVG and the variables
 */
ColSectorsViz.prototype.initViz = function(){
    var that = this; // read about the this

    // constructs SVG layout
    this.svg = d3.select("#yearsectors").append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g");

    // Add the text label for the Y axis
    this.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", -110)
        .attr("dy", "0.07em")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Crime Number/College");

    this.crimeYear=[2008,2009,2010,2011,2012,2013];

    this.wrangleData("");

    // call the update method
    this.xAxisGroup = this.svg
        .append("g")
        .attr("class", "scatterPlotAxis scatterPlotAxisX")
        .attr("transform", "translate(0,"+(this.height-this.padding.bottom)+")")


    this.yAxisGroup = this.svg
        .append("g")
        .attr("class", "scatterPlotAxis")
        .attr("transform", "translate(" + this.padding.left + ",0)")


    this.updateViz();    
}

/**
 * Method to wrangle the data. In this case it takes an option object
 * @param _filterFunction - a function that filters data or is "null" if none
 */
ColSectorsViz.prototype.wrangleData= function(_crimekey){

    //get aggregated data
    var dataPrepare = new DataPrepare(this.data, "year", "sectorCd");

    //make a data object used for the multi-series scatterplot
    var firstKeyArray=[];
    for (var y=0; y<aggregatedData.length;y++){

        for (var s=0; s<aggregatedData[y].values.length;s++){
            var crimeValue=0;

            if(_crimekey==""){
                crimeValue+=aggregatedData[y].values[s].values.aggravatedAssault;
                crimeValue+=aggregatedData[y].values[s].values.arson;
                crimeValue+=aggregatedData[y].values[s].values.burglary;
                crimeValue+=aggregatedData[y].values[s].values.drugViolations;
                crimeValue+=aggregatedData[y].values[s].values.forcibleSexOffense;
                crimeValue+=aggregatedData[y].values[s].values.liquorViolations;
                crimeValue+=aggregatedData[y].values[s].values.murderCount;
                crimeValue+=aggregatedData[y].values[s].values.negligentManSlaughter;
                crimeValue+=aggregatedData[y].values[s].values.nonForcibleSexOffense;
                crimeValue+=aggregatedData[y].values[s].values.robbery;
                crimeValue+=aggregatedData[y].values[s].values.vehicleTheft;
                crimeValue+=aggregatedData[y].values[s].values.weaponOffence;
            }
            else{
                crimeValue+=aggregatedData[y].values[s].values[_crimekey];
            }
            firstKeyArray.push({
                "crimeKey": aggregatedData[y].values[s].key,
                "crimeData":crimeValue
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
   var that =this;
//this.displayData=this.crimeKeyData;
// a data series
    this.displayData={};

    this.crimeYear.forEach(function(d,i){
        that.displayData[d] = that.crimeKeyData[d];
    })

    var dataSeries = d3.values(this.displayData);

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
                sectorCode:dd.crimeKey,
                crimeData:dd.crimeData
            })
        });
    });


//scales
    var x =d3.scale.ordinal()
        .domain(["",1,2,3,4,5,6,7,8,9,'.'])
        .rangePoints([this.padding.left, this.width-this.padding.right]);

    var y = d3.scale.linear()
        .domain([0, yMax])
        .range([this.height-this.padding.bottom, this.padding.top]);

  // for(var i=1; i<that.labels.length;i++){
      this.svg.selectAll('text')
            .data(this.labels)
            var labelText= this.svg.selectAll('text')
                    .data(this.labels);

            labelText.enter()
                    .append('text')
                    .attr('x', -y(0))
                    .attr('y', function(d,i){return x(i);})
                    .attr("dy", "0.07em")
                    .attr("dx", "-1em")
                    .attr('class', 'scatterPlotLabel')
                    .attr("text-anchor", "end")
                    .text(function(d,i){return d})
                    .attr('transform', 'rotate(-90)')
  // }
  

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
        .data(flatData);

    circles.enter()
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
 * Get called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 */
ColSectorsViz.prototype.onCrimeChange= function (_crimekey){
    console.log(_crimekey);
    this.wrangleData(_crimekey); 
    this.width = $("#yearsectors").width();
    this.updateViz();
}

ColSectorsViz.prototype.onYearChange= function (_slideryear){
    this.wrangleData(this.crimekey, _slideryear);

    this.width = $("#yearsectors").width();   
    d3.select("#yearsectors").select('svg').remove();

    this.updateViz();
}


//for check boxes
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

//resize
ColSectorsViz.prototype.resize = function(){
    this.width = $("#yearsectors").width();
    
    d3.select("#yearsectors").select('svg').remove();
  
    this.initViz();
  
};

}