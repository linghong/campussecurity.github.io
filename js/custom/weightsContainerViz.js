/**
 * Created by suhas on 4/18/2015.
 * for the interactive box that is used for changing crime weights
 */

WeightContainerViz = function(_theDiv,_eventHandler){
    this.eventHandler = _eventHandler;
    var that = this;
    var width=200;
    var labelWidth=120;
    var checkedImageWidth = 15;
    var imageWidth=5;
    var imagePadding=2;
    var height=220;
    var imageSpacing = 4;
    var barSpacing = 4;
    this.MAX = 5;
    this.txt = null;
    this.txtBox = null;


    this.colorScale = d3.scale.linear().domain([0,this.MAX]).range(["lightgreen","orange"]);
    var initialWeights = [4,3,2,.5,.5,.2,1,.2,.1,.1,.1]
    var labels = ['Murder','Negl. Manslaughter', 'Forcible Sex Offense', 'Robbery', 'Burglary',
        'Vehicle Theft', 'Aggravated Assault', 'Arson', 'Weapons Offense', 'Drug Offense', 'Liquor Offense']

    this.weights = [];

    var refreshWaitPeriod = 200;
    var timer = null;
    var timerCaption = null;
    for (var  i=0; i<11; i++){
        this.weights.push({
            weight:initialWeights[i],
            checked:true,
            label:labels[i]
        })
    }

    this.xScale = width/this.MAX;

    var tot = this.weights.length;

    var barHeight = height / tot;

    this.svg = d3.select("#"+_theDiv).append("svg").attr('width', checkedImageWidth+ width +labelWidth +2*imagePadding +imageWidth)
        .attr('height',height)

    this.svg.append("rect")
        .attr('width','100%')
        .attr('height','100%')
        .attr('fill','white')
    var y = 0;
    var bars = [];
    for(var i=0; i<tot;i++){
        var rect = that.svg.append("rect")
            .attr("width",this.xScale* this.weights[i].weight)
            .attr("x",labelWidth+ 4*imagePadding+imageWidth + checkedImageWidth)
            .attr("y",y + barSpacing)
            .attr("idx",i)
            .attr("height", barHeight - barSpacing)
            .style("fill", this.colorScale(this.weights[i].weight))
            .on("mouseover", showImportance)

        this.weights[i]["bar"] = rect;
        bars.push(rect);

        that.svg.append('text')
            .attr('x',labelWidth-5)
            .attr('y',y+barHeight-3)
            .text(labels[i])
            .attr('text-anchor','end')
            .attr('font-size','12px')
            .attr('class','noSelect')

        that.svg.append('image')
            .attr("width",checkedImageWidth)
            .attr("height",checkedImageWidth)
            .attr("idx",i)
            .attr("checked","1")
            .attr('x',labelWidth+ 5*imagePadding )
            .attr('y',y +(barHeight-checkedImageWidth))
            .attr("xlink:href", "images/checked.png")
            .style("cursor", "pointer")
            .on("mouseup", toggle)

        y += barHeight;
    }


    y=0;
    for(var i=0; i<tot;i++){
        that.svg.append("image")
            .attr("width",imageWidth)
            .attr("idx",i)
            .attr("x",labelWidth+imagePadding)
            .attr("y",y + imageSpacing)
            .attr("height", imageWidth)
            .style("cursor", "pointer")
            .attr("xlink:href", "images/plus.png")
            .on("mouseup", add)

        that.svg.append("image")
            .attr("idx",i)
            .attr("width",imageWidth)
            .attr("x",labelWidth+imagePadding)
            .attr("y",y + barHeight -2*imageSpacing)
            .attr("height", imageWidth)
            .attr("idx",i)
            .style("cursor", "pointer")
            .attr("xlink:href", "images/minus.png")
            .on('mouseup', subtract)

        y+=barHeight;
    }

    this.txt = this.svg.append("text")
        .style("visibility", "hidden")

    that.txtBox = that.svg.insert('rect', 'text');

    function toggle(){
        var button = d3.select(this);
        var checked = button.attr("checked");
        var idx = button.attr("idx");

        if(checked == 1){
            button.attr("checked",0);
            button.attr("xlink:href","/images/unchecked.png")
            that.weights[idx].checked = false;
            that.weights[idx].bar.style("opacity",.1);
        }
        else{
            button.attr("checked",1);
            button.attr("xlink:href","/images/checked.png")
            that.weights[idx].checked = true;
            that.weights[idx].bar.style("opacity",1);
        }
        showImportance(idx);
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(triggerEvent, refreshWaitPeriod);
    }



    function add(){
        var button = d3.select(this);
        var idx = button.attr('idx')

        var w = bars[idx].attr('width')
        if(w == width){
            return;
        }

        var wt = that.weights[idx];
        wt.weight += 5/that.xScale;
        paintRectangle(wt)
        bars[idx].attr('width', parseInt(w)+5);
        showImportance(idx);
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(triggerEvent, refreshWaitPeriod);
    }

    function subtract(){
        var button = d3.select(this);
        var idx = button.attr('idx')
        var w = bars[idx].attr('width')
        if(w==0){
            return;
        }

        var wt = that.weights[idx];
        wt.weight -= 5/that.xScale;
        paintRectangle(wt)
        bars[idx].attr('width', parseInt(w)-5);
        showImportance(idx);
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(triggerEvent, refreshWaitPeriod);

    }

    function paintRectangle(bucket){
        bucket.bar.style('fill', that.colorScale(bucket.weight))
    }

    function triggerEvent(){
        timer = null;
        $(that.eventHandler).trigger("changed");
    }

    function showImportance(idx){
        if(timerCaption){
            clearTimeout(timerCaption);
        }

        if (!idx){
            idx = d3.select(this).attr("idx")
        }

        var rectangle = that.weights[idx].bar;

        var wt = that.weights[idx].weight;

        var caption = "";

        if(!that.weights[idx].checked){
            caption = "not considering for now"
        }
        else if(wt < 5/6) {
            caption = "not important at all";
        }
        else if(wt < 10/6){
            caption = "not very important";
        }
        else if(wt < 15/6){
            caption = "somewhat important";
        }
        else if(wt < 20/6){
            caption = "moderately important";
        }
        else if(wt < 25/6){
            caption = "highly important";
        }
        else{
            caption = "absolutely important";
        }

        that.txt.style("visibility", "visible")
            .text(caption)
            .attr("x", parseFloat(rectangle.attr("x")) + parseFloat(rectangle.attr("width")) + 10)
            .attr("y", parseFloat(rectangle.attr("y"))+20)
            .attr('class','schoolLabel');

        var padding=5;
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

        if(timerCaption) {
            clearTimeout(timerCaption)
        }
        timerCaption = setTimeout(hideCaption,3500)
    }

    function hideCaption(){
        timerCaption = null;
        that.txt.style("visibility", "hidden")
        that.txtBox.style("visibility", "hidden")

        that.hideCaptionTimer = null;
    }
}

