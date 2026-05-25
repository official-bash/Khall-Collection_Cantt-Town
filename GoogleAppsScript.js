// ==========================================
// 💡 GOOGLE APPS SCRIPT FOR YOUR SPREADSHEET
// ==========================================
// Copy and paste this complete code into your Google Apps Script editor.
// To open it: Go to Google Sheets > Extensions > Apps Script.
//
// ⚠️ AFTER PASTING:
// 1. Click Save (Floppy disk icon).
// 2. Click "Deploy" > "Manage deployments".
// 3. Click the Pencil icon (Edit) next to the active deployment.
// 4. In "Version", choose "New Version".
// 5. Click "Deploy". This is critical so the web app runs the latest code!

// ✅ Your Spreadsheet ID (from the URL of your Google Sheet)
const SPREADSHEET_ID = '1eCvJOfecwT3Kh3n08yHPEIi0JgvCc5s7iudkmKvYQJs';

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getData") {
    return getData();
  }
  
  if (action === "updateLocation") {
    return updateLocation(e.parameter);
  }
  
  return makeJsonResponse({
    status: "error",
    message: "Invalid action"
  });
}

function getData() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0]; // Always use the first sheet
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var jsonData = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var record = {};
      var hasValues = false;
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        if (header) {
          // Convert cell value to string to avoid type issues with numbers/dates
          var cellValue = row[j];
          if (cellValue instanceof Date) {
            cellValue = cellValue.toLocaleDateString();
          }
          record[header] = (cellValue !== null && cellValue !== undefined) ? String(cellValue) : "";
          if (row[j] !== "") {
            hasValues = true;
          }
        }
      }
      if (hasValues) {
        jsonData.push(record);
      }
    }
    
    return makeJsonResponse({
      status: "success",
      data: jsonData
    });
       
  } catch (error) {
    return makeJsonResponse({
      status: "error",
      message: error.toString()
    });
  }
}

function updateLocation(params) {
  try {
    var uc = params.uc;
    var srNo = params.srNo;
    var mapLink = params.mapLink;
    var cordinates = params.cordinates;
    var password = params.password;
    
    if (!srNo || !password) {
      return makeJsonResponse({ status: "error", message: "Missing required parameters" });
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheets()[0]; // Always use the first sheet
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Find column indexes
    var srNoColIdx = headers.indexOf("نمبر شمار");
    var mobileColIdx = headers.indexOf("موبائل نمبر");
    var mapLinkColIdx = headers.indexOf("Google Map Link");
    var cordinatesColIdx = headers.indexOf("cordinates");
    
    if (srNoColIdx === -1) {
      return makeJsonResponse({ status: "error", message: "Serial number column ('نمبر شمار') not found in sheet" });
    }
    if (mobileColIdx === -1) {
      return makeJsonResponse({ status: "error", message: "Mobile number column ('موبائل نمبر') not found in sheet" });
    }
    if (mapLinkColIdx === -1) {
      return makeJsonResponse({ status: "error", message: "Map Link column ('Google Map Link') not found in sheet" });
    }
    if (cordinatesColIdx === -1) {
      return makeJsonResponse({ status: "error", message: "Coordinates column ('cordinates') not found in sheet" });
    }
    
    // Find row by matching serial number
    var targetRowIdx = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][srNoColIdx]).trim() === String(srNo).trim()) {
        targetRowIdx = i + 1; // 1-based index including header
        break;
      }
    }
    
    if (targetRowIdx === -1) {
      return makeJsonResponse({ status: "error", message: "Serial number '" + srNo + "' not found in sheet" });
    }
    
    // Verify password (last 4 digits of mobile number)
    var mobileNumber = String(data[targetRowIdx - 1][mobileColIdx]).trim();
    // Strip non-digit characters from mobile number to be safe
    var cleanMobile = mobileNumber.replace(/\D/g, "");
    var cleanPassword = String(password).trim();
    
    if (cleanMobile.length < 4) {
      return makeJsonResponse({ status: "error", message: "Mobile number in sheet is too short to verify password" });
    }
    
    var last4 = cleanMobile.substring(cleanMobile.length - 4);
    if (last4 !== cleanPassword) {
      return makeJsonResponse({ status: "error", message: "غلط پاس ورڈ! برائے مہربانی درست پاس ورڈ درج کریں۔ / Incorrect password! Please enter the correct password." });
    }
    
    // Update cells
    sheet.getRange(targetRowIdx, mapLinkColIdx + 1).setValue(mapLink);
    sheet.getRange(targetRowIdx, cordinatesColIdx + 1).setValue(cordinates);
    
    return makeJsonResponse({ status: "success" });
    
  } catch (error) {
    return makeJsonResponse({ status: "error", message: error.toString() });
  }
}

// ✅ FIXED: Removed invalid .setHeader() call.
// Google Apps Script ContentService does NOT support .setHeader().
// CORS headers are handled automatically by Google for deployed web apps.
function makeJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
