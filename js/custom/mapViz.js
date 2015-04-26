
//TODO:
//add parameters - data and width so that it can be passed from outside.
MapViz = function(_statesData,_zipCodeData, _countryStatistics,_stateOffsets) {
    this.txt = null;
    this.txtBox = null;
    this.stateOffsets=_stateOffsets;
    this.stateFillColor = "#f2f2f2";
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
    this.scaleLast = this.scale;
    this.multiplier = 1;
    this.zoomTimer = null;
    this.moveTimer = null;
    this.timerWaitPeriod = 100;

    this.hideCaptionTimer = null;
    this.hideDetailTimer = null;
    this.hideCaptionWaitPeriod = 2500;

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

    this.drag = d3.behavior.drag().on("drag", dragMove);
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


        that.zoomTimer = setTimeout(that.moveMap(that.scale,true), that.timerWaitPeriod);
    }

    function dragMove(){

        that.xOffset += parseFloat(d3.event.dx);
        that.yOffset += parseFloat(d3.event.dy);

        if(that.moveTimer){
            clearTimeout(that.moveTimer);
        }

        that.moveTimer = setTimeout(that.moveMap(that.scale,false), that.timerWaitPeriod);
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

MapViz.prototype.moveMap = function(scaleIn,reOffset){
    var that = this;

    if(reOffset){
        that.xOffset *= (that.scaleLast / scaleIn);
        that.yOffset *= (that.scaleLast / scaleIn);

    }
    that.zoomTimer = null;
    that.moveTimer = null;

    that.scaleLast = scaleIn;

    $("#debugInfo").text(that.scale +", " + that.xOffset +", " + that.yOffset)


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
    this.svg.selectAll("text").remove();
    this.svg.selectAll("rect").remove();

    var weights = weightsContainerViz.getWeights();
    var aveCrimeFactor= this.getAveCrimeFactor(this.universityAggregateData,weights)
    var minCrimeFactor = null, maxCrimeFactor = null;
    var crimeFactors = this.processCrimeFactor(this.zipCodeData,weights);
    minCrimeFactor = crimeFactors.minCrimeFactor;
    maxCrimeFactor = crimeFactors.maxCrimeFactor;
    this.paintCircles(aveCrimeFactor,maxCrimeFactor,this.zipCodeData,weights.topCount,weights.bottomCount);
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
        d["cityName"] = d.city + ", " + d.state + "-" + d.zip;


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

MapViz.prototype.paintCircles = function (aveCrimeFactor,maxCrimeFactor,cityData,topCount, bottomCount){
    var that = this;

    var colorScale = d3.scale.linear().domain
    ([aveCrimeFactor, maxCrimeFactor]).range(["#8b0000", "#FFF0F0"])

    this.svg.selectAll("circle").remove();
    this.svg.selectAll("circle")
        .data(cityData)
        .enter()
        .append("circle")
        .attr("cityName", function(d){return d.cityName})
        .attr("zipCodeId", function(d){return d.zipCodeId})
        .attr("rank", function(d){return d.rank})
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

            var r;
            try {
                if (d.rank <=topCount || d.rank>= that.totalZips-bottomCount ){
                    if (d.crimeFactor < aveCrimeFactor){
                        r =  2+ 5*((aveCrimeFactor- d.crimeFactor)/aveCrimeFactor)
                        if(isNaN(r)){

                            r=10;
                        }
                    }
                    else{

                        r = 2+ 5*(d.crimeFactor/( maxCrimeFactor-aveCrimeFactor))
                    }
                }
                else{
                    r=0;
                }

            }
            catch (e){
                r=10;
            }
            return r;

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
        .on('mouseover',showDetails)
        .on('click',showDetails);


    this.txt = this.svg.append("text")
        .style("visibility", "hidden")
        .attr("class","schoolLabel")
    that.txtBox = that.svg.insert('rect', 'text');

    function formatData(data){
        return Math.round(data/100);
    }

    function showDetails(){
        if (that.hideDetailTimer){
            clearTimeout(that.hideDetailTimer)
        }

        var circle = d3.select(this);
        var caption = "";

        var zipCodeId = circle.attr("zipCodeId");
        var zipData = zips[parseInt(zipCodeId)-1];

        if (zipData) {

            caption = "<p class='univCity'>" + zipData.zip.city + "," + zipData.zip.state + "-" +
                        zipData.zip.zip + "</p>"

            zipData.zip.schools.forEach(function(d){
                caption += "<p class='univName'>" + d.name + "</p>";

                caption += "Murders:" + formatData(d.avgMurderCount)+ "<br>"
                caption += "Negligent Manslaughter:" + formatData(d.avgNegligentManlaughter)+ "<br>"
                caption += "Forcible Sex Assault:" + formatData(d.avgForcibleSexOffense)+ "<br>"
                caption += "Non Forcible Sex Assault:" + formatData(d.avgNonForcibleSexOffense)+ "<br>"
                caption += "Robbery:" + formatData(d.avgRobbery)+ "<br>"
                caption += "Aggravated Assault:" + formatData(d.avgAggravatedAssault)+ "<br>"
                caption += "Burglary:" + formatData(d.avgBurglary)+ "<br>"
                caption += "Vehicle Theft:" + formatData(d.avgVehicleTheft)+ "<br>"
                caption += "Arson:" + formatData(d.avgArson)+ "<br>"
                caption += "Weapons Offense:" + formatData(d.avgWeaponOffence)+ "<br>"
                caption += "Drug Violations:" + formatData(d.avgDrugViolations)+ "<br>"
                caption += "Liquor Violations:" + formatData(d.avgLiquorViolations)+ "<br>"


            })
        }
        else{
            caption = "zip code data for " + zipCodeId +" not found";
        }


        $("#floatingDiv").width(that.svg.attr("width"))
        $("#floatingDiv").height(that.svg.attr("height"))
        $("#floatingDiv").css("top",$(that.svg[0][0]).offset().top)
        $("#floatingDiv").css("left",$(that.svg[0][0]).offset().left)

        var dataHeight = parseFloat(that.svg.attr("height"))/2;
        var dataWidth = parseFloat(that.svg.attr("width"))/2;

        $("#univDataDiv").css("top",$(that.svg[0][0]).offset().top + dataHeight/2)
        $("#univDataDiv").css("left",$(that.svg[0][0]).offset().left + dataWidth/2)

        $("#univDataDiv").width(dataWidth)
        $("#univDataDiv").height(dataHeight)
        $("#univDataDivText").height(dataHeight-10)
        $("#univDataDivText").html(caption);

        $("#floatingDiv").show()
        $("#univDataDiv").show()

        that.hideDetailTimer = setTimeout(that.hideDetails,10*that.hideCaptionWaitPeriod);
    }


    function showCityData(){
        if(that.hideCaptionTimer){
          clearTimeout(that.hideCaptionTimer);
        }
        var circle = d3.select(this);
        var caption = "(" +circle.attr("rank")+ " / " + that.totalZips +") "
            +circle.attr("cityName")

        var zipCodeId = circle.attr("zipCodeId");
        var zipData = zips[parseInt(zipCodeId)-1];

        if (zipData) {
            if(zipData.zip.schools.length>1){
                caption += " (" +zipData.zip.schools.length + " schools)"
            }
        }


        that.txt.style("visibility", "visible")
            .text(caption)
            .attr("x", circle.attr("cx")+ 10)
            .attr("y", circle.attr("cy") - 10)
            .attr('class','schoolLabel');

        var padding=5;
        var ctm = that.txt[0][0].getCTM();
        var bbox= that.txt[0][0].getBBox()
        that.txtBox
            .attr('x', bbox.x-padding).attr('y', bbox.y-padding).attr('width', bbox.width+2*padding)
            .attr('height', bbox.height+2*padding)

        var deltaX =  parseFloat(that.svg.attr('width')) - (bbox.x +bbox.width);
        if(deltaX <0){
            that.txtBox.attr('x',parseFloat(that.txtBox.attr('x')) +deltaX);
            that.txt.attr('x',parseFloat(that.txt.attr('x')) +deltaX);
        }
        that.txtBox.style("visibility", "visible")

        that.hideCaptionTimer = setTimeout(hideCaption, that.hideCaptionWaitPeriod);

    }

    function hideCaption(){
        that.txt.style("visibility", "hidden")
        that.txtBox.style("visibility", "hidden")

        that.hideCaptionTimer = null;
    }
}

MapViz.prototype.hideDetails = function(){
    $("#floatingDiv").hide()
    $("#univDataDiv").hide()
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
            d["rank"]=i+1;
        })

        minCrimeFactor = crimeFactors.minCrimeFactor;
        maxCrimeFactor = crimeFactors.maxCrimeFactor;

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
            .attr("id",function(d,i){return d.id })
            .style("fill",that.stateFillColor) // function(d, i) {return colors(i)})
            .style("stroke", "grey")
            .attr("d", that.path)
            //.on("click",stateClicked)
            .on("mouseover",stateIn)
            .on("mouseout",stateOut)


        //Murder	NegM	Forcib	NonForcib	Robbe	AggA	Burgla	Vehic	Arson

        that.paintCircles(aveCrimeFactor,maxCrimeFactor,that.zipCodeData,weights.topCount,weights.bottomCount);

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


    function stateClicked(){
        var stateId = d3.select(this).attr("id")


        for (var i=0; i<that.stateOffsets.length; i++){
            if (that.stateOffsets[i].stateId ==stateId ){
                that.scale = that.stateOffsets[i].scale;
                that.xOffset = that.stateOffsets[i].xOffset;
                that.yOffset = that.stateOffsets[i].yOffset;
                that.moveMap(that.scale,false);
                break;
            }
        }
    }

    function stateIn(){
        d3.select(this).style("fill","khaki");
        weightsContainerViz.hideWeightsContainer();
    }

    function stateOut(){
        var ctrl = d3.select(this);
        var i=ctrl.attr("i");
        d3.select(this).style("fill",that.stateFillColor);
    }

}


