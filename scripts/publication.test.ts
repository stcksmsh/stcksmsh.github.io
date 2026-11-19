// Run: npm run test:publication
// Exercises the Level 3 publication.json contract with fake fetch responses:
// parsing, failure isolation (never throws), and unlisted filtering.
import assert from "node:assert/strict";
import { fetchPublication, publicationFields, websiteBranch } from "./publication";
import { isListed } from "../src/lib/listing";

const fake = (status: number, body: string): typeof fetch =>
  (async () => new Response(body, { status })) as typeof fetch;
const throwing: typeof fetch = async () => { throw new TypeError("fetch failed (ENOTFOUND)"); };

const valid = { schemaVersion: 1, url: "https://stcksmsh.github.io/kabl/", category: "software", visibility: "public" };

const cases: Array<[string, () => Promise<void> | void]> = [
  ["websiteBranch maps manifest flag", () => {
    assert.equal(websiteBranch(undefined), null);
    assert.equal(websiteBranch(false), null);
    assert.equal(websiteBranch(true), "website");
    assert.equal(websiteBranch("site-v2"), "site-v2");
    assert.equal(websiteBranch("  "), null);
  }],
  ["valid publication.json parses and merges only url/category/visibility", async () => {
    const pub = await fetchPublication("o/r", "website", fake(200, JSON.stringify({ ...valid, preview: "https://x.test/p.png" })));
    assert.ok(pub);
    assert.deepEqual(publicationFields(pub), { url: valid.url, category: "software", visibility: "public" });
  }],
  ["404 → null", async () => {
    assert.equal(await fetchPublication("o/r", "website", fake(404, "Not Found")), null);
  }],
  ["500 → null", async () => {
    assert.equal(await fetchPublication("o/r", "website", fake(500, "")), null);
  }],
  ["network error → null (no throw)", async () => {
    assert.equal(await fetchPublication("o/r", "website", throwing), null);
  }],
  ["malformed JSON → null", async () => {
    assert.equal(await fetchPublication("o/r", "website", fake(200, "{ nope")), null);
  }],
  ["schema violations → null", async () => {
    for (const bad of [
      { ...valid, schemaVersion: 2 },
      { ...valid, url: "not a url" },
      { ...valid, category: "blog" },
      { ...valid, visibility: "secret" },
      { schemaVersion: 1 },
    ]) {
      assert.equal(await fetchPublication("o/r", "website", fake(200, JSON.stringify(bad))), null, JSON.stringify(bad));
    }
  }],
  ["unlisted filtered out of listings, public/absent kept", () => {
    const all = [{ slug: "a" }, { slug: "b", visibility: "public" }, { slug: "c", visibility: "unlisted" }];
    assert.deepEqual(all.filter(isListed).map((p) => p.slug), ["a", "b"]);
  }],
];

let failed = 0;
for (const [name, fn] of cases) {
  try { await fn(); console.log(`ok   ${name}`); }
  catch (e) { failed++; console.error(`FAIL ${name}\n`, e); }
}
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
