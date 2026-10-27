# Sabah Modu — Kısa Tasarım

## Amaç
Mağaza müdürü mesaiye başladığında "sipariş vermem gereken ürün var mı?" sorusunun cevabını saniyeler içinde görsün. Bu, kabul kriterlerinin beşincisini doğrudan karşılar.

## Hedefler
- Panelin yerini alan ayrı bir sabah görünümü. Başlıktaki soru: **"Hangi ürünler kritik durumda ve acil sipariş gerektiriyor?"**
- Günün 08:30'dan sonraki ilk açılışında kendiliğinden açılır, kapatılınca o gün tekrar açılmaz.
- Sunum ve test için her zaman görünen tek bir buton modu açar ve kapatır.

## Hedef dışı
Sipariş oluşturma, sipariş miktarı önerisi, bildirim (e-posta/SMS), hafta sonu veya tatil takvimi, sunucu tarafında zamanlama.

## Anti-hedefler
- Ekran siparişin verildiğini ima etmez: "sipariş oluşturuldu" yok, sipariş butonu yok. İlk brief §7.C kuralı geçerlidir.
- Mevcut paneli ve kabul testlerini bozmaz.

## Yaklaşımlar
| | Yaklaşım | Artı | Eksi |
|---|---|---|---|
| A | Mevcut tabloyu Tükendi + Kritik'e filtreleyen mod | En az iş | Ekran neredeyse aynı kalır, soru tabloda kaybolur |
| **B** | **Ayrı sabah görünümü (seçilen)** | Soru tek bakışta cevaplanır, sunumda net fark yaratır | A'dan biraz fazla arayüz işi |
| C | Panelin üstünde açılan pencere | "Günde bir kez" fikrine uyar | Açılışta ekranı kaplar, dar ekranda alan kısıtlı |

**Seçilen yol B.** Gerekçe: beşinci kriteri en doğrudan karşılayan ve sunumda en anlaşılır yol bu.

## Kararlaştırılanlar (sizinle)
- Mod günde bir kez, günün 08:30'dan sonraki ilk açılışında kendiliğinden açılır. Panel gece açık bırakılmışsa 08:30'da kendiliğinden geçer.
- Aynı buton modu açar ve kapatır; sunumda serbestçe kullanılır.
- Sipariş gereken ürünler kritik stok seviyesi, tedarik süresi ve mevcut stoğa göre belirlenir.

## Benim kararlarım (kontrol edin)
1. **"Sipariş gerekiyor" = Tükendi + Kritik.** Bunlar mevcut iş kurallarındaki ürünlerdir: stok 0, ya da kalan gün ≤ 3, ya da kalan gün ≤ tedarik süresi. Bugünkü demo veride 15 ürün. Yeni bir eşik eklenmez; panel ile sabah modu aynı sayıyı gösterir.
2. **İki grup:** "Stoğu tükendi" ve "Yeni stok gelmeden tükenecek". Grupların içinde mevcut aciliyet sırası korunur.
3. **Her üründe:** ürün adı, SKU, mevcut stok, kalan gün, tedarik süresi ve tek satırlık bir sonuç cümlesi.
   - Tedarik açığı > 0 ise: "Bugün sipariş verilse bile yaklaşık N gün stoksuz kalır."
   - Açık ≤ 0 ise (yalnızca ≤ 3 gün kuralıyla kritik olanlar): "Bugün sipariş verilirse yeni stok yetişir."
   - Tükendi ise: "Raf boş; yeni stok en erken N gün sonra gelir." N = tedarik süresi.
   - Stoğu ve satışı 0 olan üründe ek not: "Satış verisi yok."
4. **Üst özet:** "Bugün 15 ürün için sipariş vermeniz gerekiyor." Hiç ürün yoksa: "Bugün acil sipariş gerektiren ürün yok." Altında bugünün tarihi ve "Mesai başlangıcı 08:30" bilgisi.
5. **Buton:** sayfa başlığının sağında, güneş ikonlu. Normal modda "Sabah modu", sabah modunda "Panele dön" yazar. Basılı durumu ekran okuyucuya bildirilir.
6. **"Bugün gösterildi" bilgisi** tarayıcıda (localStorage) tarih olarak saklanır. Tarayıcı bunu engellerse mod her açılışta, 08:30 sonrası bir kez açılır; panel çökmez.
7. **Saat:** cihazın yerel saati kullanılır. Hafta sonu ayrımı yapılmaz (mağaza her gün açık varsayımı).
8. **Hatalı kayıt varsa** sabah görünümünde de "N kayıt değerlendirilemedi" notu görünür. Böylece eksik bir liste "tam liste" gibi sunulmaz.

## Uygulama notları (geliştiriciye bırakılanlar)
- Saf fonksiyonlar, testleriyle birlikte:
  - `getOrderNeeds(analyses)`: grupları döner.
  - `shouldAutoOpen(now, lastShownDate)`: 08:30 kuralını uygular.
  - `msUntilShiftStart(now)`: zamanlayıcı için 08:30'a kalan süreyi verir.
- Yerleşim ve görsel dil mevcut paletle aynı kalır; yeni bileşen olarak yalnızca gerekirse shadcn `Separator` eklenir.
- Playwright: buton ile açma ve kapama; saat 08:31'de otomatik açılma; 08:00'de açılmama; aynı gün kapatıldıktan sonra yenilemede tekrar açılmama. Saat, Playwright clock ile simüle edilir.
