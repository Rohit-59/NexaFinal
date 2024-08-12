module.exports = (qualifiedRM, formData) => {
  qualifiedRM.forEach((record) => {
    let soldCar = parseInt(record["Grand Total"]);
    let productivityCarsIncentive = 0;
    // Find the appropriate incentive based on the exact number of cars sold

    if (formData.productivityCarsIncentive.length > 0) {
      formData.productivityCarsIncentive.forEach((incentive) => {
        if (soldCar == parseInt(incentive.cars)) {
          productivityCarsIncentive = parseInt(incentive.incentive);
        }
      });

      const lastIncentive =
        formData.productivityCarsIncentive[
          formData.productivityCarsIncentive.length - 1
        ].incentive;
      if (
        soldCar >
        parseInt(
          formData.productivityCarsIncentive[
            formData.productivityCarsIncentive.length - 1
          ].cars
        )
      ) {
        productivityCarsIncentive = lastIncentive;
      }

      //get Special car count
      let specialCarCount = 0;
      for (let key in formData.SpecialCarIncentive) {
        if (record[key] > 0) {
          specialCarCount += record[key];
        }
      }

      // Add the incentive to the record
      // record["Per Car Incentive"] = productivityCarsIncentive;
      record["Total Productivity Car Incentive"] = productivityCarsIncentive;
    }
  });
  return qualifiedRM;
};
