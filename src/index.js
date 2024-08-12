const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const XLSX = require("xlsx");
const writeXlsxFile = require("write-excel-file/node");
const { isContext } = require("node:vm");
const fs = require("fs");
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "Nimar Motors Khargone",
    // width: 1290,
    // height: 1080,
    icon: path.join(__dirname, "./assets/NimarMotor.png"),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("reset-application", () => {
    mainWindow.reload();
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
  });

  ipcMain.on("reset-app", () => {
    if (mainWindow) {
      KeyMissing = false;

      mainWindow.reload();
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // mainWindow.webContents.openDevTools();
};

//Separate Calculation Functions for Each type incentive
const MGAfunc = require("./functions/MGACalculation");
const CDIfunc = require("./functions/CDICalculation");
const EWfunc = require("./functions/EWCalculation");
const CCPfunc = require("./functions/CCPCalculation");
const MSSFfunc = require("./functions/MSSFCalculation");
const DiscountFunc = require("./functions/DiscountCalculation");
const ExchangeFunc = require("./functions/ExchangeStatusCalculation");
const ComplaintFunc = require("./functions/ComplaintCalculation");
const PerModelCarFunc = require("./functions/PerModelCalculation");
const ProductivityIncentive = require("./functions/ProductivityIncentiveCalculation");
const SpecialCarFunc = require("./functions/SpecialCarCalculation");
const PerCarFunc = require("./functions/PerCarCalculation");
const MSRFunc = require("./functions/MSRCalculation");
const SuperCarFunc = require("./functions/SuperCarCalculation");
const NewDSEincentiveCalculation = require("./functions/NewDSEincentiveCalculation");
const ModelWiseNumberFunc = require("./functions/ModelNumberWiseCalculation");
const EBFunc = require("./functions/EBCalculation");
const GNAfunc = require("./functions/GNACalculation");

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
let path1;
let path2;

let newVariantlist = [];

ipcMain.on("newVariantlist", (event, data) => {
  newVariantlist = data;
});

// Function to check if the Key value of CDI/MGA and DSE Excel data is in correct form or not
function checkKeys(array, keys) {
  const firstObject = array[0];
  const missingKeys = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (firstObject) {
      if (!firstObject.hasOwnProperty(key)) {
        missingKeys.push(key);
      }
    }
  }
  return missingKeys.length > 0 ? missingKeys : null;
}

// function to remove whiteSpaces from DSE Excel Data Column name or keys
function transformKeys(array) {
  return array.map((obj) => {
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
  return arr.map((obj) => {
    const trimmedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        trimmedObj[key] = value.trim();
      } else {
        trimmedObj[key] = value;
      }
    }
    return trimmedObj;
  });
}

// Function to check qualification based on selected checkboxes
function checkQualification(selectedCars,dataArray) {
  // Create an array of model names associated with the ID
  const modelNames = dataArray.map(entry => entry["model name"]);

  // Check if all selected cars (model names) are present in the modelNames array
  return selectedCars.every(car => modelNames.includes(car));
}



// Function to check if the DSE is qualifying based on the FormData inputs

const checkQualifingCondition = (formData, employeeStatusDataSheet) => {
  salesExcelDataSheet.forEach((item) => {
    let numberCheck = 0;
    let Discount = 0;
    let gna = 0;
    let gnaDeduction = 0;
    let mgaDeduction = 0;
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
      ALTO: 0,
      "ALTO K-10": 0,
      "S-Presso": 0,
      CELERIO: 0,
      WagonR: 0,
      BREZZA: 0,
      DZIRE: 0,
      EECO: 0,
      Ertiga: 0,
      SWIFT: 0,
      BALENO: 0,
      FRONX: 0,
      CIAZ: 0,
      "G.VITARA": 0,
      "XL-6": 0,
      IGNIS: 0,
      JIMNY: 0,
      INVICTO: 0,
    };
    if (newVariantlist) {
      newVariantlist.forEach((variant) => {
        carObj[variant] = 0;
      });
    }
    const DSE_NoOfSoldCarExcelDataArr = Object.values(item)[0];


    // console.log(DSE_NoOfSoldCarExcelDataArr);
    // check OLD / NEW DSE
    let empStatus = true;
    // console.log(employeeStatusDataSheet)

    if (employeeStatusDataSheet) {
      employeeStatusDataSheet.forEach((employee) => {
        if (employee["dse id"] == DSE_NoOfSoldCarExcelDataArr[0]["dse id"]) {
          if (employee["status"] === "NEW") empStatus = false;
        }
      });
    }

    obj = {
      "DSE ID": DSE_NoOfSoldCarExcelDataArr[0]["dse id"],
      "DSE Name": DSE_NoOfSoldCarExcelDataArr[0]["dse name"],
      "BM AND TL NAME": DSE_NoOfSoldCarExcelDataArr[0]["bm and tl name"],
      Status: "OLD",
      "Focus Model Qualification": "No",
      ...carObj,
      "Grand Total": 0,
      "Vehicle Incentive ": 0,
      "Special Car Incentive": 0,
      "Total Vehicle Incentive": 0,
      "Total PerCar Incentive": 0,
      "EarlyBird Incentive": 0,
      "GNA Incentive": 0,
      "GNAPerVehicleDeduction":0,
      "Super Car Incentive Qualification": 0,
      TotalModelIncentive: 0,
      "PerModel Incentive": 0,
      "SpecialCar Incentive": 0,
      "Vehicle Incentive": 0,
      "CDI Score": 0,
      "CDI Incentive": 0,
      "CCP Score": 0,
      "CCP Incentive": 0,
      "MSSF Score": 0,
      "MSSF Incentive": 0,
      "MSR Score": 0,
      MGA: 0,
      "MSR Incentive": 0,
      "EW Incentive": 0,
      "Total Discount": 0,
      "Vehicle Incentive % Slabwise": 0,
      "Total Vehicle Incentive Amt. Slabwise": 0,
      "Exchange Incentive": 0,
      "Complaint Deduction": 0,
      "MGA/Vehicle": 0,
      "MGA Incentive": 0,
      "Final Incentive":0
    };
    empStatus = true;
    if (empStatus) {


      DSE_NoOfSoldCarExcelDataArr.forEach((sold) => {
        if (parseInt(sold["final discount"]) > 0) {
          Discount += parseInt(sold["final discount"]);
        }
        // console.log("gna ::::",sold['gna'])
        if (parseInt(sold["gna"]) > 0) {
          gna += parseInt(sold["gna"]);
        }else{

          gnaDeduction++;


        }

        //MGA Total and deduction check 
        // if (parseInt(sold["mga"]) > 0) {
        //   mga += parseInt(sold["mgaa"]);
        // }else{
        //   mgaDeduction++;
        // }

        carObj[sold["model name"]]++;

        if (parseInt(sold["final discount"]) > 0) {
          DiscountCount++;
        }
        if (parseInt(sold["ccp plus"]) > 0) {
          CCPcheck++;
        }
        if (sold["financer remark"] == "MSSF" || sold["financer remark"] > 0 ) {
          MSSFcheck++;
        }
        if (parseInt(sold["extended warranty"]) > 0) {
          EWPCheck++;
        }
        if (sold["exchange status"] == "YES" || sold["exchange status"] == "yes" || sold["exchange status"] > 0) {
          ExchangeStatusCheck++;
        }
        if ( sold["complaint status"] == "YES" || sold["complaint status"] == "yes" ||  sold["complaint status"] > 0 ) {
          ComplaintCheck++;
        }
        if (sold["autocard"] == "YES" || sold["autocard"] == "yes" || sold["autocard"] > 0) {
          MSRcheck++;
        }
        TotalNumberCheck++;

        if (formData.QC.focusModel.includes(sold["model name"])) {
          numberCheck++;
        }
        if (formData.QC.autoCard == "yes") {
          if (sold["autocard"] == "YES" || sold["autocard"] > 0) {
            autoCardCheck++;
          }
        }
        if (formData.QC.EW == "yes") {
          if (sold["extended warranty"] > 0) {
            EWCheck++;
          }
        }
      });

     


      if(formData.QCType == 'ANDType'){

        const QCAndType = checkQualification(formData.QC.focusModel,DSE_NoOfSoldCarExcelDataArr);

        if(QCAndType && numberCheck >= formData.QC.numOfCars){
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
          if (
            (autoCardCheck / TotalNumberCheck) * 100 >=
            formData.QC.autocardPercent
          )
            autoCardFlag = true;
          else {
            autoCardFlag = false;
          }
        }

        //checking Extended warranty checked
        if (formData.QC.EW === "yes") {
          //if % is greater or equal then qualify
          if ((EWCheck / TotalNumberCheck) * 100 >= formData.QC.ewdPercent)
            EWFlag = true;
          else {
            EWFlag = false;
          }
        }

        //checking CCP checked
        if (formData.QC.CCPCheck === "yes") {
          //if % is greater or equal then qualify
          if ((CCPcheck / TotalNumberCheck) * 100 >= formData.QC.CCPPercent)
            CCPFlag = true;
          else {
            CCPFlag = false;
          }
        }

        //checking MSSF checked
        if (formData.QC.MSSFCheck === "yes") {
          //if % is greater or equal then qualify
          if ((MSSFcheck / TotalNumberCheck) * 100 >= formData.QC.MSSFPercent)
            MSSFFlag = true;
          else {
            MSSFFlag = false;
          }
        }

        //checking MGA checked
        if (formData.QC.MGACheck === "yes") {
          //if % is greater or equal then qualify
          let MGAAmountForQC = 0;
          const result = searchByID(
            MGAdata,
            DSE_NoOfSoldCarExcelDataArr[0]["dse id"]
          );
          if (result) {
            MGAAmountForQC = result["mga/veh"];
            if (MGAAmountForQC >= formData.QC.MGAAmount) MGAFlag = true;
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
          if (AvgDiscount <= formData.QC.DiscountAmount) DiscountFlag = true;
          else DiscountFlag = false;
        }

        //checking Exchange checked
        if (formData.QC.ExchangeCheck === "yes") {
          //if % is greater or equal then qualify

          if (ExchangeStatusCheck >= formData.QC.ExchangeCount)
            ExchangeFlag = true;
          else ExchangeFlag = false;
        }

        //checking Complaint checked
        if (formData.QC.ComplaintCheck === "yes") {
          //if % is greater or equal then qualify
          if (ComplaintCheck <= formData.QC.ComplaintCount) ComplainFlag = true;
          else ComplainFlag = false;
        }

        // check final qulification
        if ( EWFlag &&
          autoCardFlag &&
          CCPFlag &&
          MSSFFlag &&
          MGAFlag &&
          DiscountFlag &&
          ExchangeFlag &&
          ComplainFlag
        ) {
          obj = {
            ...obj,
            ...carObj,
            Status: "OLD",
            "Focus Model Qualification": "YES",
            Discount: Discount > 0 ? Discount : 0,
            "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
            gna: gna > 0 ? gna : 0,
            gnaDeduct: gnaDeduction,
            "Exchange Status": ExchangeStatusCheck,
            Complaints: ComplaintCheck,
            "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
            MSR: (MSRcheck / TotalNumberCheck) * 100,
            CCP: (CCPcheck / TotalNumberCheck) * 100,
            MSSF: (MSSFcheck / TotalNumberCheck) * 100,
            MSSFCount: MSSFcheck,
            EWPCount: EWPCheck,
            MSRCount: MSRcheck,
            CCPCount: CCPcheck,
            "Grand Total": TotalNumberCheck,
          };
          qualifiedRM.push(obj);
        }




        }else{

          obj = {
            ...obj,
            ...carObj,
            Status: "OLD",
            "Focus Model Qualification": "NO",
            Discount: Discount > 0 ? Discount : 0,
            "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
            gna: gna > 0 ? gna : 0,
            gnaDeduct: gnaDeduction,
            "Exchange Status": ExchangeStatusCheck,
            Complaints: ComplaintCheck,
            "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
            MSR: (MSRcheck / TotalNumberCheck) * 100,
            CCP: (CCPcheck / TotalNumberCheck) * 100,
            MSSF: (MSSFcheck / TotalNumberCheck) * 100,
            MSSFCount: MSSFcheck,
            EWPCount: EWPCheck,
            MSRCount: MSRcheck,
            CCPCount: CCPcheck,
            "Grand Total": TotalNumberCheck,
          };
          nonQualifiedRM.push(obj);

        }


      }else{

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
          if (
            (autoCardCheck / TotalNumberCheck) * 100 >=
            formData.QC.autocardPercent
          )
            autoCardFlag = true;
          else {
            autoCardFlag = false;
          }
        }

        //checking Extended warranty checked
        if (formData.QC.EW === "yes") {
          //if % is greater or equal then qualify
          if ((EWCheck / TotalNumberCheck) * 100 >= formData.QC.ewdPercent)
            EWFlag = true;
          else {
            EWFlag = false;
          }
        }

        //checking CCP checked
        if (formData.QC.CCPCheck === "yes") {
          //if % is greater or equal then qualify
          if ((CCPcheck / TotalNumberCheck) * 100 >= formData.QC.CCPPercent)
            CCPFlag = true;
          else {
            CCPFlag = false;
          }
        }

        //checking MSSF checked
        if (formData.QC.MSSFCheck === "yes") {
          //if % is greater or equal then qualify
          if ((MSSFcheck / TotalNumberCheck) * 100 >= formData.QC.MSSFPercent)
            MSSFFlag = true;
          else {
            MSSFFlag = false;
          }
        }

        //checking MGA checked
        if (formData.QC.MGACheck === "yes") {
          //if % is greater or equal then qualify
          let MGAAmountForQC = 0;
          const result = searchByID(
            MGAdata,
            DSE_NoOfSoldCarExcelDataArr[0]["dse id"]
          );
          if (result) {
            MGAAmountForQC = result["mga/veh"];
            if (MGAAmountForQC >= formData.QC.MGAAmount) MGAFlag = true;
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
          if (AvgDiscount <= formData.QC.DiscountAmount) DiscountFlag = true;
          else DiscountFlag = false;
        }

        //checking Exchange checked
        if (formData.QC.ExchangeCheck === "yes") {
          //if % is greater or equal then qualify

          if (ExchangeStatusCheck >= formData.QC.ExchangeCount)
            ExchangeFlag = true;
          else ExchangeFlag = false;
        }

        //checking Complaint checked
        if (formData.QC.ComplaintCheck === "yes") {
          //if % is greater or equal then qualify
          if (ComplaintCheck <= formData.QC.ComplaintCount) ComplainFlag = true;
          else ComplainFlag = false;
        }

        // check final qulification
        if ( EWFlag &&
          autoCardFlag &&
          CCPFlag &&
          MSSFFlag &&
          MGAFlag &&
          DiscountFlag &&
          ExchangeFlag &&
          ComplainFlag
        ) {
          obj = {
            ...obj,
            ...carObj,
            Status: "OLD",
            "Focus Model Qualification": "YES",
            Discount: Discount > 0 ? Discount : 0,
            "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
            gna: gna > 0 ? gna : 0,
            gnaDeduct: gnaDeduction,
            "Exchange Status": ExchangeStatusCheck,
            Complaints: ComplaintCheck,
            "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
            MSR: (MSRcheck / TotalNumberCheck) * 100,
            CCP: (CCPcheck / TotalNumberCheck) * 100,
            MSSF: (MSSFcheck / TotalNumberCheck) * 100,
            MSSFCount: MSSFcheck,
            EWPCount: EWPCheck,
            MSRCount: MSRcheck,
            CCPCount: CCPcheck,
            "Grand Total": TotalNumberCheck,
          };
          qualifiedRM.push(obj);
        }
      } else {
        //unqualified data

        obj = {
          ...obj,
          ...carObj,
          Status: "OLD",
          "Focus Model Qualification": "NO",
          Discount: Discount > 0 ? Discount : 0,
          "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
          gna: gna > 0 ? gna : 0,
          gnaDeduct: gnaDeduction,
          "Exchange Status": ExchangeStatusCheck,
          Complaints: ComplaintCheck,
          "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
          MSR: (MSRcheck / TotalNumberCheck) * 100,
          CCP: (CCPcheck / TotalNumberCheck) * 100,
          MSSF: (MSSFcheck / TotalNumberCheck) * 100,
          MSSFCount: MSSFcheck,
          EWPCount: EWPCheck,
          MSRCount: MSRcheck,
          CCPCount: CCPcheck,
          "Grand Total": TotalNumberCheck,
        };
        nonQualifiedRM.push(obj);
      }

    }


    } else {
      //New DSE data

      DSE_NoOfSoldCarExcelDataArr.forEach((sold) => {
        TotalNumberCheck++;

        if (parseInt(sold["final discount"]) > 0) {
          Discount += parseInt(sold["final discount"]);
        }
        if (parseInt(sold["gna"]) > 0) {
          gna += parseInt(sold["gna"]);
        }else{  
          gnaDeduction++;
        }

//MGA Total and deduction check 
        // if (parseInt(sold["mga"]) > 0) {
        //   mga += parseInt(sold["mgaa"]);
        // }else{
        //   mgaDeduction++;
        // }


        carObj[sold["model name"]]++;

        if (parseInt(sold["final discount"]) > 0) {
          DiscountCount++;
        }
        if (parseInt(sold["ccp plus"]) > 0) {
          CCPcheck++;
        }
        if (sold["financer remark"] == "MSSF") {
          MSSFcheck++;
        }
        if (parseInt(sold["extended warranty"]) > 0) {
          EWPCheck++;
        }
        if (
          sold["exchange status"] == "YES" ||
          sold["exchange status"] == "yes"
        ) {
          ExchangeStatusCheck++;
        }
        if (
          sold["complaint status"] == "YES" ||
          sold["complaint status"] == "yes"
        ) {
          ComplaintCheck++;
        }
        if (sold["autocard"] == "YES" || sold["autocard"] == "yes") {
          MSRcheck++;
        }
      });

      obj = {
        ...obj,
        ...carObj,
        Status: "NEW",
        "Focus Model Qualification": "NO",
        Discount: Discount > 0 ? Discount : 0,
        "AVG. Discount": Discount > 0 ? Discount / TotalNumberCheck : 0,
        gna: gna > 0 ? gna : 0,
        gnaDeduct: gnaDeduction,
        "Exchange Status": ExchangeStatusCheck,
        Complaints: ComplaintCheck,
        "EW Penetration": (EWPCheck / TotalNumberCheck) * 100,
        MSR: (MSRcheck / TotalNumberCheck) * 100,
        CCP: (CCPcheck / TotalNumberCheck) * 100,
        MSSF: (MSSFcheck / TotalNumberCheck) * 100,
        MSSFCount: MSSFcheck,
        EWPCount: EWPCheck,
        MSRCount: MSRcheck,
        CCPCount: CCPcheck,
        "Grand Total": TotalNumberCheck,
      };

      newRm.push(obj);
    }
  });
};

