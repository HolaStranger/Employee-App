require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { client } = require("./cosmos");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ---- ENV ----
const DB_ID = process.env.COSMOS_DB;
const USERS_CONTAINER_ID = process.env.COSMOS_CONTAINER_USERS;
const LEAVE_CONTAINER_ID = process.env.COSMOS_CONTAINER_LEAVE;
const ROOM_CONTAINER_ID = process.env.COSMOS_CONTAINER_ROOM;
const CHAT_CONTAINER_ID = process.env.COSMOS_CONTAINER_CHAT; // optional
const JWT_SECRET = process.env.JWT_SECRET;

if (!DB_ID || !USERS_CONTAINER_ID || !LEAVE_CONTAINER_ID || !ROOM_CONTAINER_ID || !JWT_SECRET) {
  throw new Error(
    "Missing env. Need: COSMOS_DB, COSMOS_CONTAINER_USERS, COSMOS_CONTAINER_LEAVE, COSMOS_CONTAINER_ROOM, JWT_SECRET"
  );
}

// ---- COSMOS ----
const db = client.database(DB_ID);
const usersContainer = db.container(USERS_CONTAINER_ID);
const leaveContainer = db.container(LEAVE_CONTAINER_ID);
const roomContainer = db.container(ROOM_CONTAINER_ID);
const chatContainer = CHAT_CONTAINER_ID ? db.container(CHAT_CONTAINER_ID) : null;

// ---- Helpers: read partition key path and return correct PK value ----
const pkCache = new Map();

async function getPkPath(container) {
  const key = container.id;
  if (pkCache.has(key)) return pkCache.get(key);

  const { resource } = await container.read();
  const pkPath = resource?.partitionKey?.paths?.[0] || "/id"; // fallback
  pkCache.set(key, pkPath);
  return pkPath;
}

async function replaceById(container, doc) {
  const pkPath = await getPkPath(container);
  const pkField = pkPath.replace("/", ""); // "/userId" -> "userId"
  const pkValue = doc[pkField];

  if (!pkValue) {
    throw new Error(`Partition key value missing. Container PK=${pkPath}, expected doc.${pkField}`);
  }

  await container.item(doc.id, pkValue).replace(doc);
}

// Health check
app.get("/", (req, res) => res.json({ ok: true, message: "EmployeeApp backend running" }));

// Debug: check containers exist (VERY IMPORTANT)
app.get("/debug/containers", async (req, res) => {
  try {
    const results = {};

    async function testContainer(c) {
      const { resource } = await c.read();
      return {
        id: c.id,
        pk: resource.partitionKey?.paths?.[0],
      };
    }

    results.users = await testContainer(usersContainer);
    results.leave = await testContainer(leaveContainer);
    results.room = await testContainer(roomContainer);

    if (chatContainer) results.chat = await testContainer(chatContainer);

    res.json({ ok: true, containers: results });
  } catch (err) {
    res.status(500).json({ message: "debug failed", details: err?.message || String(err) });
  }
});

