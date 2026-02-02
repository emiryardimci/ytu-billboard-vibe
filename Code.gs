/**
 * YTÜ Billboard Rezervasyon Sistemi - Zırhlı Code.gs
 */
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAME = 'rezervasyonlar';

function doGet(e) {
  try {
    const action = e.parameter.action;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (action === 'getOccupied') {
      const baslangic = parseDate(e.parameter.baslangic);
      const bitis = parseDate(e.parameter.bitis);
      const data = sheet.getDataRange().getValues();
      const occupied = [];

      for (let i = 1; i < data.length; i++) {
        if (!data[i][0]) continue;
        const bCode = data[i][0].toString().padStart(3, '0');
        const bStart = parseDate(data[i][4]);
        const bEnd = parseDate(data[i][5]);

        // Çakışma Mantığı: (S1 <= E2) && (E1 >= S2)
        if ((baslangic <= bEnd) && (bitis >= bStart)) {
          occupied.push({ code: bCode, kulup: data[i][1], start: data[i][4], end: data[i][5] });
        }
      }
      return createJsonResponse(occupied);
    }

    if (action === 'getReservations') {
      const data = sheet.getDataRange().getValues();
      const results = [];
      for (let i = data.length - 1; i >= 1; i--) {
        if (!data[i][0]) continue;
        results.push({
          rowIndex: i + 1,
          billboardKodu: data[i][0],
          kulupAdi: data[i][1],
          isimSoyisim: data[i][2],
          iletisim: data[i][3],
          baslangicTarihi: data[i][4],
          bitisTarihi: data[i][5],
          kayitTarihi: data[i][6]
        });
      }
      return createJsonResponse(results);
    }

    if (action === 'deleteBatch') {
      const rows = JSON.parse(e.parameter.rows).sort((a, b) => b - a);
      rows.forEach(row => sheet.deleteRow(row));
      return createJsonResponse({ success: true });
    }

  } catch (err) {
    return createJsonResponse({ success: false, message: err.toString() });
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    const kayitTarihi = Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy HH:mm");

    data.billboardKodlari.forEach(code => {
      sheet.appendRow([
        code.toString().padStart(3, '0'),
        data.kulupAdi,
        data.isimSoyisim,
        data.iletisim,
        formatDateStr(data.baslangicTarihi),
        formatDateStr(data.bitisTarihi),
        kayitTarihi
      ]);
    });
    return createJsonResponse({ success: true });
  } catch (err) {
    return createJsonResponse({ success: false, message: err.toString() });
  }
}

// YARDIMCI FONKSİYONLAR
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  // Eğer tarih objesiyse (bazı durumlarda Sheets objesi gelir)
  if (dateStr instanceof Date) return dateStr;
  
  // ISO veya YYYY-MM-DD formatı (2026-02-22...)
  if (dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  // DD.MM.YYYY formatı
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}

function formatDateStr(dateStr) {
  // Input'tan gelen YYYY-MM-DD'yi DD.MM.YYYY yapar
  const d = parseDate(dateStr);
  return Utilities.formatDate(d, "GMT+3", "dd.MM.yyyy");
}