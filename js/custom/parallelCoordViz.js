/**
 * Created by suhas on 5/1/2015.
 */
ParallelCoordinateViz = function(_theDiv,_eventHandler){

    this.width = 366;
    this.height = 160;
    this.svg = d3.select("#"+_theDiv).append("svg")
        .attr('width', this.width)
        .attr('height',this.height)
    this.SPACING = 35;
    this.svg.append("rect")
        .attr('width','100%')
        .attr('height','100%')
        .attr('fill','white')

    this.aggravatedAssaults = []
    this.arsons = []
    this.burglaries = []
    this.drugViolations = []
    this.forcibleSexOffenses = []
    this.liquorViolations = []
    this.murderCounts = []
    this.negligentManSlaughters = []
    this.robberies = []
    this.vehicleThefts = []
    this.weaponOffences = []
    this.categoryMetaData = [];
    this.polyLines = [];

    this.txt = null;
    this.txtBox = null;
    this.labels= [
        "Public, 4-year or above",
        "Private nonprofit, 4-year or above",
        "Private for-profit, 4-year or above",
        "Public, 2-year",
        "Private nonprofit, 2-year",
        "Private for-profit, 2-year",
        "Public, less-than 2-year",
        "Private nonprofit, less-than 2-year",
        "Private for-profit, less-than 2-year"
    ];

    this.crimeLabels= [
        "Aggr. Assault",
        "Arson",
        "Burglary",
        "Drug Violations",
        "Forcible Sex Offence",
        "Liquor Violations",
        "Murder",
        "Negl. Manslaughter",
        "Robbery",
        "Vehicle Theft",
        "Weapon Offence"

    ]
    this.init();

}

