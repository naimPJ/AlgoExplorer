const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../db/connection", () => ({ query: jest.fn() }));

const db = require("../db/connection");
const app = require("../app");

beforeEach(() => {
  db.query.mockReset();
});

describe("POST /api/auth/register", () => {
  it("creates a new user and returns a token", async () => {
    db.query
      .mockResolvedValueOnce([[]]) // no existing user
      .mockResolvedValueOnce([{ insertId: 42 }]); // insert result

    const res = await request(app).post("/api/auth/register").send({
      username: "newuser",
      email: "new@example.com",
      password: "password123",
      college: "IBU",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: 42, username: "newuser", email: "new@example.com" });
    expect(typeof res.body.token).toBe("string");
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ id: 42, username: "newuser", email: "new@example.com" });
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "x" });
    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 6 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "x",
      email: "x@example.com",
      password: "123",
    });
    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("rejects a duplicate email", async () => {
    db.query.mockResolvedValueOnce([[{ email: "dupe@example.com", username: "other" }]]);

    const res = await request(app).post("/api/auth/register").send({
      username: "newname",
      email: "dupe@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email already exists/i);
  });

  it("rejects a duplicate username", async () => {
    db.query.mockResolvedValueOnce([[{ email: "other@example.com", username: "taken" }]]);

    const res = await request(app).post("/api/auth/register").send({
      username: "taken",
      email: "fresh@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username is already taken/i);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials", async () => {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("correct-password", 12);
    db.query.mockResolvedValueOnce([
      [{ id: 7, username: "someone", email: "someone@example.com", college: "IBU", password: hash }],
    ]);

    const res = await request(app).post("/api/auth/login").send({
      email: "someone@example.com",
      password: "correct-password",
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 7, username: "someone", email: "someone@example.com", college: "IBU" });
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects an unknown email", async () => {
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "whatever",
    });

    expect(res.status).toBe(401);
  });

  it("rejects a wrong password", async () => {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("correct-password", 12);
    db.query.mockResolvedValueOnce([
      [{ id: 7, username: "someone", email: "someone@example.com", college: "IBU", password: hash }],
    ]);

    const res = await request(app).post("/api/auth/login").send({
      email: "someone@example.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
  });

  it("rejects missing fields", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "someone@example.com" });
    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe("GET /api/auth/me", () => {
  const makeToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  it("returns the current user for a valid token", async () => {
    db.query.mockResolvedValueOnce([
      [{ id: 3, username: "me", email: "me@example.com", college: "IBU", created_at: "2024-01-01" }],
    ]);

    const token = makeToken({ id: 3, username: "me", email: "me@example.com" });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(3);
  });

  it("rejects a request with no Authorization header", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("rejects an invalid token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("returns 404 when the user no longer exists", async () => {
    db.query.mockResolvedValueOnce([[]]);
    const token = makeToken({ id: 999, username: "ghost", email: "ghost@example.com" });
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
