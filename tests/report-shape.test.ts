import { describe, expect, it } from "vitest";
import { COMMON_PORTS } from "@/lib/scanner/ports";

describe("scanner constants", () => {
  it("keeps v1 port scanning limited to the approved common-port list", () => {
    expect(COMMON_PORTS.map((item) => item.port)).toEqual([
      21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3306, 5432, 6379, 8080, 8443
    ]);
  });
});
