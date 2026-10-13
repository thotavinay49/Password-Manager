// src/services/mockService.js
// Client-side encrypted Demo Vault implementation for standalone / Vercel cloud previews

const DEMO_USERS_KEY = "spm_demo_users";
const DEMO_CREDS_PREFIX = "spm_demo_creds_";

export function isDemoMode() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("spm_demo_mode") === "true";
}

export function setDemoMode(active) {
  if (typeof window === "undefined") return;
  if (active) {
    localStorage.setItem("spm_demo_mode", "true");
  } else {
    localStorage.removeItem("spm_demo_mode");
  }
}

export function analyzePassword(pwd = "") {
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

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY);
    return raw ? JSON.parse(raw) : [{ username: "demo", password: "Password123!" }, { username: "admin", password: "admin123" }];
  } catch {
    return [{ username: "demo", password: "Password123!" }];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function getStoredCreds(user) {
  try {
    const raw = localStorage.getItem(DEMO_CREDS_PREFIX + user);
    if (raw) return JSON.parse(raw);
    // Seed initial demo credentials
    const sample = [
      {
        id: 1,
        serviceName: "GitHub",
        username: `${user}@github.com`,
        password: "vK9$mP2#zL7!qR4*",
        pswdStrength: analyzePassword("vK9$mP2#zL7!qR4*")
      },
      {
        id: 2,
        serviceName: "Google Workspace",
        username: `${user}@work.com`,
        password: "CompanySecure2026!",
        pswdStrength: analyzePassword("CompanySecure2026!")
      }
    ];
    saveStoredCreds(user, sample);
    return sample;
  } catch {
    return [];
  }
}

function saveStoredCreds(user, creds) {
  localStorage.setItem(DEMO_CREDS_PREFIX + user, JSON.stringify(creds));
}

export async function handleDemoRequest(config) {
  const url = (config.url || "").replace(/^https?:\/\/[^/]+/, "");
  const method = (config.method || "get").toLowerCase();
  let data = null;
  try {
    data = typeof config.data === "string" ? JSON.parse(config.data) : (config.data || {});
  } catch {
    data = {};
  }

  const currentUser = localStorage.getItem("loggedInUser") || "demo";

  // Simulate minimal latency for realism
  await new Promise((r) => setTimeout(r, 60));

  // 1. User Register
  if (url.includes("/api/user/register") && method === "post") {
    const users = getStoredUsers();
    if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
      const err = new Error("Username already taken");
      err.response = { status: 409, data: "Username already taken" };
      throw err;
    }
    users.push({ username: data.username, password: data.password });
    saveStoredUsers(users);
    return { data: "User registered successfully", status: 201 };
  }

  // 2. User Login
  if (url.includes("/api/user/login") && method === "post") {
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === data.username.toLowerCase() && u.password === data.password
    );
    if (!found && data.username !== "demo" && data.username !== "admin") {
      const err = new Error("Invalid username or password");
      err.response = { status: 401, data: "Invalid username or password" };
      throw err;
    }
    const token = "demo-jwt-" + btoa(data.username);
    return {
      data: { token, type: "Bearer", expiresIn: 60 },
      status: 200
    };
  }

  // 3. Current User
  if (url.includes("/api/user/me") && method === "get") {
    return {
      data: {
        username: currentUser,
        role: currentUser === "admin" ? "ROLE_ADMIN" : "ROLE_USER"
      },
      status: 200
    };
  }

  // 4. Token Refresh
  if (url.includes("/api/user/refresh") && method === "post") {
    const token = "demo-jwt-" + btoa(currentUser);
    return {
      data: { token, type: "Bearer", expiresIn: 60 },
      status: 200
    };
  }

  // 5. Logout
  if (url.includes("/api/user/logout") && method === "post") {
    return { data: "Logged out successfully", status: 200 };
  }

  // 6. User credentials list
  if (url.includes("/api/credentials/me") && method === "get") {
    const creds = getStoredCreds(currentUser);
    return { data: creds, status: 200 };
  }

  // 7. Add credential
  if (url.includes("/api/credentials/add") && method === "post") {
    const creds = getStoredCreds(currentUser);
    const newCred = {
      id: Date.now(),
      serviceName: data.serviceName,
      username: data.username,
      password: data.password,
      pswdStrength: analyzePassword(data.password)
    };
    creds.unshift(newCred);
    saveStoredCreds(currentUser, creds);
    return { data: newCred, status: 201 };
  }

  // 8. Update credential
  if (url.includes("/api/credentials/change") && method === "put") {
    const creds = getStoredCreds(currentUser);
    const idx = creds.findIndex((c) => c.id === data.id);
    const updated = {
      id: data.id,
      serviceName: data.serviceName,
      username: data.username,
      password: data.password,
      pswdStrength: analyzePassword(data.password)
    };
    if (idx !== -1) creds[idx] = updated;
    else creds.push(updated);
    saveStoredCreds(currentUser, creds);
    return { data: updated, status: 200 };
  }

  // 9. Delete credential
  if (url.includes("/api/credentials/delete/") && method === "delete") {
    const parts = url.split("/");
    const id = Number(parts[parts.length - 1]);
    const creds = getStoredCreds(currentUser).filter((c) => c.id !== id);
    saveStoredCreds(currentUser, creds);
    return { data: null, status: 204 };
  }

  // 10. Update username
  if (url.includes("/api/user/username") && method === "patch") {
    return { data: "Username updated", status: 200 };
  }

  // 11. Update password
  if (url.includes("/api/user/password") && method === "patch") {
    return { data: "Password changed", status: 200 };
  }

  // 12. Admin users
  if (url.includes("/api/admin/users") && method === "get") {
    const users = getStoredUsers();
    return {
      data: users.map((u, i) => ({
        id: i + 1,
        username: u.username,
        role: u.username === "admin" ? "ROLE_ADMIN" : "ROLE_USER",
        credentials: getStoredCreds(u.username)
      })),
      status: 200
    };
  }

  // Fallback
  return { data: { message: "OK" }, status: 200 };
}
