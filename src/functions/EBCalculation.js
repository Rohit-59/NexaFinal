module.exports = (qualifiedRM, formData, salesExcelDataSheet) => {
  function excelDateToJSDate(excelDate) {
    // Excel date system starts from 1899-12-30
    const unixEpoch = new Date(1899, 11, 30);
    const date = new Date(unixEpoch);
    date.setDate(unixEpoch.getDate() + excelDate);
    return date;
  }
  function isDateInRange(excelDate, startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const dateToCheck = excelDateToJSDate(excelDate);
    // Check if dateToCheck is within the start and end dates, inclusive
    return dateToCheck >= startDate && dateToCheck <= endDate;
  }
  qualifiedRM.forEach((element) => {
    //Setting default incentive to 0
    element["EarlyBird Incentive"] = 0;
    let userID = element["DSE ID"];
    // let userDate = element["Delivery Date"];
    if (formData.EBIncentive.length !== 0) {
      salesExcelDataSheet.forEach((data) => {
        if (data.hasOwnProperty(userID)) {
          data[userID].forEach((record) => {
            let userDate = record["delivery date"];
            for (let i = 0; i < formData.EBIncentive.length; i++) {
              if (
                isDateInRange(
                  parseInt(userDate),
                  formData.EBIncentive[i].startDate,
                  formData.EBIncentive[i].endDate
                )
              ) {
                element["EarlyBird Incentive"] =
                  element["EarlyBird Incentive"] +
                  formData.EBIncentive[i].incentive;
              }
            }
          });
        }
      });
    }
  });

  return qualifiedRM;
};
