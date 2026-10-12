# 🔐 Password Manager

A secure, full-stack password management application built with **Spring Boot** (Backend) and **React** (Frontend).  
It allows users to store, manage, and generate strong passwords with encryption and authentication.

---

## 📌 Features
- **User Authentication**: JWT-based secure login & registration.
- **Credential Management**:
  - Add, view, update, delete credentials.
  - Search and filter credentials.
- **Password Generator**:
  - Generate strong random passwords.
  - Visual strength indicator (badge & ring).
- **Responsive UI**:
  - Built with modular components and reusable UI elements.
- **Secure Storage**:
  - Passwords stored in encrypted form in the database.
- **Audit Logging**:
  - Track user actions and credential changes.

---

## 🛠 Tech Stack

### Backend
- **Java 17** + **Spring Boot**
- **Spring Security** with JWT
- **H2 Database** (dev) / can be replaced with MySQL/PostgreSQL
- **Maven**

### Frontend
- **React 18** + Vite
- **Context API** for theme & toast notifications
- **Custom Hooks** for clipboard and local storage

---

## 📂 Project Structure
```
PasswordManager/
│
├── App/
│   ├── Backend/         # Spring Boot backend
│   │   ├── src/main/java/com/PasswordManager/Backend/
│   │   ├── data/        # H2 database files
│   │   └── pom.xml
│   │
│   ├── Frontend/        # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── styles/
│   │   ├── index.html
│   │   └── vite.config.js
│   │
│   └── data/            # App-level data storage
│
└── README.md
```

---

## ⚙️ Setup & Run

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/Password-Manager.git
cd Password-Manager/App
```

### 2️⃣ Backend Setup
```bash
cd Backend
mvnw.cmd clean install
```

In MySQL Workbench, connect to your local MySQL server and run this once. Replace the example password with a new password of your choice:
```sql
CREATE DATABASE IF NOT EXISTS passwordmanagerdb;
CREATE USER IF NOT EXISTS 'VINAY_SECURED'@'localhost'
  IDENTIFIED BY 'replace-with-a-new-strong-password';
ALTER USER 'VINAY_SECURED'@'localhost'
  IDENTIFIED BY 'replace-with-a-new-strong-password';
GRANT ALL PRIVILEGES ON passwordmanagerdb.* TO 'VINAY_SECURED'@'localhost';
```

Set the same credentials for Spring Boot in PowerShell, then start the backend. `DB_USERNAME` and `DB_PASSWORD` are required; the backend does not fall back to the MySQL `root` account:
```powershell
$env:DB_USERNAME = "VINAY_SECURED"
$env:DB_PASSWORD = "<the new MySQL password>"
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:CREDENTIAL_ENCRYPTION_KEY = [Convert]::ToBase64String($bytes)
.\mvnw.cmd spring-boot:run
```

Generate `CREDENTIAL_ENCRYPTION_KEY` once and keep it private and backed up. Reuse that exact key on every backend restart; changing or losing it makes saved credential passwords unreadable. Saved vault passwords are encrypted by the backend using AES-GCM before being stored in MySQL. Existing plaintext vault passwords are encrypted the first time that user's vault is fetched. The backend connects to MySQL at **`localhost:3306`**. User accounts and application data are stored in `passwordmanagerdb`. The backend starts at **`http://localhost:8080`**.

### 3️⃣ Frontend Setup
```bash
cd ../Frontend
npm install
npm run dev
```
The frontend will start at **`http://localhost:5173`** (Vite default).

---

## 🔑 Environment Variables

**Backend environment variables** (set these before starting Spring Boot)
```properties
DB_URL=jdbc:mysql://localhost:3306/passwordmanagerdb?createDatabaseIfNotExist=true&serverTimezone=UTC
DB_USERNAME=VINAY_SECURED
DB_PASSWORD=your_mysql_password
CREDENTIAL_ENCRYPTION_KEY=base64_encoded_32_byte_key
jwt.secret=your_jwt_secret
```

**Frontend (`.env`)**
```env
# Optional: omit to use the Vite /api proxy to localhost:8080
VITE_BACKEND_URL=http://localhost:8080
```

---

## 📸 Screenshots
*(You can add screenshots here later)*

---

## 🛡 Security Notes
- Vault passwords are encrypted in the backend before database storage. Protect and back up `CREDENTIAL_ENCRYPTION_KEY`; do not commit or rotate it without migrating existing data.
- JWT tokens are used for authentication.
- Implement HTTPS in production.

---

## 📜 License
MIT License. Free to use and modify.

---
