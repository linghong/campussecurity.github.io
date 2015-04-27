
/**
 * @param _data -- the data array
 * @constructor
 */
ColSectorsViz = function(_data,_crimekey){
    this.data = _data;
    // defines constants
    this.padding= {top: 15, right: 15, bottom: 15, left: 25},
    this.width = $("#crimehistory").width();
    this.height = 0.9*this.width;
    this.initVis(_crimekey);
    console.log("this.width");
    console.log(this.width);
}


/**
 * Method that sets up the SVG and the variables
 */
_crimekey="weapon";
ColSectorsViz.prototype.initVis = function(_crimekey){
var Data = {
    "2011": [
             {"sect_cd":"1", "weapon":52.9264214},
             {"sect_cd":"2", "weapon":5.657370518},
             {"sect_cd":"3", "weapon":1.315789474},
             {"sect_cd":"4", "weapon":12.02290076},
             {"sect_cd":"5", "weapon":4.191616766},
             {"sect_cd":"6", "weapon":1.011122346}
         ],
    "2012": [
             {"sect_cd":"1", "weapon":51.6722408},
             {"sect_cd":"2", "weapon":5.61752988},
             {"sect_cd":"3", "weapon":1.315789474},
             {"sect_cd":"4", "weapon":12.40458015},
             {"sect_cd":"5", "weapon":3.592814371},
             {"sect_cd":"6", "weapon":0.910010111}
         ],
    "2013": [
             {"sect_cd":"1", "weapon":53.84615385},
             {"sect_cd":"2", "weapon":6.573705179},
             {"sect_cd":"3", "weapon":1.435406699},
             {"sect_cd":"4", "weapon":11.30725191},
             {"sect_cd":"5", "weapon":3.592814371},
             {"sect_cd":"6", "weapon":0.707785642}
    ]};


// A way to look more easily across all 'inner' arrays
var myDataDrill = d3.values(Data);

var x =d3.scale.ordinal()
    .domain([0,1,2,3,4,5,6])
    .rangePoints([this.padding.left, this.width-this.padding.left-this.padding.right]);

var yMax= d3.max( myDataDrill, function(d) { 
      var innermax= d3.max(d, function(v) { 
          return v[_crimekey]; });  
        return innermax;          
      } );

var y = d3.scale.linear()
    .domain([0, yMax])
    .range([this.height-this.padding.top-this.padding.bottom, this.padding.bottom]);

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
    .data( d3.map(Data).entries())
    .enter()
    // create a container for each series
    .append("g")
    .attr( "id", function(d) { return "series-" + d.key } );
    
    series.selectAll( "circle" )
        // do a data join for each series' values
        .data( function(d) { return d.value } )
        .enter()
        .append("circle")
        .attr( "cx", function(d) { return x(d.sect_cd) } )
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