WeightContainerViz.prototype.getWeights = function(crimeKey){



    if(crimeKey != null){
        var allCategory = crimeKey=="";
        var weapon = crimeKey=="weaponOffence";
        var drug = crimeKey=="drugViolations";
        var liquor = crimeKey=="liquorViolations";
        var murd = crimeKey=="murderCount";
        var forcib = crimeKey=="forcibleSexOffense";
        var robbe = crimeKey=="robbery";
        var agg = crimeKey=="aggravatedAssault";
        var burgla = crimeKey=="burglary";
        var vehic = crimeKey=="vehicleTheft";
        var arson = crimeKey=="arson";

        if (!allCategory){
            this.weights[0].checked = murd;
            this.weights[1].checked = false;
            this.weights[2].checked = forcib;
            this.weights[3].checked = robbe;
            this.weights[4].checked = burgla;
            this.weights[5].checked = vehic;
            this.weights[6].checked = agg;
            this.weights[7].checked = arson;
            this.weights[8].checked = weapon;
            this.weights[9].checked = drug;
            this.weights[10].checked = liquor;
        }
        else{
            this.weights[0].checked = true;
            this.weights[1].checked = true;
            this.weights[2].checked = true;
            this.weights[3].checked = true;
            this.weights[4].checked = true;
            this.weights[5].checked = true;
            this.weights[6].checked = true;
            this.weights[7].checked = true;
            this.weights[8].checked = true;
            this.weights[9].checked = true;
            this.weights[10].checked = true;
        }

        this.processSection(0)
        this.processSection(1)
        this.processSection(2)
        this.processSection(3)
        this.processSection(4)
        this.processSection(5)
        this.processSection(6)
        this.processSection(7)
        this.processSection(8)
        this.processSection(9)
        this.processSection(10)
    }

    return {
        murdFactor: (this.weights[0].checked) ? Math.pow(10,this.weights[0].weight) : 0,
        negligenceFactor: (this.weights[1].checked) ?Math.pow(10,this.weights[1].weight) : 0,
        forcibleCrimeFactor: (this.weights[2].checked) ?Math.pow(10,this.weights[2].weight) : 0,
        robberyCrimeFactor: (this.weights[3].checked) ?Math.pow(10,this.weights[3].weight) : 0,
        burglaryCrimeFactor: (this.weights[4].checked) ?Math.pow(10,this.weights[4].weight) : 0,
        vehicleCrimeFactor: (this.weights[5].checked) ?Math.pow(10,this.weights[5].weight) : 0,
        aggravatedAssaultFactor: (this.weights[6].checked) ?Math.pow(10,this.weights[6].weight) : 0,
        arsonFactor: (this.weights[7].checked) ?Math.pow(10,this.weights[7].weight) : 0,
        weaponFactor: (this.weights[8].checked) ?Math.pow(10,this.weights[8].weight) : 0,
        drugFactor: (this.weights[9].checked) ?Math.pow(10,this.weights[9].weight) : 0,
        liquorFactor: (this.weights[10].checked) ?Math.pow(10,this.weights[10].weight) : 0,
        sectId1:$('#sectId1').is(':checked'),
        sectId2:$('#sectId2').is(':checked'),
        sectId3:$('#sectId3').is(':checked'),
        sectId4:$('#sectId4').is(':checked'),
        sectId5:$('#sectId5').is(':checked'),
        sectId6:$('#sectId6').is(':checked'),
        sectId7:$('#sectId7').is(':checked'),
        sectId8:$('#sectId8').is(':checked'),
        sectId9:$('#sectId9').is(':checked'),
        hideSafeSchools:$('#cbxHideSafeSchools').is(':checked')
    }


}
WeightContainerViz.prototype.processSection = function (idx){
    var button = this.svg.select('image[idx="'+idx+'"]');
    var that=this;

    if(!this.weights[idx].checked){
        button.attr("checked",0);
        button.attr("xlink:href","/images/unchecked.png")
        that.weights[idx].checked = false;
        that.weights[idx].bar.style("opacity",.1);
    }
    else{
        button.attr("checked",1);
        button.attr("xlink:href","/images/checked.png")
        that.weights[idx].checked = true;
        that.weights[idx].bar.style("opacity",1);
    }

}