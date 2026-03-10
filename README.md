# Meal Plan Record Web App

เว็บแอพแบบ static สำหรับอัปขึ้น GitHub Pages ได้ทันที ใช้บันทึกการใช้บริการอาหารเช้าและ meal plan พร้อมสรุปยอดรายวันและรายเดือน

## ฟังก์ชันหลัก

- เลือกปีและเดือน
- เพิ่มรายการลูกค้าแบบละเอียดผ่านปุ่ม `Add Record`
- คีย์จำนวน cover ลงในช่องของตารางรายวันได้โดยตรง
- คำนวณ Total Cover และ Revenue อัตโนมัติ
- สรุปผลแยกตามหมวด ABF และ Meal Plan
- Export CSV
- ลบรายการรายชื่อลูกค้าได้
- ล้างข้อมูลทั้งเดือนได้
- เก็บข้อมูลใน `localStorage`
- เชื่อม Firebase Firestore ได้
- Sync ข้อมูลรายเดือนขึ้นคลาวด์ได้
- โหลดข้อมูลรายเดือนจาก Firebase ได้เมื่อเปลี่ยนเดือน

## โครงสร้างไฟล์

- `index.html` หน้าเว็บหลัก
- `styles.css` สไตล์ทั้งหมด
- `app.js` logic ของระบบ และการเชื่อม Firebase

## วิธีใช้งานบน GitHub Pages

1. สร้าง repository ใหม่บน GitHub
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ขึ้น repository
3. ไปที่ `Settings` > `Pages`
4. ตั้ง Source เป็น `Deploy from a branch`
5. เลือก branch `main` และ folder `/root`
6. กด Save
7. รอสักครู่แล้ว GitHub Pages จะสร้างลิงก์เว็บไซต์ให้

## วิธีเชื่อม Firebase

1. ไปที่ Firebase Console
2. สร้างโปรเจกต์ หรือเลือกโปรเจกต์เดิม
3. เปิด `Firestore Database`
4. เพิ่ม Web App ใน Project settings
5. คัดลอกค่า config ของ Web App
6. เปิดเว็บ แล้วกด `Firebase Settings`
7. วางค่าเหล่านี้ให้ครบ
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
8. กด `Save & Connect`
9. กด `Sync Now` เพื่ออัปข้อมูลเดือนปัจจุบันขึ้น Firebase

## โครงสร้างข้อมูลบน Firestore

- Collection: `meal_plan_record_months`
- Document ID: `YYYY-MM` เช่น `2026-03`

ในแต่ละ document จะมีข้อมูลหลัก เช่น:
- `periodKey`
- `year`
- `month`
- `guestRecords`
- `cellEntries`
- `updatedAt`
- `savedAtISO`

## หมายเหตุ

- ช่องในตาราง summary ใช้สำหรับคีย์ยอด cover โดยตรง
- ถ้าต้องการเก็บชื่อแขก ห้อง หรือหมายเหตุ ให้ใช้ปุ่ม `Add Record`
- ถ้าไม่เชื่อม Firebase ข้อมูลจะอยู่ในเบราว์เซอร์เครื่องที่ใช้งาน
- ถ้าล้าง browser data ข้อมูล local จะหาย
- ถ้าเชื่อม Firebase แล้ว แนะนำให้กด `Sync Now` หลังเริ่มใช้งานครั้งแรก