function getIncentiveValue(item, key) {
  return typeof item[key] === "number" || typeof item[key] == "NaN"
    ? Math.round(item[key])
    : 0;
}

function transformKeysToLower(data) {
  return data.map((obj) => {
    const transformedObj = {};
    Object.keys(obj).forEach((key) => {
      transformedObj[key.toLowerCase()] = obj[key];
    });
    return transformedObj;
  });
}

ipcMain.on("form-submit", (event, formData) => {
  console.log("Form Data Input", formData);
  // console.log(JSON.stringify(salesExcelDataSheet));

  if (formData.QC.numOfCars !== "" && formData.QC.focusModel.length !== 0) {
    if (!KeyMissing) {
      // console.log("formData", formData);

      // Calling Function to Check Qualification and Calculate eacch incentive of DSE

      checkQualifingCondition(formData, employeeStatusDataSheet);
      // newDSEIncentiveDataSheet = NewDSEincentiveCalculation(newRm, formData)
      qualifiedRM = PerCarFunc(qualifiedRM, formData);
      qualifiedRM = SpecialCarFunc(qualifiedRM, formData);
      qualifiedRM = EBFunc(qualifiedRM, formData, salesExcelDataSheet);
      qualifiedRM = PerModelCarFunc(qualifiedRM, formData, salesExcelDataSheet); //TODO
      qualifiedRM = ProductivityIncentive(qualifiedRM, formData); //TODO
      qualifiedRM = ModelWiseNumberFunc(qualifiedRM, formData);
      qualifiedRM = CDIfunc(qualifiedRM, CDIdata, formData); //TODO
      qualifiedRM = EWfunc(qualifiedRM, formData);
      qualifiedRM = CCPfunc(qualifiedRM, formData);
      qualifiedRM = GNAfunc(qualifiedRM, formData, salesExcelDataSheet);
      qualifiedRM = MSSFfunc(qualifiedRM, formData);
      qualifiedRM = MSRFunc(qualifiedRM, formData);
      qualifiedRM = ExchangeFunc(qualifiedRM, formData);
      qualifiedRM = MGAfunc(qualifiedRM, MGAdata, formData);
      qualifiedRM = SuperCarFunc(
        qualifiedRM,
        MGAdata,
        salesExcelDataSheet,
        formData
      );
      qualifiedRM = DiscountFunc(qualifiedRM, formData);
      qualifiedRM = ComplaintFunc(qualifiedRM, formData);


      newRm = NewDSEincentiveCalculation(newRm, formData);
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
      // console.log("qualifiedRM", qualifiedRM)
      // Pushing qualified OLD DSE objects to Final Object
      qualifiedRM.forEach((item) => {
        // if (item["Super Car Incentive"] === 'NaN') {
        //   item["Super Car Incentive"] = 0
        // }
        
        // const grandTotal =
        //   getIncentiveValue(item, "Total Vehicle Incentive Amt. Slabwise") +
        //   getIncentiveValue(item, "SpecialCar Incentive") +
        //   getIncentiveValue(item, "CDI Incentive") +
        //   getIncentiveValue(item, "EW Incentive") +
        //   getIncentiveValue(item, "CCP Incentive") +
        //   getIncentiveValue(item, "MSSF Incentive") +
        //   getIncentiveValue(item, "MSR Incentive") +
        //   getIncentiveValue(item,"Total Productivity Car Incentive")+
        //   getIncentiveValue(item,"GNA Incentive")+
        //   getIncentiveValue(item,"GNAPerVehicleDeduction")+
        //   // getIncentiveValue(item, "Discount Incentive") +
        //   getIncentiveValue(item, "Exchange Incentive") +
        //   // getIncentiveValue(item, "Vehicle Incentive")
        //   getIncentiveValue(item, "Complaint Deduction") +
        //   getIncentiveValue(item, "Super Car Incentive") +
        //   getIncentiveValue(item, "MGA Incentive");

        // getIncentiveValue(item, "TotalModelIncentive");
        obj = {
          "DSE ID": item["DSE ID"],
          "DSE Name": item["DSE Name"],
          "BM AND TL NAME": item["BM AND TL NAME"],
          Status: item["Status"],
          "Focus Model Qualification": item["Focus Model Qualification"],
          ALTO: item["ALTO"],
          "ALTO K-10": item["ALTO K-10"],
          "S-Presso": item["S-Presso"],
          CELERIO: item["CELERIO"],
          WagonR: item["WagonR"],
          BREZZA: item["BREZZA"],
          DZIRE: item["DZIRE"],
          EECO: item["EECO"],
          Ertiga: item["Ertiga"],
          SWIFT: item["SWIFT"],
          BALENO: item["BALENO"],
          FRONX: item["FRONX"],
          CIAZ: item["CIAZ"],
          "XL-6": item["XL-6"],
          IGNIS: item["IGNIS"],
          JIMNY: item["JIMNY"],
          INVICTO: item["INVICTO"],
          "G.VITARA": item["G.VITARA"],
          ...newVariantlist.reduce((acc, variant) => {
            acc[variant] = [];
            return acc;
          }, {}),
          "Grand Total": item["Grand Total"],
          "Vehicle Incentive":
            item["Total PerCar Incentive"] + item["PerModel Incentive"],
          "Special Car Incentive": item["SpecialCar Incentive"],
          "PerModel Incentive": item["PerModel Incentive"],
          "Model Incentive": getIncentiveValue(item, "TotalModelIncentive"),
          "Total Vehicle Incentive": (parseInt(item["Total PerCar Incentive"]) + parseInt(item["SpecialCar Incentive"]) + parseInt(item["TotalModelIncentive"]))? parseInt(item["Total PerCar Incentive"]) + parseInt(item["SpecialCar Incentive"]) + parseInt(item["TotalModelIncentive"]): 0,
          "EarlyBird Incentive": getIncentiveValue(item, "earlybird incentive"),
          // "GNA Incentive": item["GNA Incentive"],
          "Total Productivity Car Incentive": getIncentiveValue(
            item,
            "Total Productivity Car Incentive"
          ),
          "Super Car Incentive Qualification": getIncentiveValue(
            item,
            "Super Car Incentive"
          )
            ? "YES"
            : "NO",
          "Super Car Incentive": getIncentiveValue(item, "Super Car Incentive"),
          "CDI Score": getIncentiveValue(item, "CDI Score"), //TODO Handle NAN values
          "CDI Incentive": item["CDI Incentive"],
          "Total MGA": item["TOTAL MGA"] ? Math.round(item["TOTAL MGA"]) : 0,
          "MGA/Vehicle": Math.round(item["MGA"]),
          "MGA Incentive": Math.round(item["MGA Incentive"]),
          "Exchange Count": item["Exchange Status"],
          "Exchange Incentive": item["Exchange Incentive"],
          //TODO
          "Extended Warranty Penetration": Math.round(item["EW Penetration"]),
          "Extended Warranty Count": item["EWPCount"],
          "Extended Warranty Incentive": item["EW Incentive"],
          "CCP Score": Math.round(item["CCP"]),
          "CCP Incentive": item["CCP Incentive"],
          //TODO
          "Total Discount": item["Discount"], //TODO Handle value result is not calculating
          "AVG. Discount": item["AVG. Discount"]
            ? Math.round(item["AVG. Discount"])
            : 0,

            //discount
          "Vehicle Incentive % Slabwise": item["Vehicle Incentive % Slabwise"],
          "Total Vehicle Incentive Amt. Slabwise":
            item["Total Vehicle Incentive Amt. Slabwise"],
//GNA
"Total GNA": item["gna"],
            "Vehicle Incentive GNA % Slabwise GNA ": item["Vehicle Incentive % Slabwise GNA"],
          "Total Vehicle Incentive Amt. GNA Slabwise GNA":
            item["Total Vehicle Incentive Amt. Slabwise GNA"],
            "GNAPerVehicleDeduction": item["GNAPerVehicleDeduction"],


          "MSSF Score": Math.round(item["MSSF"]),
          "MSSF Incentive": item["MSSF Incentive"],
          "MSR Score": Math.round(item["MSR"]),
          "MSR Incentive": item["MSR Incentive"],
          Complaints: item["Complaints"],
          "Complaint Deduction": item["Complaint Deduction"], //TODO
          "Final Incentive":
            item["Final Incentive"] > 0 ? item["Final Incentive"] : 0,
        };

        newVariantlist.forEach((variant) => {
          obj[variant].push(item[variant]);
        });

        finalExcelobjOldDSE.push(obj);
      });
      // Pushing Nonqualified OLD DSE objects to Final Object
      nonQualifiedRM.forEach((item) => {
        const grandTotal = 0;
        obj = {
          "DSE ID": item["DSE ID"],
          "DSE Name": item["DSE Name"],
          "BM AND TL NAME": item["BM AND TL NAME"],
          Status: item["Status"],
          "Focus Model Qualification": item["Focus Model Qualification"],
          ALTO: item["ALTO"],
          "ALTO K-10": item["ALTO K-10"],
          "S-Presso": item["S-Presso"],
          CELERIO: item["CELERIO"],
          WagonR: item["WagonR"],
          BREZZA: item["BREZZA"],
          DZIRE: item["DZIRE"],
          EECO: item["EECO"],
          Ertiga: item["Ertiga"],
          SWIFT: item["SWIFT"],
          BALENO: item["BALENO"],
          FRONX: item["FRONX"],
          CIAZ: item["CIAZ"],
          "XL-6": item["XL-6"],
          IGNIS: item["IGNIS"],
          JIMNY: item["JIMNY"],
          INVICTO: item["INVICTO"],
          "G.VITARA": item["G.VITARA"],
          ...newVariantlist.reduce((acc, variant) => {
            acc[variant] = [];
            return acc;
          }, {}),
          "Grand Total": item["Grand Total"],
          "Vehicle Incentive": item["Total PerCar Incentive"],
          "Special Car Incentive": item["SpecialCar Incentive"],
          "PerModel Incentive": item["PerModel Incentive"],
          // "Model Incentive": item["TotalModelIncentive"],
          "Total Vehicle Incentive":
            item["Total PerCar Incentive"] + item["Special Car Incentive"],
          "EarlyBird Incentive": item["EarlyBird Incentive"],
          // // "GNA Incentive": item["GNA Incentive"],
          "Total Productivity Car Incentive": getIncentiveValue(
            item,
            "Total Productivity Car Incentive"
          ),
          "Super Car Incentive Qualification": getIncentiveValue(
            item,
            "Super Car Incentive"
          )
            ? "YES"
            : "NO",
          "Super Car Incentive": 0,
          "CDI Score": getIncentiveValue(item, "CDI Score"), //TODO Handle NAN values
          "CDI Incentive": item["CDI Incentive"],
          "Total MGA": item["TOTAL MGA"] ? Math.round(item["TOTAL MGA"]) : 0,
          "MGA/Vehicle": Math.round(item["MGA"]),
          "MGA Incentive": Math.round(item["MGA Incentive"]),
          "Exchange Count": item["Exchange Status"],
          "Exchange Incentive": item["Exchange Incentive"],

          //TODO
          "Extended Warranty Penetration": Math.round(item["EW Penetration"]),
          "Extended Warranty Count": item["EWPCount"],
          "Extended Warranty Incentive": item["EW Incentive"],
          "CCP Score": Math.round(item["CCP"]),
          "CCP Incentive": item["CCP Incentive"],
          //TODO
          "Total Discount": item["Discount"], //TODO Handle value result is not calculating
          "AVG. Discount": item["AVG. Discount"]
            ? Math.round(item["AVG. Discount"])
            : 0,
            //discount
          "Vehicle Incentive % Slabwise": item["Vehicle Incentive % Slabwise"],
          "Total Vehicle Incentive Amt. Slabwise":
            item["Total Vehicle Incentive Amt. Slabwise"],
            //GNA
            "Vehicle Incentive GNA % Slabwise GNA ": item["Vehicle Incentive % Slabwise GNA"],
          "Total Vehicle Incentive Amt. GNA Slabwise GNA":
            item["Total Vehicle Incentive Amt. Slabwise GNA"],
            "GNAPerVehicleDeduction": item["GNAPerVehicleDeduction"],
          "MSSF Score": Math.round(item["MSSF"]),
          "MSSF Incentive": item["MSSF Incentive"],
          "MSR Score": Math.round(item["MSR"]),
          "MSR Incentive": item["MSR Incentive"],
          Complaints: item["Complaints"],
          "Complaint Deduction": item["Complaint Deduction"], //TODO
          "Final Incentive": Math.round(grandTotal),
        };
        newVariantlist.forEach((variant) => {
          obj[variant].push(item[variant]);
        });

        finalExcelobjOldDSE.push(obj);
      });
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
          "DSE ID": item["DSE ID"],
          "DSE Name": item["DSE Name"],
          "BM AND TL NAME": item["BM AND TL NAME"],
          Status: item["Status"],
          "Focus Model Qualification": item["Focus Model Qualification"],
          ALTO: item["ALTO"],
          "ALTO K-10": item["ALTO K-10"],
          "S-Presso": item["S-Presso"],
          CELERIO: item["CELERIO"],
          WagonR: item["WagonR"],
          BREZZA: item["BREZZA"],
          DZIRE: item["DZIRE"],
          EECO: item["EECO"],
          Ertiga: item["Ertiga"],
          SWIFT: item["SWIFT"],
          BALENO: item["BALENO"],
          FRONX: item["FRONX"],
          CIAZ: item["CIAZ"],
          "XL-6": item["XL-6"],
          IGNIS: item["IGNIS"],
          JIMNY: item["JIMNY"],
          INVICTO: item["INVICTO"],
          "G.VITARA": item["G.VITARA"],
          ...newVariantlist.reduce((acc, variant) => {
            acc[variant] = [];
            return acc;
          }, {}),
          "Grand Total": item["Grand Total"],
          "Vehicle Incentive": item["Vehicle Incentive"],
          "Special Car Incentive": item["SpecialCar Incentive"],
          "PerModel Incentive": item["PerModel Incentive"],
          // "Model Incentive": item["TotalModelIncentive"],
          "Total Vehicle Incentive": item["Vehicle Incentive"],
          "EarlyBird Incentive": item["EarlyBird Incentive"],
          // "GNA Incentive": item["GNA Incentive"],
          "Total Productivity Car Incentive": getIncentiveValue(
            item,
            "Total Productivity Car Incentive"
          ),
          "Super Car Incentive Qualification": getIncentiveValue(
            item,
            "Super Car Incentive"
          )
            ? "YES"
            : "NO",
          "Super Car Incentive": getIncentiveValue(item, "Super Car Incentive"),
          "CDI Score": getIncentiveValue(item, "CDI Score"), //TODO Handle NAN values
          "CDI Incentive": item["CDI Incentive"],
          "Total MGA": item["TOTAL MGA"] ? Math.round(item["TOTAL MGA"]) : 0,
          "MGA/Vehicle": Math.round(item["MGA"]),
          "MGA Incentive": Math.round(item["MGA Incentive"]),
          "Exchange Count": item["Exchange Status"],
          "Exchange Incentive": item["Exchange Incentive"],

          //TODO
          "Extended Warranty Penetration": Math.round(item["EW Penetration"]),
          "Extended Warranty Count": item["EWPCount"],
          "Extended Warranty Incentive": item["EW Incentive"],
          "CCP Score": Math.round(item["CCP"]),
          "CCP Incentive": item["CCP Incentive"],
          //TODO
          "Total Discount": item["Discount"], //TODO Handle value result is not calculating
          "AVG. Discount": item["AVG. Discount"]
            ? Math.round(item["AVG. Discount"])
            : 0,
            //discount
          "Vehicle Incentive % Slabwise": item["Vehicle Incentive % Slabwise"],
          "Total Vehicle Incentive Amt. Slabwise":
            item["Total Vehicle Incentive Amt. Slabwise"],

            //GNA 
            "Vehicle Incentive GNA % Slabwise GNA ": item["Vehicle Incentive % Slabwise GNA"],
          "Total Vehicle Incentive Amt. GNA Slabwise GNA":
            item["Total Vehicle Incentive Amt. Slabwise GNA"],
            "GNAPerVehicleDeduction": item["GNAPerVehicleDeduction"],
          "MSSF Score": Math.round(item["MSSF"]),
          "MSSF Incentive": item["MSSF Incentive"],
          "MSR Score": Math.round(item["MSR"]),
          "MSR Incentive": item["MSR Incentive"],
          Complaints: item["Complaints"],
          "Complaint Deduction": item["Complaint Deduction"], //TODO
          "Final Incentive": item["Final Incentive"],
          // "Final Incentive": parseInt(grandTotal)
        };
        newVariantlist.forEach((variant) => {
          obj[variant].push(item[variant]);
        });

        finalExcelobjOldDSE.push(obj);
      });

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
      newDSEIncentiveDataSheet = [];
      qualifiedRM = [];
      nonQualifiedRM = [];
      newRm = [];
      finalExcelobjOldDSE = [];
    }
  }
});

