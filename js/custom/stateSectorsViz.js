
/**
 * scatter plots for crime pattern categorized by states (This viz does not display in the final visualization page)
 * @param _data -- the data array
 * @constructor
 * Created by Linghong 
 */
StateSectorsViz = function(_data){
    this.data = _data;
    // defines constants
    this.padding= {top:20, right: 5, bottom: 25, left: 70};
    this.width = $("#statessectors").width();
    this.height = 0.55*this.width;
    this.displayData={};
    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
StateSectorsViz.prototype.initVis = function(){
  var that = this; // read about the this

  // constructs SVG layout
  this.svg = d3.select("#statessectors").append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g");

    this.wrangleData("weaponOffence",2013);
    // call the update method
    this.updateViz();
    
    // Add the text label for the Y axis
    this.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -92)
        .attr("dy", "0.08em")
        .style("text-anchor", "middle")
        .text("Crime Number Per College");

     // Add the text label for the x axis
    this.svg.append("text")
        .attr("y", this.height-12)
        .attr("x", 200)
        .attr("dy", "0.08em")
        .style("text-anchor", "middle")
        .text("Nine US College Categories");   

}

/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
StateSectorsViz.prototype.wrangleData= function(_crimekey, _year){

  //group data as year basis
  var yearData = d3.nest()
          .key(function(d) { 
            return d.year; })
          .entries(this.data);

  //get aggregated data
  var dataPrepare = new DataPrepare(yearData[_year-2008].values, "state", "sectorCd");
   
  //make a data object used for the multi-series scatterplot
  var firstKeyArray=[];
  for (var y=0; y<aggregatedData.length;y++){

    for (var s=0; s<aggregatedData[y].values.length;s++){
      firstKeyArray.push({
        "aggKey2": aggregatedData[y].values[s].key,
        "key":aggregatedData[y].values[s].values[_crimekey],    
      });
    }          
  }

      for (i=0;i<aggregatedData.length;i++){
         this.displayData[aggregatedData[i].key]=firstKeyArray.slice(i*9,i*9+9);
      }
    this.crimekey=_crimekey;
    this.year=_year;  
}

/**
 * Method to updata Viz. 
 */
StateSectorsViz.prototype.updateViz = function(){

// a data series
var dataSeries = d3.values(this.displayData);

//scales
var x =d3.scale.ordinal()
    .domain(["",1,2,3,4,5,6,7,8,9,"."])
    .rangePoints([this.padding.left-6, this.width-this.padding.left-this.padding.right]);

var yMax= d3.max( dataSeries, function(d) { 
      var innermax= d3.max(d, function(v) { 
          return v.key; });
 
        return innermax;          
      } );

var y = d3.scale.linear()
    .domain([0, yMax])
    .range([this.height-this.padding.top-this.padding.bottom, this.padding.top]);

    this.xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(y)
      .ticks(5)
      .orient("left");
  
  var series = this.svg.selectAll( "g" )
    // convert the object to an array of d3 entries
    .data( d3.map(this.displayData).entries())

    series.enter()    
    // create a container for each series
    .append("g")
    .attr( "class", function(d) { return "series-" + d.key } )
   ;
  
  // do a data join for each series' values
  var circle=series.selectAll( "circle" )      
        .data( function(d) { return d.value } );

  circle.enter()
        .append("circle");
  circle.attr( "cx", function(d) { return x(d.aggKey2) } )
        .attr( "r", "5" )
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

    series.exit().remove();
    circle.exit().remove();
  }


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 */
StateSectorsViz.prototype.onCrimeChange= function (_crimekey){
    this.wrangleData(_crimekey,this.year);
    this.updateViz();
}

StateSectorsViz.prototype.onYearChange= function (_slideryear){
    this.wrangleData(this.crimekey, _slideryear);
    this.updateViz();
}
 