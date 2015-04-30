
CrimeDataAnalyzer = function(_crimeData) {
    this.crimeData = _crimeData;
    this.crimeData["containerForMapVis"] = {
        minCrimeFactor:null,
        maxCrimeFactor:null,
        maxRank:null,
        countOfSchools:null,
        averageCrimeFactor:null
    };
    this.yearCrimeData = {};
    this.allTimeCrimeData =
    {
        murderCount: 0,
        negligentManSlaughter: 0,
        forcibleSexOffense: 0,
        nonForcibleSexOffense: 0,
        robbery: 0,
        aggravatedAssault: 0,
        burglary: 0,
        vehicleTheft: 0,
        arson: 0,
        weaponOffence: 0,
        drugViolations: 0,
        liquorViolations: 0,
        crimeFactorForMapVis:0,
        count: 0
    };
    this.init();
}

CrimeDataAnalyzer.prototype.init = function(){

    var that = this;

    var maxCrimeData = {};

    this.crimeData.forEach(function(d,i) {

        d["allTimeCrimeData"] =
        {
            murderCount: 0,
            negligentManSlaughter: 0,
            forcibleSexOffense: 0,
            nonForcibleSexOffense: 0,
            robbery: 0,
            aggravatedAssault: 0,
            burglary: 0,
            vehicleTheft: 0,
            arson: 0,
            weaponOffence: 0,
            drugViolations: 0,
            liquorViolations: 0
        }

        d.yearData.forEach(function (dd, i) {
            if (!that.yearCrimeData[dd.yearOfData]) {
                that.yearCrimeData[dd.yearOfData] =
                {
                    murderCount: 0,
                    negligentManSlaughter: 0,
                    forcibleSexOffense: 0,
                    nonForcibleSexOffense: 0,
                    robbery: 0,
                    aggravatedAssault: 0,
                    burglary: 0,
                    vehicleTheft: 0,
                    arson: 0,
                    weaponOffence: 0,
                    drugViolations: 0,
                    liquorViolations: 0,
                    count: 0
                }
            }


            that.yearCrimeData[dd.yearOfData].murderCount += parseFloat(dd.murderCount);
            that.yearCrimeData[dd.yearOfData].negligentManSlaughter += parseFloat(dd.negligentManSlaughter);
            that.yearCrimeData[dd.yearOfData].forcibleSexOffense += parseFloat(dd.forcibleSexOffense);
            that.yearCrimeData[dd.yearOfData].nonForcibleSexOffense += parseFloat(dd.nonForcibleSexOffense);
            that.yearCrimeData[dd.yearOfData].robbery += parseFloat(dd.robbery);
            that.yearCrimeData[dd.yearOfData].aggravatedAssault += parseFloat(dd.aggravatedAssault);
            that.yearCrimeData[dd.yearOfData].burglary += parseFloat(dd.burglary);
            that.yearCrimeData[dd.yearOfData].vehicleTheft += parseFloat(dd.vehicleTheft);
            that.yearCrimeData[dd.yearOfData].arson += parseFloat(dd.arson)
            that.yearCrimeData[dd.yearOfData].weaponOffence += parseFloat(dd.weaponOffence)
            that.yearCrimeData[dd.yearOfData].drugViolations += parseFloat(dd.drugViolations)
            that.yearCrimeData[dd.yearOfData].liquorViolations += parseFloat(dd.liquorViolations)
            that.yearCrimeData[dd.yearOfData].count++;

            that.allTimeCrimeData.murderCount += parseFloat(dd.murderCount);
            that.allTimeCrimeData.negligentManSlaughter += parseFloat(dd.negligentManSlaughter);
            that.allTimeCrimeData.forcibleSexOffense += parseFloat(dd.forcibleSexOffense);
            that.allTimeCrimeData.nonForcibleSexOffense += parseFloat(dd.nonForcibleSexOffense);
            that.allTimeCrimeData.robbery += parseFloat(dd.robbery);
            that.allTimeCrimeData.aggravatedAssault += parseFloat(dd.aggravatedAssault);
            that.allTimeCrimeData.burglary += parseFloat(dd.burglary);
            that.allTimeCrimeData.vehicleTheft += parseFloat(dd.vehicleTheft);
            that.allTimeCrimeData.arson += parseFloat(dd.arson)
            that.allTimeCrimeData.weaponOffence += parseFloat(dd.weaponOffence)
            that.allTimeCrimeData.drugViolations += parseFloat(dd.drugViolations)
            that.allTimeCrimeData.liquorViolations += parseFloat(dd.liquorViolations)
            that.allTimeCrimeData.count++;

            d.allTimeCrimeData.murderCount += parseFloat(dd.murderCount);
            d.allTimeCrimeData.negligentManSlaughter += parseFloat(dd.negligentManSlaughter);
            d.allTimeCrimeData.forcibleSexOffense += parseFloat(dd.forcibleSexOffense);
            d.allTimeCrimeData.nonForcibleSexOffense += parseFloat(dd.nonForcibleSexOffense);
            d.allTimeCrimeData.robbery += parseFloat(dd.robbery);
            d.allTimeCrimeData.aggravatedAssault += parseFloat(dd.aggravatedAssault);
            d.allTimeCrimeData.burglary += parseFloat(dd.burglary);
            d.allTimeCrimeData.vehicleTheft += parseFloat(dd.vehicleTheft);
            d.allTimeCrimeData.arson += parseFloat(dd.arson)
            d.allTimeCrimeData.weaponOffence += parseFloat(dd.weaponOffence)
            d.allTimeCrimeData.drugViolations += parseFloat(dd.drugViolations)
            d.allTimeCrimeData.liquorViolations += parseFloat(dd.liquorViolations)

        });
    });

    for(year=2006; year<=2013; year++){
        if(that.yearCrimeData[year]){
            var yearData = that.yearCrimeData[year];
            yearData.murderCount *= (1000/yearData.count);
            yearData.negligentManSlaughter *= (1000/yearData.count);
            yearData.forcibleSexOffense *= (1000/yearData.count);
            yearData.nonForcibleSexOffense *= (1000/yearData.count);
            yearData.robbery *= (1000/yearData.count);
            yearData.aggravatedAssault *= (1000/yearData.count);
            yearData.burglary *= (1000/yearData.count);
            yearData.vehicleTheft *= (1000/yearData.count);
            yearData.arson *= (1000/yearData.count);
            yearData.weaponOffence *= (1000/yearData.count);
            yearData.drugViolations *= (1000/yearData.count);
            yearData.liquorViolations *= (1000/yearData.count);
        }
    }

    that.allTimeCrimeData.murderCount *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.negligentManSlaughter *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.forcibleSexOffense *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.nonForcibleSexOffense *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.robbery *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.aggravatedAssault *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.burglary *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.vehicleTheft *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.arson *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.weaponOffence *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.drugViolations *= (1000/that.allTimeCrimeData.count);
    that.allTimeCrimeData.liquorViolations *= (1000/that.allTimeCrimeData.count);


}

