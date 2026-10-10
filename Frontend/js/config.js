// ค่าตั้งต้นของหน้าเว็บ
// หน้าเว็บถูกเสิร์ฟจาก server เดียวกับ API (Render หรือ http://localhost:3000)
// จึงเรียก API ที่ origin เดียวกัน ('' = ไม่ต้องระบุโดเมน)
// ตอนพัฒนาให้เปิดผ่าน http://localhost:3000 เสมอ (CSP จำกัด connect-src ไว้ที่ origin เดียวกัน)
// เก็บค่าตั้งต้นไว้ที่ window.APP_CONFIG ให้ทุกหน้าอ่าน (Object.freeze =
// ล็อกไม่ให้แก้ค่าระหว่างทำงาน)
window.APP_CONFIG = Object.freeze({
    API_BASE_URL: ''  // '' = เรียก API ที่ origin เดียวกับหน้าเว็บ
});
