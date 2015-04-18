
MapViz = function() {
    this.txt = null;
    // get the width of a D3 element
    this.w = $("#map").width();
    this.mapRatio = 0.6;
    this.h = this.w * this.mapRatio;
    this.xOffset = 0;
    this.yOffset =0;
    this.universityAggregateData =null;
    this.cityDataSave  = null;
    this.path = null;
    this.paths = null;
    this.scaleFactor = 1.3;
    this.scale = this.scaleFactor * this.w;
    this.multiplier = 10000;
    this.zoomTimer = null;
    this.moveTimer = null;


    this.init();
    this.loadData();


};

MapViz.prototype.init = function(){
    var that = this;
    this.projection = d3.geo.albersUsa()
        .translate([this.w/2, this.h/2]).scale([this.scaleFactor*this.w]);
    this.path = d3.geo.path().projection(this.projection);
    this.svg = d3.select("#map")
        .append("svg")
        .attr("width", this.w)
        .attr("height", this.h);

    this.drag = d3.behavior.drag()
        .on("drag", dragMove);
    this.svg.call(d3.behavior.zoom().scaleExtent([1, this.scaleFactor*this.w]).on("zoom", zoom));
    this.svg.call(this.drag);
    $( window ).resize(function() {
        that.svg.call(resize);
    });



    function zoom(){

        if(that.zoomTimer){
            clearTimeout(that.zoomTimer);
        }

        that.scale =   parseFloat(d3.event.scale)* that.w;

        that.zoomTimer = setTimeout(that.moveMap(that.scale), 250);
    }

    function dragMove(){

        that.xOffset += parseFloat(d3.event.dx);
        that.yOffset += parseFloat(d3.event.dy);

        if(that.moveTimer){
            clearTimeout(that.moveTimer);
        }

        that.moveTimer = setTimeout(that.moveMap(that.scale), 250);
    }



    function resize(){
        // get the width of a D3 element
        that.w = $("#map").width();
        that.h = that.w * that.mapRatio;
        that.scale = that.scaleFactor * that.w;
        that.svg.attr("width", that.w)
            .attr("height", that.h);
        that.moveMap();
    }


}

MapViz.prototype.moveMap = function(scaleIn){
    var that = this;
    that.zoomTimer = null;
    that.moveTimer = null;


    that.projection.scale([that.scale])
        .translate([that.w/2 + parseInt(that.xOffset) ,that.h/2 + parseInt(that.yOffset)]);
    that.path.projection(that.projection)
    that.paths.attr("d",that.path)

    that.svg.selectAll("circle")
        .attr("cx", function(d) {

            var proj = that.projection([d.Longitude, d.Latitude]);
            if(!proj){
                return null;
            }
            else {
                return that.projection([d.Longitude, d.Latitude])[0];
            }

        })
        .attr("cy", function(d) {
            var proj = that.projection([d.Longitude, d.Latitude]);
            if(!proj){
                return null;
            }
            else {
                return that.projection([d.Longitude, d.Latitude])[1];
            }
        })

}

MapViz.prototype.refreshData = function () {
    var weights = this.getWeights();
    var aveCrimeFactor= this.getAveCrimeFactor(this.universityAggregateData,weights)
    var minCrimeFactor = null, maxCrimeFactor = null;
    var crimeFactors = this.processCrimeFactor(this.cityDataSave,weights);
    minCrimeFactor = crimeFactors.minCrimeFactor;
    maxCrimeFactor = crimeFactors.maxCrimeFactor;
    this.paintCircles(aveCrimeFactor,maxCrimeFactor,this.cityDataSave);
}


MapViz.prototype.getAveCrimeFactor = function (univAggrData,weights){

    return weights.murdFactor * univAggrData.totMurd +
        weights.negligenceFactor * univAggrData.totNegM +
        weights.forcibleCrimeFactor * univAggrData.totForcib +
        weights.nonForcibleCrimeFactor * univAggrData.totNonForcib +
        weights.robberyCrimeFactor * univAggrData.totRobbe +
        weights.burglaryCrimeFactor * univAggrData.totBurgla +
        weights.vehicleCrimeFactor * univAggrData.totVehic;
};


