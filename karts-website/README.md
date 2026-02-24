# 🛡️ PROYEK KARTS: SETUP GUIDE
**Fullstack System (C++ Backend & React Frontend)**

Panduan ini berisi langkah-langkah untuk menyiapkan lingkungan pengembangan agar Backend (C++) dan Frontend (React) dapat berkomunikasi dengan benar menggunakan sistem terbaru.

---

## 1. PRASYARAT SISTEM

### **Backend (C++)**
* **Compiler:** GCC 12+ (Gunakan **MSYS2 UCRT64** untuk Windows).
* **Build Tool:** CMake 3.10+ & Make.
* **Database:** Akun MySQL (Disarankan [Aiven Cloud](https://aiven.io/)).
* **Library Utama:**
  - `cpp-httplib` (Header-only).
  - `nlohmann/json` (Header-only).
  - `libmysqlclient` (Untuk koneksi MySQL).

### **Frontend (React)**
* **Node.js:** Versi LTS terbaru.
* **Package Manager:** NPM.

---

## 2. CARA MENJALANKAN BACKEND (C++)

### **Langkah Lokal (Windows/MSYS2):**
1. Buka terminal **MSYS2 UCRT64**.
2. Instal library MySQL yang diperlukan:
   ```bash
   pacman -S mingw-w64-ucrt-x86_64-mysql-connector-c
3. Tambahkan folder bin MSYS2 ke System PATH Windows: C:\msys64\ucrt64\bin.
4. Masuk ke folder karts-backend dan lakukan kompilasi:
   mkdir build && cd build
   cmake .. -G "MinGW Makefiles"
   mingw32-make
5. Jalankan aplikasi: ./karts-backend.exe

### **Langkah Docker (Deployment)**
Backend ini telah dikonfigurasi menggunakan Docker multi-stage build untuk optimasi ukuran image dan keamanan.

1. **Build Image:**
   ```bash
   docker build -t karts-backend .
2. **Run Container:**
   Gunakan flag -e untuk memasukkan password database sebagai environment variable.
      docker run -d \
      -p 8080:8080 \
      -e DB_PASSWORD=your_mysql_password \
      --name karts-app \
      karts-backend
3. **Verifikasi:**
   Cek apakah container berjalan dengan benar:
      docker ps
      docker logs karts-app

## 3. CARA MENJALANKAN FRONTEND (React/Vite)
1. Buka terminal (CMD / VS Code Terminal).
2. Masuk ke folder frontend.
3. Instal dependencies (jika pertama kali):
   npm install
4. Jalankan aplikasi:
   npm run dev
*Secara default frontend berjalan di http://localhost:5173*

## 4. KONFIGURASI DATABASE & LOGIN
### **A. Skema MySQL (Events & Announcements)**
   Pastikan tabel berikut sudah ada di database MySQL Aiven kamu:
      CREATE TABLE announcements (
       id INT AUTO_INCREMENT PRIMARY KEY,
       announcements VARCHAR(255),
       description TEXT,
       date DATE,
       location VARCHAR(255),
       urgent TINYINT(1)
   );

   CREATE TABLE events (
       id INT PRIMARY KEY,
       name VARCHAR(255),
       date DATE,
       location VARCHAR(255),
       description TEXT
   );

### ****B. Login Admin (JSON)***
Login menggunakan file lokal users.json. Format pengisian:
   [
      { "username": "admin", "password": "password123" }
   ]

## 5. PANDUAN EDIT (OFFICIAL NOTES)
Untuk menjaga kestabilan sistem, mohon jangan mengubah file berikut tanpa diskusi:
- Dockerfile & CMakeLists.txt.
- Bagian CORS Handler di main.cc.
- File konfigurasi: vite.config.js, tailwind.config.js, package.json.

## 6. TROUBLESHOOTING
### Error 115 (Connection Timeout)
Cek port MySQL di main.cc dan pastikan IP Whitelist di Aiven diset ke 0.0.0.0/0.

### Error 404 pada Post/Put/Delete
Pastikan endpoint tersebut sudah terdaftar di main.cc dan server sudah di-build ulang.

### Status 500 & Unexpected JSON Input
Cek Environment Variables di Render/Lokal. Pastikan DB_PASSWORD sudah terisi dan ca.pem tersedia di folder root backend.

=Last Updated 23 February 2026=

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
