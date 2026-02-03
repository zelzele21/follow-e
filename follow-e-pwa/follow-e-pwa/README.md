# 💰 Follow-E | Expense Tracker

Modern, şık ve kullanımı kolay bir harcama ve ödeme takip uygulaması. iOS ve Android cihazlarda gerçek bir uygulama gibi çalışır!

![Versiyon](https://img.shields.io/badge/versiyon-1.0.0-10b981)
![Lisans](https://img.shields.io/badge/lisans-MIT-22c55e)
![PWA](https://img.shields.io/badge/PWA-Ready-059669)

---

## ✨ Özellikler

- 📊 **Akıllı Takip**: Faturalar, abonelikler, krediler ve tüm ödemelerinizi tek yerden takip edin
- 💵 **Tutar Yönetimi**: Her ödemenin tutarını kaydedin, aylık toplamları görün
- 🔔 **Bildirimler**: Ödeme zamanı geldiğinde push bildirim alın
- 📅 **Esnek Tekrarlar**: Günlük, haftalık, aylık, yıllık veya tek seferlik
- 🎨 **Açık/Koyu Tema**: Göz yormayan modern tasarım
- 📱 **PWA Desteği**: Ana ekrana ekleyerek gerçek uygulama gibi kullanın
- 💾 **Offline Çalışma**: İnternet olmadan da kullanılabilir
- 🏷️ **Kategoriler**: Fatura, Abonelik, Kredi, Kira, Sigorta, Diğer
- ⚡ **Öncelik Seviyeleri**: Düşük, Orta, Yüksek

---

## 🚀 Hızlı Başlangıç

### Yöntem 1: GitHub Pages (Önerilen)

1. Bu klasörü GitHub'a yükleyin
2. Repository ayarlarına gidin
3. **Pages** bölümünden **main** branch'i seçin
4. Birkaç dakika bekleyin
5. `https://kullanici-adiniz.github.io/repo-adiniz` adresinden erişin

### Yöntem 2: Yerel Sunucu

```bash
# Python 3 ile
python -m http.server 8000

# veya Node.js ile
npx serve .

# Tarayıcıda açın
http://localhost:8000
```

---

## 📲 Cihaza Kurulum

### 📱 iPhone / iPad (iOS)

1. **Safari** tarayıcısında uygulamayı açın (Chrome desteklemez!)
2. Alttaki **Paylaş** butonuna dokunun (kare + yukarı ok)
3. Aşağı kaydırın ve **"Ana Ekrana Ekle"** seçeneğine dokunun
4. İsim verin ve **"Ekle"** butonuna dokunun
5. Ana ekranda uygulama ikonunu göreceksiniz! 🎉

> ⚠️ **Önemli**: iOS'ta bildirimler için uygulamayı **Safari'den** açmalısınız.

### 📱 Android (Samsung, Xiaomi, vb.)

1. **Chrome** tarayıcısında uygulamayı açın
2. Otomatik çıkan **"Ana Ekrana Ekle"** banner'ına dokunun
3. Veya: Sağ üstteki **⋮** menüye dokunun
4. **"Uygulamayı yükle"** veya **"Ana ekrana ekle"** seçin
5. **"Yükle"** butonuna dokunun 🎉

### 💻 Masaüstü (Chrome/Edge)

1. Adres çubuğundaki **⊕** veya **indirme** ikonuna tıklayın
2. **"Yükle"** butonuna tıklayın
3. Uygulama masaüstüne ve başlat menüsüne eklenir

---

## 🖼️ İkon Oluşturma

Uygulama ikonları için `icons/icon.svg` dosyasını kullanın.

### Online Araçlarla (Kolay Yol)

1. [RealFaviconGenerator](https://realfavicongenerator.net/) sitesine gidin
2. `icons/icon.svg` dosyasını yükleyin
3. Tüm platformlar için ikonları indirin
4. İndirilen dosyaları `icons/` klasörüne kopyalayın

### Gerekli İkon Boyutları

- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

### Komut Satırı ile (ImageMagick)

```bash
# ImageMagick kurulu olmalı
for size in 72 96 128 144 152 192 384 512; do
  convert -background none -resize ${size}x${size} icons/icon.svg icons/icon-${size}.png
done
```

---

## 📁 Dosya Yapısı

```
follow-e-pwa/
├── index.html          # Ana HTML dosyası
├── style.css           # CSS stilleri
├── app.js              # JavaScript mantığı
├── manifest.json       # PWA yapılandırması
├── service-worker.js   # Offline destek
├── README.md           # Bu dosya
└── icons/
    ├── icon.svg        # Kaynak ikon (vektör)
    ├── icon-192.png    # Android/Chrome ikonu
    └── icon-512.png    # Büyük ikon
```

---

## ⚙️ Özelleştirme

### Renkleri Değiştirme

`style.css` dosyasındaki `:root` bölümünden renkleri değiştirebilirsiniz:

```css
:root {
    --primary: #10b981;        /* Ana yeşil */
    --primary-light: #34d399;  /* Açık ton */
    --primary-dark: #059669;   /* Koyu ton */
    /* ... diğer renkler */
}
```

### Uygulama Adını Değiştirme

1. `manifest.json` dosyasında:
   - `name`: Tam uygulama adı
   - `short_name`: Kısa ad (ikon altında görünür)

2. `index.html` dosyasında:
   - `<title>` etiketi
   - `<meta name="apple-mobile-web-app-title">` etiketi

---

## 🔔 Bildirim Sistemi

### Çalışma Prensibi

- **Uygulama açıkken**: JavaScript `setTimeout` ile bildirim gönderir
- **Uygulama kapalıyken**: Service Worker arka planda çalışır (sınırlı)

### iOS Sınırlamaları

- Uygulama arka plandayken bildirimler **gecikebilir**
- Safari'den kurulum **zorunludur**
- iOS 16.4+ gereklidir (tam destek için)

### Android Avantajları

- Arka planda tam destek
- Kilit ekranında görünür
- Titreşim desteği

---

## 🛠️ Sorun Giderme

### Bildirimler Gelmiyor

1. Tarayıcı bildirim izinlerini kontrol edin
2. iOS'ta Safari kullandığınızdan emin olun
3. Android'de pil optimizasyonundan muaf tutun

### Uygulama Güncellenmiyor

1. Tarayıcı önbelleğini temizleyin
2. Service Worker'ı kaldırın (DevTools > Application > Service Workers)
3. Sayfayı yenileyin

### Ana Ekrana Eklenemiyor

- HTTPS bağlantısı gereklidir (localhost hariç)
- `manifest.json` dosyası doğru yapılandırılmış olmalı

---

## 📱 Test Edilen Cihazlar

| Cihaz | Tarayıcı | Durum |
|-------|----------|-------|
| iPhone 12+ | Safari | ✅ Tam destek |
| Samsung Galaxy | Chrome | ✅ Tam destek |
| Xiaomi | Chrome | ✅ Tam destek |
| Windows | Chrome/Edge | ✅ Tam destek |
| MacOS | Chrome/Safari | ✅ Tam destek |

---

## 🎨 Tasarım

Follow-E, modern ve profesyonel bir finans uygulaması görünümüne sahiptir:

- **Renk Paleti**: Yeşil/Emerald tonları (güven ve finans teması)
- **Font**: Plus Jakarta Sans (modern ve okunabilir)
- **Stil**: Soft shadows, yuvarlatılmış köşeler, gradient'ler
- **Animasyonlar**: Yumuşak geçişler ve micro-interactions

---

## 💡 İpuçları

1. **Düzenli Kullanım**: Uygulamayı düzenli açarsanız bildirimler daha güvenilir çalışır
2. **Pil Tasarrufu**: Android'de pil optimizasyonunu devre dışı bırakın
3. **Yedekleme**: LocalStorage verileri tarayıcıya bağlıdır, önemli hatırlatmaları not alın
4. **Güncelleme**: Yeni özellikler için sayfayı yenileyin

---

## 📄 Lisans

MIT Lisansı - Dilediğiniz gibi kullanabilirsiniz.

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin yeni-ozellik`)
5. Pull Request açın

---

**Follow-E ile ödemelerinizi asla kaçırmayın! 💰**
