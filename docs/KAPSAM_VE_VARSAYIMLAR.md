# Kapsam ve Varsayımlar

## Kapsam içi

- Tek sayfalık, Türkçe, açık renkli stok uyarı paneli
- JSON dosyasından ürün okuma (sabit veri, 56 demo ürün)
- Kalan gün, tedarik açığı ve stok durumu hesaplaması
- Aciliyete göre varsayılan sıralama ve kullanıcı sütun sıralaması
- Dört KPI kartı: toplam ürün, tükenen, kritik, dikkat
- Operasyonel uyarı mesajı
- Ürün adı ve SKU ile arama, kategori ve durum filtresi, sayfalama
- Hatalı veriye dayanıklılık
- Masaüstü ve mobil uyumlu görünüm

## Kapsam dışı

ERP, veritabanı, REST API, stok güncelleme, ürün ekleme/silme/düzenleme, Excel yükleme veya Excel'den JSON'a aktarım, sipariş oluşturma, satın alma yönetimi, kullanıcı girişi ve yetkilendirme, e-posta/SMS bildirimi, yapay zekâ ile stok tahmini, çok sayfalı yönetim sistemi, analitik grafikler, koyu tema, dışa aktarma.

## Varsayımlar

Brief'te açıkça tanımlanmamış konularda verilen kararlar:

| # | Varsayım | Gerekçe |
|---|---|---|
| V1 | Geçersiz kayıtlar (eksik alan, sayı olmayan değer, negatif değer, ondalıklı stok, tekrar eden SKU) tabloya alınmaz. Sayfada ayrı bir uyarıda satır numarası, SKU ve nedenleriyle listelenir. | "Sessizce sıfıra çevirme, çökertme" kuralı. Tablo ve KPI'ların yalnızca hesaplanabilen ürünleri içermesi sayıların tutarlı kalmasını sağlar. |
| V2 | JSON dosyası okunamıyor, geçerli JSON değil veya liste değilse panel çökmez; ne olduğunu ve nasıl düzeltileceğini anlatan bir hata gösterir. | Kabul kriteri: hatalı JSON uygulamayı çökertmemeli. |
| V3 | "Toplam ürün", hesaplanabilen (geçerli) ürünlerin sayısıdır. KPI'lar filtrelerden bağımsızdır ve tüm veri üzerinden hesaplanır. | KPI = ilgili durum filtresindeki tablo sayısı. |
| V4 | Tedarik süresi 0 olabilir. Negatif değerler geçersizdir. Günlük satış ondalıklı olabilir (örn. 0,5). Stok tam sayı olmalıdır. | Gerçek mağaza verisiyle tutarlılık. |
| V5 | Tükenen ürünler kendi içinde günlük satışı yüksek olandan düşüğe sıralanır (kaçırılan satış potansiyeli). Tüm eşitliklerde son kriter SKU'dur. | Brief bu grupta sıralama tanımlamıyor; sıranın deterministik olması gerekiyor. |
| V6 | Kritik grupta tedarik açığı negatif olabilir (yalnızca "≤ 3 gün" kuralıyla kritik olan ürünler). Sıralama yine büyükten küçüğe uygulanır. | Brief formülünün doğrudan sonucu. |
| V7 | Kalan gün ekranda en fazla 1 ondalıkla gösterilir ("6,4"). Satış 0 ise "—" gösterilir. | Okunabilirlik. Hesaplama yuvarlanmamış değerle yapılır. |
| V8 | Sayfa başına 15 ürün gösterilir. Hatalı kayıt örnekleri demo veride değil, otomatik testlerde bulunur. | Demo sunumda temiz görünür; dayanıklılık testlerle kanıtlanır. |
| V9 | Uyarı metinleri sipariş oluşturulduğunu ima etmez; "inceleyin" dili kullanılır. | Brief §7.C. |
| V10 | KPI kartları tıklanabilir ve tabloyu ilgili duruma filtreler. "Toplam ürün" kartı filtreyi kaldırır. | Müdür tek tıkla "kritik olanlar hangileri?" sorusunun cevabına ulaşır. Yeni bir veri işlemi değildir. |
| V11 | Mobilde (640 px altı) SKU ayrı sütun yerine ürün adının altında, durum rozetiyle birlikte gösterilir. Ürün adı sütunu yatay kaydırmada sabit kalır. | Dar ekranda en önemli bilgi (durum) kaydırmaya gerek kalmadan görünür. |
| V12 | Sütun başlığına ilk tıklama artan sıralar, ikincisi azalan, üçüncüsü aciliyet sırasına döner. | "Kalan gün"de önce en kısa süre görünür. |
| V13 | Sabah modunda "sipariş gereken" ürünler = Tükendi + Kritik. Yeni bir eşik eklenmedi. | Kritik kuralı zaten stok, günlük satış ve tedarik süresini birlikte değerlendiriyor; panel ile sabah modu aynı sayıyı gösterir. |
| V14 | Sabah modu cihazın yerel saatine göre 08:30'da açılır. Hafta sonu veya tatil ayrımı yapılmaz. | Mağazanın her gün açık olduğu varsayıldı. |
| V15 | "Bugün gösterildi" bilgisi tarayıcıda (localStorage) tarih olarak saklanır. Tarayıcı izin vermezse mod 08:30 sonrası her açılışta bir kez açılır; panel çökmez. | Sunucu yok; tek cihazlık POC. |
| V16 | Sabah modu 08:30 sonrası butonla elle açıldıysa o gün gösterilmiş sayılır. 08:30'dan önce elle açılıp kapatılırsa 08:30'da yine kendiliğinden açılır. Sabah modundan panele dönülünce tablo filtreleri sıfırlanır. | Mesai başlangıcındaki gösterim kaçırılmaz. |
| V17 | Sabah modunda sipariş butonu veya "sipariş verildi/oluşturuldu" ifadesi yoktur. Ekran yalnızca neyin sipariş edilmesi gerektiğini gösterir. | İlk brief §7.C kuralı. |

Sabah modu tasarımı: [superpowers/specs/2026-10-27-sabah-modu-design.md](superpowers/specs/2026-10-27-sabah-modu-design.md)
