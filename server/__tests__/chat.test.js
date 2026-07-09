const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../db/connection", () => ({ query: jest.fn() }));

jest.mock("groq-sdk", () =>
  jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue(
          (async function* () {
            yield { choices: [{ delta: { content: "Hello" } }] };
            yield { choices: [{ delta: { content: " world" } }] };
          })()
        ),
      },
    },
  }))
);

const app = require("../app");

const makeToken = () =>
  jwt.sign({ id: 1, username: "tester", email: "tester@example.com" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

describe("POST /api/chat", () => {
  it("rejects requests with no auth token", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ question: "why?", context: { kind: "array" } });
    expect(res.status).toBe(401);
  });

  it("rejects requests missing question or context", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({ question: "why?" });
    expect(res.status).toBe(400);
  });

  it("streams an SSE response for an authenticated request", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${makeToken()}`)
      .send({ question: "why?", context: { kind: "array", array: [1, 2, 3] } });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/event-stream/);
    expect(res.text).toContain("Hello");
    expect(res.text).toContain("[DONE]");
  });
});
