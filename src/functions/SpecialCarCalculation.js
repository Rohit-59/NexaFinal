
module.exports =  (qualifiedRM, formData) => {

 
    qualifiedRM.forEach(element => {
    
    
    element["SpecialCar Incentive"] = 0;
    
    let specialCarIncentive = 0;
    
     // Find the appropriate incentive based on the number of each Special cars sold

    for (const model in formData.SpecialCarIncentive) {
        if (element.hasOwnProperty(model) && element[model] > 0) {
             specialCarIncentive += element[model] * formData.SpecialCarIncentive[model];
        }
    }
    
    element["SpecialCar Incentive"] = specialCarIncentive;
    
    });
    
    return qualifiedRM;
    }
    