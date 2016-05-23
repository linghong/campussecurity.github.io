/**
* hide and show check box
*/

CategorySelectionViz =  function(){
    this.crimeKey = "";
}


CategorySelectionViz.prototype.onCrimeChange = function(crimeKey){
    this.crimeKey=crimeKey
}

CategorySelectionViz.prototype.getWeights = function(){
    var topCount = 1000
    var bottomCount = 1000
    /*
     <button class="btn btn-info-darken btn-sm" id="weapon" value="weaponOffence">WEAPON</button>
     <button class="btn btn-info-darken btn-sm" id="drug" value="drugViolations">DRUG</button>
     <button class="btn btn-info-darken btn-sm" id="liquor" value="liquorViolations">LIQUOR</button>
     <button class="btn btn-info-darken btn-sm" id="murd" value="murderCount">MURD</button>
     <button class="btn btn-info-darken btn-sm" id="forcib" value="forcibleSexOffense">FORCIB</button>
     <button class="btn btn-info-darken btn-sm" id="robbe" value="robbery">ROBBE</button>
     <button class="btn btn-info-darken btn-sm" id="agg" value="aggravatedAssault">AGG</button>
     <button class="btn btn-info-darken btn-sm" id="burgla" value="burglary">BURGLA</button>
     <button class="btn btn-info-darken btn-sm" id="vehic" value="vehicleTheft">VEHIC</button>
     <button class="btn btn-info-darken btn-sm" id="arson" value="arson">ARSON</button>

     var initialWeights = [4,3,2,.5,.5,.2,1,.2,.1,.1,.1]
     var labels = ['Murder','Negl. Manslaughter', 'Forcible Sex Offence', 'Robbery', 'Burglary',
     'Vehicle Theft', 'Aggravated Assault', 'Arson', 'Weapons Offence', 'Drug Offence', 'Liquor Offence']

     */

    var hideSafeSchools = $("#cbxHideSafe").is(":checked")
    return {
        murdFactor: (this.crimeKey=='' || this.crimeKey=='murderCount') ? Math.pow(10,4) : 0,
        negligenceFactor: (this.crimeKey=='' || this.crimeKey=='negl') ?Math.pow(10,3) : 0,
        forcibleCrimeFactor: (this.crimeKey=='' || this.crimeKey=='forcibleSexOffense') ?Math.pow(10,2) : 0,
        robberyCrimeFactor: (this.crimeKey=='' || this.crimeKey=='robbery') ?Math.pow(10,.5) : 0,
        burglaryCrimeFactor: (this.crimeKey=='' || this.crimeKey=='burglary') ?Math.pow(10,.5) : 0,
        vehicleCrimeFactor: (this.crimeKey=='' || this.crimeKey=='vehicleTheft') ?Math.pow(10,.2) : 0,
        topCount: topCount,
        bottomCount:bottomCount,
        aggravatedAssaultFactor: (this.crimeKey=='' || this.crimeKey=='aggravatedAssault') ?Math.pow(10,1) : 0,
        arsonFactor: (this.crimeKey=='' || this.crimeKey=='arson') ?Math.pow(10,.2) : 0,
        weaponFactor: (this.crimeKey=='' || this.crimeKey=='weaponOffence') ?Math.pow(10,.1) : 0,
        drugFactor: (this.crimeKey=='' || this.crimeKey=='drugViolations') ?Math.pow(10,.1) : 0,
        liquorFactor: (this.crimeKey=='' || this.crimeKey=='liquorViolations') ?Math.pow(10,.1) : 0,
        sectId1:true,
        sectId2:true,
        sectId3:true,
        sectId4:true,
        sectId5:true,
        sectId6:true,
        sectId7:true,
        sectId8:true,
        sectId9:true,
        hideSafeSchools:hideSafeSchools
    }
}