<div align="center">

# 💍 Yüzük Konfigüratörü (yuzukapp)
Gerçek zamanlı 3D halka / yüzük tasarlama aracı. Metal rengi, taş tipi, prong yapısı, band genişliği ve daha fazlasını tarayıcı içinde anında değiştirin.

![Status](https://img.shields.io/badge/status-dev-purple) ![Angular](https://img.shields.io/badge/Angular-16-red) ![Three.js](https://img.shields.io/badge/Three.js-0.180-black)  

</div>

## 🚀 Özellikler
- 3D GLB model yükleme ve otomatik ölçek / merkezleme
- OrbitControls ile döndürme, zoom ve pan (serbest kamera)
- Dinamik metal rengi (White / Rose / Platinum / Mixed vb.)
- Taş tipi (Natural / Lab Grown / Skip) ve şekil oranı slider’ı
- Basket / Halo / Hidden Halo / None seçenekleri
- Prong sayısı (4 / 6 / 4 Compass), uç tipi ve pave durumu
- Band stil (Round / Square), genişlik ve yüzük numarası ayarı
- Görsel (image) seçildiğinde sürüklenebilir dev önizleme
- Performans için sadece görünür mesh’leri güncelleme yaklaşımı
- Responsive grid (sol: sahne, sağ: filtre paneli)

## 📂 Proje Yapısı (Özet)
```
src/
	app/
		home/          <-- Konfigüratör (Three.js + filtreler)
		footer/        <-- Alt bilgi (genişletilebilir)
	assets/          <-- GLB modeller ve görseller
```

## 🧱 Teknolojiler
| Katman | Kullanılan |
|--------|-----------|
| UI     | Angular 16 |
| 3D     | Three.js (GLTFLoader, OrbitControls) |
| Build  | Angular CLI |
| Dil    | TypeScript |

## 🔧 Kurulum
```bash
git clone <repo-url>
cd yuzukapp
npm install
npm start  # veya: ng serve
```
Tarayıcı: http://localhost:4200

## 📜 NPM Script’leri
| Script  | Açıklama |
|---------|----------|
| `npm start` | Development server (HMR) |
| `npm run build` | Production build (dist/) |
| `npm test` | Unit test (Karma + Jasmine) |
| `npm run watch` | Development build watch mode |

## 🧠 Önemli Mantık Noktaları
| Konu | Açıklama |
|------|----------|
| Model Yükleme | GLTFLoader ile seçili GLB yüklenir, bounding box ile normalize edilir. |
| Filtre Uygulama | Her buton ringModel.traverse içinde ilgili mesh adını bulup görünürlük / scale / color günceller. |
| Prong Sayısı | Mesh isimleri (Prong1..Prong6) kontrol edilerek visible yönetilir. |
| Görsel Modu | Seçim image ise drag ile translate uygulanır, scale sabit (CSS değişkenleri --tx/--ty). |
| Kamera | OrbitControls full serbest mod; minDistance düşük, maxDistance yüksek. |

## 🛠 Geliştirme Notları
- GLB mesh isimleri değişirse filter fonksiyonlarındaki string karşılaştırmalar güncellenmeli.
- Performance iyileştirme için ileride: material / mesh referansları ilk yüklemede indexlenip traverse azaltılabilir.
- Mobil gesture desteği OrbitControls TOUCH yapılandırmasıyla açık.

## 🗺 Yol Haritası (Öneri)
| Aşama | Plan |
|-------|------|
| 1 | Mesh adlarını otomatik gruplayan index (prongs, halo, basket vs.) |
| 2 | Environment map / HDRI desteği (daha gerçekçi metal parlaması) |
| 3 | Işık paneli (intensity / renk ayarı) |
| 4 | Otomatik ekran görüntüsü alma (download PNG) |
| 5 | State export/import (JSON konfigürasyon paylaşımı) |
| 6 | SSR veya statik export (SEO için görüntü oluşturma pipeline) |

## 🧪 Test
Şu an temel Angular test altyapısı hazır (Karma + Jasmine). Kritik filtre fonksiyonları için ileride component unit test eklenebilir.

## 📦 Production Build
```bash
npm run build
```
`dist/yuzukapp` klasörünü statik barındırma (Netlify, Vercel, S3 + CloudFront vb.) ile servis edebilirsiniz.

## ❗ Sık Karşılaşılan Sorunlar
| Sorun | Çözüm |
|-------|-------|
| GLB yüklenmiyor | Yol (assets/...) doğru mu ve angular.json assets dizisine ekli mi kontrol edin. |
| Renk değişmiyor | İlgili mesh material.metalness / color özelliklerine sahip mi bakın. |
| Kamera dönmüyor | Canvas focus değilse bir kere tıklayın; Controls enabled=false yapılmadığından normalde açık. |

## 🤝 Katkı
PR / issue açmadan önce mesh isimleri ve filtre davranışlarını açıklayan kısa bir not ekleyin.

## 📄 Lisans
Şu an için “tüm hakları saklıdır” varsayılmaktadır. Açık lisans eklemek isterseniz (MIT / Apache-2.0) dosyayı güncelleyebiliriz.

---
Sorular / geliştirme talepleri için: _(buraya iletişim veya GitHub profil linki ekleyin)_

Keyifli kodlamalar! 💎