MapViz.prototype.getWeights = function(){
    var murdFactor = parseInt($("#murdId").val());
    var negligenceFactor = parseInt($("#negId").val());
    var forcibleCrimeFactor = parseInt($("#forcibId").val());
    var nonForcibleCrimeFactor = parseInt($("#nonForcibId").val());
    var robberyCrimeFactor = parseInt($("#robbeId").val());
    var burglaryCrimeFactor = parseInt($("#murdId").val());
    var vehicleCrimeFactor = parseInt($("#vehicId").val());


    return {
        murdFactor:murdFactor,
        negligenceFactor:negligenceFactor,
        forcibleCrimeFactor:forcibleCrimeFactor,
        nonForcibleCrimeFactor:nonForcibleCrimeFactor,
        robberyCrimeFactor:robberyCrimeFactor,
        burglaryCrimeFactor:burglaryCrimeFactor,
        vehicleCrimeFactor:vehicleCrimeFactor
    }
}

MapViz.prototype.processCrimeFactor = function (cityData,weights){
    var minCrimeFactor = null, maxCrimeFactor = null;

    var that = this;

    cityData.forEach(function(d){
        var crimeFactor = that.multiplier * weights.murdFactor * d.Murder +
            that.multiplier * weights.negligenceFactor * d.NegM +
            that.multiplier * weights.forcibleCrimeFactor * d.Forcib +
            that.multiplier * weights.nonForcibleCrimeFactor * d.NonForcib +
            that.multiplier * weights.robberyCrimeFactor * d.Robbe +
            that.multiplier * weights.burglaryCrimeFactor * d.Burgla +
            that.multiplier * weights.vehicleCrimeFactor * d.Vehic;
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

MapViz.prototype.paintCircles = function (aveCrimeFactor,maxCrimeFactor,cityData){
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
            var proj = that.projection([d.Longitude, d.Latitude]);
            if(!proj){
                console.log("Invalid lat /long",d);
                return null;
            }
            else {
                return that.projection([d.Longitude, d.Latitude])[0];
            }

        })
        .attr("cy", function(d) {
            var proj = that.projection([d.Longitude, d.Latitude]);
            if(!proj){
                console.log("Invalid lat /long",d);
                return null;
            }
            else {
                return proj[1];
            }
        })
        .attr("r",function(d,i){
            if (d.crimeFactor > aveCrimeFactor){
                return 3
            }
            else {
                return 1.5
            }
        })
        .style("fill", function(d,i){

            if (d.crimeFactor > aveCrimeFactor){
                return colorScale(d.crimeFactor)
            }
            else {
                return "green"
            }


        })
        .style("opacity", function(d){
            if (d.crimeFactor > aveCrimeFactor){
                return 1
            }
            else {
                return .3
            }
        })
        .on('mouseover',showCityData)

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

    d3.json("data/us-states.json", function(json) {
        d3.tsv("data/univDataAgg.tsv", function(err,univAggrDataArray){
            var weights = that.getWeights();
            that.universityAggregateData = univAggrDataArray[0];

            var aveCrimeFactor= that.getAveCrimeFactor(that.universityAggregateData,weights)
            var minCrimeFactor = null, maxCrimeFactor = null;
            d3.tsv("data/univData.tsv", function (err,cityData) {
                that.cityDataSave = cityData;
                var crimeFactors = that.processCrimeFactor(that.cityDataSave,weights);
                minCrimeFactor = crimeFactors.minCrimeFactor;
                maxCrimeFactor = crimeFactors.maxCrimeFactor;

                var selectedData = []
                json.features.forEach(function(d){
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

                that.paintCircles(aveCrimeFactor,maxCrimeFactor,that.cityDataSave);

            });
        });
    });

    function stateIn(){
        d3.select(this).style("opacity",".6");
    }

    function stateOut(){
        var ctrl = d3.select(this);
        var i=ctrl.attr("i");
        d3.select(this).style("opacity","1");
    }

}


