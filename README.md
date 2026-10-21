# 🎮 DEKTHEP STORE - ระบบเข้าสู่ระบบ & สมัครสมาชิก (Auth System)

ระบบ UI เข้าสู่ระบบและสมัครสมาชิก ดีไซน์สไตล์ Gaming Dark Theme โทนสีน้ำเงินนีออน พร้อมระบบสมัครสมาชิกด้วยชื่อผู้ใช้/อีเมล และเชื่อมต่อ **Discord OAuth 2.0** และ **Google OAuth 2.0** ของจริง 100%

---

## 🚀 วิธีการเริ่มต้นใช้งาน (Quick Start)

### 1. เปิด Terminal ในโฟลเดอร์นี้ แล้วรันคำสั่ง:
```bash
npm start
```
หรือหากต้องการให้เซิร์ฟเวอร์รีโหลดอัตโนมัติเมื่อแก้ไขโค้ด:
```bash
npm run dev
```

### 2. เข้าใช้งานผ่านเว็บเบราว์เซอร์
เปิดเบราว์เซอร์ไปที่:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 วิธีตั้งค่าเชื่อมต่อ Discord และ Google OAuth (ของจริง)

ข้อมูลการเชื่อมต่อจะอยู่ในไฟล์ `.env` ที่อยู่ในโฟลเดอร์โปรเจกต์นี้:

### 🔹 1. Discord OAuth 2.0 (เข้าสู่ระบบด้วย Discord)
1. ไปที่ **[Discord Developer Portal](https://discord.com/developers/applications)**
2. ล็อกอินแล้วกดปุ่ม **"New Application"** (เช่น ตั้งชื่อว่า `DEKTHEP STORE`)
3. เลือกเมนู **"OAuth2"** ในแถบซ้ายมือ
4. เลื่อนลงมาที่หัวข้อ **"Redirects"** กดปุ่ม **"Add Redirect"** แล้วกรอก:
   ```text
   http://localhost:3000/auth/discord/callback
   ```
   *(กด Save Changes ที่ด้านล่าง)*
5. ในหน้า OAuth2 เดียวกัน ให้คัดลอก:
   - **Client ID**
   - **Client Secret** (กด Reset Secret เพื่อดูรหัส)
6. นำมาวางในไฟล์ `.env`:
   ```env
   DISCORD_CLIENT_ID=เลข_Client_ID_ของคุณ
   DISCORD_CLIENT_SECRET=รหัส_Client_Secret_ของคุณ
   ```

---

### 🔹 2. Google OAuth 2.0 (เข้าสู่ระบบด้วย Google)
1. ไปที่ **[Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)**
2. สร้างโปรเจกต์หรือเลือกโปรเจกต์ที่คุณต้องการ
3. หากยังไม่เคยตั้งค่าหน้า Consent ให้ไปที่เมนู **"OAuth consent screen"**:
   - เลือก **External** -> กด Create
   - กรอก **App name** (เช่น `DEKTHEP STORE`) และ **User support email**
   - ในขั้นตอน Scopes ให้เพิ่ม `openid`, `.../auth/userinfo.profile`, `.../auth/userinfo.email`
4. ไปที่เมนู **"Credentials"** -> กด **"+ CREATE CREDENTIALS"** -> เลือก **"OAuth client ID"**
5. เลือก Application type: **Web application**
6. ในหัวข้อ **"Authorized redirect URIs"** กด **"+ ADD URI"** แล้วกรอก:
   ```text
   http://localhost:3000/auth/google/callback
   ```
7. กด **CREATE** จะได้รับ Client ID และ Client Secret
8. นำมาวางในไฟล์ `.env`:
   ```env
   GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxxxxxxxxx
   ```

---

## 📂 โครงสร้างโปรเจกต์
- `server.js` - เซิร์ฟเวอร์ Express สำหรับจัดการ API, Session, Password Hashing, Discord OAuth และ Google OAuth
- `data/` - เก็บฐานข้อมูลบัญชีผู้ใช้ในรูปแบบ JSON (`data/users.json`) และตัวจัดการ `data/database.js`
- `public/`
  - `index.html` - โครงสร้างหน้าเว็บ UI เข้าสู่ระบบ / สมัครสมาชิก / หน้าโปรไฟล์หลังเข้าสู่ระบบ
  - `style.css` - สไตล์มืดนีออน ดีไซน์ตามภาพตัวอย่างของ DekThep Store
  - `app.js` - สคริปต์สลับแท็บ, จัดการฟอร์ม, เรียก API และดึงข้อมูล OAuth
  - `assets/` - รูปภาพโลโก้มาสคอต DekThep Store
- `.env` - ไฟล์เก็บการตั้งค่าพอร์ตและ Secret Keys ของ Discord/Google
