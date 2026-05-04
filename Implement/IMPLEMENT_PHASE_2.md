# 🚀 Phase 2 Implementation Plan: Personal Management & Finance Analyzer

เอกสารฉบับนี้รวบรวมฟีเจอร์ที่เสนอให้พัฒนาใน Phase 2 เพื่อยกระดับโปรเจกต์ให้มีความครอบคลุมและตอบโจทย์การใช้งานมากขึ้น ทั้งในแง่ของระบบการเงิน (Finance), การตั้งเป้าหมาย (Goals & Productivity), รวมไปถึงระบบ UX/UI ที่สวยงามและทันสมัย

---

## 1. ☁️ Cloud & Infrastructure Enhancements

### 1.1 Secure Image Storage (Google Cloud Storage & Signed URLs)
- **Concept:** ปรับปรุงระบบเก็บรูปภาพ (เช่น สลิปโอนเงิน หรือใบเสร็จ) ให้จัดเก็บอย่างปลอดภัยบน Google Cloud Storage (GCS) แบบ Free Tier
- **Security (SAS / Signed URLs):**
  - จัดเก็บไฟล์แบบ Private (ห้ามเข้าถึงแบบสาธารณะ) โดยเก็บเพียงชื่อไฟล์ (File Name / Path) ลงใน Supabase
  - เมื่อผู้ใช้ (ที่ล็อกอินแล้วและมีสิทธิ์) ต้องการเปิดดูรูปภาพ Backend จะใช้ Service Account ทำการ Generate **Signed URL** ที่มีวันหมดอายุชั่วคราว (เช่น 15 นาที) มาให้
  - วิธีนี้ป้องกันการที่ผู้อื่นจะเดา URL หรือแชร์ลิงก์ให้บุคคลภายนอกได้อย่างสมบูรณ์

---

## 2. 💸 Finance & Budgeting Enhancements

### 1.1 Monthly Budget Limits (ระบบการตั้งงบประมาณรายเดือน)
- **Concept:** ผู้ใช้สามารถกำหนดเพดานค่าใช้จ่ายในแต่ละหมวดหมู่ (Category) ได้ เช่น ค่าอาหารไม่เกิน 5,000 บาท/เดือน
- **UI/UX:**
  - เพิ่มหน้าจอ Dashboard ย่อยสำหรับแสดง Budget
  - ใช้ Progress bar สไตล์ Pastel Glassmorphism (ไล่สี Gradient เมื่อใกล้เต็มหลอด และเป็นสีแดง/ส้มเมื่อเกินงบ)
  - เพิ่ม Alert/Notification เล็กๆ เมื่อใช้จ่ายเกิน 80% ของงบ

### 1.2 Receipt OCR (สแกนใบเสร็จทั่วไป)
- **Concept:** ต่อยอดจากการแสกน QR Slip ด้วยการเพิ่มฟีเจอร์ถ่ายรูปใบเสร็จทั่วไป (สลิป 7-11, สลิปห้างฯ)
- **Technical:**
  - เชื่อมต่อกับ LLM API (เช่น Google Cloud Vision หรือ Prompt ผ่าน AI Model ที่รองรับ Image) เพื่อดึงยอดรวม (Total Amount)
  - ให้ AI ช่วยแนะนำหมวดหมู่ (Category) ประจำรายการให้อัตโนมัติ

### 1.3 Advanced Analytics & "Year in Review"
- **Concept:** ระบบรายงานผลขั้นสูงที่ช่วยให้เห็นภาพรวมการเงินและพฤติกรรมในแต่ละช่วงเวลา
- **UI/UX:**
  - กราฟสวยงาม (ใช้ `recharts`) เช่น Cashflow (Income vs Expense) ประจำเดือน
  - Pie Chart สัดส่วนค่าใช้จ่ายแบ่งตามหมวดหมู่
  - ฟีเจอร์ "Wrapped" ประจำปี (เหมือน Spotify Wrapped) สรุปผลการเงิน เป้าหมายที่ทำสำเร็จ สถิติสลิปที่สแกนไป ฯลฯ

---

## 3. 📈 Investment & Subscriptions

### 2.1 Live Price Fetching (อัปเดตราคาแบบอัตโนมัติ)
- **Concept:** ไม่ต้องคอยมากรอกมูลค่าปัจจุบันของสินทรัพย์ลดเลี้ยว (Stock/Crypto) ด้วยตัวเอง
- **Technical:**
  - เชื่อมต่อกับ Public APIs ฟรี (เช่น CoinGecko สำหรับ Crypto หรือ Yahoo Finance สำหรับหุ้น) เพื่ออัปเดต `currentValue` อัตโนมัติเป็นระยะ (Cron Job หรือ On-Demand)

