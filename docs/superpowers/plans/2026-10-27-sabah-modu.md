# Sabah Modu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Panelin yerini alan, günde bir kez 08:30'dan sonra kendiliğinden açılan ve bir butonla açılıp kapanan "Sabah modu" görünümü.

**Architecture:** İş kuralları `src/domain/` altında saf fonksiyonlar olarak durur. "Sipariş gereken ürünler" mevcut `ProductAnalysis` durumlarından türetilir (Tükendi + Kritik), yeni eşik yoktur. Saat ve "bugün gösterildi" mantığı saf fonksiyonlardadır; React hook'u yalnızca zamanlayıcıyı ve localStorage'ı bağlar. Görünüm yeni bir bileşendir; `App` mod durumuna göre paneli ya da sabah görünümünü çizer.

**Tech Stack:** React 19, TypeScript, Tailwind 4, shadcn/ui, lucide-react, Vitest, Playwright (clock API).

**Spec:** `docs/superpowers/specs/2026-10-27-sabah-modu-design.md`

## Global Constraints

- Başlık sorusu, birebir: "Hangi ürünler kritik durumda ve acil sipariş gerektiriyor?"
- Sipariş gereken = durumu `out_of_stock` veya `critical` olan ürünler. Yeni eşik eklenmez.
- Otomatik açılma: yerel saatle 08:30 ve sonrası, günde bir kez. Hafta sonu ayrımı yok.
- Ekranda sipariş butonu ya da "sipariş oluşturuldu/verildi" ifadesi yok.
- Buton metni: normal modda "Sabah modu", sabah modunda "Panele dön". `aria-pressed` taşır.
- localStorage erişimi her zaman try/catch içinde. Hata olursa panel çökmez.
- Mevcut 72 birim ve 15 e2e testi yeşil kalır.

## Review Focus

1. Panel 08:30'dan önce açık bırakılır → 08:30'da mod kendiliğinden açılmalı (Task 3 e2e: clock ile 08:29 → 08:31).
2. localStorage okuma/yazma hata fırlatır (gizli pencere) → mod 08:30 sonrası yine açılır, sayfa çökmez (Task 2 birim testi: hata fırlatan depo).
3. Sipariş gereken ürün yok → "Bugün acil sipariş gerektiren ürün yok." (Task 1 birim testi).
4. Tükenen ürünün tedarik süresi 0 → "en erken 0 gün sonra" yazmamalı (Task 1 birim testi).
5. Aynı gün kapatılıp sayfa yenilenir → mod tekrar açılmamalı; ertesi gün 08:30'da açılmalı (Task 2 birim + Task 3 e2e).

---

### Task 1: Sipariş gereken ürünler (domain)

**Files:**
- Create: `src/domain/orderNeeds.ts`
- Test: `src/domain/orderNeeds.test.ts`

**Interfaces:**
- Consumes: `ProductAnalysis`, `StockStatus` (`src/domain/types.ts`); `formatDays` (`src/lib/format.ts`).
- Produces:
  ```ts
  export interface OrderNeed { analysis: ProductAnalysis; note: string; noSalesData: boolean }
  export interface OrderNeeds { outOfStock: OrderNeed[]; beforeRestock: OrderNeed[]; total: number }
  export function getOrderNeeds(analyses: readonly ProductAnalysis[]): OrderNeeds
  export function buildOrderSummary(total: number): string
  ```

- [ ] **Step 1: Write the failing tests** in `orderNeeds.test.ts` (analizleri `analyzeProduct` ile üret):
  - `getOrderNeeds` yalnızca `out_of_stock` ve `critical` ürünleri alır; `warning`/`normal`/`no_sales` dışarıda kalır.
  - Girdi sırası korunur (çağıran `sortByUrgency` ile sıralı verir): `[out A, critical B, critical C]` → `outOfStock=[A]`, `beforeRestock=[B, C]`, `total=3`.
  - Not metinleri, birebir:
    - stok 0, satış 4, tedarik 7 → `"Raf boş; yeni stok en erken 7 gün sonra gelir."`
    - stok 0, satış 2, tedarik 0 → `"Raf boş; yeni stok bugün gelebilir."`
    - stok 24, satış 2, tedarik 15 (açık 3) → `"Bugün sipariş verilse bile yaklaşık 3 gün stoksuz kalır."`
    - stok 20, satış 10, tedarik 1 (açık −1) → `"Bugün sipariş verilirse yeni stok yetişir."`
    - stok 0, satış 0, tedarik 4 → `noSalesData: true`; diğerlerinde `false`.
  - `buildOrderSummary(15)` → `"Bugün 15 ürün için sipariş vermeniz gerekiyor."`; `buildOrderSummary(0)` → `"Bugün acil sipariş gerektiren ürün yok."`
  - Hiçbir not ve özet `/oluştur|verildi/i` içermez.

