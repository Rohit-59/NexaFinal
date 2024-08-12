// module.exports = (qualifiedRM, formData) => {
//   qualifiedRM.forEach((element) => {
//     element["Complaint Deduction"] = 0;
//     if (formData.ComplaintInputsPercent.length !== 0) {
//       let userComplaintNumber = element["Complaints"];
//       //Loop to check if Exchange Status of DSE falls in the range of MGA inputs given by user and calculate its incentive
//       for (let i = 0; i < formData.ComplaintInputsPercent.length; i++) {
//         if (userComplaintNumber ===parseInt(formData.ComplaintInputsPercent[i].ComplaintNumber)) {
//             //Need to cross check if deduction is on Total Amount directly
//           element["Complaint Deduction"]=formData.ComplaintInputsPercent[i].incentive;
//         }
//       }
//       //if DSE Complaints Status value is greater than the largest input number of Complaints then we calculate deduction on the basis of the highest value
//       const lastIncentive =
//         formData.ComplaintInputsPercent[formData.ComplaintInputsPercent.length - 1].incentive;
//       if (userComplaintNumber > parseInt(formData.ComplaintInputsPercent[formData.ComplaintInputsPercent.length - 1].ComplaintNumber
//         )
//       ) {
//         element["Complaint Deduction"] = lastIncentive;
//       }
//     }
//   });
//   return qualifiedRM;
// };
