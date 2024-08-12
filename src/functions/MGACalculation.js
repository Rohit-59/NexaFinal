module.exports = (qualifiedRM, MGAdata, formData) => {
    function searchByID(data, id) {
        return data.find(item => item.id == id);
    }

    qualifiedRM.forEach(element => {
        


        //Check if DSE ID exist in the MGA data based on that we can go further
        const result = searchByID(MGAdata, element["DSE ID"]);

        if (result) {
            element["MGA"] = result["mga/veh"];
            let MGAforCalculation = result["total mga sale ddl"];

            const mgaValue = parseFloat(element["MGA"]);
            let MGAIncentive = 0;


 //Loop to check if MGA per vehicle of DSE falls in the range of MGA inputs given by user and calculate its incentive 

            for (const range of formData["MGAIncentive"]) {
                if (range.max === null) {
                    if (mgaValue >= range.min) {
                        MGAIncentive = parseFloat(range.incentive);
                        break;
                    }
                } else {
                    if (mgaValue >= range.min && mgaValue <= range.max) {
                        MGAIncentive = parseFloat(range.incentive);
                        break;
                    }
                }
            }

            element["MGA Incentive"] = ((parseFloat(MGAforCalculation) * parseFloat(MGAIncentive))) / 100;
            element["TOTAL MGA"] = MGAforCalculation;
            // Optionally, you can add this if you need to update the total incentive
            // element["Total Incentive"] = parseFloat(element["Total Incentive"]) + parseFloat(element["MGA Incentive"]);

        } else {

   // if no matching ID found in MGA data

            // console.error(`No matching MGA data found for DSE ID: ${element["DSE ID"]}`);
            element["MGA"] = 0;
            element["TOTAL MGA"] = 0;
            element["MGA Incentive"] = 0;
        }

        
    });

    return qualifiedRM;
};