- [ ] **Step 2: Run** `npx vitest run src/domain/orderNeeds.test.ts`. Expected: FAIL (stub olmadan modül yok; boş stub ile assertion hataları).

- [ ] **Step 3: Implement** `getOrderNeeds` ve `buildOrderSummary` in `src/domain/orderNeeds.ts`. Açık değeri `stockGapDays`'tan gelir ve `formatDays` ile yazılır. `stockGapDays > 0` ise "stoksuz kalır" notu, değilse "yetişir" notu kullanılır.

- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS, toplam 72 + yeni testler.

- [ ] **Step 5: Commit** `feat(domain): sabah modu için sipariş gereken ürünler`

### Task 2: Mesai saati ve günlük gösterim kuralı (domain + hook)

**Files:**
- Create: `src/domain/shiftClock.ts`, `src/components/useMorningMode.ts`
- Test: `src/domain/shiftClock.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const SHIFT_START = { hour: 8, minute: 30 } as const
  export function toLocalDateKey(now: Date): string              // "2026-10-27"
  export function isAfterShiftStart(now: Date): boolean           // 08:30:00 dahil
  export function shouldAutoOpen(now: Date, lastShown: string | null): boolean
  export function msUntilShiftStart(now: Date): number | null     // bugünkü 08:30 geçtiyse null
  export interface KeyValueStore { getItem(k: string): string | null; setItem(k: string, v: string): void }
  export function readLastShown(store: KeyValueStore | undefined): string | null   // hata → null
  export function writeLastShown(store: KeyValueStore | undefined, dateKey: string): void  // hata → sessiz
  export const LAST_SHOWN_KEY = "stok-paneli:sabah-modu:son-gosterim"
  ```
  Hook: `useMorningMode(): { isMorning: boolean; toggle: () => void }`.

- [ ] **Step 1: Write the failing tests** in `shiftClock.test.ts` (yerel saatle `new Date(2026, 9, 27, 8, 29)` gibi):
  - `toLocalDateKey(new Date(2026, 9, 7, 23, 59))` → `"2026-10-07"`.
  - `isAfterShiftStart`: 08:29:59 → false; 08:30:00 → true; 17:00 → true.
  - `shouldAutoOpen`: 08:29 + null → false; 08:30 + null → true; 09:00 + `"2026-10-27"` (bugün) → false; 09:00 + `"2026-10-26"` (dün) → true.
  - `msUntilShiftStart`: 08:00:00 → `30 * 60_000`; 08:30 → null; 12:00 → null.
  - `readLastShown`: depo hata fırlatırsa → null; `undefined` depo → null. `writeLastShown`: depo hata fırlatırsa fırlatmaz.

