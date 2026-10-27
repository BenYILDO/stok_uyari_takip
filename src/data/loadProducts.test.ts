import { describe, expect, it } from "vitest";
import { loadProducts } from "./loadProducts";

const respond = (body: string, status = 200) => async () =>
  new Response(body, { status, headers: { "Content-Type": "application/json" } });

const item = {
  sku: "SK-1",
  name: "A",
  category: "Walking",
  stock: 0,
  dailyAverageSales: 4,
  leadTimeDays: 3,
};

describe("loadProducts — AC-19", () => {
  it("geçerli JSON'u analiz edip aciliyete göre sıralar", async () => {
    const result = await loadProducts(
      "/x.json",
      respond(JSON.stringify([{ ...item, sku: "SK-2", stock: 100 }, item])),
    );
    expect(result.status).toBe("ready");
    expect(result.status === "ready" && result.analyses.map((a) => a.product.sku)).toEqual([
      "SK-1",
      "SK-2",
    ]);
  });

  it("geçersiz kayıtları issues olarak taşır", async () => {
    const result = await loadProducts("/x.json", respond(JSON.stringify([item, { sku: "X" }])));
    expect(result.status === "ready" && result.issues.map((i) => i.row)).toEqual([2]);
  });

  it("bozuk JSON'da hata durumu döner, çökmez", async () => {
    expect(await loadProducts("/x.json", respond("[{ bozuk"))).toEqual({
      status: "error",
      message: "Ürün dosyası okunamadı: geçerli bir JSON değil.",
    });
  });

  it("dizi olmayan JSON'da hata durumu döner", async () => {
    expect(await loadProducts("/x.json", respond('{"a":1}'))).toEqual({
      status: "error",
      message: "Ürün verisi bir liste olmalı.",
    });
  });

  it("HTTP hatasında durum kodunu bildirir", async () => {
    expect(await loadProducts("/x.json", respond("", 404))).toEqual({
      status: "error",
      message: "Ürün dosyası yüklenemedi (HTTP 404).",
    });
  });

  it("ağ hatasında hata durumu döner", async () => {
    const failing = async () => {
      throw new TypeError("Failed to fetch");
    };
    expect(await loadProducts("/x.json", failing)).toEqual({
      status: "error",
      message: "Ürün dosyası yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.",
    });
  });
});
