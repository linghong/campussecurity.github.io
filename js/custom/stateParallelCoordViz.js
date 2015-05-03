/**
 * Created by suhas on 5/1/2015.
 */
StateParallelCoordinateViz = function(_theDiv,_eventHandler){

    this.width = 366;
    this.eventHandler = _eventHandler;
    this.height = 160;
    this.svg = d3.select("#"+_theDiv).append("svg")
        .attr('width', this.width)
        .attr('height',this.height)
    this.SPACING = 35;
    this.svg.append("rect")
        .attr('width','100%')
        .attr('height','100%')
        .attr('fill','white')

    this.captionTextBoxData = [];
    this.captionTextBoxes = [];
    this.triggerTimer =null;

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

    this.txt = null;
    this.txtBox = null;
    this.labels= [
        'AK',
        'AL',
        'AR',
        'AS',
        'AZ',
        'CA',
        'CO',
        'CT',
        'DC',
        'DE',
        'FL',
        'GA',
        'HI',
        'IA',
        'ID',
        'IL',
        'IN',
        'KS',
        'KY',
        'LA',
        'MA',
        'MD',
        'ME',
        'MI',
        'MN',
        'MO',
        'MS',
        'MT',
        'NC',
        'ND',
        'NE',
        'NH',
        'NJ',
        'NM',
        'NV',
        'NY',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VA',
        'VI',
        'VT',
        'WA',
        'WI',
        'WV',
        'WY'
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

StateParallelCoordinateViz.prototype.init = function () {

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
    for(var i=0; i< that.labels.length; i++){

        var points = "";
        j=0

        that.captionTextBoxData.push([]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.arsons[i]),
            value:that.arsons[i]
        })
        points += that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.arsons[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.aggravatedAssaults[i]),
            value:that.aggravatedAssaults[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.aggravatedAssaults[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.arsons[i]),
            value:that.arsons[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.arsons[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.arsons[i]),
            value:that.arsons[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.arsons[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.forcibleSexOffenses[i]),
            value:that.forcibleSexOffenses[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.forcibleSexOffenses[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.liquorViolations[i]),
            value:that.liquorViolations[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.liquorViolations[i]);


        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.murderCounts[i]),
            value:that.murderCounts[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.murderCounts[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.negligentManSlaughters[i]),
            value:that.negligentManSlaughters[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.negligentManSlaughters[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.robberies[i]),
            value:that.robberies[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.robberies[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.vehicleThefts[i]),
            value:that.vehicleThefts[i]
        })
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.vehicleThefts[i]);

        that.captionTextBoxData[i].push({
            x: that.categoryMetaData[j].offset,
            y: that.categoryMetaData[j].scale(that.weaponOffences[i]),
            value:that.weaponOffences[i]
        })
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
        .attr("idx", function(d,i){
            return i;
        })
        .on("mouseover", highlight)
        .on("mouseout", unHighlight)
        .attr("points", basePoint)
        .attr("class", 'polylineState')
        .transition()
        .delay(500)
        .attr("points", function(d){
            return d;
        });


    that.txtBox = that.svg.append('rect');
    that.txt = that.svg.append("text")
        .style("visibility", "hidden")


    function highlight(){

        var myLine = d3.select(this);

        myLine.style("stroke-width",3)
        myLine.style("opacity",1)

        var coord = d3.mouse(this);

        that.triggerTimer = setTimeout(function(){
            $(that.eventHandler).trigger('stateSelected',myLine.attr("type"));
            that.triggerTimer = null;
        },100);


        that.txt.style("visibility", "visible")
            .text(myLine.attr("type"))
            .attr("x",  coord[0] + 10)
            .attr("y",  coord[1] +  10)
            .attr('class','schoolLabel');

        var padding=5;
        var bbox= that.txt[0][0].getBBox()
        that.txtBox
            .attr('x', bbox.x-padding)
            .attr('y', bbox.y-padding)
            .attr('width', bbox.width+2*padding)
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

        var idx = myLine.attr("idx");

        if(that.captionTextBoxes.length ==0){

            for(var i=0; i< that.captionTextBoxData[idx].length; i++){
                that.captionTextBoxes.push(
                    {
                        txtBox: that.svg
                            .append('rect')
                            .attr('class', 'highlightOnly')
                            .style('fill', 'white')
                            .style('stroke', 'black')
                            .style('stroke-width', '1px')
                            .style('text-anchor', 'middle'),

                        txt: that.svg
                            .append("text")
                            .attr('class', 'schoolLabelBlack highlightOnly')
                    }
                );
            }
        }

        padding=1
        for(var i=0; i<that.captionTextBoxData[idx].length; i++){

            that.captionTextBoxes[i].txt.style("visibility", "visible")
                .text(that.captionTextBoxData[idx][i].value)
                .attr("x",  that.captionTextBoxData[idx][i].x + 1)
                .attr("y",  that.captionTextBoxData[idx][i].y + 10);

            bbox= that.captionTextBoxes[i].txt[0][0].getBBox()
            that.captionTextBoxes[i].txtBox
                .attr('x', bbox.x-padding)
                .attr('y', bbox.y-padding)
                .attr('width', bbox.width+2*padding)
                .attr('height', bbox.height+2*padding)

            deltaX =  parseFloat(that.svg.attr('width')) - (bbox.x +bbox.width);
            deltaY =  parseFloat(that.svg.attr('height')) - (bbox.y +bbox.height);

            if(deltaX <0){
                that.captionTextBoxes[i].txtBox.attr('x',parseFloat(that.captionTextBoxes[i].txtBox.attr('x')) +deltaX);
                that.captionTextBoxes[i].txt.attr('x',parseFloat(that.captionTextBoxes[i].txt.attr('x')) +deltaX);
            }

            if(deltaY <0){
                that.captionTextBoxes[i].txtBox.attr('y',parseFloat(that.captionTextBoxes[i].txtBox.attr('y')) +deltaY);
                that.captionTextBoxes[i].txt.attr('y',parseFloat(that.captionTextBoxes[i].txt.attr('y')) +deltaY);
            }

            that.captionTextBoxes[i].txtBox.style("visibility", "visible")


        }
    }

    function unHighlight(){
        d3.select(this).style("stroke-width",null)
        d3.select(this).style("opacity",null)
      that.txtBox.style("visibility", "hidden")
        that.txt.style("visibility", "hidden")

        d3.selectAll('.highlightOnly')
            .style('visibility','hidden')
        if(that.triggerTimer){
            clearTimeout(that.triggerTimer)
            that.triggerTimer = null;
        }
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

StateParallelCoordinateViz.prototype.updateAxis =function(data,i){
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

StateParallelCoordinateViz.prototype.wrangleData =function(year) {
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

    for(i=0; i<this.labels.length; i++){

        var points = "";
        j=0

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.arsons[i])
        that.captionTextBoxData[i][j].value= that.arsons[i]
        points += that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.arsons[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.aggravatedAssaults[i])
        that.captionTextBoxData[i][j].value= that.aggravatedAssaults[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.aggravatedAssaults[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.burglaries[i])
        that.captionTextBoxData[i][j].value= that.burglaries[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.burglaries[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.drugViolations[i])
        that.captionTextBoxData[i][j].value= that.drugViolations[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.drugViolations[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.forcibleSexOffenses[i])
        that.captionTextBoxData[i][j].value= that.forcibleSexOffenses[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.forcibleSexOffenses[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.liquorViolations[i])
        that.captionTextBoxData[i][j].value= that.liquorViolations[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.liquorViolations[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.murderCounts[i])
        that.captionTextBoxData[i][j].value= that.murderCounts[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.murderCounts[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.negligentManSlaughters[i])
        that.captionTextBoxData[i][j].value= that.negligentManSlaughters[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.negligentManSlaughters[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.robberies[i])
        that.captionTextBoxData[i][j].value= that.robberies[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.robberies[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.vehicleThefts[i])
        that.captionTextBoxData[i][j].value= that.vehicleThefts[i]
        points += " " + that.categoryMetaData[j].offset + "," + that.categoryMetaData[j++].scale(that.vehicleThefts[i]);

        that.captionTextBoxData[i][j].y = that.categoryMetaData[j].scale(that.weaponOffences[i])
        that.captionTextBoxData[i][j].value= that.weaponOffences[i]
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

StateParallelCoordinateViz.prototype.resetData = function (yearBucket) {
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

    for(var i=0; i<this.labels.length; i++){
        var sectData = yearBucket["state" + this.labels[i]];

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