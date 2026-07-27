import { afterEach, describe, expect, it, vi } from "vitest";
import { createId } from "./createId";

describe("createId", () => {
  const originalCrypto = globalThis.crypto;
  afterEach(() => vi.stubGlobal("crypto", originalCrypto));

  it("works when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (bytes: Uint8Array) => { bytes.forEach((_, index) => { bytes[index] = index + 1; }); return bytes; },
    });
    expect(createId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("still creates an id without Web Crypto", () => {
    vi.stubGlobal("crypto", undefined);
    expect(createId().length).toBeGreaterThan(10);
  });
});
