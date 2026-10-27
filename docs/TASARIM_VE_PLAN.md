# Stok Uyarı Paneli — Tasarım ve Geliştirme Planı (Faz 1–3)

Durum: **ONAYLANDI ve UYGULANDI** (2026-10-27). Uygulama sırasında plandan sapmalar: V1/V3 revize edildi (hatalı kayıtlar tabloda değil, ayrı bir uyarıda listeleniyor), font Geist yerine Public Sans seçildi, TanStack Table v9 API'si kullanıldı. Güncel varsayımlar: [KAPSAM_VE_VARSAYIMLAR.md](KAPSAM_VE_VARSAYIMLAR.md).

## 0. Skill ve ortam durumu (plan hazırlanırken)

| Öğe | Durum | Aksiyon |
|---|---|---|
| Node.js / npm / npx | Kurulu değil | Faz 4 başında kurulacak (onay gerekir, bkz. §8) |
| superpowers skill'leri | Bu oturumda yok | Faz 4 öncesi README'den güncel kurulum yöntemi okunup kurulacak |
| frontend-design | Bu oturumda yok | `npx skills add ...` Node kurulduktan sonra |
| web-design-guidelines | Bu oturumda yok | Faz 5'te kurulacak |
| shadcn/ui, TanStack Table, Vitest, Playwright | Henüz kurulmadı | Faz 4/6'da |

Faz 1–3 çıktıları, skill'ler olmadan, brief'teki yönergelere göre elle hazırlanmıştır. Superpowers `brainstorming`/`writing-plans` ya da `frontend-design` çalıştırılmış gibi sunulmamaktadır.

## 1. Faz 1 — Analiz

### 1.1 Çözülecek problem
Mağaza müdürü panel açıldığında saniyeler içinde şunları görmeli: tükenen ürün var mı, hangileri kritik, kaç gün kaldı, önce hangisine bakmalı, tedarik süresi yüzünden riskli olanlar hangileri.

### 1.2 İş kuralları (brief §5–6, kesin)
- `remainingDays = stock / dailyAverageSales` (satış 0 ise hesaplanmaz).
- `stockGapDays = leadTimeDays - remainingDays`.
- Durum sırası: Tükendi → Satış Yok → Kritik (`remainingDays <= 3 || remainingDays <= leadTimeDays`) → Dikkat (`<= 7`) → Normal.
- Karşılaştırmalar yuvarlamasız; yuvarlama yalnızca ekranda.
- Sıralama: Tükendi, Kritik, Dikkat, Normal, Satış Yok. Kritik içinde `stockGapDays` azalan, eşitlikte `remainingDays` artan. Diğerlerinde `remainingDays` artan.

### 1.3 Varsayımlar (brief'te belirsiz olanlar — onayınıza sunulur)

