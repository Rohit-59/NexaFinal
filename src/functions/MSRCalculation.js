
module.exports =  (qualifiedRM, formData) => {

    formData["MSR"].sort((a, b) => {
        if (a.type === 'greater' && b.type === 'greater') {
            return b.value - a.value; // Descending order for 'greater'
          } else if (a.type === 'less' && b.type === 'less') {
            return a.value - b.value; // Ascending order for 'less'
          } else if (a.type === 'range' && b.type === 'range') {
            return b.max - a.max; // Descending order for 'range' based on high value
          } else if (a.type === 'range') {
            return b.value - a.max;
          } else if (b.type === 'range') {
            return b.max - a.value;
          }
          // Ensuring 'greater' types come before 'less' types in case of mixed types
          return (a.type === 'greater' ? -1 : 1);
      });
  
   
    qualifiedRM.forEach(element => {

      //deafault set zero
        element["MSR Incentive"] = 0;

        let userMSR = element["MSR"];

        const noOfCarSoldMSR = element["MSRCount"];



         //Loop to check if MSR/Autocard of DSE falls in the range of MSR/Autocard inputs given by user and calculate its incentive 

        for (let i = 0; i < formData["MSR"].length; i++) {
            const condition = formData["MSR"][i];
            if (condition.type === 'less' && userMSR <= condition.value) {
              if(condition.incentive<0){
                element["MSR Incentive"] = (element["Grand Total"] - noOfCarSoldMSR)*condition.incentive;
              }else{      
                element["MSR Incentive"] = noOfCarSoldMSR*condition.incentive;
            }
              break;
            } else if (condition.type === 'greater' && userMSR >= condition.value) {
              element["MSR Incentive"] = noOfCarSoldMSR*condition.incentive;
              break;
            } else if (condition.type === 'range' && userMSR > condition.min && userMSR < condition.max) {
              element["MSR Incentive"] = noOfCarSoldMSR*condition.incentive;
              break;
            }
          }
    
    
    });
    
    return qualifiedRM;
    }