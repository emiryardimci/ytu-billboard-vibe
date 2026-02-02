/**
 * YTÜ Billboard Rezervasyon Sistemi - Final Clean Script
 * Version: 7.0 (Zero Duplicates, Standardized & Clean)
 */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxS8m9c6O7tTuGs7zuMUrdkzVhEA1w9JK2zEftURML4umwGuEB1gY1GxEgPJ1Dx1SpAwQ/exec";

const BILLBOARD_CODES = [
  "001", "002", "025", "026", "051", "052", "053", "054", "055", "056",
  "057", "058", "059", "060", "061", "062", "063", "064", "065", "066",
  "067", "075", "076", "079", "092", "093"
];

let secilenBillboards = [];
let tarihSecildi = false;
let occupiedBillboards = [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  billboardGridOlustur();
  veriListesiYukle();
  durumGostergesiniGuncelle();

  const basInput = document.getElementById('baslangicTarihi');
  const bitInput = document.getElementById('bitisTarihi');

  if (basInput) basInput.addEventListener('change', tarihDegisti);
  if (bitInput) bitInput.addEventListener('change', tarihDegisti);

  ['kulupAdi', 'isimSoyisim', 'iletisim'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', kaydetButonGuncelle);
  });
});

// --- CORE LOGIC ---

function tarihDegisti() {
  tarihSecildi = false;
  secilenBillboards = [];
  occupiedBillboards = [];

  billboardGridOlustur();
  durumGostergesiniGuncelle();
  secimSayaciniGuncelle();
  kaydetButonGuncelle();

  const bas = document.getElementById('baslangicTarihi').value;
  const bit = document.getElementById('bitisTarihi').value;

  if (bas && bit) {
    if (new Date(bit) < new Date(bas)) {
      alertGoster('Bitiş tarihi başlangıçtan önce olamaz.', 'error');
    } else {
      tarihKontrol(bas, bit);
    }
  }
}

function tarihKontrol(bas, bit) {
  const grid = document.getElementById('billboardGrid');
  if (grid) grid.style.opacity = '0.5';

  const finalUrl = `${WEB_APP_URL}?action=getOccupied&baslangic=${bas}&bitis=${bit}`;

  fetch(finalUrl)
    .then(res => res.json())
    .then(data => {
      if (grid) grid.style.opacity = '1';

      const curBas = document.getElementById('baslangicTarihi').value;
      const curBit = document.getElementById('bitisTarihi').value;

      if (curBas !== bas || curBit !== bit) return;

      occupiedBillboards = Array.isArray(data) ? data : [];
      tarihSecildi = true;

      billboardGridOlustur();
      durumGostergesiniGuncelle();
      alertGoster('Müsaitlik güncellendi.', 'success');
    })
    .catch(err => {
      if (grid) grid.style.opacity = '1';
      alertGoster('Bağlantı Hatası: ' + err.message, 'error');
    });
}

function billboardGridOlustur() {
  const grid = document.getElementById('billboardGrid');
  if (!grid) return;
  grid.innerHTML = '';

  BILLBOARD_CODES.forEach(code => {
    const codeStr = code.toString().padStart(3, '0');
    const item = document.createElement('div');
    item.className = 'billboard-item';
    item.textContent = codeStr;

    const occ = occupiedBillboards.find(o => o.code === codeStr);

    if (!tarihSecildi) {
      item.classList.add('disabled');
      item.title = "Önce tarih seçiniz.";
    } else if (occ) {
      item.classList.add('occupied');

      // CLEAN TOOLTIP: Club | Date - Date
      const sDate = formatDateDisplay(occ.start);
      const eDate = formatDateDisplay(occ.end);
      item.title = `${occ.kulup} | ${sDate} - ${eDate}`;

      const icon = document.createElement('span');
      icon.className = 'info-icon';
      icon.textContent = 'i';
      item.appendChild(icon);
    } else {
      item.classList.add('available');
      if (secilenBillboards.includes(codeStr)) {
        item.classList.add('selected');
      }

      item.onclick = () => {
        if (!tarihSecildi) return;
        const idx = secilenBillboards.indexOf(codeStr);
        if (idx > -1) {
          secilenBillboards.splice(idx, 1);
          item.classList.remove('selected');
        } else {
          secilenBillboards.push(codeStr);
          item.classList.add('selected');
        }
        secimSayaciniGuncelle();
        kaydetButonGuncelle();
      };
    }
    grid.appendChild(item);
  });
}

function rezervasyonKaydet() {
  setLoading(true);

  const payload = {
    billboardKodlari: secilenBillboards,
    kulupAdi: document.getElementById('kulupAdi').value.trim(),
    isimSoyisim: document.getElementById('isimSoyisim').value.trim(),
    iletisim: document.getElementById('iletisim').value.trim(),
    baslangicTarihi: document.getElementById('baslangicTarihi').value,
    bitisTarihi: document.getElementById('bitisTarihi').value
  };

  fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        // OPERATION SEQUENCE: Refresh -> Hide Loading -> Show Alert
        veriListesiYukle(() => {
          setLoading(false);
          alertGoster('Rezervasyon Başarılı!', 'success');
          formTemizle();
        });
      } else {
        setLoading(false);
        alertGoster(res.message || 'Kayıt başarısız.', 'error');
      }
    })
    .catch(e => {
      setLoading(false);
      alertGoster('Hata: ' + e.message, 'error');
    });
}

