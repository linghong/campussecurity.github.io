/**
 * Created by suhas on 4/18/2015.
 */
var colors = d3.scale.category20();
var multiplier = 10000;

function getWeights(){
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

function getAveCrimeFactor(univAggrData,weights){

    return weights.murdFactor * univAggrData.totMurd +
        weights.negligenceFactor * univAggrData.totNegM +
        weights.forcibleCrimeFactor * univAggrData.totForcib +
        weights.nonForcibleCrimeFactor * univAggrData.totNonForcib +
        weights.robberyCrimeFactor * univAggrData.totRobbe +
        weights.burglaryCrimeFactor * univAggrData.totBurgla +
        weights.vehicleCrimeFactor * univAggrData.totVehic;
}

function processCrimeFactor(cityData,weights){
    var minCrimeFactor = null, maxCrimeFactor = null;

    cityData.forEach(function(d){
        var crimeFactor = multiplier * weights.murdFactor * d.Murder +
            multiplier * weights.negligenceFactor * d.NegM +
            multiplier * weights.forcibleCrimeFactor * d.Forcib +
            multiplier * weights.nonForcibleCrimeFactor * d.NonForcib +
            multiplier * weights.robberyCrimeFactor * d.Robbe +
            multiplier * weights.burglaryCrimeFactor * d.Burgla +
            multiplier * weights.vehicleCrimeFactor * d.Vehic;
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

function paintCircles(aveCrimeFactor,maxCrimeFactor,cityData){
    var colorScale = d3.scale.linear().domain
    ([aveCrimeFactor, maxCrimeFactor]).range(["#8b0000", "#FFF0F0"])

    svg.selectAll("circle").remove();
    svg.selectAll("circle")
        .data(cityData)
        .enter()
        .append("circle")
        .attr("city", function(d){return d.City})
        .attr("cx", function(d) {
            var proj = projection([d.Longitude, d.Latitude]);
            if(!proj){
                console.log("Invalid lat /long",d);
                return null;
            }
            else {
                return projection([d.Longitude, d.Latitude])[0];
            }

        })
        .attr("cy", function(d) {
            var proj = projection([d.Longitude, d.Latitude]);
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

    svg.selectAll("txt").remove();
    txt = svg.append("text")
        .style("visibility", "hidden")
        .attr("class","schoolLabel")
}

function refreshData(){
    var weights = getWeights();
    var aveCrimeFactor= getAveCrimeFactor(universityAggregateData,weights)
    var minCrimeFactor = null, maxCrimeFactor = null;
    var crimeFactors = processCrimeFactor(cityDataSave,weights);
    minCrimeFactor = crimeFactors.minCrimeFactor;
    maxCrimeFactor = crimeFactors.maxCrimeFactor;
    paintCircles(aveCrimeFactor,maxCrimeFactor,cityDataSave);
}

function loadData(){


    d3.json("data/us-states.json", function(json) {
        d3.tsv("data/univDataAgg.tsv", function(err,univAggrDataArray){
            var weights = getWeights();
            universityAggregateData = univAggrDataArray[0];

            var aveCrimeFactor= getAveCrimeFactor(universityAggregateData,weights)
            var minCrimeFactor = null, maxCrimeFactor = null;
            d3.tsv("data/univData.tsv", function (err,cityData) {
                cityDataSave = cityData;
                var crimeFactors = processCrimeFactor(cityDataSave,weights);
                minCrimeFactor = crimeFactors.minCrimeFactor;
                maxCrimeFactor = crimeFactors.maxCrimeFactor;

                var selectedData = []
                json.features.forEach(function(d){
                    selectedData.push(d);
                })

                //Bind data and create one path per GeoJSON feature
                paths = svg.selectAll("path")
                    .data(selectedData)
                    .enter()
                    .append("path")
                    .attr("i",function(d,i){return i })
                    .style("fill","#f2f2f2") // function(d, i) {return colors(i)})
                    .style("stroke", "grey")
                    .attr("d", path)
                    .on("mouseover", stateIn)
                    .on("mouseout", stateOut)


                //Murder	NegM	Forcib	NonForcib	Robbe	AggA	Burgla	Vehic	Arson

                paintCircles(aveCrimeFactor,maxCrimeFactor,cityDataSave);

            });
        });
    });
}




//for counties data, see view-source:http://upload.wikimedia.org/wikipedia/commons/5/59/Usa_counties_large.svg

//Load in GeoJSON data


function showCityData(){
    var circle = d3.select(this);

    txt.style("visibility", "visible")
        .transition()
        .delay(100)
        .text(circle.attr("city"))
        .attr("x", circle.attr("cx")+5)
        .attr("y", circle.attr("cy") +5)

}

function moveMap(scaleIn){
    //txt.style("visibility", "hidden")
    zoomTimer = null;
    moveTimer = null;


    projection.scale([scale])
        .translate([w/2 + parseInt(xOffset) ,h/2 + parseInt(yOffset)]);
    path.projection(projection)
    paths.attr("d",path)

    svg.selectAll("circle")
        .attr("cx", function(d) {

            var proj = projection([d.Longitude, d.Latitude]);
            if(!proj){
                return null;
            }
            else {
                return projection([d.Longitude, d.Latitude])[0];
            }

        })
        .attr("cy", function(d) {
            var proj = projection([d.Longitude, d.Latitude]);
            if(!proj){
                return null;
            }
            else {
                return projection([d.Longitude, d.Latitude])[1];
            }
        })

}

var zoomTimer = null;
var moveTimer = null;

function zoom(){

    if(zoomTimer){
        clearTimeout(zoomTimer);
    }

    scale =   parseFloat(d3.event.scale)*w;

    zoomTimer = setTimeout(moveMap(scale), 250);
}

function dragMove(){

    xOffset += parseFloat(d3.event.dx);
    yOffset += parseFloat(d3.event.dy);

    if(moveTimer){
        clearTimeout(moveTimer);
    }

    moveTimer = setTimeout(moveMap(scale), 250);
}

function stateIn(){
    d3.select(this).style("opacity",".6");
}

function stateOut(){
    var ctrl = d3.select(this);
    var i=ctrl.attr("i");
    d3.select(this).style("opacity","1");
}
function resize(){
    // get the width of a D3 element
    w = $("#map").width();
    h = w*mapRatio;
    scale =1.3* w;
    svg.attr("width", w)
        .attr("height", h);
    moveMap();
}
