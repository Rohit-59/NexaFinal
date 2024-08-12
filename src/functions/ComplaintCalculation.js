
module.exports =  (qualifiedRM, formData) => {

     
    qualifiedRM.forEach(element => {


        
if(formData.complaintType == 'fixvalueDeduction'){

        element["Complaint Deduction"] = 0;


if(formData.DiscountType == 'Vehicle'){

    element["Final Incentive"] =
    element['Total Vehicle Incentive Amt. Slabwise'] +        
    element['Total Productivity Car Incentive'] +
    element['SpecialCar Incentive'] +
    element['CDI Incentive'] +
    element['EW Incentive'] +
    element['CCP Incentive'] +
    element['MSSF Incentive'] +
    element['MSR Incentive'] +
    element['GNA Incentive'] +
    element['GNAPerVehicleDeduction'] +
    element['Exchange Incentive'] +
    element['Super Car Incentive'] +
    element['MGA Incentive'] +
    element['EarlyBird Incentive'];

}else{
    element["Final Incentive"]=
    element['Total Vehicle Incentive Amt. Slabwise'];
}


        if(formData.ComplaintInputs.length !== 0){
        let userComplaintNumber = element["Complaints"];


//Loop to check if Exchange Status of DSE falls in the range of MGA inputs given by user and calculate its incentive 

        for (let i = 0; i < formData.ComplaintInputs.length; i++) {
            if (userComplaintNumber === parseInt(formData.ComplaintInputs[i].ComplaintNumber)) {
                element["Complaint Deduction"] = formData.ComplaintInputs[i].incentive;
                element["Final Incentive"] = element["Final Incentive"] + element["Complaint Deduction"];
            }
        }

 //if DSE Complaints Status value is greater than the largest input number of Complaints then we calculate deduction on the basis of the highest value

        const lastIncentive = formData.ComplaintInputs[formData.ComplaintInputs.length - 1].incentive;
        if (userComplaintNumber > parseInt(formData.ComplaintInputs[formData.ComplaintInputs.length - 1].ComplaintNumber)) {
            element["Complaint Deduction"] = lastIncentive;
            element["Final Incentive"] = element["Final Incentive"] + element["Complaint Deduction"];
        }


    }
}   
else{

    element["Complaint Deduction"] = 0;


if(formData.DiscountType == 'Vehicle'){

    let TotalforCalc =
    element['Total Vehicle Incentive Amt. Slabwise'] +        
    element['Total Productivity Car Incentive'] +
    element['SpecialCar Incentive'] +
    element['CDI Incentive'] +
    element['EW Incentive'] +
    element['CCP Incentive'] +
    element['MSSF Incentive'] +
    element['MSR Incentive'] +
    element['GNA Incentive'] +
    element['GNAPerVehicleDeduction'] +
    element['Exchange Incentive'] +
    element['Super Car Incentive'] +
    element['MGA Incentive'] +
    element['EarlyBird Incentive'];

}else{
    let TotalforCalc =
    element['Total Vehicle Incentive Amt. Slabwise'];
}

    if(formData.ComplaintInputs.length !== 0){
    let userComplaintNumber = element["Complaints"];

    for (let i = 0; i < formData.ComplaintInputs.length; i++) {
        if (userComplaintNumber === parseInt(formData.ComplaintInputs[i].ComplaintNumber)) {
            element["Complaint Deduction"] = formData.ComplaintInputs[i].incentive*TotalforCalc/100;
            element["Final Incentive"] = TotalforCalc + element["Complaint Deduction"];
        }
    }

    const lastIncentive = formData.ComplaintInputs[formData.ComplaintInputs.length - 1].incentive;
    if (userComplaintNumber > parseInt(formData.ComplaintInputs[formData.ComplaintInputs.length - 1].ComplaintNumber)) {
        element["Complaint Deduction"] = lastIncentive*TotalforCalc/100;
        element["Final Incentive"] = TotalforCalc + element["Complaint Deduction"];
       
    }





    }

}
    
    });
    
    return qualifiedRM;
    }