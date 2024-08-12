const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const XLSX = require('xlsx');
const writeXlsxFile = require('write-excel-file/node');
const { isContext } = require('node:vm');
const fs = require('fs');
if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    title: 'Nimar Motors Khargone',
    // width: 1290,
    // height: 1080,
    icon: path.join(__dirname, './assets/NimarMotor.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  ipcMain.on('reset-application', () => {
    mainWindow.reload();
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
  })

  ipcMain.on('reset-app', () => {
    if (mainWindow) {
      KeyMissing = false;
      mainWindow.reload();
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // mainWindow.webContents.openDevTools();
};

//Separate Calculation Functions for Each type incentive
const MGAfunc = require('./functions/MGACalculation');
const CDIfunc = require('./functions/CDICalculation');
const EWfunc = require('./functions/EWCalculation');
const CCPfunc = require('./functions/CCPCalculation');
const MSSFfunc = require('./functions/MSSFCalculation');
const DiscountFunc = require('./functions/DiscountCalculation')
const ExchangeFunc = require('./functions/ExchangeStatusCalculation')
const ComplaintFunc = require('./functions/ComplaintCalculation');
const PerModelCarFunc = require('./functions/PerModelCalculation');
const SpecialCarFunc = require('./functions/SpecialCarCalculation');
const PerCarFunc = require('./functions/PerCarCalculation');
const MSRFunc = require('./functions/MSRCalculation');
const SuperCarFunc = require('./functions/SuperCarCalculation');
const NewDSEincentiveCalculation = require('./functions/NewDSEincentiveCalculation');
const ModelWiseNumberFunc = require('./functions/ModelNumberWiseCalculation')

// Global Variables
let MGAdata = [];
let CDIdata = [];
let salesExcelDataSheet = [];
let employeeStatusDataSheet = [];
let qualifiedRM = [];
let nonQualifiedRM = [];
let newRm = [];
let newDSEIncentiveDataSheet = [];
let KeyMissing = false;

// Function to check if the Key value of CDI/MGA and DSE Excel data is in correct form or not
function checkKeys(array, keys) {
  const firstObject = array[0];
  const missingKeys = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!firstObject.hasOwnProperty(key)) {
      missingKeys.push(key);
    }
  }
  return missingKeys.length > 0 ? missingKeys : null;
}


// function to remove whiteSpaces from DSE Excel Data Column name or keys
function transformKeys(array) {
  return array.map(obj => {
    let newObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let newKey = key.trim();
        newObj[newKey] = obj[key];
      }
    }
    return newObj;
  });
}


// function to remove whiteSpaces from DSE Excel Data
function trimValuesArray(arr) {
  return arr.map(obj => {
    const trimmedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        trimmedObj[key] = value.trim();
      } else {
        trimmedObj[key] = value;
      }
    }
    return trimmedObj;
  });
}


// Function to check if the DSE is qualifying based on the FormData inputs

