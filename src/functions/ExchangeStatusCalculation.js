
module.exports = (qualifiedRM, formData) => {
    qualifiedRM.forEach(element => {

if(formData.exchangeType == 'totalNumberIncentive'){


        element["Exchange Incentive"] = 0;

        if(formData.ExchangeInputs.length !== 0){

        let userExchangeNumber = element["Exchange Status"];


 //Loop to check if Exchange Status of DSE falls in the range of Exchange inputs given by user and calculate its incentive 

        for (let i = 0; i < formData.ExchangeInputs.length; i++) {
            if (userExchangeNumber === parseInt(formData.ExchangeInputs[i].ExchangeNumber)) {
                element["Exchange Incentive"] = userExchangeNumber*formData.ExchangeInputs[i].incentive;
            }
        }


        //if DSE Exchange Status value is greater than the largest input number of Exchange Status then we calculate on the basis of the highest value
        const lastIncentive = formData.ExchangeInputs[formData.ExchangeInputs.length - 1].incentive;
        if (userExchangeNumber > parseInt(formData.ExchangeInputs[formData.ExchangeInputs.length - 1].ExchangeNumber)) {
            element["Exchange Incentive"] = userExchangeNumber*lastIncentive;
        }
    }
}else{


    element["Exchange Incentive"] = 0;

    if(formData.ExchangeInputs.length !== 0){

    let userExchangeNumber = element["Exchange Status"];


 //Loop to check if Exchange Status of DSE falls in the range of Exchange inputs given by user and calculate its incentive 

    for (let i = 0; i < formData.ExchangeInputs.length; i++) {
        if (userExchangeNumber > 0) {
            element["Exchange Incentive"] =  element["Exchange Incentive"] + parseInt(formData.ExchangeInputs[i].incentive);
            userExchangeNumber--;
        }
    }
 }
}

    });
    return qualifiedRM;
}