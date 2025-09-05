import { describe, it, expect, beforeAll } from "vitest";
import { performSearch } from "../services/SearchService.js";
import { loadData } from "../data/load.js";

beforeAll(async () => {
  await loadData();
});

describe("search", () => {
  it("EN search", () => {
    const r = performSearch({ q: "apple" });
    expect(r.length).greaterThan(0);
  });
  it("VI search with diacritics", () => {
    const r = performSearch({ q: "chân" });
    expect(r.length).greaterThan(0);
  });
  it("VI search without diacritics", () => {
    const r = performSearch({ q: "chan" });
    expect(r.length).greaterThan(0);
  });
});