const creatExcel = (dataForExcelObj, text) => {
  // console.log("text :: ", text);
  const nowDate = new Date();
  const month = nowDate.getMonth() + 1;
  const date = nowDate.getDate();
  const year = nowDate.getFullYear();
  const time = nowDate.toLocaleTimeString().replace(/:/g, "-");

  const newWorkbook = XLSX.utils.book_new();
  const newSheet = XLSX.utils.json_to_sheet(dataForExcelObj);
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");

  const fileName = `calculatedIncentive_${text}_${date}-${month}-${year}_${time}.xlsx`;
  const folderPath = "./DataSheets";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    // console.log(`Directory ${folderPath} created.`);
  } else {
    // console.log(`Directory ${folderPath} already exists.`);
  }
  XLSX.writeFile(newWorkbook, `./DataSheets/${fileName}`);
};




ipcMain.on("file-selected-salesExcel", (event, path) => {
  path1 = path;

  //sales datasheet
  if (path) {
    const workbook = XLSX.readFile(path);
    const salesSheetName = workbook.SheetNames[0];
    const salesSheet = workbook.Sheets[salesSheetName];
    let salesSheetData = XLSX.utils.sheet_to_json(salesSheet);
    salesSheetData = transformKeys(salesSheetData);
    salesSheetData = trimValuesArray(salesSheetData);

    salesSheetData = transformKeysToLower(salesSheetData);

    // const keysToCheckInsalesexcel = [
    //   "Model Name",
    //   "DSE ID",
    //   "DSE Name",
    //   "BM AND TL NAME",
    //   "Insurance",
    //   "Extended Warranty",
    //   "CASH ACCESSORIES",
    //   "Autocard",
    //   "CCP PLUS",
    //   "FINAL DISCOUNT",
    // ];

    const keysToCheckInsalesexcel = [
      "model name",
      "dse id",
      "dse name",
      "bm and tl name",
      "insurance",
      "extended warranty",
      "cash accessories",
      "autocard",
      "ccp plus",
      "final discount",
    ];



    const missingKeyForSalesExcel = checkKeys(
      salesSheetData,
      keysToCheckInsalesexcel
    );
    
    if (missingKeyForSalesExcel) {
      KeyMissing = true;
      event.reply("formateAlertSalesExcel", missingKeyForSalesExcel);
    }

    //salesExcel
    // salesSheetData.shift();
    let groupedData = {};
    salesSheetData.forEach((row) => {
      const dseId = row["dse id"];
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
      range: 3,
    };
    let MGAsheetData = XLSX.utils.sheet_to_json(MGAsheet, options);
    MGAsheetData = transformKeys(MGAsheetData);
    MGAsheetData = trimValuesArray(MGAsheetData);

    MGAsheetData = transformKeysToLower(MGAsheetData);

    // const keysToCheckInMGAexcel = [
    //   "DSE NAME",
    //   "ID",
    //   "MGA/VEH",
    //   "TOTAL MGA SALE DDL",
    //   "MGA SALE FOR ARGRIMENT",
    // ];

    const keysToCheckInMGAexcel = [
      "dse name",
      "id",
      "mga/veh",
      "total mga sale ddl",
      "mga sale for argriment",
    ];

    const missingKeyForMGAExcel = checkKeys(
      MGAsheetData,
      keysToCheckInMGAexcel
    );

    if (missingKeyForMGAExcel) {
      KeyMissing = true;
      event.reply("formateAlertMGAExcel", missingKeyForMGAExcel);
    }

    MGAsheetData.forEach((MGArow) => {
      if (MGArow.hasOwnProperty("id")) {
        MGAdata.push(MGArow);
      }
    });

    //employe Status Sheet
    const employeeStatusSheetName = workbook.SheetNames[3];
    const employeeStatusSheet = workbook.Sheets[employeeStatusSheetName];
    employeeStatusDataSheet = XLSX.utils.sheet_to_json(employeeStatusSheet);

    employeeStatusDataSheet = transformKeys(employeeStatusDataSheet);
    employeeStatusDataSheet = trimValuesArray(employeeStatusDataSheet);


    employeeStatusDataSheet = transformKeysToLower(employeeStatusDataSheet);

    // const keysToCheckInStatusexcel = [
    // "DSE",
    // "STATUS",
    // "DSE ID"
    // ];

    const keysToCheckInStatusexcel = ["dse", "status", "dse id"];

    const missingKeyForStatusExcel = checkKeys(
      employeeStatusDataSheet,
      keysToCheckInStatusexcel
    );

    if (missingKeyForStatusExcel) {
      KeyMissing = true;
      event.reply("formateAlertStatusExcel", missingKeyForStatusExcel);
    }
  }

  // console.log("Object inside array employeeStatus", JSON.stringify(employeeStatusDataSheet));
});

ipcMain.on("file-selected-CDIScore", (event, path) => {
  path2 = path;
  if (path) {
    const workbook = XLSX.readFile(path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const CDIsheetData = XLSX.utils.sheet_to_json(sheet);
    CDIdata = CDIsheetData;
    CDIdata = transformKeys(CDIdata);
    CDIdata = trimValuesArray(CDIdata);

    CDIdata = transformKeysToLower(CDIdata);

    // console.log(CDIdata)
    // const keysToCheckInCDIexcel = ["DSE ID", "DSE", "CDI"];


    const keysToCheckInCDIexcel = ["dse id", "dse", "cdi"];

    const missingKeyForCDIExcel = checkKeys(CDIdata, keysToCheckInCDIexcel);
    // console.log("missingKeyForCDIExcel")
    // console.log(missingKeyForCDIExcel)
    if (missingKeyForCDIExcel) {
      KeyMissing = true;
      event.reply("formateAlertCDIExcel", missingKeyForCDIExcel);
    }
  }
  // console.log("Object inside array CDI Score", CDIdata);
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