CrimeDataAnalyzer.prototype.processWeights =function(weights, year){
    var that = this;
    that.crimeData.containerForMapVis.minCrimeFactor = null;
    that.crimeData.containerForMapVis.maxCrimeFactor = null;

    var totalCrimeFactor=0, count=0;

    this.crimeData.forEach(function(d,i) {

        var container = null;
        if(year){
            container = d.yearData[year];
        }
        else {
            container = d.allTimeCrimeData;
        }
        if(container && weights["sectId"+ d.sectorCd]){
            count++;
            d.crimeFactorForMapVis =
                weights.murdFactor * container.murderCount +
                weights.negligenceFactor * container.negligentManSlaughter +
                weights.forcibleCrimeFactor * container.forcibleSexOffense +
                weights.robberyCrimeFactor * container.robbery +
                weights.burglaryCrimeFactor * container.burglary +
                weights.vehicleCrimeFactor * container.vehicleTheft +
                weights.aggravatedAssaultFactor * container.aggravatedAssault +
                weights.arsonFactor * container.arson +
                weights.weaponFactor * container.weaponOffence +
                weights.drugFactor * container.drugViolations +
                weights.liquorFactor * container.liquorViolations;


            totalCrimeFactor += d.crimeFactorForMapVis;

            if(that.crimeData.containerForMapVis.minCrimeFactor == null){
                that.crimeData.containerForMapVis.minCrimeFactor = d.crimeFactorForMapVis;
            }
            else if(that.crimeData.containerForMapVis.minCrimeFactor >
                d.crimeFactorForMapVis) {
                that.crimeData.containerForMapVis.minCrimeFactor = d.crimeFactorForMapVis;
            }

            if(that.crimeData.containerForMapVis.maxCrimeFactor == null){
                that.crimeData.containerForMapVis.maxCrimeFactor = d.crimeFactorForMapVis;
            }
            else if(that.crimeData.containerForMapVis.maxCrimeFactor <
                d.crimeFactorForMapVis) {
                that.crimeData.containerForMapVis.maxCrimeFactor = d.crimeFactorForMapVis;
            }
        }
        else{
            d.crimeFactorForMapVis = null;
        }
    });

    this.crimeData.sort(
    function(a,b){
        return d3.ascending(a.crimeFactorForMapVis, b.crimeFactorForMapVis)
    });



    var rank = 0;
    var oldCrimeFactor = -1;

    var container = null;

    this.crimeData.forEach(function(d,i){
        if(year){
            container = d[year]
        }
        else {
            container = d.allTimeCrimeData
        }

        if(container){
            if(oldCrimeFactor != d.crimeFactorForMapVis){
                d["rank"] = ++rank;
            }
            else {
                d["rank"] = rank;
            }

            oldCrimeFactor = d.crimeFactorForMapVis;
        }
        else {
            d["rank"] = 0;
        }
    })

    this.crimeData.containerForMapVis.maxRank = rank;
    this.crimeData.containerForMapVis.countOfSchools= count;
    this.crimeData.containerForMapVis.averageCrimeFactor = totalCrimeFactor/count;

    return this.crimeData;


}

CrimeDataAnalyzer.prototype.getData = function(){
    return this.crimeData;
}
