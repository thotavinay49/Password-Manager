// api/index.js - Serverless Backend for Vercel deployment
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-which-is-long-enough-to-be-secure-default-dev";

// In-memory runtime database for Vercel serverless environment
const db = {
  users: new Map([
    ["admin", { username: "admin", passwordHash: hashPassword("admin123"), role: "ROLE_ADMIN" }],
    ["demo", { username: "demo", passwordHash: hashPassword("Password123!"), role: "ROLE_USER" }]
  ]),
  credentials: new Map([
    ["admin", []],
    ["demo", [
      {
        id: 1,
        serviceName: "GitHub",
        username: "demo@github.com",
        password: "vK9$mP2#zL7!qR4*",
        pswdStrength: analyzePassword("vK9$mP2#zL7!qR4*")
      },
      {
        id: 2,
        serviceName: "Google Workspace",
        username: "demo@work.com",
        password: "CompanySecure2026!",
        pswdStrength: analyzePassword("CompanySecure2026!")
      }
    ]]
  ])
};

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "spm_salt_2026").digest("hex");
}

function generateJWT(username, role = "ROLE_USER") {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    role,
    iat: now,
    exp: now + 15 * 60
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyJWT(token) {
  if (!token) return null;
  const parts = token.replace(/^Bearer\s+/, "").split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
  if (signature !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

function analyzePassword(pwd = "") {
  let score = 0;
  if (!pwd) return ["score:0", "crackTime:instant", "Enter a password"];
  const len = pwd.length;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);

  if (len >= 8) score++;
  if (len >= 12) score++;
  if (hasLower && hasUpper) score++;
  if (hasDigit && hasSymbol) score++;

  let crackTime = "instant";
  if (score === 1) crackTime = "3 minutes";
  else if (score === 2) crackTime = "5 hours";
  else if (score === 3) crackTime = "2 years";
  else if (score >= 4) crackTime = "centuries";

  const suggestions = [];
  suggestions.push(`score:${score}`);
  suggestions.push(`crackTime:${crackTime}`);
  if (len < 12) suggestions.push("Make it at least 12–16 characters long.");
  if (!hasLower) suggestions.push("Add lowercase letters.");
  if (!hasUpper) suggestions.push("Include uppercase letters.");
  if (!hasDigit) suggestions.push("Add digits to increase complexity.");
  if (!hasSymbol) suggestions.push("Include symbols like !, @, # for more entropy.");
  return suggestions;
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url || "";
  const method = (req.method || "GET").toUpperCase();
  const body = await parseBody(req);

  // Authenticate user for protected routes
  const authHeader = req.headers.authorization;
  const tokenPayload = verifyJWT(authHeader);
  const authUser = tokenPayload ? tokenPayload.sub : null;

  try {
    // 1. Health check
    if (url.includes("/api/user/hello")) {
      return res.status(200).send("Hello");
    }

    // 2. User Register
    if (url.includes("/api/user/register") && method === "POST") {
      const { username, password } = body;
      if (!username || !password || username.trim().length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters and password is required" });
      }
      const lower = username.trim().toLowerCase();
      if (db.users.has(lower)) {
        return res.status(409).send("Username already taken");
      }
      db.users.set(lower, {
        username: username.trim(),
        passwordHash: hashPassword(password),
        role: "ROLE_USER"
      });
      if (!db.credentials.has(lower)) {
        db.credentials.set(lower, []);
      }
      return res.status(201).send("User registered successfully");
    }

    // 3. User Login
    if (url.includes("/api/user/login") && method === "POST") {
      const { username, password } = body;
      if (!username || !password) {
        return res.status(401).send("Invalid username or password");
      }
      const lower = username.trim().toLowerCase();
      const user = db.users.get(lower);
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).send("Invalid username or password");
      }
      const token = generateJWT(user.username, user.role);
      res.setHeader("Set-Cookie", `refreshToken=${token}; HttpOnly; Path=/api; Max-Age=604800; SameSite=Lax`);
      return res.status(200).json({ token, type: "Bearer", expiresIn: 15 });
    }

    // 4. User Refresh
    if (url.includes("/api/user/refresh") && method === "POST") {
      const current = authUser || "demo";
      const token = generateJWT(current);
      return res.status(200).json({ token, type: "Bearer", expiresIn: 15 });
    }

    // 5. User Logout
    if (url.includes("/api/user/logout") && method === "POST") {
      res.setHeader("Set-Cookie", "refreshToken=; HttpOnly; Path=/api; Max-Age=0; SameSite=Lax");
      return res.status(200).send("Logged out successfully");
    }

    // 6. Current User Me
    if (url.includes("/api/user/me") && method === "GET") {
      if (!authUser) return res.status(401).json({ message: "Authentication required" });
      const lower = authUser.toLowerCase();
      const user = db.users.get(lower) || { username: authUser, role: "ROLE_USER" };
      return res.status(200).json({ username: user.username, role: user.role });
    }

    // 7. Get Credentials
    if (url.includes("/api/credentials/me") && method === "GET") {
      if (!authUser) return res.status(401).json({ message: "Authentication required" });
      const lower = authUser.toLowerCase();
      const list = db.credentials.get(lower) || [];
      return res.status(200).json(list);
    }

    // 8. Add Credential
    if (url.includes("/api/credentials/add") && method === "POST") {
      if (!authUser) return res.status(401).json({ message: "Authentication required" });
      const lower = authUser.toLowerCase();
      const list = db.credentials.get(lower) || [];
      const newCred = {
        id: Date.now(),
        serviceName: body.serviceName || "Unknown",
        username: body.username || "",
        password: body.password || "",
        pswdStrength: analyzePassword(body.password || "")
      };
      list.unshift(newCred);
      db.credentials.set(lower, list);
      return res.status(201).json(newCred);
    }

    // 9. Update Credential
    if (url.includes("/api/credentials/change") && method === "PUT") {
      if (!authUser) return res.status(401).json({ message: "Authentication required" });
      const lower = authUser.toLowerCase();
      const list = db.credentials.get(lower) || [];
      const idx = list.findIndex((c) => c.id === body.id);
      const updated = {
        id: body.id,
        serviceName: body.serviceName,
        username: body.username,
        password: body.password,
        pswdStrength: analyzePassword(body.password || "")
      };
      if (idx !== -1) list[idx] = updated;
      else list.unshift(updated);
      db.credentials.set(lower, list);
      return res.status(200).json(updated);
    }

    // 10. Delete Credential
    if (url.includes("/api/credentials/delete/") && method === "DELETE") {
      if (!authUser) return res.status(401).json({ message: "Authentication required" });
      const lower = authUser.toLowerCase();
      const id = Number(url.split("/").pop());
      const list = (db.credentials.get(lower) || []).filter((c) => c.id !== id);
      db.credentials.set(lower, list);
      return res.status(204).end();
    }

    // 11. Admin users
    if (url.includes("/api/admin/users") && method === "GET") {
      const usersList = Array.from(db.users.values()).map((u, i) => ({
        id: i + 1,
        username: u.username,
        role: u.role,
        credentials: db.credentials.get(u.username.toLowerCase()) || []
      }));
      return res.status(200).json(usersList);
    }

    // Fallback 404
    return res.status(404).json({ message: `API endpoint ${url} not found` });
  } catch (err) {
    console.error("Vercel API error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
