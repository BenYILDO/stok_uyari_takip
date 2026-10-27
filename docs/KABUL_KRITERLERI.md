# Kabul Kriterleri Kontrol Listesi

Son doğrulama: 2026-10-27, `feature/poc` dalı.

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm test` (Vitest) | 10 dosya, **94/94 geçti** |
| `npm run test:e2e` (Playwright, Chromium masaüstü 1440 px + Pixel 7 mobil) | **21/21 geçti** |
| `npm run build` | exit 0 |

## İş birimi kabul kriterleri

| # | Kriter | Nasıl karşılanıyor | Test | Durum |
|---|---|---|---|---|
| 1 | Ürün listesi bir tabloda görünsün | Ana tablo: SKU, ad, kategori, stok, günlük satış, kalan gün, tedarik süresi, durum; 15'erli sayfa | e2e › AC-14, AC-17 | ✅ |
| 2 | Her ürünün stokta ne kadar süre kalacağı hesaplansın | "Kalan gün" = stok ÷ günlük satış; satış 0 ise "—" | `calculate.test.ts`; e2e › AC-15 (12 gün) | ✅ |
| 3 | Kritik ürünler görsel olarak öne çıksın | Kırmızı rozet ve ikon, satırda sol kırmızı çizgi, "Tedarikten N gün kısa" notu; Tükendi için koyu kırmızı | e2e › AC-15; ekran görüntüleri | ✅ |
| 4 | Sıralama otomatik olsun, en acil üstte | Açılışta Tükendi → Kritik (açığı büyük önce) → Dikkat → Normal → Satış Yok | `prioritize.test.ts`; e2e › AC-15 ilk yüklemede Tükendi üstte | ✅ |
| 5 | Sabah bakınca "sipariş vermem gereken var mı" hemen anlaşılsın | **Sabah modu:** 08:30'dan sonraki ilk açılışta kendiliğinden açılır; "Hangi ürünler kritik durumda ve acil sipariş gerektiriyor?" sorusunu tek cümleyle cevaplar ve ürünleri listeler. Sunum için butonla açılıp kapanır. | `orderNeeds.test.ts`, `shiftClock.test.ts`; e2e › AC-20, AC-21, AC-22 | ✅ |

## Sabah modu

| Kod | Kriter | Test | Durum |
|---|---|---|---|
| AC-20 | Buton ile sabah moduna geçilir ve aynı butonla panele dönülür; mobilde taşma ve konsol hatası yok | e2e › AC-20 (masaüstü + mobil) | ✅ |
| AC-21 | 08:30'dan önce açılmaz; 08:30'dan sonraki ilk açılışta açılır; kapatılınca o gün tekrar açılmaz; ertesi gün yeniden açılır; panel 08:30'dan önce açıksa saat gelince geçer | `shiftClock.test.ts` (11 test); e2e › AC-21 (iki test) | ✅ |
| AC-22 | Sipariş gereken = Tükendi + Kritik (demo veride 15); iki grup; her üründe stok, kalan gün, tedarik süresi ve neden acil olduğu; sipariş oluşturulduğunu ima eden ifade yok | `orderNeeds.test.ts` (11 test); e2e › AC-22 | ✅ |

## Brief §9 — durum senaryoları

| Kod | Senaryo | Beklenen | Test | Durum |
|---|---|---|---|---|
| AC-01 | Stok 0 | Tükendi | `calculate.test.ts` › AC-01 | ✅ |
| AC-02 | Stok 20, satış 10, tedarik 1 | Kritik | `calculate.test.ts` › AC-02 | ✅ |
| AC-03 | Stok 50, satış 10, tedarik 8 | Kritik | `calculate.test.ts` › AC-03 | ✅ |
| AC-04 | Stok 50, satış 10, tedarik 2 | Dikkat | `calculate.test.ts` › AC-04 | ✅ |
| AC-05 | Stok 100, satış 5, tedarik 4 | Normal | `calculate.test.ts` › AC-05 | ✅ |
| AC-06 | Stok 25, satış 0, tedarik 5 | Satış Yok | `calculate.test.ts` › AC-06 | ✅ |
| AC-07 | Kalan gün = tedarik süresi | Kritik | `calculate.test.ts` › AC-07; ondalıklı satışta da (21 / 1,4 = 15) | ✅ |
| AC-08 | Kalan gün = 3 | Kritik | `calculate.test.ts` › AC-08 | ✅ |
| AC-09 | Kalan gün = 7, tedarik 2 | Dikkat | `calculate.test.ts` › AC-09 | ✅ |

## Ek kriterler

| Kod | Kriter | Test | Durum |
|---|---|---|---|
| AC-10 | Sıfıra bölme yok; sınırlar yuvarlanmadan karşılaştırılır (3,67 gün → Dikkat; 3,1 → Dikkat; 7,1 → Normal) | `calculate.test.ts` | ✅ |
| — | Tedarik süresi 7 günden uzunsa da kritik olabilir (12 gün stok / 15 gün tedarik) | `calculate.test.ts`; e2e › AC-15 tedarik süresi nedeniyle kritik | ✅ |
| AC-11 | Kritik ürünler doğru sıralanır: durum sırası, tedarik açığı azalan, eşitlikte kalan gün artan | `prioritize.test.ts` (8 test); e2e › AC-15 ilk yüklemede Tükendi üstte | ✅ |
| AC-12 | Eksik, metin, NaN/sonsuz, negatif, ondalıklı stok, tekrar eden SKU ve nesne olmayan kayıtlar sıfıra çevrilmeden ayrılır | `validate.test.ts` (10 test) | ✅ |
| AC-13 | KPI sonuçları tablodaki verilerle tutarlı | `summarize.test.ts`; e2e › AC-13 (iki test) | ✅ |
| AC-14 | Sayfa açılır, JSON yüklenir (56 ürün), konsolda hata yok | e2e › AC-14 | ✅ |
| AC-15 | Tükenen ürünler üstte; tedarik nedeniyle kritik ürünler doğru gösterilir | e2e › AC-15 (iki test) | ✅ |
| AC-16 | Arama SKU ve ürün adında çalışır (Türkçe I/İ/ı duyarsız) | `search.test.ts`; e2e › AC-16 | ✅ |
| AC-17 | Filtreleme ve sayfalama birlikte çalışır; filtre değişince ilk sayfaya dönülür | e2e › AC-17 | ✅ |
| AC-18 | Mobil görünüm bozulmaz: sayfa yatay taşmaz, tablo kaydırılır, ürün adı ve durum görünür | e2e [mobile] › AC-18; `docs/screenshots/mobile.png` | ✅ |
| AC-19 | Hatalı JSON uygulamayı çökertmez: bozuk dosya, liste olmayan veri, HTTP ve ağ hatası, kısmen hatalı kayıtlar, boş liste | `loadProducts.test.ts` (6 test); e2e › AC-19 (üç test) | ✅ |
| — | Uyarı metni sipariş oluşturulduğunu ima etmez | `summarize.test.ts` › V9; e2e › operasyonel uyarı | ✅ |
| — | Varsayılan aciliyet sıralaması ilk yüklemede aktif; kullanıcı sıralaması ve geri dönüş | e2e › kullanıcı sütuna göre sıralayabilir | ✅ |
| — | Demo veri ≥ 50 ürün ve tüm durumlar, sınır değerler, istisnalar | `demoData.test.ts` (5 test) | ✅ |

## Bilinen sınırlamalar (ertelenen küçük iyileştirmeler)

- KPI kartına tıklamak yalnızca durum filtresini değiştirir; arama ve kategori filtresi açık kalır.
- SKU sütununa göre sıralamada geliştirme konsolunda bir TanStack uyarısı (warning) çıkar; sıralama doğru çalışır.
- Ad ve kategori sıralaması Türkçe alfabeye göre değildir (demo veride Türkçe karakterle başlayan ad yok).
- 0,05 günden küçük tedarik açığında "Tedarikten 0 gün kısa" yazabilir.
- Sonuç sıfıra düştüğünde ekran okuyucuya ayrıca duyuru yapılmaz (boş durum metni görünür).
- Hatalı kayıt listesindeki "Satır N", dosya satırı değil kayıt sırasıdır.
- Bilgi ipuçları (tooltip) dokunmatik ekranda açılmaz; aynı bilgi tabloda metin olarak var.
- Filtreler adres çubuğunda (URL) saklanmaz.
