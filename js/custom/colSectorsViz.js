
/**
 * @param _data -- the data array
 * @constructor
 */
ColSectorsViz = function(_data,_crimekey){
    this.data = _data;
    // defines constants
    this.padding= {top: 15, right: 15, bottom: 15, left: 25};
    this.width = $("#crimehistory").width();
    this.height = 0.9*this.width;
    this.initVis(_crimekey);
}


/**
 * Method that sets up the SVG and the variables
 */
ColSectorsViz.prototype.initVis = function(_crimekey){

  //get aggregated data
  var dataPrepare = new DataPrepare(this.data, "year", "sectorCd");

  //make a data object used for the multi-series scatterplot
  var yearArray=[];
  var yearObject={};
  var index;
  for (var y=0; y<6;y++){

    for (var s=0; s<yearSectors[y].values.length;s++){
      yearArray.push({
        "sectorCd": yearSectors[y].values[s].key,
        "murderCount":yearSectors[y].values[s].values.murderCount*100,
        "negligentManSlaughter":yearSectors[y].values[s].values.negligentManSlaughter*100,
        "forcibleSexOffense":yearSectors[y].values[s].values.forcibleSexOffense*100,
        "nonForcibleSexOffense":yearSectors[y].values[s].values.nonForcibleSexOffense*100,
        "robbery":yearSectors[y].values[s].values.robbery*100,
        "aggravatedAssault":yearSectors[y].values[s].values.aggravatedAssault*100,
        "burglary":yearSectors[y].values[s].values.burglary*100,
        "vehicleTheft":yearSectors[y].values[s].values.vehicleTheft*100,
        "arson":yearSectors[y].values[s].values.arson*100,
        "weaponOffence":yearSectors[y].values[s].values.weaponOffence*100,
        "drugViolations":yearSectors[y].values[s].values.drugViolations*100,
        "liquorViolations":yearSectors[y].values[s].values.liquorViolations*100 
      });
    }          
}

var ySecCrime={
  "2008": yearArray.slice(0,9),
  "2009": yearArray.slice(9,18),
  "2010": yearArray.slice(18,27),
  "2011": yearArray.slice(27,36),
  "2012": yearArray.slice(36,45),
  "2013": yearArray.slice(45,54)
}

// a data series
var dataSeries = d3.values(ySecCrime);

//scales
var x =d3.scale.ordinal()
    .domain([0,1,2,3,4,5,6,7,8,9,10])
    .rangePoints([this.padding.left, this.width-this.padding.left-this.padding.right]);

var yMax= d3.max( dataSeries, function(d) { 
      var innermax= d3.max(d, function(v) { 
          return v[_crimekey]; });  
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
  
  // constructs SVG layout
  var svg = d3.select("#crimehistory").append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g");

  var series = svg.selectAll( "g" )
    // convert the object to an array of d3 entries
    .data( d3.map(ySecCrime).entries())
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
        .attr( "r", "5" )
        .attr( "cy", function(d) { return y(d[_crimekey])-5} );
 
    // Add axes visual elements
    svg
      .append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + (this.height - this.padding.bottom-this.padding.top) + ")") 
      .call(this.xAxis);

    svg
      .append("g")
      .attr("class", "y_axis")
      .attr("transform", "translate("+this.padding.left+",0)")  
      .call(this.yAxis);
  }

