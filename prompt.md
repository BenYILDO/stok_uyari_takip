# MAĞAZA STOK UYARI PANELİ — POC GELİŞTİRME BRIEF'İ

## Rolün ve çalışma yöntemin

Deneyimli bir Business Analyst, Senior Frontend Engineer ve Product Designer olarak hareket et.

Projemiz bir İş Analizi Uzmanı mülakatı için gerçekleştirilecek Proof of Concept (POC) çalışmasıdır.

**Superpowers workflow'unu kullan:**
1. `brainstorming`: Verilen gereksinimleri analiz et ve çözüm tasarımını oluştur.
2. `writing-plans`: Onaylanan tasarım üzerinden uygulanabilir geliştirme planı hazırla.
3. `test-driven-development`: İş kuralları için testler oluştur.
4. `executing-plans` veya `subagent-driven-development`: Onaylanan planı uygula.
5. `verification-before-completion`: Kabul kriterlerini doğrula.

Arayüz tasarımında `frontend-design` skill'ini, son kalite kontrolünde `web-design-guidelines` yaklaşımını kullan.

Gereksinimler iş birimiyle yapılan görüşmelerde netleştirilmiştir. Daha önce cevaplanmış soruları yeniden sorma. Belirsizlikleri ayrı bir varsayımlar bölümünde belirt.

**Önce tasarım ve geliştirme planını sun. Onay almadan kodlama aşamasına geçme.**


## GITHUB REPOSITORY, AGENT SKILL VE GELİŞTİRME ARAÇLARI

Bu projede aşağıdaki açık kaynak GitHub repolarını kullanmanı istiyorum.

**Önemli:** Bu repoları yalnızca referans olarak okuma. İlgili geliştirme aşamasına geldiğinde gerekli olanları kur, skill dosyalarını incele ve aktif olarak kullan.

Kuruluma başlamadan önce mevcut proje ortamını, kurulu skill'leri ve bağımlılıkları kontrol et. Zaten kurulu olanları tekrar kurma.

GitHub repolarının güncel README ve kurulum talimatlarını incele. Eski veya geçersiz komutlarla kurulum yapma.

### 1. Superpowers — Ana geliştirme workflow'u

GitHub:
https://github.com/obra/superpowers

**Amaç:** Gereksinim analizi, çözüm tasarımı, planlama, kodlama ve test aşamalarını sistematik yürütmek.

**Kurulum:**
- Repository README dosyasındaki kullanılan AI coding agent'a uygun güncel kurulum yöntemini uygula.
- Kurulumdan sonra skill'lerin erişilebilir olduğunu doğrula.

**Kullanılacak skill'ler:**

- `brainstorming` — Gereksinimleri analiz et, alternatifleri değerlendir, tasarım kararlarını oluştur.
- `writing-plans` — Onaylanan tasarımdan uygulanabilir geliştirme planı çıkar.
- `using-git-worktrees` — Uygunsa izole geliştirme ortamı oluştur.
- `test-driven-development` — İş kurallarının testlerini kodlamadan önce yaz.
- `subagent-driven-development` — Destekleniyorsa onaylanan planı görevler hâlinde uygula.
- `executing-plans` — Subagent yöntemi uygun değilse alternatif olarak kullan.
- `systematic-debugging` — Karşılaşılan hataların temel nedenini bul.
- `requesting-code-review` — Kodun gereksinimlere uygunluğunu incele.
- `verification-before-completion` — Tamamlandı demeden önce testleri ve build'i doğrula.

**Ne zaman kullanılacak?**

Projenin başından teslimatına kadar ana geliştirme metodolojisi olarak.

Skill isimlerinin mevcut sürümde değişmiş olması durumunda gerçek dosyaları ve dokümantasyonu esas al.

### 2. Frontend Design — UI/UX tasarımı

GitHub:
https://github.com/vercel-labs/open-agents

Skill: `frontend-design`

**Kurulum:**

```bash
npx skills add https://github.com/vercel-labs/open-agents --skill frontend-design
```

**Amaç:**

Sıradan ve gereksiz detaylarla dolu AI dashboard tasarımlarından kaçınarak minimalist, özgün, profesyonel bir operasyon paneli oluşturmak.

**Ne zaman çağırılacak?**