ParallelCoordinateViz.prototype.init = function () {


    var year = "*";
    var yearBucket = crimeAnalyzer.getCategoryCrimeData()[year];
    var that = this;

    this.resetData(yearBucket);

    var i = 0;

    processAxis(that.categoryMetaData,this.arsons,i++);
    processAxis(that.categoryMetaData,this.aggravatedAssaults,i++);
    processAxis(that.categoryMetaData,this.burglaries,i++);
    processAxis(that.categoryMetaData,this.drugViolations,i++);
    processAxis(that.categoryMetaData,this.forcibleSexOffenses,i++);
    processAxis(that.categoryMetaData,this.liquorViolations,i++);
    processAxis(that.categoryMetaData,this.murderCounts,i++);
    processAxis(that.categoryMetaData,this.negligentManSlaughters,i++);
    processAxis(that.categoryMetaData,this.robberies,i++);
    processAxis(that.categoryMetaData,this.vehicleThefts,i++);
    processAxis(that.categoryMetaData,this.weaponOffences,i++);

    var j=0
    var basePoint = "";
    basePoint += that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);
    basePoint += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(0);

    var pointsArray=[];
    for(var i=0; i<9; i++){

        var points = "";
        j=0

        points += that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.arsons[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.aggravatedAssaults[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.burglaries[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.drugViolations[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.forcibleSexOffenses[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.liquorViolations[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.murderCounts[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.negligentManSlaughters[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.robberies[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.vehicleThefts[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.weaponOffences[i]);
        pointsArray.push(points);
    }

    that.svg.selectAll("polyline")
        .data(pointsArray)
        .enter()
        .append("polyline")
        .attr("type", function(d,i){
            return that.labels[i];
        })
        .on("mouseover", highlight)
        .on("mouseout", unHighlight)
        .attr("points", basePoint)
        .transition()
        .delay(500)
        .attr("points", function(d){
            return d;
        });


    that.txtBox = that.svg.append('rect');
    that.txt = that.svg.append("text")
        .style("visibility", "hidden")


    function highlight(){

        d3.select(this).style("stroke-width",3)
        d3.select(this).style("opacity",1)

        var coord = d3.mouse(this);

        that.txt.style("visibility", "visible")
            .text(d3.select(this).attr("type"))
            .attr("x",  coord[0] + 10)
            .attr("y",  coord[1] +  10)
            .attr('class','schoolLabel');

        var padding=5;
        var bbox= that.txt[0][0].getBBox()
        that.txtBox
            .attr('x', bbox.x-padding).attr('y', bbox.y-padding).attr('width', bbox.width+2*padding)
            .attr('height', bbox.height+2*padding)

        var deltaX =  parseFloat(that.svg.attr('width')) - (bbox.x +bbox.width);
        var deltaY =  parseFloat(that.svg.attr('height')) - (bbox.y +bbox.height);

        if(deltaX <0){
            that.txtBox.attr('x',parseFloat(that.txtBox.attr('x')) +deltaX);
            that.txt.attr('x',parseFloat(that.txt.attr('x')) +deltaX);
        }

        if(deltaY <0){
            that.txtBox.attr('y',parseFloat(that.txtBox.attr('y')) +deltaY);
            that.txt.attr('y',parseFloat(that.txt.attr('y')) +deltaY);
        }

        that.txtBox.style("visibility", "visible")



    }

    function unHighlight(){
        d3.select(this).style("stroke-width",2)
        d3.select(this).style("opacity",.5)
        that.txtBox.style("visibility", "hidden")
        that.txt.style("visibility", "hidden")

    }



    function processAxis(categoryMetaData,data,i){


        var ext = d3.extent(data);
        var range = ext[1]-ext[0];

        ext[0] -= (range)*.1;
        ext[1] += (range)*.1;

        var scale = d3.scale.linear()
            .domain(ext)
            .range([that.height, 0]);

        var offset = 10+ (that.SPACING * i);

        var axis = d3.svg.axis()
            .scale(scale)
            .orient('left')

        var axisGroup = that.svg.append("g")
            .attr("class",'axis')
            .attr("transform",
                    "translate("+ offset + ",0)").call(axis)

        that.svg.append("text")
            .text(that.crimeLabels[i])
            .attr("class", "axiscaption")
            .attr("x", -40)
            .attr("y", offset)
            .attr("transform", "rotate(-90)");


        categoryMetaData.push({scale:scale, offset:offset, axisGroup:axisGroup});


    }


}

ParallelCoordinateViz.prototype.updateAxis =function(data,i){
    var that = this;
    var ext = d3.extent(data);
    var range = ext[1]-ext[0];

    ext[0] -= (range)*.1;
    ext[1] += (range)*.1;

    that.categoryMetaData[i].scale =
        d3.scale.linear()
        .domain(ext)
        .range([that.height, 0]);

    var offset = 10+ (that.SPACING * i);


    var axis = d3.svg.axis()
        .scale(that.categoryMetaData[i].scale)
        .orient('left')

    that.categoryMetaData[i].axisGroup
        .attr("transform",
            "translate("+ offset + ",0)")
        .call(axis)

}

ParallelCoordinateViz.prototype.wrangleData =function(year) {
    var that=this;

    var i=0;
    var yearBucket = crimeAnalyzer.getCategoryCrimeData()[year];
    this.resetData(yearBucket);
    that.updateAxis(this.arsons,i++);
    that.updateAxis(this.aggravatedAssaults,i++);
    that.updateAxis(this.burglaries,i++);
    that.updateAxis(this.drugViolations,i++);
    that.updateAxis(this.forcibleSexOffenses,i++);
    that.updateAxis(this.liquorViolations,i++);
    that.updateAxis(this.murderCounts,i++);
    that.updateAxis(this.negligentManSlaughters,i++);
    that.updateAxis(this.robberies,i++);
    that.updateAxis(this.vehicleThefts,i++);
    that.updateAxis(this.weaponOffences,i++);

    var pointsArray=[];

    for(i=0; i<9; i++){

        var points = "";
        j=0

        points += that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.arsons[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.aggravatedAssaults[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.burglaries[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.drugViolations[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.forcibleSexOffenses[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.liquorViolations[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.murderCounts[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.negligentManSlaughters[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.robberies[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.vehicleThefts[i]);
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.weaponOffences[i]);
        pointsArray.push(points)

    }

    that.svg.selectAll("polyline")
        .data(pointsArray)
        .transition()
        .delay(500)
        .attr("points", function(d){
            return d;
        });




}

ParallelCoordinateViz.prototype.resetData = function (yearBucket) {
    this.aggravatedAssaults = []
    this.arsons = []
    this.burglaries = []
    this.drugViolations = []
    this.forcibleSexOffenses = []
    this.liquorViolations = []
    this.murderCounts = []
    this.negligentManSlaughters = []
    this.robberies = []
    this.vehicleThefts = []
    this.weaponOffences = []

    for(var i=1; i<=9; i++){
        var sectData = yearBucket["sectId" + i];

        if(sectData) {
            this.arsons.push(sectData.crimeCounts.arson);
            this.aggravatedAssaults.push(sectData.crimeCounts.aggravatedAssault);
            this.burglaries.push(sectData.crimeCounts.burglary);
            this.drugViolations.push(sectData.crimeCounts.drugViolations);
            this.forcibleSexOffenses.push(sectData.crimeCounts.forcibleSexOffense);
            this.liquorViolations.push(sectData.crimeCounts.liquorViolations);
            this.murderCounts.push(sectData.crimeCounts.murderCount);
            this.negligentManSlaughters.push(sectData.crimeCounts.negligentManSlaughter);
            this.robberies.push(sectData.crimeCounts.robbery);
            this.vehicleThefts.push(sectData.crimeCounts.vehicleTheft);
            this.weaponOffences.push(sectData.crimeCounts.weaponOffence);
        }
        else{
            this.arsons.push(0);
            this.aggravatedAssaults.push(0);
            this.burglaries.push(0);
            this.drugViolations.push(0);
            this.forcibleSexOffenses.push(0);
            this.liquorViolations.push(0);
            this.murderCounts.push(0);
            this.negligentManSlaughters.push(0);
            this.robberies.push(0);
            this.vehicleThefts.push(0);
            this.weaponOffences.push(0);
        }
    }

}