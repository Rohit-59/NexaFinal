module.exports = (qualifiedRM, formData) => {


    qualifiedRM.forEach((record) => {
   
      record["TotalModelIncentive"] = 0;


      if(formData.perModelNumType !== 'fixvalue'){
   
      if(formData.PerModelNumberCarIncentive.length !== 0){
        let soldCar = parseInt(record["Grand Total"]);
        let IncentivePercentage = 0;

      // Find the appropriate incentive based on the exact number of cars sold for modelWise Calculation
      formData.PerModelNumberCarIncentive.forEach((incentive) => {
        if (soldCar == parseInt(incentive.VehicleNumber)) {
            IncentivePercentage = parseInt(incentive.incentive);
         
        }
      });
      const lastIncentive = formData.PerModelNumberCarIncentive[formData.PerModelNumberCarIncentive.length - 1].incentive;
      if (soldCar > parseInt(formData.PerModelNumberCarIncentive[formData.PerModelNumberCarIncentive.length - 1].VehicleNumber)) {
        IncentivePercentage = lastIncentive;
      }
  
  
      record["TotalModelIncentive"] = ((record["PerModel Incentive"] * IncentivePercentage)/100);
    }

    record["TotalModelIncentive"] = record["PerModel Incentive"];

  }else{

    if(formData.PerModelNumberCarIncentive.length !== 0){

      let soldCar = parseInt(record["Grand Total"]);
      let IncentiveValue = 0;

    // Find the appropriate incentive based on the exact number of cars sold for modelWise Calculation
    formData.PerModelNumberCarIncentive.forEach((incentive) => {
      if (soldCar == parseInt(incentive.VehicleNumber)) {
          IncentiveValue = parseInt(incentive.incentive);
       
      }
    });


    const lastIncentive = parseInt(formData.PerModelNumberCarIncentive[formData.PerModelNumberCarIncentive.length - 1].incentive);
    if (soldCar > parseInt(formData.PerModelNumberCarIncentive[formData.PerModelNumberCarIncentive.length - 1].VehicleNumber)) {
      IncentiveValue = lastIncentive;
    }


    record["TotalModelIncentive"] = parseInt(record["PerModel Incentive"]) + IncentiveValue;
  }

  record["TotalModelIncentive"] = record["PerModel Incentive"];





  }
      
    });
    return qualifiedRM;
  }
  
  