- İlk UI tasarımı oluşturulurken
- Dashboard yerleşimi belirlenirken
- KPI kartları ve ürün tablosu tasarlanırken
- Responsive görünüm iyileştirilirken
- Görsel tutarlılık üzerinde çalışılırken

**Özel talimat:**

Skill'in yaratıcı tasarım yaklaşımını kullan ama mevcut iş probleminin önüne geçmesine izin verme.

Minimal ve işlevsel bir perakende operasyon paneli tasarla.

Gereksiz sidebar, büyük grafikler, dekoratif animasyonlar ve bilgi yoğunluğu oluşturma.

### 3. shadcn/ui — Arayüz bileşenleri

GitHub:
https://github.com/shadcn-ui/ui

Dokümantasyon:
https://ui.shadcn.com/

**Amaç:** Erişilebilir, özelleştirilebilir ve modern UI bileşenleri kullanmak.

**Nerede kullanılacak?**

- KPI kartlarında `Card`
- Stok durumlarında `Badge`
- Ürün tablosunda `Table`
- Aramada `Input`
- Filtrelerde `Select`
- Gerektiğinde `Tooltip`
- Uyarılarda `Alert`

Projeyi Vite ve Tailwind CSS ile uyumlu şekilde yapılandır.

Yalnızca ihtiyaç duyulan bileşenleri ekle.

### 4. TanStack Table — Tablo yönetimi

GitHub:
https://github.com/TanStack/table

Dokümantasyon:
https://tanstack.com/table

**Amaç:** Ürün listesinin veri odaklı işlemlerini yönetmek.

**Nerede kullanılacak?**

- Varsayılan aciliyet sıralaması
- Ürün arama
- Kategori filtreleme
- Stok durumu filtreleme
- Sayfalama
- Kullanıcının sütun sıralamasını değiştirebilmesi

TanStack Table yalnızca tablo mantığını yönetsin.

Görsel bileşenler shadcn/ui ile oluşturulsun.

Kritik stok hesaplamalarını tablo bileşeninin içine gömme. Hesaplamaları bağımsız TypeScript fonksiyonlarında tut.

### 5. Web Design Guidelines — UI kalite denetimi

GitHub:
https://github.com/vercel-labs/agent-skills

Tasarım kuralları:
https://github.com/vercel-labs/web-interface-guidelines

Skill: `web-design-guidelines`

