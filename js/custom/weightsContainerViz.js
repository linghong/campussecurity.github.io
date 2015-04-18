/**
 * Created by suhas on 4/18/2015.
 */

WeightContainerViz = function(_widthOfWeightSel){
    this.visible = false;
    this.widthOfWeightSel = _widthOfWeightSel;
}

WeightContainerViz.prototype.showWeightsContainer = function ()
{
    if(this.visible){
        return;
    }
    this.visible = true;
    $( "#weightsSelector").show();
    $( "#weightsSelector" ).animate({
        width: this.widthOfWeightSel,
        left: "-=" +this.widthOfWeightSel
    }, 1000);
}

WeightContainerViz.prototype.hideWeightsContainer = function ()
{
    if(!this.visible){
        return;
    }

    this.visible = false;
    $( "#weightsSelector" ).animate({
        width: "-=" +this.widthOfWeightSel,
        left: "+=" +this.widthOfWeightSel
    }, 1000, function(){
        $( "#weightsSelector").hide();
    });
}

WeightContainerViz.prototype.getWeights = function(){
    var murdFactor = parseInt($("#murdId").val());
    var negligenceFactor = parseInt($("#negId").val());
    var forcibleCrimeFactor = parseInt($("#forcibId").val());
    var robberyCrimeFactor = parseInt($("#robbeId").val());
    var burglaryCrimeFactor = parseInt($("#murdId").val());
    var vehicleCrimeFactor = parseInt($("#vehicId").val());


    return {
        murdFactor:murdFactor,
        negligenceFactor:negligenceFactor,
        forcibleCrimeFactor:forcibleCrimeFactor,
        //nonForcibleCrimeFactor:nonForcibleCrimeFactor,
        robberyCrimeFactor:robberyCrimeFactor,
        burglaryCrimeFactor:burglaryCrimeFactor,
        vehicleCrimeFactor:vehicleCrimeFactor
    }
}

WeightContainerViz.prototype.showSafe = function(){

    return $("#rbSafe").prop( "checked")
}