### 2.2 Subscription Renewal Alerts
- **Concept:** แจ้งเตือนเมื่อบิลกำลังจะตัดรอบ เพื่อให้เตรียมเงิน หรือเลือดยกเลิก
- **UI/UX:**
  - แสดงลิสต์ "Upcoming Bills" ของเดือนนี้บนหน้า Dashboard
  - (Optional) ส่ง Web Push Notification หรือ Email ล่วงหน้า 1-3 วัน

---

## 4. 🎯 Productivity (Tasks, Habits & Goals)

### 3.1 Gamification (ระบบการให้รางวัล)
- **Concept:** กระตุ้นผู้ใช้ให้เข้าแอปมา Track Habit และทำ Task อย่างสม่ำเสมอ
- **UI/UX:**
  - เพิ่มระบบสะสมคะแนน (EXP) เมื่อเช็คอินหรือทำ Habit สำเร็จ
  - Badge (เหรียญตรา) พิเศษเมื่อบรรลุเป้าหมาย เช่น "Streak 7 วันติด", "ออมเงินตามเป้าหมาย"
  - มี Animation (เช่น Confetti) เมื่อได้รับเหรียญ

### 3.2 Kanban Board สำหรับ Yearly Goals
- **Concept:** ปรับรูปแบบการจัดการเป้าหมายให้มองเห็นภาพรวมง่ายขึ้น
- **UI/UX:**
  - เปลี่ยน List ธรรมดา เป็น Board รูปแบบคล้าย Trello (ใช้งาน Drag and Drop) ประกอบไปด้วยคอลัมน์:
    - Not Started (ยังไม่เริ่ม)
    - In Progress (กำลังดำเนินการ)
    - Done (สำเร็จแล้ว)
  - คงความพรีเมียมด้วยพื้นหลังโปร่งแสง (Translucent) ของแต่ละการ์ดเป้าหมาย

---

## 5. 🎨 UX/UI & Tech Stack Upgrades

### 4.1 Progressive Web App (PWA)
- **Concept:** ยกระดับ Web App ให้ทำตัวคล้าย Mobile App มากขึ้น
- **Technical/UI:**
  - สร้างไฟล์ `manifest.json` ใส่คำอธิบาย, Icon ของแอป
  - เซตอัป Service Worker พื้นฐานให้พอ Caching ของบางส่วนได้
  - ผู้ใช้สามารถกด (Install) ลงบน Home Screen และเปิดใช้ได้แบบแยกแอป (Standalone Mode) โดยไม่มี UI Browser มารบกวน

### 4.2 Dark Mode / Pastel Glassmorphism Fine-tuning
- **Concept:** เก็บรายละเอียดทางสายตาต่างๆ
- **UI/UX:**
  - ปรับปรุง Hover Effect, Animation การเฟดเข้า-ออกสำหรับ Modal ทุกตัว
  - ตรวจสอบองค์ประกอบใน Dark Mode ให้ดูไม่ทึบเกินไป และใช้แสงสี (Glow) สะท้อนความเป็นโปรเจกต์ยุคใหม่

---

## 📝 ลำดับความสำคัญในการพัฒนาก่อน-หลัง (Priority)

1. **High Priority (เห็นผลง่ายและตรงประเด็นแอปที่สุด):**
   - Secure Image Storage (GCS + Signed URLs) ยกระดับความปลอดภัยรูปภาพให้ถูกต้องตามสถาปัตยกรรม
   - Monthly Budget Limits + UI Progress Bar สวยๆ
   - Progressive Web App (PWA) เพิ่ม PWA Config (ทำง่ายและมี Impact กับการใช้งานมือถือ)
2. **Medium Priority:**
   - Advanced Analytics (Recharts - กราฟสัดส่วนค่าใช้จ่าย)
   - Subscription Renewal UI บนหน้า Dashboard
   - Kanban Board สำหรับ Goals
3. **Low/Long-Term Priority:**
   - Gamification & AI Receipt OCR
   - Integration โหลดข้อมูลราคาหุ้น และแจ้งเตือน Push Notification
   - Year in Review (เหมาะจะทำตอนปลายปี)
