
MapViz = function(_statesData,_countryStatistics,_weightControl, _eventHandler) {
    this.eventHandler = _eventHandler;
    this.txt = null;
    this.grp = null;
    this.txtBox = null;
    this.oldPath = null;
    this.zoomed = false;
    this.stateFillColor = "#f2f2f2";
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
    this.zoomTimer = null;
    this.moveTimer = null;
    this.showDetailTimer=null;
    this.timerWaitPeriod = 100;
    this.weightControl = _weightControl;

    this.hideCaptionTimer = null;
    this.hideDetailTimer = null;
    this.hideCaptionWaitPeriod = 2500;

    this.stateScale = 1;

    this.countryStatistics = _countryStatistics;
    this.statesData = _statesData;
    this.circlesBySector = {};
    this.init();
    this.loadData();
};

MapViz.prototype.init = function(){
    this.hideDetails();
    var that = this;
    this.projection = d3.geo.albersUsa()
        .translate([this.width/2, this.height/2]).scale([this.scaleFactor*this.width]);
    this.path = d3.geo.path().projection(this.projection);
    this.svg = d3.select("#map")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.drag = d3.behavior.drag().on("drag", dragMove);
    this.svg.call(this.drag);

    $( window ).resize(function() {
        that.svg.call(this.resize());
    });

    var that=this;

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

MapViz.prototype.wrangleSectorIn = function (sectorCd) {
    var that = this;

    that.circlesBySector[sectorCd].forEach(function(d){
        var ctrl = d3.select(d);
        ctrl.attr('origOpacity',ctrl.attr('opacity'));
        ctrl.style('stroke', 'black')
        ctrl.style('stroke-width', function(d,i){
            if(that.zoomed){
                return '.5px';
            }
            else{
                return '2px';
            }
        })
        ctrl.style('opacity', '1')
    })
}

MapViz.prototype.wrangleSectorOut = function (sectorCd) {
    var that = this;

    that.circlesBySector[sectorCd].forEach(function(d){
        var ctrl = d3.select(d);
        ctrl.style('stroke', '')
        ctrl.style('stroke-width', '0px')
        ctrl.style('opacity', ctrl.attr('origOpacity'))
    })
}



MapViz.prototype.wrangleStateIn = function (stateCd) {
    var that = this;
    if(that.oldPath && that.oldPath.attr('id') == stateCd){
        return;
    }
    var path = that.svg.select("path[id="+stateCd+"]");


    var box = path.node().getBBox();
    var midpointX = box.x + box.width/2;
    var midpointY = box.y + box.height/2;

    var xScale = that.width / box.width;
    var yScale = that.height / box.height;

    that.stateScale = d3.min([xScale,yScale])

    //Reference:http://stackoverflow.com/questions/12062561/calculate-svg-path-centroid-with-d3-js
    that.zoomed = true;
    that.grp.transition()
        .duration(1000)
        .attr("transform",
        "translate(" + that.width / 2 + ","
        + that.height / 2
        + ")scale("+that.stateScale+")translate("
        + (-midpointX) + ","
        + (-midpointY) + ")");

    that.svg.selectAll('circle')
        .attr("r", function(d,i){
            return d3.select(this).attr("originalR") /(that.stateScale/2);
        });

    path.style("fill","khaki");

    that.svg.selectAll('path')
        .style('stroke-width',(2/(that.stateScale)/2)+'px')

    if(that.oldPath){
        that.oldPath.style('fill',that.stateFillColor)
    }
    that.oldPath = path;

}

MapViz.prototype.wrangleStateOut = function (stateCd) {
    var that = this;
    that.paths.forEach(function(d,i){

    })
}

MapViz.prototype.wrangleData = function (year) {
    this.svg.selectAll("text").remove();
    this.svg.selectAll("rect").remove();

    var weights = this.weightControl.getWeights();
    var crimeData = crimeAnalyzer.processWeights(weights,year)
    this.paintCircles(crimeData,year, weights.hideSafeSchools)
}


MapViz.prototype.getAveCrimeFactor = function (univAggrData,weights){

    return weights.murdFactor * univAggrData.avgAggMurderCount +
        weights.negligenceFactor * univAggrData.avgAggNegligentManSlaughter +
        weights.forcibleCrimeFactor * univAggrData.avgAggForcibleSexOffense +
        weights.robberyCrimeFactor * univAggrData.avgAggRobbery +
        weights.burglaryCrimeFactor * univAggrData.avgAggBurglary +
        weights.vehicleCrimeFactor * univAggrData.avgAggVehicleTheft;
};

MapViz.prototype.paintCircles = function (crimeData,year,hideSafeSchools){
    var that = this;
    var topCount=1000, bottomCount=1000

    var maxRank = crimeData.containerForMapVis.maxRank;
    var aveCrimeFactor = crimeData.containerForMapVis.averageCrimeFactor;
    var maxCrimeFactor = crimeData.containerForMapVis.maxCrimeFactor;

    this.circlesBySector = {};

    this.grp.selectAll("circle").remove();
    this.grp.selectAll("circle")
        .data(crimeData)
        .enter()
        .append("circle")
        .attr('class', 'schoolCircle')
        .style('cursor','pointer')
        //.style('stroke', 'black')
        //.style('stroke-width', '1px')
        .attr("caption", function(d){

            var caption = "(" + d.rank + " / " + maxRank +") "
            + d.name;
            return caption;
        })
        .attr("longCaption", function(d){

            var school = d;

            caption = "<p class='univCity'>" + school.name + "</p>"
            caption += "<div class='univCity'>" + school.address +", " + school.state + "-" +school.zip +"</div>"

            var container = getYearData(that.year,school);

            if(container) {
                pushToSector(school.sectorCd,this);
                caption += "<span class='captionLabel'>Crime Ranking:</span><span class='captionValueHighlight'>"
                + school.rank + " / " + maxRank + "</span><br>"
                caption += "<span class='captionLabel'>Murders:</span>" +
                "<span class='captionValue'>" + formatData(container.murderCount) + "</span>"
                caption += "<span class='captionLabel'>Negligent Manslaughter:</span>" +
                "<span class='captionValue'>" + formatData(container.negligentManSlaughter) + "</span><br>"
                caption += "<span class='captionLabel'>Forcible Sex Assault:</span>" +
                "<span class='captionValue'>" + formatData(container.forcibleSexOffense) + "</span>"
                caption += "<span class='captionLabel'>Non Forcible Sex Assault:</span>" +
                "<span class='captionValue'>" + formatData(container.nonForcibleSexOffense) + "</span><br>"
                caption += "<span class='captionLabel'>Robbery:</span>" +
                "<span class='captionValue'>" + formatData(container.robbery) + "</span>"
                caption += "<span class='captionLabel'>Aggravated Assault:</span>" +
                "<span class='captionValue'>" + formatData(container.aggravatedAssault) + "</span><br>"
                caption += "<span class='captionLabel'>Burglary:</span>" +
                "<span class='captionValue'>" + formatData(container.burglary) + "</span>"
                caption += "<span class='captionLabel'>Vehicle Theft:</span>" +
                "<span class='captionValue'>" + formatData(container.vehicleTheft) + "</span><br>"
                caption += "<span class='captionLabel'>Arson:</span>" +
                "<span class='captionValue'>" + formatData(container.arson) + "</span>"
                caption += "<span class='captionLabel'>Weapons Offense:</span>" +
                "<span class='captionValue'>" + formatData(container.weaponOffence) + "</span><br>"
                caption += "<span class='captionLabel'>Drug Violations:</span>" +
                "<span class='captionValue'>" + formatData(container.drugViolations) + "</span>"
                caption += "<span class='captionLabel'>Liquor Violations:</span>" +
                "<span class='captionValue'>" + formatData(container.liquorViolations) + "</span>"
            }
            return caption;

        })
        .attr("cx", function(d) {
            var proj = that.projection([d.longitude, d.latitude]);
            if(!proj){
                console.log("Invalid lat /long",d);
                return null;
            }
            else {
                return proj[0];
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
                if (d.rank <=topCount || d.rank>= crimeData.containerForMapVis.maxRank -bottomCount ){

                    if (d.crimeFactorForMapVis  < aveCrimeFactor){
                       if(hideSafeSchools){
                           r =0;
                       }
                       else{
                           r =  1+ ((aveCrimeFactor- d.crimeFactorForMapVis)/aveCrimeFactor)
                       }
                    }
                    else{

                        r = 2+ 6*(d.crimeFactorForMapVis/( maxCrimeFactor-aveCrimeFactor))
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
        .attr("originalR", function(d){
            return d3.select(this).attr("r");
        })
        .attr("r", function(d){
            if(that.zoomed) {
                return d3.select(this).attr("originalR") / (that.stateScale/2);
            }
            else {
                return d3.select(this).attr("r")
            }
        })
        .style("fill", function(d,i){

            if (d.crimeFactorForMapVis > aveCrimeFactor){
                return "brown";// colorScale(d.crimeFactor)
            }
            else {
                return "green"
            }


        })
        .style("opacity", function(d){
            if (d.crimeFactorForMapVis > aveCrimeFactor){
                return .6
            }
            else {
                return .5
            }
        })
        .on('mouseover',showCityData)
        .on('mouseout',outFromZipCode)


    this.txt = this.svg.append("text")
        .style("visibility", "hidden")
        .attr("class","schoolLabel")
    that.txtBox = that.svg.insert('rect', 'text');

    function pushToSector(sectorCd,circle){
        var sectorContainer = that.circlesBySector[sectorCd];
        if(!sectorContainer){
            sectorContainer = []
            that.circlesBySector[sectorCd] = sectorContainer;
        }
        sectorContainer.push(circle);
    }

    function getYearData(year, school){
        if (year) {
            if (school.yearData) {
                school.yearData.forEach(function (d) {
                    if (d.yearOfData == year) {
                        return d;
                    }
                })
            }

            return null;
        }
        else {
            return school.allTimeCrimeData
        }
    }

    function formatData(data){
        return Math.round(data);
    }

    function outFromZipCode(){
        if(that.showDetailTimer){
            clearTimeout(that.showDetailTimer);
        }
    }
    function showDetails(circle){
        that.showDetailTimer = null;
        if (that.hideDetailTimer){
            clearTimeout(that.hideDetailTimer)
        }


        var caption = circle.attr("longCaption");

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

        var caption = circle.attr("caption");


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

        that.hideCaptionTimer = setTimeout(hideCaption, 1100);

        that.showDetailTimer = setTimeout(function(){showDetails(circle)}, 1000)

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

    var weights = that.weightControl.getWeights();
    that.universityAggregateData = that.countryStatistics[0];

    var aveCrimeFactor= that.getAveCrimeFactor(that.universityAggregateData,weights)
    var minCrimeFactor = null, maxCrimeFactor = null;
    var crimeData = crimeAnalyzer.processWeights(weights);

    var selectedData = []
    that.statesData.features.forEach(function(d){
        selectedData.push(d);
    })

    that.grp = that.svg.append("g");

    //Bind data and create one path per GeoJSON feature
    that.paths = that.grp.selectAll("path")
        .data(selectedData)
        .enter()
        .append("path")
        .attr("i",function(d,i){
            return i
        })
        .attr("id",function(d,i){return d.id })
        .on('click', stateClicked)
        .style("fill",that.stateFillColor)
        .style("stroke", "grey")
        .attr("d", that.path)
        .on("mouseover",stateIn)
        .on("mouseout",stateOut)




    that.paintCircles(crimeData,"",weights.hideSafeSchools);

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



    function stateClicked(itm){


        var midpoint = that.path.centroid(itm);
        var midpointX, midpointY;
        if(that.zoomed) {
            that.zoomed = false;
            that.stateScale = 1;
            midpointX = that.width /2;
            midpointY = that.height /2;
            if(that.oldPath){
                that.oldPath.style('fill',that.stateFillColor)
            }
            that.oldPath = null;
        }
        else {
            that.zoomed = true;
            midpointX = midpoint[0];
            midpointY = midpoint[1];
            that.stateScale = 5;
        }

        that.grp.transition()
            .duration(1000)
            .attr("transform",
            "translate(" + that.width / 2 + ","
            + that.height / 2
            + ")scale("+that.stateScale+")translate("
            + (-midpointX) + ","
            + (-midpointY) + ")");


        if(that.stateScale==1){
            that.svg.selectAll('circle')
                .transition()
                .duration(1000)
                .attr("r", function(d,i){
                    return d3.select(this).attr("originalR");
                });

            that.svg.selectAll('path')
                .transition()
                .duration(1000)
                .style('stroke-width',null);

        }
        else {
            that.svg.selectAll('circle')
                .transition()
                .duration(1000)
                .attr("r", function(d,i){
                    return d3.select(this).attr("originalR") /(that.stateScale/2);
                });

            that.svg.selectAll('path')
                .transition()
                .duration(1000)
                .style('stroke-width',(2/(that.stateScale)/2)+'px')

        }
    }

    function stateIn(){
        d3.select(this).style("fill","khaki");
    }

    function stateOut(){
        var ctrl = d3.select(this);
        var i=ctrl.attr("i");
        d3.select(this).style("fill",that.stateFillColor);
    }
}

 MapViz.prototype.resize  = function (){
        // get the width of a D3 element
        this.width = $("#map").width();
        this.height = this.width * this.mapRatio;
        this.scale = this.scaleFactor * this.width;
        this.svg.attr("width", this.width)
            .attr("height", this.height);
        this.moveMap();
    }