const checkQualifingCondition = (formData, employeeStatusDataSheet) => {

  salesExcelDataSheet.forEach((item) => {
    let numberCheck = 0;
    let Discount = 0;
    let ComplaintCheck = 0;
    let EWCheck = 0;
    let EWPCheck = 0;
    let ExchangeStatusCheck = 0;
    let TotalNumberCheck = 0;
    let CCPcheck = 0;
    let DiscountCount = 0;
    let DiscountAmount = 0;
    let MSSFcheck = 0;
    let autoCardCheck = 0;
    let obj = {};
    let MSRcheck = 0;

    let carObj = {
      "ALTO": 0,
      "ALTO K-10": 0,
      "S-Presso": 0,
      "CELERIO": 0,
      "WagonR": 0,
      "BREZZA": 0,
      "DZIRE": 0,
      "EECO": 0,
      "Ertiga": 0,
      "SWIFT": 0
    }

    const DSE_NoOfSoldCarExcelDataArr = Object.values(item)[0];
    // check OLD / NEW DSE
    let empStatus = true;
    // console.log(employeeStatusDataSheet)
    employeeStatusDataSheet.forEach(employee => {
      if (employee["DSE ID"] == DSE_NoOfSoldCarExcelDataArr[0]['DSE ID']) {
        if (employee["STATUS"] === "NEW")
          empStatus = false;
      }
    });

    obj = {
      "DSE ID": DSE_NoOfSoldCarExcelDataArr[0]['DSE ID'],
      "DSE Name": DSE_NoOfSoldCarExcelDataArr[0]['DSE Name'],
      "BM AND TL NAME": DSE_NoOfSoldCarExcelDataArr[0]['BM AND TL NAME'],
      "Status": "OLD",
      "Focus Model Qualification": "No",
      ...carObj,
      "Grand Total": 0,
      "Vehicle Incentive ": 0,
      "Special Car Incentive": 0,
      "Total Vehicle Incentive": 0,
      "Total PerCar Incentive":0,
      "Super Car Incentive Qualification": 0,
      "TotalModelIncentive":0,
      "PerModel Incentive":0,
      "SpecialCar Incentive":0,
      "Vehicle Incentive":0,
      "CDI Score": 0,
      "CDI Incentive": 0,
      "CCP Score": 0,
      "CCP Incentive": 0,
      "MSSF Score": 0,
      "MSSF Incentive": 0,
      "MSR Score": 0,
      "MGA":0,
      "MSR Incentive": 0,
      "EW Incentive":0,
      "Total Discount": 0,
      "Vehicle Incentive % Slabwise":0,
      "Total Vehicle Incentive Amt. Slabwise":0,
      "Exchange Incentive": 0,
      "Complaint Deduction": 0,
      "MGA/Vehicle": 0,
      "MGA Incentive": 0,
      "Final Incentive": 0,
    }

    if (empStatus) {

      DSE_NoOfSoldCarExcelDataArr.forEach((sold) => {

        if (parseInt(sold["FINAL DISCOUNT"]) > 0) {
          Discount += parseInt(sold["FINAL DISCOUNT"]);
      }
                    


        carObj[sold["Model Name"]]++;
     

        if (parseInt(sold["FINAL DISCOUNT"]) > 0) {
          DiscountCount++;
        }
        if (parseInt(sold["CCP PLUS"]) > 0) {
          CCPcheck++;
        }
        if (sold["Financer REMARK"] == "MSSF") {
          MSSFcheck++;
        }
        if (parseInt(sold["Extended Warranty"]) > 0) {
          EWPCheck++;
        }
        if (sold["Exchange Status"] == 'YES' || sold["Exchange Status"] == 'yes') {
          ExchangeStatusCheck++;
        }
        if (sold["Complaint Status"] == 'YES' || sold["Complaint Status"] == 'yes') {
          ComplaintCheck++;
        }
        if (sold["Autocard"] == 'YES' || sold["Autocard"] == 'yes') {
          MSRcheck++;
        }
        TotalNumberCheck++;

        if (formData.QC.focusModel.includes(sold["Model Name"])) {
          numberCheck++;
        }
        if (formData.QC.autoCard == "yes") {
          if (sold["Autocard"] == "YES") {
            autoCardCheck++;
          }
        }
        if (formData.QC.EW == "yes") {
          if (sold["Extended Warranty"] > 0) {
            EWCheck++;
          }
        }
      })

      //for EW, auto card, CCP,MSSF,Discount,MGA,Exchange,Complaint check
      if (numberCheck >= formData.QC.numOfCars) {


        let EWFlag = true;
        let autoCardFlag = true;
        let CCPFlag = true;
        let MSSFFlag = true;
        let MGAFlag = true;
        let DiscountFlag = true;
        let ExchangeFlag = true;
        let ComplainFlag = true;

        //checking autocard checked 
        if (formData.QC.autoCard === "yes") {
          //if % is greater or equal then qualify 
          if ((autoCardCheck / TotalNumberCheck) * 100 >= formData.QC.autocardPercent)
            autoCardFlag = true;
          else {
            autoCardFlag = false;
          }
        }

        //checking Extended warranty checked 
        if (formData.QC.EW === "yes") {
          //if % is greater or equal then qualify 
          if (((EWCheck / TotalNumberCheck) * 100) >= formData.QC.ewdPercent)
            EWFlag = true;
          else {
            EWFlag = false;
          }
        }

        //checking CCP checked 
        if (formData.QC.CCPCheck === "yes") {
          //if % is greater or equal then qualify 
          if (((CCPcheck / TotalNumberCheck) * 100) >= formData.QC.CCPPercent)
            CCPFlag = true;
          else {
            CCPFlag = false;
          }
        }

        //checking MSSF checked 
        if (formData.QC.MSSFCheck === "yes") {
          //if % is greater or equal then qualify 
          if (((MSSFcheck / TotalNumberCheck) * 100) >= formData.QC.MSSFPercent)
            MSSFFlag = true;
          else {
            MSSFFlag = false;
          }
        }


        //checking MGA checked 
        if (formData.QC.MGACheck === "yes") {
          //if % is greater or equal then qualify 
          let MGAAmountForQC = 0;
          const result = searchByID(MGAdata, DSE_NoOfSoldCarExcelDataArr[0]['DSE ID']);
          if (result) {
            MGAAmountForQC = result["MGA/VEH"];
            if (MGAAmountForQC >= formData.QC.MGAAmount)
              MGAFlag = true;
            else {
              MGAFlag = false;
            }
          } else {
            MGAFlag = false;
          }
        }


        //checking Discount checked 
        if (formData.QC.DiscountCheck === "yes") {
          //if % is greater or equal then qualify 
          let AvgDiscount = Discount / DiscountCount;
          if (AvgDiscount <= formData.QC.DiscountAmount)
            DiscountFlag = true;
          else
            DiscountFlag = false;
        }

        //checking Exchange checked 
        if (formData.QC.ExchangeCheck === "yes") {
          //if % is greater or equal then qualify 

          if (ExchangeStatusCheck >= formData.QC.ExchangeCount)
            ExchangeFlag = true;
          else
            ExchangeFlag = false;
        }

        //checking Complaint checked 
        if (formData.QC.ComplaintCheck === "yes") {
          //if % is greater or equal then qualify 
          if (ComplaintCheck <= formData.QC.ComplaintCount)
            ComplainFlag = true;
          else
            ComplainFlag = false;
        }


       

        // check final qulification
        if (EWFlag && autoCardFlag && CCPFlag && MSSFFlag && MGAFlag && DiscountFlag && ExchangeFlag && ComplainFlag) {
          obj = {
            ...obj,
            ...carObj,
            "Status": "OLD",
            "Focus Model Qualification": "YES",
            "Discount": Discount > 0 ? Discount : 0,
            "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
            "Exchange Status": ExchangeStatusCheck,
            "Complaints": ComplaintCheck,
            "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
            "MSR": (MSRcheck / TotalNumberCheck) * 100,
            "CCP": (CCPcheck / TotalNumberCheck) * 100,
            "MSSF": (MSSFcheck / TotalNumberCheck) * 100,
            "MSSFCount": MSSFcheck,
            "EWPCount": EWPCheck,
            "MSRCount": MSRcheck,
            "CCPCount": CCPcheck,
            "Grand Total": TotalNumberCheck
          }
          qualifiedRM.push(obj)
        } 

      }else{
        //unqualified data

        obj = {
          ...obj,
          ...carObj,
          "Status": "OLD",
          "Focus Model Qualification": "NO",
          "Discount": Discount > 0 ? Discount : 0,
          "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
          "Exchange Status": ExchangeStatusCheck,
          "Complaints": ComplaintCheck,
          "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
          "MSR": (MSRcheck / TotalNumberCheck) * 100,
          "CCP": (CCPcheck / TotalNumberCheck) * 100,
          "MSSF": (MSSFcheck / TotalNumberCheck) * 100,
          "MSSFCount": MSSFcheck,
          "EWPCount": EWPCheck,
          "MSRCount": MSRcheck,
          "CCPCount": CCPcheck,
          "Grand Total": TotalNumberCheck
        }
        nonQualifiedRM.push(obj)

      }

    } else {
    
      //New DSE data

      DSE_NoOfSoldCarExcelDataArr.forEach((sold) => {

        TotalNumberCheck++;

        if (parseInt(sold["FINAL DISCOUNT"]) > 0) {
          Discount += parseInt(sold["FINAL DISCOUNT"]);
      }
        carObj[sold["Model Name"]]++;
      
        if (parseInt(sold["FINAL DISCOUNT"]) > 0) {
          DiscountCount++;
        }
        if (parseInt(sold["CCP PLUS"]) > 0) {
          CCPcheck++;
        }
        if (sold["Financer REMARK"] == "MSSF") {
          MSSFcheck++;
        }
        if (parseInt(sold["Extended Warranty"]) > 0) {
          EWPCheck++;
        }
        if (sold["Exchange Status"] == 'YES' || sold["Exchange Status"] == 'yes') {
          ExchangeStatusCheck++;
        }
        if (sold["Complaint Status"] == 'YES' || sold["Complaint Status"] == 'yes') {
          ComplaintCheck++;
        }
        if (sold["Autocard"] == 'YES' || sold["Autocard"] == 'yes') {
          MSRcheck++;
        }


      })
      
      obj = {
        ...obj,
        ...carObj,
        "Status": "NEW",
        "Focus Model Qualification": "NO",
        "Discount": Discount > 0 ? Discount : 0,
        "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
        "Exchange Status": ExchangeStatusCheck,
        "Complaints": ComplaintCheck,
        "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
        "MSR": (MSRcheck / TotalNumberCheck) * 100,
        "CCP": (CCPcheck / TotalNumberCheck) * 100,
        "MSSF": (MSSFcheck / TotalNumberCheck) * 100,
        "MSSFCount": MSSFcheck,
        "EWPCount": EWPCheck,
        "MSRCount": MSRcheck,
        "CCPCount": CCPcheck,
        "Grand Total": TotalNumberCheck
      }

      newRm.push(obj)

    }

  })
 


}