| # | Varsayım | Gerekçe |
|---|---|---|
| V1 | Geçersiz kayıt (eksik alan, sayı olmayan, negatif değer, tekrar eden SKU) tabloya **"Veri hatası"** durumuyla girer, en altta listelenir, hesaplanmaz; sayfanın üstünde "N kayıt hatalı veri nedeniyle hesaplanamadı" uyarısı çıkar. Sıfıra çevrilmez, çökmez. *(Uygulamada revize edildi: tabloya girmez, yalnızca uyarıda listelenir.)* | Brief: "sessizce sıfıra çevirme, çökertme" |
| V2 | JSON dosyası tamamen bozuksa / dizi değilse sayfa çökmez; hata mesajı gösterilir. | Brief §9 |
| V3 | "Toplam ürün" KPI'ı veri hatalı kayıtlar dahil tüm kayıtları sayar; Veri hatası ayrıca uyarıda belirtilir. KPI'lar filtreden bağımsızdır (tüm veri üzerinden). *(Uygulamada revize edildi: yalnızca geçerli ürünler sayılır.)* | KPI–tablo tutarlılığı: ilgili durum filtresi seçilince tablo sayısı = KPI |
| V4 | Tedarik süresi `0` geçerlidir; negatif geçersizdir. Stok/satış negatifse geçersiz. Satış ondalıklı olabilir (örn. 0,5). Stok tam sayı olmalı. | Mantıksal tutarlılık |
| V5 | "Tükendi" ürünleri kendi içinde günlük satışı yüksek olan üstte (kaçırılan satış potansiyeli), sonra SKU. Diğer eşitliklerde son kriter SKU. | Brief eşitlik kuralı tanımsız; deterministik sıra gerekli |
| V6 | Kritik grubunda `stockGapDays` negatif olabilir (yalnızca ≤3 gün kuralıyla kritik olanlar); sıralama yine büyükten küçüğe. | Brief formülünün doğrudan sonucu |
| V7 | Ekranda kalan gün 1 ondalık gösterilir ("6,4 gün"); Tükendi → "0", Satış Yok → "—". | Okunabilirlik; hesap yuvarlamasız |
| V8 | Sayfa boyutu 15. Demo veri 56 ürün; Veri hatası örnekleri demo JSON'da değil, test fixture'larında bulunur (demo temiz kalır, sunumda net görünür). | Mülakat demosu |
| V9 | Uyarı metni sipariş ima etmez; "inceleyin" dili kullanılır. | Brief §7.C |

### 1.4 Kabul kriterleri
Brief §9'daki 9 durum senaryosu + sıralama, KPI tutarlılığı, arama (SKU+ad), filtre+sayfalama birlikteliği, mobil, hatalı JSON. Her biri `AC-xx` koduyla test planına bağlanmıştır (§3.5).

## 2. Faz 2 — UI tasarım yönü

(Plan aşamasında frontend-design skill'i kullanılamadığı için yön elle belirlendi. Faz 4'te skill ile gözden geçirildi: tek aile Public Sans + `tabular-nums`, soğuk nötr palet, akılda kalan tek öğe olarak stok/tedarik çubuğu.)

**Yön: "Sakin klinik" — açık zemin, mürekkep rengi metin, tek vurgu: durum renkleri.**

- Zemin açık nötr, kartlar beyaz, 1px kenarlık, gölge yok.
- Renk yalnızca anlam taşır; **renk tek başına bilgi değildir** (ikon + metin de var):

| Durum | Görünüm |
|---|---|
| Tükendi | Dolgu koyu kırmızı rozet, beyaz metin, `PackageX` ikonu |
| Kritik | Açık kırmızı zemin, koyu kırmızı metin, `TriangleAlert`; satırda 3px sol kırmızı çizgi |
| Dikkat | Amber zemin/metin, `Clock` |
| Normal | Nötr yeşil ton, `CircleCheck` |
| Satış Yok | Gri, `Minus` |

### Yerleşim (tek sütun, sidebar/menü yok)

```
┌──────────────────────────────────────────────────────────────┐
│ Stok Uyarı Paneli                                            │
│ Ürün stoklarını ve tedarik risklerini tek ekrandan takip edin│
│                                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│ │Toplam  │ │Tükenen │ │Kritik  │ │Dikkat  │  KPI (4 kompakt) │
│ └────────┘ └────────┘ └────────┘ └────────┘                  │
│ ⚠ N ürünün stoğu tükenmiş, M ürün kritik seviyede.   Alert   │
│                                                              │
│ [🔍 Ürün adı veya SKU ara] [Kategori ▾] [Durum ▾]            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │SKU  Ürün  Kategori  Stok  Günl.satış  Kalan gün Tedarik Durum│
│ │ ... satırlar (15/sayfa) ...                              │ │
│ └──────────────────────────────────────────────────────────┘ │
│ 56 üründen 1–15 arası                 ‹ Önceki  1/4  Sonraki › │
└──────────────────────────────────────────────────────────────┘
```

