/*
* a function to aggregate data with two aggregators
*@_data  a flat structure data with all crime prameters
*/

var aggregratedData;

DataPrepare = function(_data,_aggKey1, _aggKey2){
    this.data = _data;

    this.doubleAggregate(_aggKey1, _aggKey2);   
}
/*
  * Aflat data  structure include basic school information and all crime information
 */
  /* 
  * function for aggregating data by keys (two layers) using a flat structure data file.
  */
DataPrepare.prototype.doubleAggregate = function ( _aggKey1, _aggKey2){
    aggregratedData = d3.nest()
          .key(function(d) { 
            return d[_aggKey1]; })
          .key(function(d) { 
            return d[_aggKey2]; })
          .sortKeys(d3.ascending) 
          .rollup(function(leaves) {
            return {
            "murderCount":d3.sum(leaves, function(l) {
                                    return l.murderCount;
                                 })/leaves.length ,
            "negligentManSlaughter":d3.sum(leaves, function(l) {
                                    return l.negligentManSlaughter;
                                  })/leaves.length,
            "forcibleSexOffense":d3.sum(leaves, function(l) {
                                    return l.forcibleSexOffense;
                                  })/leaves.length,
            "nonForcibleSexOffense":d3.sum(leaves, function(l) {
                                    return l.nonForcibleSexOffense;
                                  })/leaves.length,
            "robbery":d3.sum(leaves, function(l) {
                                    return l.robbery;
                                  })/leaves.length,
            "aggravatedAssault":d3.sum(leaves, function(l) {
                                    return l.aggravatedAssault;
                                  })/leaves.length,
            "burglary":d3.sum(leaves, function(l) {
                                    return l.burglary;
                                  })/leaves.length,
            "vehicleTheft":d3.sum(leaves, function(l) {
                                    return l.vehicleTheft;
                                  })/leaves.length,
            "arson":d3.sum(leaves, function(l) {
                                    return l.arson;
                                  })/leaves.length,
            "weaponOffence":d3.sum(leaves, function(l) {
                                    return l.weaponOffence;
                                  })/leaves.length,
            "drugViolations":d3.sum(leaves, function(l) {
                                    return l.drugViolations;
                                  })/leaves.length,
            "liquorViolations":d3.sum(leaves, function(l) {
                                    return l.liquorViolations;
                                  })/leaves.length     
            };
          })
        .entries(this.data); 

    return aggregratedData;
}