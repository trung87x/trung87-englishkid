import { describe, it, expect } from "vitest";
import { normalize, hasDiacritics } from "../utils/text.js";

describe("normalize", () => {
  it("strips VI diacritics & punctuation", () => {
    expect(normalize("chân")).toBe("chan");
    expect(normalize("Apple, Inc.")).toBe("apple inc");
  });
});

describe("hasDiacritics", () => {
  it("detects", () => {
    expect(hasDiacritics("chân")).toBe(true);
    expect(hasDiacritics("chan")).toBe(false);
  });
});