- **Mobil (<640px):** KPI 2×2; filtreler yığılır; tablo yatay kaydırılır, ürün adı sütunu sabit; SKU ve durum rozeti ürün adının altında.
- **Erişilebilirlik:** AA kontrast, görünür odak halkası, tablo `<caption>` (görsel olarak gizli), başlık `aria-sort`, filtre etiketleri, `lang="tr"`, `prefers-reduced-motion`, skip link.
- **Sıralama:** Varsayılan = aciliyet sırası. Başlığa tıklayınca kullanıcı sıralaması; "Varsayılan görünüme dön" aciliyet sırasına döner.

## 3. Faz 3 — Geliştirme planı

### 3.1 Mimari ilke
İş mantığı UI'dan bağımsız saf TypeScript fonksiyonları; TanStack Table yalnızca durum (sıralama/filtre/sayfa) yönetir; görsel bileşenler shadcn/ui.

### 3.2 Dosya yapısı (uygulanan)

```
src/
  domain/   types, calculate, prioritize, validate, summarize, search (+ *.test.ts)
  data/     loadProducts.ts (+ test), demoData.test.ts
  components/
    ui/     shadcn: card, badge, table, input, select, tooltip, alert, button
    KpiCards, StatusAlerts, StatusBadge, RunwayBar, ProductTable,
    productColumns, useProductTable, TableToolbar, TablePagination
  lib/      format.ts (+ test), status.ts, utils.ts
  App.tsx / main.tsx / index.css
public/data/products.json   56 demo ürün
e2e/dashboard.spec.ts       Playwright
```

### 3.3 Hesaplama fonksiyonları
```ts
getRemainingDays(p): number | null          // satış 0 -> null
getStockGapDays(p): number | null
getStatus(p): StockStatus                   // brief §5.3 sırasıyla
analyzeProduct(p): ProductAnalysis
compareByUrgency(a, b) / sortByUrgency(list)
getKpis(list) / buildAlertMessage(kpis)
parseProducts(raw: unknown)                 // geçerli ürünler + issues
matchesSearch(product, query)
```

### 3.4 TanStack Table kullanımı
- Sıralama durumu boşken veri aciliyet sırasıyla gösterilir; "Durum" sütununun karşılaştırıcısı `compareByUrgency`.
- Global filtre (ad + SKU, Türkçe harf duyarsız), `category` ve `status` sütun filtreleri.
- Sayfa boyutu 15; filtre değişince sayfa 1'e döner.
- Hesaplanamayan kalan gün sıralamada her zaman sonda.

### 3.5 Test planı ve kabul kriteri eşlemesi

| Kod | Test | Seviye |
|---|---|---|
| AC-01…09 | Brief §9 tablosundaki 9 durum senaryosu | Vitest |
| AC-10 | Sıfıra bölme yok; yuvarlamasız sınırlar | Vitest |
| AC-11 | Aciliyet sıralaması | Vitest |
| AC-12 | Geçersiz kayıtlar çökmeden ayrılır | Vitest |
| AC-13 | KPI = tablodaki durum sayıları | Vitest + Playwright |
| AC-14 | Sayfa açılır, 56 ürün, konsol hatası yok | Playwright |
| AC-15 | Tükendi üstte; tedarik nedeniyle kritik örnek (12/15) | Playwright |
| AC-16 | Arama SKU ve ad ile | Vitest + Playwright |
| AC-17 | Kategori + durum filtresi + sayfalama birlikte | Playwright |
| AC-18 | Mobil (Pixel 7): taşma yok, tablo kaydırılır, ürün adı ve durum görünür | Playwright |
| AC-19 | Bozuk JSON → hata mesajı, çökme yok | Vitest + Playwright |

### 3.6 Kapsam koruması
Backend, sidebar, grafik, animasyon, çok sayfa, koyu tema, dışa aktarma, stok/sipariş işlemi **yok**.
