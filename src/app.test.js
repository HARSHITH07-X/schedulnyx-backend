import assert from "node:assert/strict";
import { after, test } from "node:test";

import { createApp } from "./app.js";
import { pool } from "./config/db.js";

const app = createApp();

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function request(server, method, path, { headers, body } = {}) {
  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

test("GET / returns the welcome payload", async () => {
  const server = await listen();
  try {
    const { status, json } = await request(server, "GET", "/");
    assert.equal(status, 200);
    assert.match(json.message, /Schedulnyx Backend Live/);
  } finally {
    server.close();
  }
});

test("unknown routes return 404 JSON", async () => {
  const server = await listen();
  try {
    const { status, json } = await request(server, "GET", "/does-not-exist");
    assert.equal(status, 404);
    assert.ok(json.error);
  } finally {
    server.close();
  }
});

test("protected routes reject requests without auth", async () => {
  const server = await listen();
  try {
    // No x-dev-uid header and no bearer token -> 401.
    const { status } = await request(server, "GET", "/api/auth/me");
    assert.equal(status, 401);
  } finally {
    server.close();
  }
});

after(async () => {
  await pool.end();
});