**Kurulum:**

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
```

**Amaç:** Oluşturulan UI'ı profesyonel web arayüzü standartlarına göre denetlemek.

**Ne zaman çağırılacak?**

İlk çalışan arayüz tamamlandığında ve son teslimden önce.

**Kontrol edilecek konular:**

- Görsel hiyerarşi
- Okunabilirlik
- Erişilebilirlik
- Renk kontrastları
- Form ve filtre kullanılabilirliği
- Responsive davranış
- Tutarlı boşluklar ve hizalamalar
- Etkileşimli bileşenlerin davranışları

Tespit edilen problemleri önem derecesine göre raporla ve düzelt.

### 6. Playwright — Tarayıcı ve kabul testleri

GitHub:
https://github.com/microsoft/playwright

Dokümantasyon:
https://playwright.dev/

**Amaç:** Panelin gerçek tarayıcıdaki davranışlarını doğrulamak.

**Ne zaman kullanılacak?**

Temel işlevler ve ilk UI tamamlandıktan sonra.

**Test senaryoları:**

- Sayfa başarıyla açılıyor mu?
- JSON verileri doğru yükleniyor mu?
- KPI kartları doğru hesaplanıyor mu?
- Tükendi durumundaki ürünler üstte mi?
- Tedarik süresi nedeniyle kritik olan ürünler doğru gösteriliyor mu?
- Arama çalışıyor mu?
- Filtreler doğru sonuç üretiyor mu?
- Sayfalama çalışıyor mu?
- Mobil görünümde tablo kullanılabilir mi?
- Tarayıcı konsolunda hata var mı?

Mümkünse masaüstü ve mobil ekran görüntüleri oluşturup tasarımı görsel olarak da denetle.

---

## ZORUNLU SKILL KULLANIM SIRASI

Aşağıdaki akışı takip et:

**FAZ 1 — Analiz**

`superpowers:brainstorming`

Gereksinimleri, iş kurallarını, varsayımları ve kabul kriterlerini incele.

**FAZ 2 — UI tasarımı**

`frontend-design`

Tek sayfalık dashboard için sade bir tasarım yönü ve bileşen yerleşimi öner.

**FAZ 3 — Geliştirme planı**

`superpowers:writing-plans`

Dosya yapısını, component mimarisini, hesaplama fonksiyonlarını ve test planını oluştur.

**BU NOKTADA DUR VE ONAYIMI BEKLE.**

**FAZ 4 — Kodlama**

Onay sonrası:

`superpowers:subagent-driven-development`

veya

`superpowers:executing-plans`

Geliştirme boyunca `test-driven-development` kullan.

React, shadcn/ui ve TanStack Table ile uygulamayı geliştir.

**FAZ 5 — UI denetimi**

`web-design-guidelines`

Arayüzü incele, sorunları tespit et ve gerekli düzeltmeleri uygula.

**FAZ 6 — Kabul testleri**

Playwright ile tarayıcı testlerini gerçekleştir.

**FAZ 7 — Son doğrulama**

`superpowers:verification-before-completion`

Tüm kabul kriterlerinin karşılandığını test sonuçlarıyla doğrula.

---

## AGENT ÇALIŞMA KURALLARI

1. Her aşamada doğru skill'i aktif olarak çağır.
2. Skill kullanamadığında bunu açıkça belirt; kullanmış gibi davranma.
3. Repository'nin güncel kurulum talimatlarını kontrol et.
4. Gerekli bağımlılıkları kendin kur ve doğrula.
5. Birbirini tekrar eden agent veya skill'ler ekleme.
6. Teknik kapsamı büyütme; mevcut POC gereksinimlerine sadık kal.
7. Tasarım ve geliştirme planı onaylanmadan uygulamayı kodlamaya başlama.
8. Her önemli geliştirmeyi ilgili kabul kriteriyle ilişkilendir.
9. Test sonuçlarını gerçekten çalıştırarak doğrula.
10. Son teslimde kullanılan repoları, skill'leri, test sonuçlarını ve karşılanan kabul kriterlerini özetle.

**Hedef:** Açık kaynak araçların sağladığı verimlilikten yararlanarak az sayıda, doğru seçilmiş bileşenle çalışan, temiz kodlu, görsel açıdan profesyonel ve iş gereksinimlerini karşılayan bir stok uyarı paneli geliştirmek.


---

## 1. İş problemi

Bir ayakkabı mağazasında yüzlerce ürün bulunmaktadır.

Mağaza müdürü ürünlerin stoklarını Excel üzerinden tek tek kontrol etmekte, stok tükenme sürelerini manuel hesaplamaktadır.

Bu süreç zaman kaybına ve kritik stokların geç fark edilmesine neden olmaktadır. Popüler ürünlerin tükenmesi satış kaybı yaratmaktadır.

### İş hedefi

Mağaza müdürünün paneli açtığında aşağıdaki sorulara saniyeler içerisinde cevap almasını sağlamak:

- Stoğu tükenen ürün var mı?
- Hangi ürünlerin stoğu kritik?
- Hangi ürünlerin tükenmesine kaç gün kaldı?
- Hangi ürünleri öncelikle incelemeliyim?
- Tedarik süresi nedeniyle risk altında olan ürünler hangileri?

Bu sistem bir ERP veya sipariş yönetim sistemi değildir.

**Yalnızca stok durumunu analiz eden, önceliklendiren ve görselleştiren tek sayfalık bir karar destek panelidir.**

---

## 2. İş birimi tarafından onaylanan kapsam

- Excel kullanımını ortadan kaldırmayı hedefleyen bir UI hazırlanacak.
- Bu POC'de ürün verileri JSON dosyasından okunacak.
- JSON içerisindeki veriler sabit kabul edilecek.
- Veritabanı bağlantısı gerekmiyor.
- Panel üzerinden stok güncelleme yapılmayacak.
- Ürün ekleme, silme ve düzenleme yapılmayacak.
- Kullanıcı girişi ve yetkilendirme gerekmiyor.
- Her ürünün kendine özgü tedarik süresi bulunacak.
- Stok kritikliği tedarik süresi dikkate alınarak hesaplanacak.

Excel'den JSON'a veri aktarım aracı geliştirmek bu POC kapsamında değildir.

---

## 3. Teknoloji

Tercih edilen teknoloji yığını:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Table
- Lucide Icons
- JSON veri kaynağı
- Vitest
- Playwright

Backend, veritabanı ve gereksiz servisler kurma.

Temiz, modüler fakat aşırı mühendislikten uzak bir mimari oluştur.

---

## 4. JSON veri modeli

Her ürün şu alanları içermelidir:

```json
{
  "sku": "SK-1001",
  "name": "Skechers Arch Fit",
  "category": "Walking",
  "stock": 24,
  "dailyAverageSales": 8,
  "leadTimeDays": 5
}
```

Alanların açıklamaları:

- `sku`: Benzersiz ürün kodu
- `name`: Ürün adı
- `category`: Ürün kategorisi
- `stock`: Mevcut stok adedi
- `dailyAverageSales`: Günlük ortalama satış adedi
- `leadTimeDays`: Ürünün tedarik süresi (gün)

Minimum 50 gerçekçi demo ürün oluştur.

Ürünler farklı stok, satış ve tedarik sürelerine sahip olsun.

Demo verilerinde tüm risk seviyeleri ve istisnai durumlar bulunmalı.

---

## 5. Hesaplama ve iş kuralları

### 5.1. Tahmini stok tükenme süresi

`remainingDays = stock / dailyAverageSales`

Örnek:

- Stok: 30
- Günlük satış: 5
- Kalan süre: 6 gün

Günlük ortalama satış sıfır olduğunda sıfıra bölme işlemi yapılmamalıdır.

### 5.2. Tedarik açığı

`stockGapDays = leadTimeDays - remainingDays`

Pozitif sonuç, tedarik süresinin kalan stok süresini aştığını ve tahmini stok açığı bulunduğunu gösterir.

Negatif sonuç, mevcut stok süresinin tedarik süresinden uzun olduğunu gösterir.

### 5.3. Stok durumları

Aşağıdaki kuralları belirtilen sırayla uygula:

1. `stock === 0` → **Tükendi**
2. `dailyAverageSales === 0` ve `stock > 0` → **Satış Yok**
3. `remainingDays <= 3` VEYA `remainingDays <= leadTimeDays` → **Kritik**
4. `remainingDays <= 7` → **Dikkat**
5. Diğer durumlar → **Normal**

Önemli: Tedarik süresi 7 günden uzun olduğunda da ürün kritik olabilir.

Örneğin kalan stok 12 gün ve tedarik süresi 15 gün ise durum Kritik olmalıdır.

Sınır değerlerini tam sayı yuvarlaması yapmadan karşılaştır. Yuvarlama yalnızca kullanıcıya gösterilen değerlerde kullanılsın.

Geçersiz veya eksik verileri sessizce sıfıra çevirme. Hesaplanamayan kayıtların uygulamayı çökertmeden ele alınmasını sağla.

---

## 6. Önceliklendirme

Tablo varsayılan olarak risk seviyesine göre sıralanmalı.

Öncelik sırası:

1. Tükendi
2. Kritik
3. Dikkat
4. Normal
5. Satış Yok

Kritik ürünler kendi aralarında `stockGapDays` değerine göre büyükten küçüğe sıralanmalı.

Eşitlik durumunda kalan stok süresi daha kısa olan üstte yer almalı.

Diğer risk seviyelerinde kalan stok süresi kısa olan ürün üstte bulunmalı.

Bu sıralama yaklaşımı, aciliyetin görselleştirilmesi için POC tasarım kararıdır.

---

## 7. UI/UX tasarım hedefi

Klasik ERP arayüzü veya kapsamlı admin dashboard oluşturma.

**Minimalist, son derece okunabilir, modern ve premium bir operasyon paneli tasarla.**

Tasarım yaklaşımı:

- Tek sayfa
- Açık renkli kurumsal tasarım
- Sade, güçlü tipografi
- Bol beyaz alan
- Minimal border ve gölgeler
- Gereksiz sidebar yok
- Gereksiz menüler yok
- Dekoratif grafikler yok
- Renkler yalnızca anlamlı durumlarda kullanılacak
- Türkçe arayüz
- Responsive yapı
- Erişilebilir kontrast ve klavye kullanımı

İyi bir operasyon dashboard'u, gereksiz bilgi yoğunluğu yaratmadan doğru kararı hızlı aldırmalıdır.

### Ekran hiyerarşisi

#### A. Üst başlık

Başlık: "Stok Uyarı Paneli"

Alt açıklama: "Ürün stoklarını ve tedarik risklerini tek ekrandan takip edin."

#### B. KPI kartları

Dört kompakt kart:

1. Toplam ürün
2. Stoğu tükenenler
3. Kritik stok
4. Dikkat gerektirenler

Tüm değerler JSON verisinden hesaplanmalı.

#### C. Operasyonel uyarı alanı

Örnek:

"2 ürünün stoğu tükenmiş, 6 ürün kritik seviyede."

Kritik ürün yoksa uygun bir bilgilendirme mesajı göster.

Siparişin gerçekten oluşturulduğunu ima eden hiçbir işlem veya mesaj bulunmamalıdır.

#### D. Ürün tablosu

Sütunlar:

- SKU
- Ürün adı
- Kategori
- Mevcut stok
- Günlük ortalama satış
- Kalan gün
- Tedarik süresi
- Durum

Kritik ürünlerin risk durumu belirgin olmalı.

Satırlar kolay taranabilir olmalı.

#### E. Arama ve filtreleme

- Ürün adı ve SKU araması
- Kategori filtresi
- Stok durumu filtresi
- Sayfalama
- Kullanıcı tercihiyle sıralama

Varsayılan aciliyet sıralaması ilk yüklemede aktif olmalı.

---

## 8. Kapsam dışı

Aşağıdaki işlevleri geliştirme:

- ERP
- Veritabanı
- REST API
- Stok güncelleme
- Excel yükleme
- Sipariş oluşturma
- Satın alma yönetimi
- Kullanıcı girişi
- Yetkilendirme
- E-posta veya SMS bildirimi
- AI stok tahmini
- Çok sayfalı admin sistemi
- Gereksiz analitik grafikler

---

## 9. Kabul testleri

Özellikle şu senaryoları doğrula:

| Test | Beklenen sonuç |
|---|---|
| Stok 0 | Tükendi |
| Stok 20, satış 10, tedarik 1 | Kritik |
| Stok 50, satış 10, tedarik 8 | Kritik |
| Stok 50, satış 10, tedarik 2 | Dikkat |
| Stok 100, satış 5, tedarik 4 | Normal |
| Stok 25, satış 0, tedarik 5 | Satış Yok |
| Kalan gün = tedarik süresi | Kritik |
| Kalan gün = 3 | Kritik |
| Kalan gün = 7, tedarik süresi 2 | Dikkat |

Ayrıca:

- Kritik ürünlerin doğru sıralandığını,
- KPI sonuçlarının tablodaki verilerle tutarlı olduğunu,
- Aramanın SKU ve ürün adında çalıştığını,
- Filtreleme ve sayfalamanın birlikte çalıştığını,
- Mobil görünümün bozulmadığını,
- Hatalı JSON verisinin uygulamayı çökertmediğini

test et.

---

## 10. Teslimatlar

1. Çalışan React uygulaması
2. Demo JSON veri dosyası
3. Stok hesaplama iş kuralları
4. Otomatik testler
5. README.md
6. Kabul kriterleri kontrol listesi
7. Kapsam ve varsayımlar dokümanı

README içerisinde projenin nasıl çalıştırılacağını açıkla.

Ayrıca iş analisti sunumunda kullanılabilecek kısa bir özet hazırla:

- İş problemi
- Mevcut süreç
- Hedef süreç
- Geliştirilen çözüm
- İş kuralları
- Kabul kriterleri
- Kapsam dışı konular
- Gelecek faz önerileri

## Son talimat

Bu projede öncelik, görsel açıdan karmaşık bir dashboard oluşturmak değil; gerçek iş problemini doğru analiz eden ve kabul kriterlerini karşılayan, profesyonel bir karar destek paneli geliştirmektir.

İlk adım olarak gereksinimleri değerlendir, sade bir UI önerisi ve uygulanabilir geliştirme planı oluştur. Onayımı bekle. Kodlamaya henüz başlama.