- [ ] **Step 2: Run** `npx vitest run src/domain/shiftClock.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement** `src/domain/shiftClock.ts`.

- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

- [ ] **Step 5: Implement `useMorningMode`** in `src/components/useMorningMode.ts`:
  - Mount'ta `shouldAutoOpen(new Date(), readLastShown(storage))` true ise modu aç ve `writeLastShown` ile bugünü kaydet.
  - `msUntilShiftStart` null değilse o süre sonra aynı kontrolü yapan bir `setTimeout` kur; unmount'ta temizle.
  - `toggle` yalnızca modu çevirir. Elle açılış 08:30 sonrasıysa bugünü kaydeder.
  - `storage` = `try { window.localStorage } catch { undefined }`.

  Bu hook'un davranışı Task 3'teki e2e testleriyle doğrulanır (jsdom eklenmez).

- [ ] **Step 6: Commit** `feat: mesai başlangıcı (08:30) ve günlük sabah modu kuralı`

### Task 3: Sabah görünümü, buton ve uçtan uca testler

**Files:**
- Create: `src/components/MorningView.tsx`
- Modify: `src/App.tsx` (başlığa buton; `Dashboard` yerine mod açıkken `MorningView`)
- Test: `e2e/morning.spec.ts`

**Interfaces:**
- Consumes: `getOrderNeeds`, `buildOrderSummary` (Task 1); `useMorningMode` (Task 2); `StatusBadge`, `formatDays`, `formatNumber`.
- Produces: `MorningView({ analyses, issueCount }: { analyses: ProductAnalysis[]; issueCount: number })`.

Görünüm (tasarım dokümanı §Benim kararlarım 2–4, 8):
- `h2` soru metni (Global Constraints), altında özet cümlesi (`data-testid="order-summary"`), tarih (`Intl.DateTimeFormat("tr-TR", { dateStyle: "full" })`) ve "Mesai başlangıcı 08:30".
- `issueCount > 0` ise not: `"${issueCount} kayıt hatalı veri nedeniyle değerlendirilemedi."`
- İki liste bölümü; başlıkları "Stoğu tükendi" ve "Yeni stok gelmeden tükenecek". Boş grup çizilmez.
- Her ürün `li` (`data-testid="order-item"`): ad, SKU, durum rozeti, "Mevcut stok", "Kalan gün", "Tedarik süresi" değerleri ve `note`. `noSalesData` ise "Satış verisi yok." eklenir.
- Mevcut palet ve kart dili kullanılır; masaüstünde iki sütun, mobilde tek sütun.
- Başlık butonu: `Sunrise` ikonu; metin "Sabah modu" / "Panele dön"; `aria-pressed={isMorning}`; `data-testid="morning-toggle"`.

- [ ] **Step 1: Write the failing e2e tests** in `e2e/morning.spec.ts` (masaüstü projesi; saat `page.clock.install({ time: new Date(2026, 9, 27, 8, 0) })` ile, `page.goto` öncesi):
  - 08:00'de açılış → normal panel (`kpi-total` görünür), buton metni "Sabah modu".
  - Butona tıkla → soru başlığı görünür; `order-summary` = `"Bugün 15 ürün için sipariş vermeniz gerekiyor."`; `order-item` sayısı 15; ilk öğe SK-1001 (Tükendi); SK-1003 öğesi `"Bugün sipariş verilse bile yaklaşık 3 gün stoksuz kalır."` içerir; SK-1052 öğesi "Satış verisi yok." içerir. Sayfada "Sipariş oluştur" yok.
  - Tekrar tıkla ("Panele dön") → panel geri gelir, `kpi-total-value` = 56.
  - Saat 08:31 ile açılış → sabah modu kendiliğinden açık. "Panele dön" → reload → normal panel kalır.
  - Saat 08:29 ile açılış (normal) → `page.clock.runFor("02:00")` → sabah modu kendiliğinden açılır.
  - Ertesi gün 08:31 (`setSystemTime(new Date(2026, 9, 28, 8, 31))`, aynı context) → reload → sabah modu açık.
  - Mobil proje (`@mobile`): sabah modu açıkken sayfa yatay taşmaz; konsol hatası yok.

- [ ] **Step 2: Run** `npx playwright test e2e/morning.spec.ts`. Expected: FAIL (buton yok).

- [ ] **Step 3: Implement** `MorningView` ve `App` değişikliği.

- [ ] **Step 4: Run** `npx playwright test`. Expected: tüm masaüstü ve mobil testler PASS (eski 15 + yeniler). Eski testler 08:30 sonrası çalışırsa sabah modu kendiliğinden açılacağından, `e2e/dashboard.spec.ts` içinde her testten önce saati 08:00'e sabitleyen bir `test.beforeEach` eklenir.

- [ ] **Step 5: Ekran görüntüsü** `docs/screenshots/morning.png` (masaüstü) bir e2e testinde alınır ve gözle kontrol edilir.

- [ ] **Step 6: Commit** `feat(ui): sabah modu görünümü ve geçiş butonu`

### Task 4: Dokümanlar ve son doğrulama

**Files:**
- Modify: `README.md`, `docs/KABUL_KRITERLERI.md`, `docs/KAPSAM_VE_VARSAYIMLAR.md`, `docs/SUNUM_OZETI.md`

- [ ] **Step 1:** `KABUL_KRITERLERI.md`'ye kullanıcının 5 kriterini tablo olarak ekle (her biri test adıyla). Sabah modu testlerini AC-20…AC-22 olarak ekle: AC-20 buton ile geçiş; AC-21 08:30'da günde bir kez otomatik açılma; AC-22 sipariş gereken ürünler doğru ve sipariş ima etmeyen dil.
- [ ] **Step 2:** `KAPSAM_VE_VARSAYIMLAR.md`'ye tasarımdaki kararları V13–V16 olarak ekle: Tükendi + Kritik tanımı, yerel saat ve hafta sonu ayrımı olmaması, localStorage ve hata davranışı, elle açılışın kaydı. README'ye "Sabah modu" bölümü, sunum özetine bir madde.
- [ ] **Step 3: Verify** `npx tsc --noEmit`, `npx vitest run`, `npx playwright test`, `npm run build` hepsi exit 0. Sayılar dokümana gerçek çıktıdan yazılır.
- [ ] **Step 4: Commit** `docs: sabah modu ve kabul kriterleri`
