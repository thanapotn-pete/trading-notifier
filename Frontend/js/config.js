// ค่าตั้งต้นของหน้าเว็บ
// หน้าเว็บถูกเสิร์ฟจาก server เดียวกับ API (Render หรือ http://localhost:3000)
// จึงเรียก API ที่ origin เดียวกัน ('' = ไม่ต้องระบุโดเมน)
// ตอนพัฒนาให้เปิดผ่าน http://localhost:3000 เสมอ (CSP จำกัด connect-src ไว้ที่ origin เดียวกัน)
window.APP_CONFIG = Object.freeze({
    API_BASE_URL: ''
});
