const sheetName = 'Form Responses'; // Change this to your sheet name
const folderId = '1zaBmGCb_E0WEhHnWGIlehM_6OrFA9i8j'; // Replace with your Google Drive folder ID

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = doc.getSheetByName(sheetName);
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
      const headers = [
        "Full Name",
        "Father Name",
        "Mother Name",
        "Email Address",
        "Phone Number",
        "Course Name",
        "JEE Main Score",
        "CUET Score",
        "Address",
        "Payment Receipt Link",
        "Student Photo Link",
        "Timestamp"
      ];
      sheet.appendRow(headers);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const folder = DriveApp.getFolderById(folderId);
    let paymentReceiptLink = '';
    let studentPhotoLink = '';

    if (e.parameter.PaymentReceipt) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(e.parameter.PaymentReceipt),
        e.parameter.PaymentReceiptMimeType,
        e.parameter.PaymentReceiptName
      );
      const file = folder.createFile(blob).setName(`PaymentReceipt_${e.parameter.RollNumber}`);
      paymentReceiptLink = file.getUrl();
    }

    if (e.parameter.StudentPhoto) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(e.parameter.StudentPhoto),
        e.parameter.StudentPhotoMimeType,
        e.parameter.StudentPhotoName
      );
      const file = folder.createFile(blob).setName(`StudentPhoto_${e.parameter.RollNumber}`);
      studentPhotoLink = file.getUrl();
    }

    const newRow = headers.map(header => {
      if (header === 'Timestamp') return new Date();
      if (header === 'Payment Receipt Link') return paymentReceiptLink;
      if (header === 'Student Photo Link') return studentPhotoLink;
      return e.parameter[header] || '';
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}


function initialSetup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = doc.getSheetByName(sheetName);

  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = doc.insertSheet(sheetName);
  }

  // Set up headers
  const headers = [
    "Full Name",
    "Father Name",
    "Mother Name",
    "Email Address",
    "Phone Number",
    "Course Name",
    "JEE Main Score",
    "CUET Score",
    "Address",
    "Payment Receipt Link",
    "Student Photo Link",
    "Timestamp"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  Logger.log('Initial setup complete. Headers added.');
}