// --------------------
// AUTH
// --------------------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, role are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role).trim().toLowerCase();

    const { resources: existing } = await usersContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: normalizedEmail }],
      })
      .fetchAll();

    if (existing.length > 0) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const userId = `EMP${Date.now()}`;

    const userDoc = {
      id: userId,
      userId,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      department: department ? String(department) : "General",
      createdAt: new Date().toISOString(),
    };

    await usersContainer.items.create(userDoc);

    const token = jwt.sign({ userId: userDoc.userId, email: userDoc.email, role: userDoc.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      userId: userDoc.userId,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      department: userDoc.department,
      token,
    });
  } catch (err) {
    console.error("[/signup] error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, role are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = String(role).trim().toLowerCase();

    const { resources: users } = await usersContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: normalizedEmail }],
      })
      .fetchAll();

    if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];
    const dbRole = String(user.role || "").trim().toLowerCase();
    if (dbRole !== normalizedRole) return res.status(401).json({ message: "Role does not match" });

    const ok = await bcrypt.compare(String(password), String(user.passwordHash || ""));
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.userId, email: user.email, role: dbRole }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: dbRole,
      department: user.department,
      token,
    });
  } catch (err) {
    console.error("[/login] error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// --------------------
// REQUESTS
// We keep ONE endpoint "/requests" for your app,
// but we STORE into 2 different containers:
// - leaveContainer for type=leave
// - roomContainer for type=room
// --------------------

// GET /requests?userId=EMPxxx  (manager: no userId => all)
app.get("/requests", async (req, res) => {
  try {
    const userId = req.query.userId ? String(req.query.userId) : null;

    const leaveQuery = userId
      ? {
          query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
          parameters: [{ name: "@userId", value: userId }],
        }
      : { query: "SELECT * FROM c ORDER BY c.createdAt DESC", parameters: [] };

    const roomQuery = userId
      ? {
          query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
          parameters: [{ name: "@userId", value: userId }],
        }
      : { query: "SELECT * FROM c ORDER BY c.createdAt DESC", parameters: [] };

    const { resources: leave } = await leaveContainer.items.query(leaveQuery).fetchAll();
    const { resources: room } = await roomContainer.items.query(roomQuery).fetchAll();

    const combined = [...leave, ...room].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json(combined);
  } catch (err) {
    console.error("[GET /requests] error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /requests  (create leave OR room)
app.post("/requests", async (req, res) => {
  try {
    const body = req.body || {};
    const type = String(body.type || "").toLowerCase();

    if (!type) return res.status(400).json({ message: "Missing type" });
    if (!body.userId || !body.userName) return res.status(400).json({ message: "Missing userId/userName" });

    if (type === "leave") {
      const { leaveType, startDate, endDate, reason } = body;
      if (!leaveType || !startDate || !endDate || !reason) {
        return res.status(400).json({ message: "Missing required leave fields" });
      }

      const doc = {
        id: `leave-${Date.now()}`,
        type: "leave",
        userId: String(body.userId),
        userName: String(body.userName),
        leaveType,
        startDate,
        endDate,
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // IMPORTANT: make sure doc has correct PK field
      const pkPath = await getPkPath(leaveContainer);
      const pkField = pkPath.replace("/", "");
      if (!doc[pkField]) doc[pkField] = doc.userId;

      await leaveContainer.items.create(doc);
      return res.status(201).json(doc);
    }

    if (type === "room") {
      const { roomName, date, startTime, endTime, duration, purpose } = body;
      if (!roomName || !date || !startTime || !endTime || !duration || !purpose) {
        return res.status(400).json({ message: "Missing required room booking fields" });
      }

      // Create a roomId because your room container PK might be /roomId (your screenshot shows /roomId)
      const roomId = `ROOM-${Date.now()}`;

      const doc = {
        id: `room-${Date.now()}`,
        type: "room",
        userId: String(body.userId),
        userName: String(body.userName),
        roomId, // ✅ important if PK is /roomId
        roomName,
        date,
        startTime,
        endTime,
        duration: Number(duration),
        purpose,
        status: "booked",
        createdAt: new Date().toISOString(),
      };

      const pkPath = await getPkPath(roomContainer);
      const pkField = pkPath.replace("/", "");
      if (!doc[pkField]) doc[pkField] = doc.roomId; // if PK is /roomId

      await roomContainer.items.create(doc);
      return res.status(201).json(doc);
    }

    return res.status(400).json({ message: "Invalid request type" });
  } catch (err) {
    console.error("[POST /requests] error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /requests/:id  (approve/reject)  -> ONLY leave normally, but we support both.
app.patch("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body || {};
    if (!status) return res.status(400).json({ message: "Missing status" });

    // 1) Try find in LEAVE container
    const { resources: leaveFound } = await leaveContainer.items
      .query({ query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] })
      .fetchAll();

    if (leaveFound.length > 0) {
      const existing = leaveFound[0];
      const updated = {
        ...existing,
        status: String(status).toLowerCase(),
        approvedBy: approvedBy ? String(approvedBy) : existing.approvedBy,
        updatedAt: new Date().toISOString(),
      };

      await replaceById(leaveContainer, updated);
      return res.json(updated);
    }

    // 2) Try find in ROOM container
    const { resources: roomFound } = await roomContainer.items
      .query({ query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] })
      .fetchAll();

    if (roomFound.length > 0) {
      const existing = roomFound[0];
      let newStatus = String(status).toLowerCase();
      if (existing.type === "room" && newStatus === "approved") newStatus = "booked";

      const updated = {
        ...existing,
        status: newStatus,
        approvedBy: approvedBy ? String(approvedBy) : existing.approvedBy,
        updatedAt: new Date().toISOString(),
      };

      await replaceById(roomContainer, updated);
      return res.json(updated);
    }

    return res.status(404).json({ message: "Request not found" });
  } catch (err) {
    console.error("[PATCH /requests/:id] FULL error:", err);
    res.status(500).json({
      message: "Failed to approve request",
      details: err?.message || String(err),
    });
  }
});

// DELETE /requests/:id (cancel)
app.delete("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { resources: leaveFound } = await leaveContainer.items
      .query({ query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] })
      .fetchAll();

    if (leaveFound.length > 0) {
      const doc = leaveFound[0];
      const pkPath = await getPkPath(leaveContainer);
      const pkField = pkPath.replace("/", "");
      await leaveContainer.item(doc.id, doc[pkField]).delete();
      return res.json({ ok: true });
    }

    const { resources: roomFound } = await roomContainer.items
      .query({ query: "SELECT * FROM c WHERE c.id = @id", parameters: [{ name: "@id", value: id }] })
      .fetchAll();

    if (roomFound.length > 0) {
      const doc = roomFound[0];
      const pkPath = await getPkPath(roomContainer);
      const pkField = pkPath.replace("/", "");
      await roomContainer.item(doc.id, doc[pkField]).delete();
      return res.json({ ok: true });
    }

    return res.status(404).json({ message: "Request not found" });
  } catch (err) {
    console.error("[DELETE /requests/:id] error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// --------------------
// CHAT (Cosmos)
// --------------------
app.get("/chat", async (req, res) => {
  try {
    if (!chatContainer) return res.status(500).json({ message: "Chat container not configured" });

    const userId = req.query.userId ? String(req.query.userId) : null;

    const q = userId
      ? {
          query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.timestamp ASC",
          parameters: [{ name: "@userId", value: userId }],
        }
      : { query: "SELECT * FROM c ORDER BY c.timestamp ASC", parameters: [] };

    const { resources } = await chatContainer.items.query(q).fetchAll();
    return res.json(resources);
  } catch (err) {
    console.error("[GET /chat] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { sessionId, sender, content, timestamp } = req.body || {};

    if (!sessionId || !sender || !content) {
      return res.status(400).json({
        message: "Missing sessionId/sender/content",
      });
    }

    const doc = {
      id: `msg-${Date.now()}`,
      sessionId: String(sessionId),
      sender: String(sender),
      content: String(content),
      timestamp: timestamp || new Date().toISOString(),
    };

    await chatContainer.items.create(doc);

    return res.status(201).json(doc);
  } catch (err) {
    console.error("[POST /chat] error:", err);
    return res.status(500).json({
      message: "Failed to save chat",
    });
  }
});

// --------------------
// CHAT (Cosmos)
// --------------------

// GET /chat?userId=EMPxxx
app.get("/chat", async (req, res) => {
  try {
    if (!chatContainer) return res.status(500).json({ message: "Chat container not configured" });

    const userId = req.query.userId ? String(req.query.userId) : null;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const { resources } = await chatContainer.items
      .query({
        query: "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt ASC",
        parameters: [{ name: "@userId", value: userId }],
      })
      .fetchAll();

    return res.json(resources);
  } catch (err) {
    console.error("[GET /chat] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /chat  { userId, messages: [...] } OR { userId, message: {...} }
// --------------------
// CHAT
// --------------------
app.post("/chat", async (req, res) => {
  try {
    const { sessionId, sender, content, timestamp } = req.body || {};

    if (!sessionId || !sender || !content) {
      return res.status(400).json({
        message: "Missing sessionId/sender/content",
      });
    }

    if (!chatContainer) {
      return res.status(500).json({
        message: "Chat container not configured",
      });
    }

    const doc = {
      id: `msg-${Date.now()}`,
      sessionId: String(sessionId),   // ✅ IMPORTANT (partition key)
      sender: String(sender),
      content: String(content),
      timestamp: timestamp || new Date().toISOString(),
    };

    await chatContainer.items.create(doc);

    return res.status(201).json(doc);
  } catch (err) {
    console.error("[POST /chat] error:", err);
    return res.status(500).json({
      message: "Failed to save chat",
      details: err?.message || String(err),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});