import request from "supertest";
import { describe, expect, test } from "vitest";
import app from "../app.js";

describe("Users API", () => {
  test("GET /api/users returns users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0].name).toBe("Aqsa");
  });
});