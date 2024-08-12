
module.exports = (qualifiedRM, CDIdata, formData) => {

    function searchByID(data, id) {
        return data.find(item => item["dse id"] == id);
    }

    qualifiedRM.forEach(element => {

        //Check if DSE ID exist in the MGA data based on that we can go further
        const result = searchByID(CDIdata, element["DSE ID"]);



        if (result) {
            element["CDI Score"] = result["cdi"];
            const cdiScore = parseFloat(element["CDI Score"]);
            let CDIIncentive = 0;

            //Loop to check if CDI score of DSE falls in the range of CDI inputs given by user and calculate its incentive 

            for (const incentive of formData.CDI) {
                if (
                    (incentive.type === 'greater' && cdiScore >= incentive.cdiValue) ||
                    (incentive.type === 'less' && cdiScore <= incentive.cdiValue) ||
                    (incentive.type === 'range' && cdiScore > incentive.cdiMin && cdiScore < incentive.cdiMax)
                ) {
                    CDIIncentive = incentive.incentive;
                }
            }
            element["CDI Incentive"] = CDIIncentive;
        } else {
            //If no matching DSE found in DSE data then set default value zero
            element["CDI Score"] = "-";
            element["CDI Incentive"] = 0;
        }

    });

    return qualifiedRM;
}