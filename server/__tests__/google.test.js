const request = require("supertest");

jest.mock("../db/connection", () => ({ query: jest.fn() }));

const passportMockState = { user: null, fail: false };

jest.mock("../middleware/passport", () => ({
  initialize: () => (req, res, next) => next(),
  authenticate: (strategy, options) => (req, res, next) => {
    if (passportMockState.fail) {
      return res.redirect(options.failureRedirect);
    }
    req.user = passportMockState.user;
    next();
  },
}));

const app = require("../app");

beforeEach(() => {
  passportMockState.user = null;
  passportMockState.fail = false;
});

describe("GET /api/auth/google/callback", () => {
  it("mints a JWT and redirects to the frontend with token+user on success", async () => {
    passportMockState.user = { id: 5, username: "googleuser", email: "g@example.com", college: "IBU" };

    const res = await request(app).get("/api/auth/google/callback");

    expect(res.status).toBe(302);
    const location = new URL(res.headers.location);
    expect(location.origin + location.pathname).toBe("http://localhost:5173/auth/callback");
    expect(location.searchParams.get("token")).toBeTruthy();
    expect(JSON.parse(location.searchParams.get("user"))).toEqual({
      id: 5,
      username: "googleuser",
      email: "g@example.com",
      college: "IBU",
    });
  });

  it("redirects to the failure URL when authentication fails", async () => {
    passportMockState.fail = true;

    const res = await request(app).get("/api/auth/google/callback");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:5173/auth?error=sso_failed");
  });
});