function getIncentiveValue(item, key) {
  return (typeof (item[key]) === 'number' || typeof (item[key]) == 'NaN') ? Math.round(item[key]) : 0;
}

ipcMain.on('form-submit', (event, formData) => {

  // console.log("Form Data Input", formData);
  if (!KeyMissing) {

    console.log("formData", formData);



    // Calling Function to Check Qualification and Calculate eacch incentive of DSE

    checkQualifingCondition(formData, employeeStatusDataSheet);
    // newDSEIncentiveDataSheet = NewDSEincentiveCalculation(newRm, formData)
    qualifiedRM = PerCarFunc(qualifiedRM, formData);
    qualifiedRM = SpecialCarFunc(qualifiedRM, formData);
    qualifiedRM = PerModelCarFunc(qualifiedRM, formData);//TODO
    qualifiedRM = ModelWiseNumberFunc(qualifiedRM,formData);
    qualifiedRM = CDIfunc(qualifiedRM, CDIdata, formData);//TODO
    qualifiedRM = EWfunc(qualifiedRM, formData);
    qualifiedRM = CCPfunc(qualifiedRM, formData);
    qualifiedRM = MSSFfunc(qualifiedRM, formData);
    qualifiedRM = MSRFunc(qualifiedRM, formData);
    qualifiedRM = DiscountFunc(qualifiedRM, formData);
    qualifiedRM = ExchangeFunc(qualifiedRM, formData);
    qualifiedRM = ComplaintFunc(qualifiedRM, formData);
    qualifiedRM = MGAfunc(qualifiedRM, MGAdata, formData);
    qualifiedRM = SuperCarFunc(qualifiedRM, MGAdata, salesExcelDataSheet, formData)





    newRm = NewDSEincentiveCalculation(newRm, formData)
    // newRm = PerCarFunc(newRm, formData);
    // newRm = SpecialCarFunc(newRm, formData);
    // newRm = PerModelCarFunc(newRm, formData);//TODO
    // newRm = ModelWiseNumberFunc(qualifiedRM,formData);
    // newRm = CDIfunc(newRm, CDIdata, formData);//TODO
    // newRm = EWfunc(newRm, formData);
    // newRm = CCPfunc(newRm, formData);
    // newRm = MSSFfunc(newRm, formData);
    // newRm = MSRFunc(newRm, formData);
    // newRm = DiscountFunc(newRm, formData);
    // newRm = ExchangeFunc(newRm, formData);
    // newRm = ComplaintFunc(newRm, formData);
    // newRm = MGAfunc(newRm, MGAdata, formData);
    // newRm = SuperCarFunc(newRm, MGAdata, salesExcelDataSheet, formData)







   



    // Final Object
    let finalExcelobjOldDSE = [];



// Pushing qualified OLD DSE objects to Final Object

    qualifiedRM.forEach((item) => {

      // if (item["Super Car Incentive"] === 'NaN') {
      //   item["Super Car Incentive"] = 0
      // }
      const grandTotal =
        getIncentiveValue(item, "Total Vehicle Incentive Amt. Slabwise") +
        // getIncentiveValue(item, "SpecialCar Incentive") +
        getIncentiveValue(item, "CDI Incentive") +
        getIncentiveValue(item, "EW Incentive") +
        getIncentiveValue(item, "CCP Incentive") +
        getIncentiveValue(item, "MSSF Incentive") +
        getIncentiveValue(item, "MSR Incentive") +
        // getIncentiveValue(item, "Discount Incentive") +
        getIncentiveValue(item, "Exchange Incentive") +
        // getIncentiveValue(item, "Vehicle Incentive")
        getIncentiveValue(item, "Complaint Deduction") +
        getIncentiveValue(item, "Super Car Incentive") +
        getIncentiveValue(item, "MGA Incentive");
        // getIncentiveValue(item, "TotalModelIncentive"); 

      obj = {
        "DSE ID": item['DSE ID'],
        "DSE Name": item['DSE Name'],
        "BM AND TL NAME": item['BM AND TL NAME'],
        "Status": item["Status"],
        "Focus Model Qualification": item['Focus Model Qualification'],
        "ALTO": item['ALTO'],
        "ALTO K-10": item['ALTO K-10'],
        "S-Presso": item['S-Presso'],
        "CELERIO": item['CELERIO'],
        "WagonR": item['WagonR'],
        "BREZZA": item['BREZZA'],
        "DZIRE": item['DZIRE'],
        "EECO": item['EECO'],
        "Ertiga": item['Ertiga'],
        "SWIFT": item['SWIFT'],
        "Grand Total": item["Grand Total"],
        "Vehicle Incentive": item["Total PerCar Incentive"] + item["PerModel Incentive"],
        "Special Car Incentive": item['SpecialCar Incentive'],
        "Total Vehicle Incentive": item["Total PerCar Incentive"] + item['SpecialCar Incentive'] + item["TotalModelIncentive"],
        "Super Car Incentive Qualification": getIncentiveValue(item, "Super Car Incentive") ? "YES" : "NO",
        "Super Car Incentive": getIncentiveValue(item, "Super Car Incentive"),
        "CDI Score": getIncentiveValue(item, "CDI Score"),//TODO Handle NAN values
        "CDI Incentive": item["CDI Incentive"],
        "Total MGA": (item['TOTAL MGA']) ? item['TOTAL MGA'] : 0,
        "MGA/Vehicle": Math.round(item["MGA"]),
        "MGA Incentive": Math.round(item["MGA Incentive"]),
        "Exchange Count": item["Exchange Status"],
        "Exchange Incentive": item["Exchange Incentive"],
        "PerModel Incentive": item["PerModel Incentive"],
        "Model Incentive" : item["TotalModelIncentive"],

        //TODO
        "Extended Warranty Penetration": Math.round(item["EW Penetration"]),
        "Extended Warranty Count": item["EWPCount"],
        "Extended Warranty Incentive": item["EW Incentive"],

        "CCP Score": Math.round(item["CCP"]),
        "CCP Incentive": item["CCP Incentive"],

        //TODO
        "Total Discount": item["Discount"],//TODO Handle value result is not calculating
        "AVG. Discount": item["AVG. Discount"]?item["AVG. Discount"]:0,
        "Vehicle Incentive % Slabwise": item["Vehicle Incentive % Slabwise"],
        "Total Vehicle Incentive Amt. Slabwise": item["Total Vehicle Incentive Amt. Slabwise"],


        "MSSF Score": Math.round(item["MSSF"]),
        "MSSF Incentive": item["MSSF Incentive"],
        "MSR Score": Math.round(item["MSR"]),
        "MSR Incentive": item["MSR Incentive"],
        "Complaints": item["Complaints"],
        "Complaint Deduction": item["Complaint Deduction"],//TODO
        "Final Incentive": Math.round(grandTotal) > 0 ? Math.round(grandTotal):0,

      }
      finalExcelobjOldDSE.push(obj);
    })


    // Pushing Nonqualified OLD DSE objects to Final Object

    nonQualifiedRM.forEach((item) => {

    
      const grandTotal = 0;

      obj = {
        "DSE ID": item['DSE ID'],
        "DSE Name": item['DSE Name'],
        "BM AND TL NAME": item['BM AND TL NAME'],
        "Status": item["Status"],
        "Focus Model Qualification": item['Focus Model Qualification'],
        "ALTO": item['ALTO'],
        "ALTO K-10": item['ALTO K-10'],
        "S-Presso": item['S-Presso'],
        "CELERIO": item['CELERIO'],
        "WagonR": item['WagonR'],
        "BREZZA": item['BREZZA'],
        "DZIRE": item['DZIRE'],
        "EECO": item['EECO'],
        "Ertiga": item['Ertiga'],
        "SWIFT": item['SWIFT'],
        "Grand Total": item["Grand Total"],
        "Vehicle Incentive": item["Total PerCar Incentive"],
        "Special Car Incentive": item['SpecialCar Incentive'],
        "Total Vehicle Incentive": item["Total PerCar Incentive"] + item['Special Car Incentive'],
        "Super Car Incentive Qualification": getIncentiveValue(item, "Super Car Incentive") ? "YES" : "NO",
         "Super Car Incentive": 0,
        "CDI Score": getIncentiveValue(item, "CDI Score"),//TODO Handle NAN values
        "CDI Incentive": item["CDI Incentive"],
        "Total MGA": (item['TOTAL MGA']) ? item['TOTAL MGA'] : 0,
        "MGA/Vehicle": Math.round(item["MGA"]),
        "MGA Incentive": Math.round(item["MGA Incentive"]),
        "Exchange Count": item["Exchange Status"],
        "Exchange Incentive": item["Exchange Incentive"],
        "Model Incentive" : item["TotalModelIncentive"],
        "PerModel Incentive": item["PerModel Incentive"],

        //TODO
        "Extended Warranty Penetration": Math.round(item["EW Penetration"]),
        "Extended Warranty Count": item["EWPCount"],
        "Extended Warranty Incentive": item["EW Incentive"],

        "CCP Score": Math.round(item["CCP"]),
        "CCP Incentive": item["CCP Incentive"],

        //TODO
        "Total Discount": item["Discount"],//TODO Handle value result is not calculating
        "AVG. Discount": item["AVG. Discount"]?item["AVG. Discount"]:0,
        "Vehicle Incentive % Slabwise": item["Vehicle Incentive % Slabwise"],
        "Total Vehicle Incentive Amt. Slabwise": item["Total Vehicle Incentive Amt. Slabwise"],


        "MSSF Score": Math.round(item["MSSF"]),
        "MSSF Incentive": item["MSSF Incentive"],
        "MSR Score": Math.round(item["MSR"]),
        "MSR Incentive": item["MSR Incentive"],
        "Complaints": item["Complaints"],
        "Complaint Deduction": item["Complaint Deduction"],//TODO
        "Final Incentive": Math.round(grandTotal),

      }
      finalExcelobjOldDSE.push(obj);
    })



    // Pushing New DSE objects to Final Object
   
    newRm.forEach((item) => {


      // const grandTotal =
      // getIncentiveValue(item, "Total Vehicle Incentive Amt. Slabwise") +
      // getIncentiveValue(item, "CDI Incentive") +
      // getIncentiveValue(item, "EW Incentive") +
      // getIncentiveValue(item, "CCP Incentive") +
      // getIncentiveValue(item, "MSSF Incentive") +
      // getIncentiveValue(item, "MSR Incentive") +
      // getIncentiveValue(item, "Exchange Incentive") +
      // getIncentiveValue(item, "Complaint Deduction") +
      // getIncentiveValue(item, "Super Car Incentive") +
      // getIncentiveValue(item, "MGA Incentive")+
      // getIncentiveValue(item, 'Vehicle Incentive');








      obj = {
        "DSE ID": item['DSE ID'],
        "DSE Name": item['DSE Name'],
        "BM AND TL NAME": item['BM AND TL NAME'],
        "Status": item["Status"],
        "Focus Model Qualification": item['Focus Model Qualification'],
        "ALTO": item['ALTO'],
        "ALTO K-10": item['ALTO K-10'],
        "S-Presso": item['S-Presso'],
        "CELERIO": item['CELERIO'],
        "WagonR": item['WagonR'],
        "BREZZA": item['BREZZA'],
        "DZIRE": item['DZIRE'],
        "EECO": item['EECO'],
        "Ertiga": item['Ertiga'],
        "SWIFT": item['SWIFT'],
        "Grand Total": item["Grand Total"],
        "Vehicle Incentive": item["Vehicle Incentive"],
        "Special Car Incentive": item['SpecialCar Incentive'],
        "Total Vehicle Incentive": item["Vehicle Incentive"],
        "Super Car Incentive Qualification": getIncentiveValue(item, "Super Car Incentive") ? "YES" : "NO",
        "Super Car Incentive": getIncentiveValue(item, "Super Car Incentive"),
        "CDI Score": getIncentiveValue(item, "CDI Score"),//TODO Handle NAN values
        "CDI Incentive": item["CDI Incentive"],
        "Total MGA": (item['TOTAL MGA']) ? item['TOTAL MGA'] : 0,
        "MGA/Vehicle": Math.round(item["MGA"]),
        "MGA Incentive": Math.round(item["MGA Incentive"]),
        "Exchange Count": item["Exchange Status"],
        "Exchange Incentive": item["Exchange Incentive"],
        "Model Incentive" : item["TotalModelIncentive"],
        "PerModel Incentive": item["PerModel Incentive"],

        //TODO
        "Extended Warranty Penetration": Math.round(item["EW Penetration"]),
        "Extended Warranty Count": item["EWPCount"],
        "Extended Warranty Incentive": item["EW Incentive"],

        "CCP Score": Math.round(item["CCP"]),
        "CCP Incentive": item["CCP Incentive"],

        //TODO
        "Total Discount": item["Discount"],//TODO Handle value result is not calculating
        "AVG. Discount": item["AVG. Discount"]?item["AVG. Discount"]:0,
        "Vehicle Incentive % Slabwise": item["Vehicle Incentive % Slabwise"],
        "Total Vehicle Incentive Amt. Slabwise": item["Total Vehicle Incentive Amt. Slabwise"],


        "MSSF Score": Math.round(item["MSSF"]),
        "MSSF Incentive": item["MSSF Incentive"],
        "MSR Score": Math.round(item["MSR"]),
        "MSR Incentive": item["MSR Incentive"],
        "Complaints": item["Complaints"],
        "Complaint Deduction": item["Complaint Deduction"],//TODO
        "Final Incentive": item["Final Incentive"],
        // "Final Incentive": parseInt(grandTotal)

      }
      finalExcelobjOldDSE.push(obj);
    })




    event.reply("dataForExcel", finalExcelobjOldDSE);

    // event.reply("newDSEIncentiveDataSheet", newDSEIncentiveDataSheet);
    const oldDSE = "oldDSE";

    // const newDSE = "newDSE";
    creatExcel(finalExcelobjOldDSE, oldDSE);

    // creatExcel(newDSEIncentiveDataSheet, newDSE);

    MGAdata = [];
    CDIdata = [];
    salesExcelDataSheet = [];
    employeeStatusDataSheet = [];
    newDSEIncentiveDataSheet = []
    qualifiedRM = [];
    nonQualifiedRM = [];
    newRm = [];
    finalExcelobjOldDSE = []
  }

});

