const request = require("supertest");

jest.mock("../db/connection", () => ({ query: jest.fn() }));

const app = require("../app");

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
