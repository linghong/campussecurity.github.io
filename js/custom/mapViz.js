
//TODO:
//add parameters - data and width so that it can be passed from outside.
MapViz = function(_statesData,_zipCodeData, _countryStatistics) {
    this.txt = null;
    // get the width of a D3 element
    this.width = $("#map").width();
    this.mapRatio = 0.6;
    this.height = this.width * this.mapRatio;
    this.xOffset = 0;
    this.yOffset =0;
    this.universityAggregateData =null;
    this.path = null;
    this.paths = null;
    this.scaleFactor = 1.1;
    this.scale = this.scaleFactor * this.width;
    this.multiplier = 1;
    this.zoomTimer = null;
    this.moveTimer = null;
    this.timerWaitPeriod = 100;
    this.zipCodeData = _zipCodeData;
    this.countryStatistics = _countryStatistics;
    this.statesData = _statesData;
    this.totalZips = _zipCodeData.length;
    this.init();
    this.loadData();
};

MapViz.prototype.init = function(){
    var that = this;
    this.projection = d3.geo.albersUsa()
        .translate([this.width/2, this.height/2]).scale([this.scaleFactor*this.width]);
    this.path = d3.geo.path().projection(this.projection);
    this.svg = d3.select("#map")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.drag = d3.behavior.drag()
        .on("drag", dragMove);
    this.svg.call(d3.behavior.zoom().scaleExtent([1, this.scaleFactor*this.width]).on("zoom", zoom));
    this.svg.call(this.drag);
    $( window ).resize(function() {
        that.svg.call(resize);
    });



    function zoom(){

        if(that.zoomTimer){
            clearTimeout(that.zoomTimer);
        }

        that.scale =   parseFloat(d3.event.scale)* that.width;

        that.zoomTimer = setTimeout(that.moveMap(that.scale), that.timerWaitPeriod);
    }

    function dragMove(){

        that.xOffset += parseFloat(d3.event.dx);
        that.yOffset += parseFloat(d3.event.dy);

        if(that.moveTimer){
            clearTimeout(that.moveTimer);
        }

        that.moveTimer = setTimeout(that.moveMap(that.scale), that.timerWaitPeriod);
    }



    function resize(){
        // get the width of a D3 element
        that.width = $("#map").width();
        that.height = that.width * that.mapRatio;
        that.scale = that.scaleFactor * that.width;
        that.svg.attr("width", that.width)
            .attr("height", that.height);
        that.moveMap();
    }


}

MapViz.prototype.moveMap = function(scaleIn){
    var that = this;
    that.zoomTimer = null;
    that.moveTimer = null;


    that.projection.scale([that.scale])
        .translate([that.width/2 + parseInt(that.xOffset) ,that.height/2 + parseInt(that.yOffset)]);
    that.path.projection(that.projection)
    that.paths.attr("d",that.path)

    that.svg.selectAll("circle")
        .attr("cx", function(d) {

            var proj = that.projection([d.longitude, d.latitude]);
            if(!proj){
                return -1;
            }
            else {
                return proj[0];
            }

        })
        .attr("cy", function(d) {
            var proj = that.projection([d.longitude, d.latitude]);
            if(!proj){
                return null;
            }
            else {
                return proj[1];
            }
        })

}

MapViz.prototype.refreshData = function () {
    var weights = weightsContainerViz.getWeights();
    var aveCrimeFactor= this.getAveCrimeFactor(this.universityAggregateData,weights)
    var minCrimeFactor = null, maxCrimeFactor = null;
    var crimeFactors = this.processCrimeFactor(this.zipCodeData,weights);
    minCrimeFactor = crimeFactors.minCrimeFactor;
    maxCrimeFactor = crimeFactors.maxCrimeFactor;
    this.paintCircles(aveCrimeFactor,maxCrimeFactor,this.zipCodeData,weights.topBottom);
}


MapViz.prototype.getAveCrimeFactor = function (univAggrData,weights){

    return weights.murdFactor * univAggrData.avgAggMurderCount +
        weights.negligenceFactor * univAggrData.avgAggNegligentManSlaughter +
        weights.forcibleCrimeFactor * univAggrData.avgAggForcibleSexOffense +
        weights.robberyCrimeFactor * univAggrData.avgAggRobbery +
        weights.burglaryCrimeFactor * univAggrData.avgAggBurglary +
        weights.vehicleCrimeFactor * univAggrData.avgAggVehicleTheft;
};



MapViz.prototype.processCrimeFactor = function (cityData,weights){
    var minCrimeFactor = null, maxCrimeFactor = null;

    var that = this;

    cityData.forEach(function(d){
        var crimeFactor = that.multiplier * weights.murdFactor * d.avgMurderCount +
            that.multiplier * weights.negligenceFactor * d.avgNegligentManSlaughter +
            that.multiplier * weights.forcibleCrimeFactor * d.avgForcibleSexOffense +
            that.multiplier * weights.robberyCrimeFactor * d.avgRobbery +
            that.multiplier * weights.burglaryCrimeFactor * d.avgBurglary +
            that.multiplier * weights.vehicleCrimeFactor * d.avgVehicleTheft;
        d["crimeFactor"] = crimeFactor;

        if (minCrimeFactor == null){
            minCrimeFactor = crimeFactor;
        }
        else if(minCrimeFactor > crimeFactor){
            minCrimeFactor = crimeFactor;
        }

        if(maxCrimeFactor == null){
            maxCrimeFactor = crimeFactor;
        }
        else if(maxCrimeFactor<crimeFactor){
            maxCrimeFactor = crimeFactor;
        }
    })

    return{
        minCrimeFactor: minCrimeFactor,
        maxCrimeFactor: maxCrimeFactor
    }
}

