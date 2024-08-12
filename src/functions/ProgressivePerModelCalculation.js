
module.exports =  (qualifiedRM, formData) => {

 
    qualifiedRM.forEach(element => {
    
    
    element["Progressive Incentive"] = 0;

    if(formData.ProgressivePerModelInputs.length !== 0){

    let TotalCarNumber = element["Grand Total"];


    let specialCarCount = 0;
    for(let key in formData.SpecialCarIncentive){
      if(element[key] > 0){
        specialCarCount += record[key];
      }
    }

    TotalCarNumber = TotalCarNumber - specialCarCount;


 //Loop to check if Exchange Status of DSE falls in the range of Exchange inputs given by user and calculate its incentive 

    for (let i = 0; i < formData.ProgressivePerModelInputs.length; i++) {
        if (TotalCarNumber > 0) {
            element["Progressive Incentive"]  =  element["Progressive Incentive"]  + parseInt(formData.ProgressivePerModelInputs[i].incentive);
            TotalCarNumber--;
        }
    }
 }
    

    });
    
    return qualifiedRM;
    }
    
    
    






// else{


//     element["Exchange Incentive"] = 0;

//     if(formData.ExchangeInputs.length !== 0){

//     let userExchangeNumber = element["Exchange Status"];


//  //Loop to check if Exchange Status of DSE falls in the range of Exchange inputs given by user and calculate its incentive 

//     for (let i = 0; i < formData.ExchangeInputs.length; i++) {
//         if (userExchangeNumber > 0) {
//             element["Exchange Incentive"] =  element["Exchange Incentive"] + parseInt(formData.ExchangeInputs[i].incentive);
//             userExchangeNumber--;
//         }
//     }
//  }
// }