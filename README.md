# YTÜ Billboard Rezervasyon Sistemi

Yıldız Teknik Üniversitesi billboard reklam alanları için geliştirilmiş, Google Sheets entegreli profesyonel rezervasyon sistemi.

## Özellikler

- **Tarih Seçimi:** Başlangıç ve bitiş tarihi seçimi (tarih seçilmeden billboard seçilemez)
- **Billboard Grid:** 26 billboard kodu (001, 002, 025, 026, vb.) dinamik grid; çoklu seçim destekler
- **Akıllı Filtreleme:** Tarih seçildiği an otomatik olarak Google Sheets taranır; dolu billboardlar kırmızı/tıklanamaz, boşlar yeşil/seçilebilir
- **Form Alanları:** Kulüp Adı, İsim Soyisim, İletişim
- **Otomatik Kayıt Tarihi:** Her işlemde anlık tarih ve saat Google Sheets'e kaydedilir
- **Veri Listesi:** Tüm kayıtların Excel benzeri tablo görünümü; bitiş tarihi geçmiş kayıtlar kırmızı tonlarında
- **Koyu Tema:** Modern, profesyonel arayüz
- **%100 Türkçe**

## Kurulum

### 1. Google Sheets Oluşturma

1. [Google Sheets](https://sheets.google.com) üzerinde yeni bir çalışma sayfası oluşturun
2. Sayfayı "YTÜ Billboard Rezervasyon" gibi bir isimle kaydedin

### 2. Apps Script Eklenmesi

1. Oluşturduğunuz Google Sheet'te **Uzantılar** → **Apps Script** menüsüne tıklayın
2. Açılan script editöründe varsayılan `Code.gs` dosyasının içeriğini silin
3. Bu projedeki **Code.gs** dosyasının içeriğini kopyalayıp yapıştırın
4. Sol menüden **+** (Artı) → **HTML** seçeneğine tıklayın, dosyayı **Index** olarak adlandırın
5. Bu projedeki **Index.html** dosyasının içeriğini kopyalayıp yapıştırın
6. Tekrar **+** → **HTML** ile yeni dosya oluşturun, **Script** olarak adlandırın
7. Bu projedeki **Script.html** dosyasının içeriğini kopyalayıp yapıştırın
8. **Ctrl+S** (veya Cmd+S) ile kaydedin

### 3. Web Uygulaması Olarak Dağıtma

1. Script editöründe **Dağıt** → **Yeni dağıtım** seçin
2. **Tür seçin** alanından **Web uygulaması** seçin
3. **Açıklama:** "YTÜ Billboard Rezervasyon Sistemi" yazın
4. **Uygulama olarak çalıştır:** "Benim" seçin (sizin hesabınızla çalışır)
5. **Erişim:** "Herkes" veya "Kuruluş içinde herkes" seçin (erişim gereksinimlerinize göre)
6. **Dağıt** butonuna tıklayın
7. Oluşan **Web uygulaması URL'si**ni kopyalayın

### 4. Uygulamayı Kullanma

Kopyaladığınız URL'yi tarayıcıda açarak sistemi kullanmaya başlayabilirsiniz.

## Google Sheets Sütun Yapısı

Sistem otomatik olarak "Rezervasyonlar" adlı bir sayfa oluşturur. Sütunlar:

| Sütun | Açıklama |
|-------|----------|
| Billboard Kodu | Seçilen billboard numarası |
| Kulüp Adı | Kulüp veya kurum adı |
| İsim Soyisim | Rezervasyonu yapan kişi |
| İletişim | Telefon veya e-posta |
| Başlangıç Tarihi | Rezervasyon başlangıcı |
| Bitiş Tarihi | Rezervasyon bitişi |
| Kayıt Tarihi | Otomatik kayıt zamanı (dd.MM.yyyy HH:mm:ss) |

## Billboard Kodları

001, 002, 025, 026, 092, 093, 053, 054, 051, 052, 063, 064, 065, 066, 067, 075, 076, 079, 055, 056, 057, 062, 060, 061, 058, 059

## Kullanım Akışı

1. **Başlangıç** ve **Bitiş Tarihi** alanlarını girin (tarih seçildiği an otomatik kontrol yapılır)
2. Yeşil (müsait) billboardlardan bir veya birden fazlasını seçin (çoklu seçim)
3. **Kulüp Adı**, **İsim Soyisim** ve **İletişim** alanlarını doldurun
4. **Rezervasyonu Kaydet** butonuna tıklayın

## Standalone Kullanım (İsteğe Bağlı)

index.html ve script.js dosyalarını bir web sunucusunda veya yerel olarak kullanmak isterseniz:

1. `script.js` dosyasının en başındaki `const WEB_APP_URL = "";` satırına Google Web Uygulaması URL'nizi yapıştırın
2. Index.html'de `<script><?!= include('Script'); ?></script>` satırını `<script src="script.js"></script>` ile değiştirin
3. index.html ve script.js aynı klasörde olacak şekilde sunucuda çalıştırın

## Teknik Notlar

- Sistem tarih çakışması kontrolü yapar; aynı billboard için çakışan tarih aralıklarına rezervasyon yapılamaz
- Bitiş tarihi geçmiş kayıtlar tabloda pasif (kırmızı tonlarında) görünür
- Tüm veriler Google Sheets'te saklanır; yedekleme için Sheets'i düzenli olarak indirebilirsiniz

## Lisans

Bu proje Yıldız Teknik Üniversitesi için geliştirilmiştir.
