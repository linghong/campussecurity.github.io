/**
 * @param _data -- the data array
 * @constructor
 */
ColSectorsViz = function(_data){
    this.data = _data;
    // defines constants
    this.padding= {top: 20, right: 0, bottom: 25, left: 70};
    this.width = $("#yearsectors").width();
    this.height = 0.55*this.width;
    this.displayData={};
    this.crimeKeyData={};
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
    .attr("height", this.height)
    .append("g");

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

    this.wrangleData("weaponOffence");

    // call the update method
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
        "key":aggregatedData[y].values[s].values[_crimekey],    
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
this.selectData();

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
    .range([this.height-this.padding.bottom-this.padding.top, this.padding.top]);

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
    .data( d3.map(this.displayData).entries())

  series.enter()    
    // create a container for each series
    .append("g")
    .attr( "class", function(d) {  
      return "series-" + d.key } );

  var circle=series.selectAll( "circle" )
        // do a data join for each series' values
        .data( function(d) { return d.value } );

  circle.enter()
        .append("circle");
  circle.attr( "cx", function(d) { return x(d.aggKey2) } )
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

    series.exit().remove();
    circle.exit().remove(); 

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
//$(".series-" + _slideryear).css({"background-color":"blue"});
//$(".series-" + _slideryear).classed('clicked', true);
}
ColSectorsViz.prototype.selectData=function(){

    var checkedValue =[];//array to represents which years are checked
    this.displayData={};
 
    //function for checking which boxes are checked
    var  m=0;
    d3.selectAll('input[name="year"]').each(function (d) {
      if(d3.select(this).attr("type") == "checkbox" &&d3.select(this).node().checked) {
        checkedValue[m] =d3.select(this).attr("value");
        m++;
      }         
  }); 

  var crimeYear=2008; 
  //get filtered data
  for(var i=0; i<checkedValue.length;i++){ 
    while(parseInt(checkedValue[i])!=crimeYear) {  
    //***d3.select("g").classed("series-"+crimeYear, false); 
    crimeYear++;
    }
    //****d3.select("g").classed("series-"+crimeYear, true); 
    this.displayData[checkedValue[i]] =this.crimeKeyData[checkedValue[i]];      
    crimeYear++; 
  } 
}
