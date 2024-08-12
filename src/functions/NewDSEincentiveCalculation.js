module.exports = (newRm, formData) => {
    
    const newDSEPerCarIncentive = parseInt(formData.newDSEInput.incentive);
    const newDSEPMcars = parseInt(formData.newDSEInput.minCars);

    newRm.forEach(element => {
      

      //Check if the New DSE has minimum no of cars to qualify for newDSE incentive and calculate based on that

          if(element['Grand Total'] >= newDSEPMcars){
            element['Final Incentive'] = element['Grand Total'] * newDSEPerCarIncentive;
            element["Vehicle Incentive"] =  element['Final Incentive']
          }else{
            element['Final Incentive'] = 0;
            element["Vehicle Incentive"] =  element['Final Incentive']


          }
       


    });

    return newRm;

};