function grupSil(idxs, skipConfirm) {
  if (!skipConfirm && !confirm('Bu rezervasyonları silmek istediğinize emin misiniz?')) return;

  setLoading(true);

  const url = `${WEB_APP_URL}?action=deleteBatch&rows=${encodeURIComponent(JSON.stringify(idxs))}`;

  fetch(url)
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        // OPERATION SEQUENCE: Refresh -> Hide Loading -> Show Alert
        veriListesiYukle(() => {
          setLoading(false);
          alertGoster('Kayıtlar Silindi.', 'success');

          if (tarihSecildi) {
            const bas = document.getElementById('baslangicTarihi').value;
            const bit = document.getElementById('bitisTarihi').value;
            if (bas && bit) tarihKontrol(bas, bit);
          }
        });
      } else {
        setLoading(false);
        alertGoster(res.message || 'Silme başarısız.', 'error');
      }
    })
    .catch(e => {
      setLoading(false);
      alertGoster('Hata: ' + e.message, 'error');
    });
}

function tekilSil(rowIndex) {
  grupSil([rowIndex], false);
}

function veriListesiYukle(onComplete) {
  const tbody = document.getElementById('veriListesi');
  if (!tbody) { if (onComplete) onComplete(); return; }

  if (tbody.children.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Veriler yükleniyor...</td></tr>';
  }

  fetch(`${WEB_APP_URL}?action=getReservations`)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Henüz kayıt yok.</td></tr>';
        if (onComplete) onComplete();
        return;
      }

      const groups = {};
      data.forEach(row => {
        const key = `${row.kulupAdi}_${row.baslangicTarihi}_${row.bitisTarihi}_${row.kayitTarihi}`;
        if (!groups[key]) groups[key] = { ...row, items: [] };
        groups[key].items.push({
          code: row.billboardKodu.toString().padStart(3, '0'),
          idx: row.rowIndex
        });
      });

      tbody.innerHTML = Object.values(groups).map(g => {
        const sortedItems = g.items.sort((a, b) => a.code.localeCompare(b.code));
        const allIdx = JSON.stringify(sortedItems.map(i => i.idx));

        // Use '×' as content. CSS will handle layout centered.
        const codesHtml = sortedItems.map(i =>
          `<span class="code-badge">
             ${i.code}
             <b class="btn-xs-delete" onclick="tekilSil(${i.idx})" title="İptal Et">×</b>
           </span>`
        ).join('');

        return `
        <tr>
          <td><div class="code-list-container">${codesHtml}</div></td>
          <td>${escapeHtml(g.kulupAdi)}</td>
          <td>${escapeHtml(g.isimSoyisim)}</td>
          <td>${escapeHtml(g.iletisim)}</td>
          <td>${formatDateDisplay(g.baslangicTarihi)}</td>
          <td>${formatDateDisplay(g.bitisTarihi)}</td>
          <td>${formatDateDisplay(g.kayitTarihi)}</td>
          <td style="text-align:center;">
             <button class="btn-sil" onclick='grupSil(${allIdx}, false)'>Grubu Sil</button>
          </td>
        </tr>`;
      }).join('');

      if (onComplete) onComplete();
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">Veri yüklenemedi.</td></tr>';
      if (onComplete) onComplete();
    });
}

// --- HELPERS ---

function setLoading(isLoading) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = isLoading ? 'flex' : 'none';
}

function formatDateDisplay(dateInput) {
  if (!dateInput) return '';
  try {
    let d = new Date(dateInput);
    if (isNaN(d.getTime())) return dateInput;
    return d.toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) { return dateInput; }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
}

function formTemizle() {
  ['kulupAdi', 'isimSoyisim', 'iletisim', 'baslangicTarihi', 'bitisTarihi'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  tarihDegisti();
}

function alertGoster(msg, type) {
  const box = document.getElementById('alertBox');
  if (box) {
    box.textContent = msg;
    box.className = `alert show ${type === 'success' ? 'alert-success' : 'alert-error'}`;
    setTimeout(() => box.className = 'alert', 3500);
  } else {
    alert(msg);
  }
}

function durumGostergesiniGuncelle() {
  const indicator = document.getElementById('statusIndicator');
  const text = document.getElementById('statusText');
  const light = document.getElementById('statusLight');

  if (tarihSecildi) {
    if (indicator) indicator.className = 'status-indicator unlocked';
    if (light) light.className = 'status-light green';
    if (text) text.textContent = 'Müsaitlik Kontrol Edildi';
  } else {
    if (indicator) indicator.className = 'status-indicator locked';
    if (light) light.className = 'status-light red';
    if (text) text.textContent = 'Lütfen Tarih Seçiniz';
  }
}

function secimSayaciniGuncelle() {
  const counter = document.getElementById('selectionCounter');
  const countSpan = document.getElementById('selectedCount');

  if (counter) counter.style.display = secilenBillboards.length > 0 ? 'inline-block' : 'none';
  if (countSpan) countSpan.textContent = secilenBillboards.length;
}

function kaydetButonGuncelle() {
  const btn = document.getElementById('btnKaydet');
  const kulup = document.getElementById('kulupAdi');

  if (btn && kulup) {
    const isValid = tarihSecildi && secilenBillboards.length > 0 && kulup.value.trim().length > 0;
    btn.disabled = !isValid;
  }
}