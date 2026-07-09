const { resolveCollege } = require("../utils/resolveCollege");

const jsonResponse = (data) => ({ json: () => Promise.resolve(data) });

beforeEach(() => {
  global.fetch = jest.fn();
});

describe("resolveCollege", () => {
  it("resolves a college from the full email domain", async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse([{ name: "IBU Sarajevo" }]));

    const college = await resolveCollege("student@ibu-unique-a.edu.ba");

    expect(college).toBe("IBU Sarajevo");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("ibu-unique-a.edu.ba"))
    );
  });

  it("walks up to a parent domain when the most specific subdomain has no match", async () => {
    global.fetch
      .mockResolvedValueOnce(jsonResponse([])) // stu.ibu-unique-b.edu.ba -> no match
      .mockResolvedValueOnce(jsonResponse([{ name: "IBU Unique B" }])); // ibu-unique-b.edu.ba -> match

    const college = await resolveCollege("student@stu.ibu-unique-b.edu.ba");

    expect(college).toBe("IBU Unique B");
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[0][0]).toContain(encodeURIComponent("stu.ibu-unique-b.edu.ba"));
    expect(global.fetch.mock.calls[1][0]).toContain(encodeURIComponent("ibu-unique-b.edu.ba"));
  });

  it("stops once only one domain part remains and returns null if nothing matched", async () => {
    global.fetch
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]));

    const college = await resolveCollege("student@sub.nomatch-unique-c.edu");

    expect(college).toBeNull();
    // "sub.nomatch-unique-c.edu" (3 parts) tries 2 candidates, never the bare "edu"
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("returns null for an email with no domain", async () => {
    const college = await resolveCollege("not-an-email");
    expect(college).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("caches results so the same domain is only queried once", async () => {
    global.fetch.mockResolvedValueOnce(jsonResponse([{ name: "Cached University" }]));

    const first = await resolveCollege("a@cache-unique-d.edu");
    const second = await resolveCollege("b@cache-unique-d.edu");

    expect(first).toBe("Cached University");
    expect(second).toBe("Cached University");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("treats a fetch failure as no match (caches null, does not throw)", async () => {
    global.fetch.mockRejectedValueOnce(new Error("network down"));

    const college = await resolveCollege("student@fails-unique-e.edu");

    expect(college).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
