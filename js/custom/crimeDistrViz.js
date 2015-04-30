/**
 * Created by suhas on 4/28/2015.
 */
CrimeDistrViz = function(_crimeData){
    this.crimeData = _crimeData;
    this.svg = null;
    this.padding=5;
    this.width=325;
    this.height=200;

    this.svg = d3.select("#distVizDiv")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)



    this.svg.append("rect")
        .attr("width", '100%')
        .attr("height", '100%')
        .style("stroke", '#000')
        .style("fill", '#fff')

    this.lineWidth = this.width - 2*this.padding;

    //var verticalPosition = lineWidth *  this.crimeData.containerForMapVis.averageCrimeFactor /
        //this.crimeData.containerForMapVis.maxCrimeFactor

    this.init();
    this.wrangleData(this.crimeData)
}

CrimeDistrViz.prototype.init = function(){

}
CrimeDistrViz.prototype.wrangleData = function(_crimeData){
    this.crimeData = _crimeData;
    var that=this;

    this.svg.selectAll("line").remove();

    this.svg.append("line")
        .attr("x1", this.padding)
        .attr("x2", this.padding + this.lineWidth)
        .attr("y1", this.height-this.padding)
        .attr("y2", this.height-this.padding)
        .style("stroke", '#000')

    /*this.svg.append("line")
        .attr("x1", this.padding + verticalPosition)
        .attr("x2", this.padding + verticalPosition)
        .attr("y1", this.padding)
        .attr("y2", this.height-this.padding)
        .style("stroke", '#000')*/


    var x1, y1;



    var buckets =[];
    var crimeFactor = 0;
    var bucketWidth = 500;
    var xPosition = this.padding;
    var xSpacing =  (this.lineWidth * bucketWidth) / this.crimeData.containerForMapVis.maxCrimeFactor
    for(; crimeFactor <= this.crimeData.containerForMapVis.maxCrimeFactor; crimeFactor+= bucketWidth){
        buckets.push({
            from:crimeFactor,
            to:crimeFactor+bucketWidth-1,
            count:0,
            x:xPosition
        })

        xPosition += xSpacing;
    }

    var maxCount = 1;
    this.crimeData.schools.forEach(function(d){

        for (var i=0; i<buckets.length;i++){
            //console.log(d.school.crimeFactorForMapViz);
            if(d.school.crimeFactorForMapVis >= buckets[i].from && d.school.crimeFactorForMapVis <= buckets[i].to){
                buckets[i].count++;

                if(buckets[i].count>maxCount){
                    maxCount = buckets[i].count;
                }

                break;
            }
        }


    });

    var ySpacing = (this.height-4*(this.padding)) / maxCount;

    x1=buckets[0].x;
    y1= that.height - (3*that.padding) - (buckets[0].count * ySpacing);

    var x2, y2;

    for (var i=1; i<buckets.length; i++){
        if(buckets[i].count ==0){
            continue;
        }
        x2 = buckets[i].x;
        y2= that.height - (that.padding) -  (buckets[i].count * ySpacing);
        this.svg.append("line")
            .attr("x1",x1)
            .attr("y1",y1)
            .attr("x2",x2)
            .attr("y2",y2)
            .style("stroke", "blue")
            .style("stroke-width", "6")
        x1 = x2;
        y1 = y2;
    }

}