const creatExcel = (dataForExcelObj, text) => {
  // console.log("text :: ", text);
  const nowDate = new Date();
  const month = nowDate.getMonth() + 1;
  const date = nowDate.getDate();
  const year = nowDate.getFullYear();
  const time = nowDate.toLocaleTimeString().replace(/:/g, '-');

  const newWorkbook = XLSX.utils.book_new();
  const newSheet = XLSX.utils.json_to_sheet(dataForExcelObj);
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");

  const fileName = calculatedIncentive_${text}_${date}-${month}-${year}_${time}.xlsx;
  const folderPath = "./DataSheets";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    // console.log(Directory ${folderPath} created.);
  } else {
    // console.log(Directory ${folderPath} already exists.);
  }
  XLSX.writeFile(newWorkbook, ./DataSheets/${fileName});

}

ipcMain.on('file-selected-salesExcel', (event, path) => {

  //sales datasheet
  const workbook = XLSX.readFile(path);
  const salesSheetName = workbook.SheetNames[0];
  const salesSheet = workbook.Sheets[salesSheetName];
  let salesSheetData = XLSX.utils.sheet_to_json(salesSheet);
  salesSheetData = transformKeys(salesSheetData);
  salesSheetData = trimValuesArray(salesSheetData);

  const keysToCheckInsalesexcel = ["Model Name", "DSE ID", "DSE Name", "BM AND TL NAME", "Insurance", "Extended Warranty", "Autocard", "CCP PLUS", "FINAL DISCOUNT"
  ];

  const missingKeyForSalesExcel = checkKeys(salesSheetData, keysToCheckInsalesexcel);
  // console.log("missingKeyForSalesExcel")
  // console.log(missingKeyForSalesExcel)
  if (missingKeyForSalesExcel) {
    KeyMissing = true;
    event.reply("formateAlertSalesExcel", missingKeyForSalesExcel);
  }

  //salesExcel
  salesSheetData.shift();
  let groupedData = {};
  salesSheetData.forEach(row => {
    const dseId = row['DSE ID'];
    if (!groupedData[dseId]) {
      groupedData[dseId] = [];
    }
    groupedData[dseId].push(row);
  });
  for (const key in groupedData) {
    if (groupedData.hasOwnProperty(key)) {
      const obj = {};
      obj[key] = groupedData[key];
      salesExcelDataSheet.push(obj);
    }
  }



  //MGA Datasheet
  const MGAsheetName = workbook.SheetNames[2];
  const MGAsheet = workbook.Sheets[MGAsheetName];
  const options = {
    range: 3
  };
  let MGAsheetData = XLSX.utils.sheet_to_json(MGAsheet, options);
  MGAsheetData = transformKeys(MGAsheetData);
  MGAsheetData = trimValuesArray(MGAsheetData);


  const keysToCheckInMGAexcel = ["DSE NAME", "ID", "MGA/VEH", "TOTAL MGA SALE DDL", "MGA SALE FOR ARGRIMENT"];

  const missingKeyForMGAExcel = checkKeys(MGAsheetData, keysToCheckInMGAexcel);
  

  if (missingKeyForMGAExcel) {
    KeyMissing = true;
    event.reply("formateAlertMGAExcel", missingKeyForMGAExcel);
  }



  MGAsheetData.forEach((MGArow) => {

    if (MGArow.hasOwnProperty("ID")) {
      MGAdata.push(MGArow);
    }
  })




  //employe Status Sheet
  const employeeStatusSheetName = workbook.SheetNames[3];
  const employeeStatusSheet = workbook.Sheets[employeeStatusSheetName];
  employeeStatusDataSheet = XLSX.utils.sheet_to_json(employeeStatusSheet);

  employeeStatusDataSheet = transformKeys(employeeStatusDataSheet);
  employeeStatusDataSheet = trimValuesArray(employeeStatusDataSheet);


  const keysToCheckInStatusexcel = ["DSE", "STATUS", "DSE ID"];

  const missingKeyForStatusExcel = checkKeys(employeeStatusDataSheet, keysToCheckInStatusexcel);
 

  if (missingKeyForStatusExcel) {
    KeyMissing = true;
    event.reply("formateAlertStatusExcel", missingKeyForStatusExcel);
  }


  // console.log("Object inside array employeeStatus", JSON.stringify(employeeStatusDataSheet));


});

ipcMain.on('file-selected-CDIScore', (event, path) => {

  const workbook = XLSX.readFile(path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const CDIsheetData = XLSX.utils.sheet_to_json(sheet);
  CDIdata = CDIsheetData;
  CDIdata = transformKeys(CDIdata);
  CDIdata = trimValuesArray(CDIdata);
  const keysToCheckInCDIexcel = ["DSE ID", "DSE", "CDI"];

  const missingKeyForCDIExcel = checkKeys(CDIdata, keysToCheckInCDIexcel);
  
  if (missingKeyForCDIExcel) {
    KeyMissing = true;
    event.reply("formateAlertCDIExcel", missingKeyForCDIExcel);
  }


});



app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});