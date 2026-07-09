const request = require("supertest");

// Real (unmocked) passport-google-oauth20 strategy: the initial redirect step
// only builds Google's authorization URL locally, no network call, so this
// runs fine against dummy client credentials.
jest.mock("../db/connection", () => ({ query: jest.fn() }));

const app = require("../app");

describe("GET /api/auth/google", () => {
  it("redirects to Google's OAuth consent screen", async () => {
    const res = await request(app).get("/api/auth/google");

    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^https:\/\/accounts\.google\.com/);
  });
});
