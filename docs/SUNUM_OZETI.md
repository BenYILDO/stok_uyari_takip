# Stok Uyarı Paneli — Sunum Özeti

## İş problemi
Mağazada yüzlerce ürün var. Stok takibi Excel'de, ürün ürün ve elle yapılıyor. Kritik stoklar geç fark ediliyor; popüler ürünler tükenince satış kaybediliyor.

## Mevcut süreç
1. Müdür Excel'i açar, her ürünün stok ve satış değerine bakar.
2. Kaç gün yeteceğini kafadan veya formülle hesaplar.
3. Tedarik süresini ayrıca hatırlamak ya da aramak zorundadır.
4. Hangi ürüne önce bakılacağına sezgiyle karar verir.

Sonuç: zaman kaybı, gözden kaçan ürünler, tedarik süresi uzun ürünlerde geç kalınan aksiyon.

## Hedef süreç
Müdür paneli açar ve saniyeler içinde şunları görür:
- Stoğu tükenen ürün var mı? → "Stoğu tükenenler" kartı ve listenin en üstü
- Hangi ürünler kritik? → "Kritik stok" kartı, kırmızı satır vurgusu
- Kaç gün kaldı? → "Kalan gün" sütunu
- Önce hangisine bakmalıyım? → Varsayılan aciliyet sıralaması
- Tedarik süresi yüzünden riskli olanlar? → "Tedarikten N gün kısa" notu ve stok/tedarik çubuğu

## Geliştirilen çözüm
Tek sayfalık, salt okunur bir karar destek paneli:
- **Dört KPI kartı:** toplam, tükenen, kritik, dikkat. Kartlara tıklanınca liste o duruma filtrelenir.
- **Operasyonel uyarı:** örn. "4 ürünün stoğu tükenmiş, 11 ürün kritik seviyede."
- **Ürün tablosu:** aciliyete göre sıralı. Arama, kategori ve durum filtresi, sayfalama ve sütun sıralaması var.
- **Stok/tedarik çubuğu:** kalan stok süresi (dolgu) ile tedarik süresi (çentik) yan yana. Dolgu çentiğe ulaşmıyorsa yeni stok gelmeden ürün tükenir.
- **Hatalı veriye dayanıklılık:** bozuk kayıtlar nedenleriyle listelenir, panel çalışmaya devam eder.

## İş kuralları
- Kalan gün = stok ÷ günlük ortalama satış (satış 0 ise hesaplanmaz)
- Tedarik açığı = tedarik süresi − kalan gün
- Durum sırası: **Tükendi** (stok 0) → **Satış Yok** (satış 0) → **Kritik** (≤ 3 gün veya ≤ tedarik süresi) → **Dikkat** (≤ 7 gün) → **Normal**
- Öncelik: Tükendi, Kritik (açığı büyük olan önce), Dikkat, Normal, Satış Yok
- Sınır değerler yuvarlanmadan karşılaştırılır; örneğin 3,67 gün "Dikkat"tir, "Kritik" değil.

Önemli nokta: tedarik süresi 7 günden uzun ürünler de kritik olabilir. Örneğin 12 gün yetecek stok ama 15 gün tedarik süresi varsa ürün kritiktir.

## Kabul kriterleri
Brief'teki 9 senaryonun tamamı ve ek kriterler (sıralama, KPI tutarlılığı, arama, filtre ile sayfalamanın birlikte çalışması, mobil görünüm, hatalı JSON) otomatik testlerle doğrulandı. Ayrıntı: [KABUL_KRITERLERI.md](KABUL_KRITERLERI.md).

## Kapsam dışı
ERP, veritabanı, API, stok güncelleme, sipariş/satın alma, Excel yükleme, kullanıcı girişi, bildirimler, yapay zekâ tahmini, grafikler.

## Gelecek faz önerileri
1. **Veri kaynağı:** JSON yerine ERP/POS'tan günlük otomatik veri; Excel'den aktarım aracı
2. **Satış ortalaması:** sabit ortalama yerine son 7/30 günlük hareketli ortalama, sezonsallık
3. **Emniyet stoğu:** Kritik eşiğine ürün bazında güvenlik payı eklenmesi (örn. tedarik süresi + 2 gün)
4. **Bildirim:** yeni kritik ürünlerde e-posta veya mobil bildirim
5. **Çok mağaza:** mağaza seçimi ve mağazalar arası transfer önerisi
6. **Görünüm kalıcılığı:** filtrelerin bağlantıya (URL) kaydedilip paylaşılabilmesi
7. **Sipariş önerisi:** tedarik açığına göre önerilen sipariş miktarı (yalnızca öneri; sipariş oluşturmadan)
