
/**
 * @param _data -- the data array
 * @constructor
 */
ColSectorsViz = function(_data,_crimekey){
    this.data = _data;
    // defines constants
    this.padding= {top: 15, right: 15, bottom: 15, left: 25};
    this.width = $("#crimehistory").width();
    this.height = 0.8*this.width;
    this.initVis(_crimekey);
}


/**
 * Method that sets up the SVG and the variables
 */
ColSectorsViz.prototype.initVis = function(_crimekey){
  var that = this; // read about the this

  // constructs SVG layout
  this.svg = d3.select("#crimehistory").append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g");

    this.wrangleData(_crimekey);
    // call the update method
    this.updateViz(_crimekey);
}

/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
ColSectorsViz.prototype.wrangleData= function(_crimekey){

  //get aggregated data
  var dataPrepare = new DataPrepare(this.data, "year", "sectorCd");

  //make a data object used for the multi-series scatterplot
  var yearArray=[];
  for (var y=0; y<6;y++){

    for (var s=0; s<aggregratedData[y].values.length;s++){
      yearArray.push({
        "sectorCd": aggregratedData[y].values[s].key,
        "key":aggregratedData[y].values[s].values[_crimekey]*100,    
      });
    }          
  }

    this.ySecCrime={
      "2008": yearArray.slice(0,9),
      "2009": yearArray.slice(9,18),
      "2010": yearArray.slice(18,27),
      "2011": yearArray.slice(27,36),
      "2012": yearArray.slice(36,45),
      "2013": yearArray.slice(45,54)
    }  

}

/**
 * Method to updata Viz. 
 */
ColSectorsViz.prototype.updateViz = function(){

// a data series
var dataSeries = d3.values(this.ySecCrime);

//scales
var x =d3.scale.ordinal()
    .domain([0,1,2,3,4,5,6,7,8,9,10])
    .rangePoints([this.padding.left, this.width-this.padding.left-this.padding.right]);

var yMax= d3.max( dataSeries, function(d) { 
      var innermax= d3.max(d, function(v) { 
          return v.key; });  
        return innermax;          
      } );

var y = d3.scale.linear()
    .domain([0, yMax])
    .range([this.height-this.padding.top-this.padding.bottom, this.padding.bottom]);

//x and y axis
    this.xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(y)
      .ticks(5)
      .orient("left");
  
  var series = this.svg.selectAll( "g" )
    // convert the object to an array of d3 entries
    .data( d3.map(this.ySecCrime).entries())
    .enter()    
    // create a container for each series
    .append("g")
    .attr( "id", function(d) { return "series-" + d.key } );
    
  series.selectAll( "circle" )
        // do a data join for each series' values
        .data( function(d) { return d.value } )
        .enter()
        .append("circle")
        .attr( "cx", function(d) { return x(d.sectorCd) } )
        .attr( "r", "6" )
        .attr( "cy", function(d) { return y(d.key)-5} );


    // Add axes visual elements
    this.svg
      .append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + (this.height - this.padding.bottom-this.padding.top) + ")") 
      .call(this.xAxis);

    this.svg
      .append("g")
      .attr("class", "y_axis")
      .attr("transform", "translate("+this.padding.left+",0)")  
      .call(this.yAxis);

  }


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 */
ColSectorsViz.prototype.onSelectionChange= function (_crimekey){
    this.updateViz(_crimekey);
}