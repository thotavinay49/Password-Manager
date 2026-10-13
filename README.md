# 🔐 SecurePasswordManagerSystem

**SecurePasswordManagerSystem** is a modern, enterprise-grade full-stack password management application engineered for zero-compromise security, real-time cryptographic analysis, and seamless cloud deployment.

---

## 🚀 Live Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Lucide React
- **Backend:** Java 21, Spring Boot 3.5.3, Spring Security 6, Spring Data JPA, Hibernate
- **Database:** Aiven Cloud MySQL 8.4 (Managed, TLS/SSL Required, HikariCP Connection Pool)
- **Encryption:** AES-256-GCM (Field-level encryption at rest)
- **Authentication:** Stateless JWT + HTTP-Only `SameSite=None; Secure` Refresh Cookies
- **Deployment:** Render (Backend Docker Web Service) + Vercel (Frontend Static Web App)

---

## 📌 Key Features

- **Zero-Exposure Credential Storage:** Passwords are encrypted with AES-256-GCM in the backend before being persisted to the Aiven Cloud MySQL database.
- **Executive Security Dashboard:**
  - 4 Live KPI Cards (Total Saved Passwords, Vault Health %, High Entropy Keys, At-Risk Items).
  - Visual Strength Distribution Donut Ring.
  - Interactive Security Inspector calculating password crack resistance.
- **Smart Password Generator:** Cryptographically random, high-entropy password generation with customizable criteria and one-click clipboard sync.
- **Dynamic Connection Switcher:** Built-in UI modal for switching between local backend (`http://localhost:8080`), Cloudflare tunnels, and cloud production URLs.
- **Responsive Theme Engine:** Glassmorphic modern dark and light mode aesthetics.

---

## 📂 Project Structure

```text
SecurePasswordManagerSystem/
├── backend/                  # Spring Boot 3.5.3 (Java 21) REST API
│   ├── src/main/java/        # Controllers, Services, Models, Security
│   ├── src/main/resources/   # application.properties (Aiven Cloud DB config)
│   ├── Dockerfile            # Multi-stage production build
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
├── Frontend/                 # React 19 + Vite 7 + Tailwind CSS
│   ├── src/components/       # UI Components, Credential Modals, Generator
│   ├── src/pages/            # Dashboard, Login, Register, Generator, Settings
│   ├── src/services/         # API Interceptors & Service Layer
│   ├── vercel.json           # Vercel SPA router rewrite rules
│   └── vite.config.js
├── docker-compose.yml        # Local container orchestration
├── render.yaml               # Render Infrastructure-as-Code Blueprint
└── README.md
```

---

## ⚙️ Running Locally

### 1️⃣ Prerequisites
- Java 21 JDK
- Node.js (v20+ or v24+)

### 2️⃣ Backend Setup
```powershell
cd backend
$env:DB_PASSWORD = "<your-aiven-db-password>"
.\mvnw.cmd spring-boot:run
```
*The backend connects to Aiven Cloud MySQL and starts on `http://localhost:8080`.*

### 3️⃣ Frontend Setup
```powershell
cd Frontend
npm install
npm run dev
```
*The frontend starts on `http://localhost:5173` with automated proxying to the backend.*

---

## 🌐 Cloud Deployment

### 1. Render (Backend)
1. Link GitHub repository: `https://github.com/thotavinay49/Password-Manager`.
2. Render uses `render.yaml` or `backend/Dockerfile` automatically.
3. In the Render Environment tab, set:
   - `DB_PASSWORD = <your-aiven-db-password>`

### 2. Vercel (Frontend)
1. Import repository on Vercel.
2. Set Root Directory to `Frontend`.
3. Add Environment Variable:
   - `VITE_BACKEND_URL = https://your-backend-name.onrender.com`

---

## 📜 License
MIT License. Free to use and modify.
