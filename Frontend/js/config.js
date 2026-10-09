// ค่าตั้งต้นของหน้าเว็บ
// ปกติหน้าเว็บถูกเสิร์ฟจาก server เดียวกับ API (Render หรือ http://localhost:3000)
// จึงใช้ '' เพื่อเรียก API ที่โดเมนเดียวกัน
// ถ้าเปิดไฟล์โดยตรง (file://) หรือเสิร์ฟจาก localhost พอร์ตอื่น ให้ชี้ไปที่ API ในเครื่อง
const servedByApi =
    window.location.protocol.startsWith('http') &&
    (window.location.port === '3000' ||
        !['localhost', '127.0.0.1'].includes(window.location.hostname));

window.APP_CONFIG = Object.freeze({
    API_BASE_URL: servedByApi ? '' : 'http://localhost:3000'
});