MapViz.prototype.paintCircles = function (aveCrimeFactor,maxCrimeFactor,cityData,topBottom){
    var that = this;

    var colorScale = d3.scale.linear().domain
    ([aveCrimeFactor, maxCrimeFactor]).range(["#8b0000", "#FFF0F0"])

    this.svg.selectAll("circle").remove();
    this.svg.selectAll("circle")
        .data(cityData)
        .enter()
        .append("circle")
        .attr("city", function(d){return d.City})
        .attr("cx", function(d) {
            var proj = that.projection([d.longitude, d.latitude]);
            if(!proj){
                console.log("Invalid lat /long",d);
                return null;
            }
            else {
                return that.projection([d.longitude, d.latitude])[0];
            }

        })
        .attr("cy", function(d) {
            var proj = that.projection([d.longitude, d.latitude]);
            if(!proj){
                console.log("Invalid lat /long",d);
                return null;
            }
            else {
                return proj[1];
            }
        })
        .attr("r",function(d,i){

            if (d.rank <topBottom || d.rank> that.totalZips-topBottom){


            if (d.crimeFactor < aveCrimeFactor){

                return 2+ 5*((aveCrimeFactor- d.crimeFactor)/aveCrimeFactor)
                //return 1;
                //return 2 + 2 -(2 *(d.crimeFactor/aveCrimeFactor));
            }
            else{

                return 2+ 5*(d.crimeFactor/( maxCrimeFactor-aveCrimeFactor))
                //console.log(2*(d.crimeFactor-aveCrimeFactor)/aveCrimeFactor)
                //return 1;
                //return 2 *(d.crimeFactor/aveCrimeFactor);
            }
            }
            else{
                return 0;
            }


        })
        .style("fill", function(d,i){

            if (d.crimeFactor > aveCrimeFactor){
                return "red";// colorScale(d.crimeFactor)
            }
            else {
                return "green"
            }


        })
        .style("opacity", function(d){
            if (d.crimeFactor > aveCrimeFactor){
                return .5
            }
            else {
                return .5
            }
        })
        .on('mouseover',showCityData)

    d3.selectAll("circle")[0].sort(function(d){return d3.ascending(d.crimeFactor)});

    this.svg.selectAll("txt").remove();
    this.txt = this.svg.append("text")
        .style("visibility", "hidden")
        .attr("class","schoolLabel")

    function showCityData(){
        var circle = d3.select(this);

        that.txt.style("visibility", "visible")
            .transition()
            .delay(100)
            .text(circle.attr("city"))
            .attr("x", circle.attr("cx")+5)
            .attr("y", circle.attr("cy") +5)

    }
}



MapViz.prototype.loadData = function (){

    var that = this;

    var weights = weightsContainerViz.getWeights();
    that.universityAggregateData = that.countryStatistics[0];

    var aveCrimeFactor= that.getAveCrimeFactor(that.universityAggregateData,weights)
    var minCrimeFactor = null, maxCrimeFactor = null;
    {
        var crimeFactors = that.processCrimeFactor(that.zipCodeData,weights);
        that.zipCodeData.sort(function(a,b){return d3.ascending(a.crimeFactor, b.crimeFactor) });
        that.zipCodeData.forEach(function(d,i){
            d["rank"]=i;
        })

        minCrimeFactor = crimeFactors.minCrimeFactor;
        maxCrimeFactor = crimeFactors.maxCrimeFactor;

        console.log(minCrimeFactor,maxCrimeFactor,aveCrimeFactor)
        var selectedData = []
        that.statesData.features.forEach(function(d){
            selectedData.push(d);
        })

        //Bind data and create one path per GeoJSON feature
        that.paths = that.svg.selectAll("path")
            .data(selectedData)
            .enter()
            .append("path")
            .attr("i",function(d,i){return i })
            .style("fill","#f2f2f2") // function(d, i) {return colors(i)})
            .style("stroke", "grey")
            .attr("d", that.path)
            .on("mouseover",stateIn)
            .on("mouseout",stateOut)


        //Murder	NegM	Forcib	NonForcib	Robbe	AggA	Burgla	Vehic	Arson

        that.paintCircles(aveCrimeFactor,maxCrimeFactor,that.zipCodeData,weights.topBottom);

    }
    var rightEdge = $("#mapContainer").position().left+ $("#mapContainer").width();
    var topEdge = $("#mapContainer").position().top -divPadding;
    var leftPosition = rightEdge;
    var widthOfWeightSel = $( "#weightsSelector").width();
    $( "#weightsSelector" )
        .css("left", leftPosition -divPadding);
    $( "#weightsSelector" )
        .css("top", topEdge);

    $( "#weightsSelector" )
        .css("width", 0);

    $( "#weightsSelector" )
        .css("display", "block");


    weightsContainerViz.showWeightsContainer();

    function stateIn(){
        d3.select(this).style("opacity",".6");
        weightsContainerViz.hideWeightsContainer();
    }

    function stateOut(){
        var ctrl = d3.select(this);
        var i=ctrl.attr("i");
        d3.select(this).style("opacity","1");
    }

}


