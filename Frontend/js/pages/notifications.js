// notifications.js — สคริปต์ของหน้า "การแจ้งเตือน" (notifications.html)
// • สวิตช์เปิด/ปิดการแจ้งเตือนแต่ละแบบ (เปิดออเดอร์ ปิดออเดอร์ TP/SL Risk Alert
// สรุปรายวัน/รายสัปดาห์) และสวิตช์หลัก
// • กำหนดเกณฑ์ Maximum Drawdown (%)  • ตั้ง Telegram Chat ID  •
// ปุ่มทดสอบการเชื่อมต่อและส่งข้อความทดสอบเข้า Telegram
// • แสดงรายการแจ้งเตือนล่าสุด  การตั้งค่าทั้งหมดบันทึกลงฐานข้อมูลผ่าน API
// (/api/notification-settings)
// เซิร์ฟเวอร์จะใช้ค่าเหล่านี้ตัดสินว่าจะส่ง Telegram ให้ผู้ใช้หรือไม่ (ดู
// notification-settings.js ฝั่งหลังบ้าน)
/* =========================================================
   NOTIFICATION PAGE - API
   ========================================================= */

const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;  // ประกาศไว้ แต่ตอนนี้เรียก API ผ่าน App.apiFetch จึงไม่ได้ใช้ตัวแปรนี้โดยตรง
const TOKEN_KEY = 'auth_token';  // ชื่อ key ที่เก็บ token ใน localStorage

let notificationSettings = null;  // การตั้งค่าล่าสุดที่โหลด/บันทึกแล้ว (ใช้เทียบว่าผู้ใช้แก้ Max Drawdown ไปหรือยัง)
let saveSettingsTimer = null;  // ตัวจับเวลาหน่วง 0.3 วินาทีก่อนบันทึก (รวมการกดสวิตช์ถี่ ๆ เป็นครั้งเดียว)
let isLoadingSettings = false;  // กำลังโหลดค่าลงหน้าจออยู่ไหม (ระหว่างนั้นไม่บันทึกกลับ กันบันทึกซ้อน)
let isSavingSettings = false;  // กำลังบันทึกอยู่ไหม

// อ่าน token ที่เก็บไว้ในเบราว์เซอร์
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// ตัวห่อให้โค้ดในไฟล์นี้เรียก apiFetch ได้สั้น ๆ — ภายในใช้ App.apiFetch ของ common.js
function apiFetch(path, options = {}) {
    // แนบ token และจัดการ session หมดอายุ (401) ที่ App.apiFetch ที่เดียว
    return App.apiFetch(path, options);
}

/* =========================================================
   NOTIFICATION SETTINGS - DATABASE
   ========================================================= */

// ดึงการตั้งค่าแจ้งเตือนของผู้ใช้จาก GET /api/notification-settings
async function fetchNotificationSettings() {
    const response = await apiFetch('/api/notification-settings');

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || `HTTP ${response.status}`
        );
    }

    return data.settings || data;
}

// [สรุป] นำการตั้งค่าที่ได้จากเซิร์ฟเวอร์มาตั้งสวิตช์/ช่องกรอกบนหน้าจอ
// หน้าเว็บมีสวิตช์ "เปิดออเดอร์" 1 ตัวแทน BUY+SELL และสวิตช์ "TP/SL" 1 ตัวแทน TP+SL
function applyNotificationSettings(settings) {
    if (!settings) return;

    notificationSettings = settings;

    const master = document.getElementById('masterSwitch');
    const openOrder = document.getElementById('openOrderSwitch');
    const closeOrder = document.getElementById('closeOrderSwitch');
    const tpSl = document.getElementById('tpSlSwitch');
    const risk = document.getElementById('riskSwitch');
    const maxDrawdownInput = document.getElementById('maxDrawdownInput');
    const daily = document.getElementById('dailySummarySwitch');
    const weekly = document.getElementById('weeklySummarySwitch');

    if (master) {
        master.checked = settings.enabled !== false;
    }

    if (openOrder) {
        // หน้าเว็บมี 1 switch สำหรับ "เปิดออเดอร์"
        // จึงแสดง ON เมื่อทั้ง BUY และ SELL เปิดอยู่
        openOrder.checked =
            settings.notify_buy !== false &&
            settings.notify_sell !== false;
    }

    if (closeOrder) {
        closeOrder.checked = settings.notify_close !== false;
    }

    // หน้าเว็บมี 1 switch สำหรับ TP / SL
    // แต่ Database แยก notify_tp และ notify_sl
    if (tpSl) {
        tpSl.checked =
            settings.notify_tp !== false &&
            settings.notify_sl !== false;
    }

    if (risk) {
        risk.checked = settings.notify_risk !== false;
    }

    if (maxDrawdownInput) {
        maxDrawdownInput.value =
            settings.max_drawdown !== null &&
            settings.max_drawdown !== undefined &&
            settings.max_drawdown !== ''
                ? settings.max_drawdown
                : 10;
    }

    if (daily) {
        daily.checked = settings.notify_daily_summary !== false;
    }

    if (weekly) {
        weekly.checked = settings.notify_weekly_summary === true;
    }

    updateMasterUI();
}

// [สรุป] อ่านค่าจากสวิตช์/ช่องกรอกบนหน้าจอ แปลงเป็นฟิลด์ตามชื่อคอลัมน์ในฐานข้อมูล
// เพื่อส่งไปบันทึก
// (สวิตช์ 1 ตัวควบคุมหลายฟิลด์ เช่น เปิดออเดอร์ = notify_buy + notify_sell)
// includeDrawdown=false leaves max_drawdown out of the PATCH, so toggling a
// switch never saves a half-edited Maximum Drawdown (it has its own save button).
function getSettingsFromUI(includeDrawdown = true) {
    const master = document.getElementById('masterSwitch');
    const openOrder = document.getElementById('openOrderSwitch');
    const closeOrder = document.getElementById('closeOrderSwitch');
    const tpSl = document.getElementById('tpSlSwitch');
    const risk = document.getElementById('riskSwitch');
    const maxDrawdownInput = document.getElementById('maxDrawdownInput');
    const daily = document.getElementById('dailySummarySwitch');
    const weekly = document.getElementById('weeklySummarySwitch');

    const settings = {
        enabled: master ? master.checked : false,

        // "เปิดออเดอร์" 1 switch ควบคุมทั้ง BUY และ SELL
        notify_buy: openOrder ? openOrder.checked : false,
        notify_sell: openOrder ? openOrder.checked : false,
        notify_close: closeOrder ? closeOrder.checked : false,

        notify_tp: tpSl ? tpSl.checked : false,
        notify_sl: tpSl ? tpSl.checked : false,

        notify_risk: risk ? risk.checked : false,
        max_drawdown:
            maxDrawdownInput && maxDrawdownInput.value.trim() !== ''
                ? Number(maxDrawdownInput.value)
                : null,
        notify_daily_summary: daily ? daily.checked : false,
        notify_weekly_summary: weekly ? weekly.checked : false
    };

    if (!includeDrawdown) delete settings.max_drawdown;

    return settings;
}

// [สรุป] ส่งการตั้งค่าไป PATCH /api/notification-settings: ตรวจเกณฑ์ Max Drawdown ต้องอยู่
// 0-100 ก่อน → ส่ง → แจ้งผล
// ไม่บันทึกระหว่างกำลังโหลดค่า และบันทึกเกณฑ์ Drawdown เฉพาะตอนผู้ใช้กดปุ่ม "บันทึก"
async function saveNotificationSettings(showSuccess = false, includeDrawdown = true) {
    if (isLoadingSettings) return;

    const settings = getSettingsFromUI(includeDrawdown);

    if (includeDrawdown && settings.max_drawdown !== null) {
        if (!Number.isFinite(settings.max_drawdown) ||
            settings.max_drawdown < 0 ||
            settings.max_drawdown > 100) {
            App.toast('Maximum Drawdown ต้องอยู่ระหว่าง 0 ถึง 100%');
            return;
        }
    }

    try {
        isSavingSettings = true;

        const response = await apiFetch(
            '/api/notification-settings',
            {
                method: 'PATCH',
                body: JSON.stringify(settings)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || `HTTP ${response.status}`
            );
        }

        notificationSettings = data.settings || settings;
        updateDrawdownButton();

        if (showSuccess) {
            App.toast('บันทึกการตั้งค่าเรียบร้อยแล้ว ✓');
        }

        console.log(
            '[Notifications] Settings saved:',
            notificationSettings
        );

    } catch (error) {
        console.error(
            '[Notifications] Save settings failed:',
            error
        );

        App.toast(
            'บันทึกการตั้งค่าไม่สำเร็จ\n\n' +
            error.message
        );

    } finally {
        isSavingSettings = false;
    }
}

// บันทึกแบบหน่วงเวลา (debounce) 0.3 วินาที:
// ถ้ากดสวิตช์ติดกันหลายครั้งจะบันทึกแค่ครั้งสุดท้ายครั้งเดียว
function scheduleSaveNotificationSettings() {
    clearTimeout(saveSettingsTimer);

    saveSettingsTimer = setTimeout(() => {
        saveNotificationSettings(false, false);
    }, 300);
}

// โหลดการตั้งค่าจากเซิร์ฟเวอร์มาแสดง (ถ้าโหลดไม่ได้ ใช้ค่าตั้งต้นใน HTML)
async function loadNotificationSettings() {
    try {
        isLoadingSettings = true;

        const settings =
            await fetchNotificationSettings();

        if (settings) {
            applyNotificationSettings(settings);
        }

    } catch (error) {
        console.error(
            '[Notifications] Load settings failed:',
            error
        );

        // ถ้าโหลดไม่ได้ ให้ใช้ค่า HTML เดิม
        updateMasterUI();

    } finally {
        isLoadingSettings = false;
    }
}

/* =========================================================
   MASTER SWITCH
   ========================================================= */

// สวิตช์หลักปิด → ปิดการกดสวิตช์ย่อยทั้งหมดและช่อง Drawdown (ค่าของสวิตช์ย่อยยังอยู่ในฐานข้อมูล
// เปิดกลับมาได้) พร้อมเปลี่ยนข้อความ เปิด/ปิดใช้งาน
function updateMasterUI() {
    const master = document.getElementById('masterSwitch');
    const switches =
        document.querySelectorAll('.notification-switch');
    const risk = document.getElementById('riskSwitch');
    const maxDrawdownInput = document.getElementById('maxDrawdownInput');
    const label = document.getElementById('masterLabel');

    if (!master) return;

    switches.forEach(item => {
        item.disabled = !master.checked;
    });

    if (maxDrawdownInput) {
        maxDrawdownInput.disabled =
            !master.checked ||
            !risk ||
            !risk.checked;
    }

    updateDrawdownButton();

    if (label) {
        label.textContent = master.checked
            ? 'เปิดใช้งาน'
            : 'ปิดใช้งาน';
    }
}

// ถูกเรียกเมื่อกดสวิตช์หลัก (ผูกผ่าน data-change ใน HTML) → อัปเดตหน้าจอแล้วบันทึก
function toggleAllNotifications() {
    const master =
        document.getElementById('masterSwitch');

    const switches =
        document.querySelectorAll('.notification-switch');

    if (!master) return;

    // เมื่อปิด Master ให้ปิด UI ของเหตุการณ์ทั้งหมด
    // แต่ค่าของแต่ละ Event จะยังคงอยู่ใน Database
    // และเปิดกลับมาได้โดยไม่ทำให้ค่าราย Event หาย
    updateMasterUI();

    scheduleSaveNotificationSettings();
}

/* =========================================================
   INDIVIDUAL SWITCHES
   ========================================================= */

// เมื่อกดสวิตช์ย่อยตัวใดตัวหนึ่ง: ถ้าสวิตช์ย่อยปิดหมดทุกตัว ให้ปิดสวิตช์หลักด้วย
// แล้วบันทึกอัตโนมัติ
document.addEventListener('change', function (event) {
    if (
        event.target.classList &&
        event.target.classList.contains('notification-switch')
    ) {
        const master =
            document.getElementById('masterSwitch');

        const switches =
            Array.from(
                document.querySelectorAll('.notification-switch')
            );

        const allOff =
            switches.length > 0 &&
            switches.every(item => !item.checked);

        if (master && allOff) {
            master.checked = false;
        }

        updateMasterUI();
        scheduleSaveNotificationSettings();
    }
});

/* =========================================================
   RISK THRESHOLD
   ========================================================= */

// Save only when the user presses "บันทึก" (or Enter), not on every arrow click.
// The button is enabled only while the value differs from what is saved.
// เปิดปุ่ม "บันทึก" ของ Max Drawdown เฉพาะเมื่อค่าในช่องต่างจากค่าที่บันทึกไว้
// (กันบันทึกค่าที่ยังไม่เสร็จหรือซ้ำ)
function updateDrawdownButton() {
    const input = document.getElementById('maxDrawdownInput');
    const button = document.getElementById('saveDrawdownBtn');

    if (!input || !button) return;

    const hasSaved =
        notificationSettings &&
        notificationSettings.max_drawdown !== null &&
        notificationSettings.max_drawdown !== undefined &&
        notificationSettings.max_drawdown !== '';

    const saved = hasSaved ? Number(notificationSettings.max_drawdown) : 10;
    const current = input.value.trim() === '' ? null : Number(input.value);

    button.disabled = input.disabled || current === saved;
}

// ผูกช่องกรอกเกณฑ์ Drawdown: พิมพ์แล้วอัปเดตปุ่ม, กด Enter = กดบันทึก, กดปุ่มบันทึก =
// ส่งไปเซิร์ฟเวอร์
const maxDrawdownInput = document.getElementById('maxDrawdownInput');
const saveDrawdownBtn = document.getElementById('saveDrawdownBtn');

if (maxDrawdownInput) {
    maxDrawdownInput.addEventListener('input', updateDrawdownButton);

    maxDrawdownInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && saveDrawdownBtn && !saveDrawdownBtn.disabled) {
            saveDrawdownBtn.click();
        }
    });
}

if (saveDrawdownBtn) {
    saveDrawdownBtn.addEventListener('click', function () {
        saveNotificationSettings(true, true);
    });
}


/* =========================================================
   CHAT ID
   ========================================================= */

// นำ Telegram Chat ID จากโปรไฟล์มาใส่ในช่องกรอก
function loadChatIdFromProfile(profile) {
    const input = document.getElementById('chatId');

    if (!input || !profile) return;

    if (profile.telegram_chat_id !== undefined &&
        profile.telegram_chat_id !== null) {
        input.value = profile.telegram_chat_id;
    }
}

// โหลดโปรไฟล์จาก GET /api/profile เพื่อเอา Chat ID ปัจจุบันมาแสดง
async function loadChatId() {
    try {
        const response =
            await apiFetch('/api/profile');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const profile =
            data.user || data.profile || data;

        loadChatIdFromProfile(profile);

    } catch (error) {
        console.error(
            '[Notifications] Load Chat ID failed:',
            error
        );

    }
}

// [สรุป] บันทึก Chat ID: ตรวจว่ากรอกและเป็นตัวเลข → PATCH /api/profile →
// จะแจ้งว่าสำเร็จก็ต่อเมื่อเซิร์ฟเวอร์ส่งค่าที่บันทึกกลับมา "ตรงกับที่ส่ง"
// (กันกรณีบอกว่าบันทึกแล้วทั้งที่ไม่ได้บันทึกจริง)
async function saveChatId() {
    const input =
        document.getElementById('chatId');

    const chatId =
        input ? input.value.trim() : '';

    if (!chatId) {
        App.toast('กรุณากรอก Telegram Chat ID');

        if (input) input.focus();

        return;
    }

    if (!/^-?\d+$/.test(chatId)) {
        App.toast('Telegram Chat ID ต้องเป็นตัวเลข');

        if (input) input.focus();

        return;
    }

    try {
        const response =
            await apiFetch('/api/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    telegram_chat_id: chatId
                })
            });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || `HTTP ${response.status}`
            );
        }

        // แสดงว่าสำเร็จก็ต่อเมื่อ server ตอบค่าที่บันทึกกลับมาตรงกับที่ส่ง
        if (String(data.telegram_chat_id ?? '') !== chatId) {
            throw new Error(
                'เซิร์ฟเวอร์ยังไม่ได้บันทึก Chat ID — ติดต่อผู้ดูแลระบบ'
            );
        }

        App.toast(
            'บันทึก Telegram Chat ID ลงฐานข้อมูลเรียบร้อยแล้ว ✓'
        );

    } catch (error) {
        console.error(
            '[Notifications] Save Chat ID failed:',
            error
        );

        App.toast(
            'บันทึก Telegram Chat ID ไม่สำเร็จ\n\n' +
            error.message
        );
    }
}

/* =========================================================
   TELEGRAM / API CONNECTION TEST
   ========================================================= */

// ปุ่ม "ทดสอบการเชื่อมต่อ": ลองเรียก GET /api/notifications เพื่อเช็กว่าเซิร์ฟเวอร์ตอบและ token
// ยังใช้ได้ แล้วแสดงสถานะ
async function testTelegram() {
    const button =
        document.getElementById('testConnectionButton');

    const originalText =
        button ? button.textContent : '';

    if (button) {
        button.disabled = true;
        button.textContent = 'กำลังตรวจสอบ...';
    }

    try {
        const token = getToken();

        if (!token) {
            App.toast(
                'ไม่พบ Session กรุณาเข้าสู่ระบบใหม่'
            );

            window.location.href = 'login.html';
            return;
        }

        const response =
            await apiFetch('/api/notifications');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        setConnectionStatus(
            true,
            'ระบบแจ้งเตือนเชื่อมต่อแล้ว'
        );

        App.toast(
            'เชื่อมต่อระบบแจ้งเตือนสำเร็จ ✓'
        );

    } catch (error) {
        console.error(
            'Notification connection test failed:',
            error
        );

        setConnectionStatus(
            false,
            'ไม่สามารถเชื่อมต่อระบบแจ้งเตือน'
        );

        App.toast(
            'ไม่สามารถเชื่อมต่อระบบแจ้งเตือนได้\n' +
            'กรุณาตรวจสอบว่า Node.js Backend กำลังทำงานอยู่'
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent =
                originalText ||
                'ทดสอบการเชื่อมต่อ';
        }
    }
}

// แสดงสถานะการเชื่อมต่อ (เขียว = พร้อมใช้งาน / แดง = ไม่พร้อม) พร้อมข้อความ
function setConnectionStatus(
    connected,
    text
) {
    const status =
        document.getElementById(
            'telegramConnectionStatus'
        );

    const dot =
        document.getElementById('connectionDot');

    const label =
        document.getElementById('connectionText');

    if (label) {
        label.textContent = text;
    }

    if (status) {
        status.style.background = connected
            ? '#edf8f5'
            : '#fff1f2';

        status.style.color = connected
            ? '#087f68'
            : '#dc2626';
    }

    if (dot) {
        dot.style.background = connected
            ? '#14b87a'
            : '#dc2626';
    }
}

/* =========================================================
   SEND TEST MESSAGE
   ========================================================= */

// ปุ่ม "ส่งข้อความทดสอบ": เรียก POST /api/notifications/test ให้เซิร์ฟเวอร์ส่งข้อความเข้า
// Telegram ของผู้ใช้จริง
// เพื่อยืนยันว่า Chat ID ถูกต้องและบอทส่งถึง
async function sendTestMessage() {
    const button =
        document.querySelector('.test-button');

    const originalText =
        button ? button.textContent : '';

    try {
        const token = getToken();

        if (!token) {
            App.toast(
                'ไม่พบ Session กรุณาเข้าสู่ระบบใหม่'
            );

            window.location.href = 'login.html';
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = 'กำลังส่ง...';
        }

        const response =
            await apiFetch(
                '/api/notifications/test',
                {
                    method: 'POST',
                    body: JSON.stringify({})
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                'ไม่สามารถส่งข้อความทดสอบได้'
            );
        }

        App.toast(
            'ส่งข้อความทดสอบไปยัง Telegram สำเร็จ ✓'
        );

    } catch (error) {
        console.error(
            '[Notifications] Test Telegram Error:',
            error
        );

        App.toast(
            'ส่งข้อความทดสอบไม่สำเร็จ\n\n' +
            error.message
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent =
                originalText ||
                'ส่งข้อความทดสอบ';
        }
    }
}

/* =========================================================
   LOAD RECENT NOTIFICATIONS
   ========================================================= */

// โหลดรายการแจ้งเตือนล่าสุดจาก GET /api/notifications (สร้างจากเทรดล่าสุดของผู้ใช้)
async function loadRecentNotifications() {
    const container =
        document.getElementById(
            'recentNotifications'
        );

    if (!container) return;

    try {
        const response =
            await apiFetch('/api/notifications');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data =
            await response.json();

        const notifications =
            Array.isArray(data)
                ? data
                : Array.isArray(data.notifications)
                    ? data.notifications
                    : [];

        renderRecentNotifications(
            notifications
        );

    } catch (error) {
        console.error(
            'Load notifications failed:',
            error
        );

        container.innerHTML = `
            <div class="recent-item">
                <div class="recent-icon warning">!</div>
                <div>
                    <div class="recent-name">
                        ไม่สามารถโหลดการแจ้งเตือนได้
                    </div>
                    <div class="recent-message">
                        ตรวจสอบการเชื่อมต่อกับ Backend
                    </div>
                </div>
            </div>
        `;
    }
}

// แสดงรายการแจ้งเตือนล่าสุด 5 รายการ (ถ้าไม่มีแสดงข้อความ "ยังไม่มีการแจ้งเตือน")
function renderRecentNotifications(
    notifications
) {
    const container =
        document.getElementById(
            'recentNotifications'
        );

    if (!container) return;

    if (!notifications.length) {
        container.innerHTML = `
            <div class="recent-item">
                <div class="recent-icon">i</div>
                <div>
                    <div class="recent-name">
                        ยังไม่มีการแจ้งเตือน
                    </div>
                    <div class="recent-message">
                        เมื่อระบบมีการแจ้งเตือน รายการจะแสดงที่นี่
                    </div>
                </div>
            </div>
        `;

        return;
    }

    const latest =
        notifications.slice(0, 5);

    container.innerHTML =
        latest.map(item => {
            const title =
                item.title ||
                item.name ||
                item.event ||
                item.type ||
                'การแจ้งเตือน';

            const message =
                item.message ||
                item.description ||
                item.text ||
                '';

            const time =
                item.created_at ||
                item.createdAt ||
                item.timestamp ||
                item.time ||
                '';

            const lower =
                `${title} ${message}`.toLowerCase();

            let icon = 'i';
            let iconClass = '';

            if (
                lower.includes('loss') ||
                lower.includes('sl') ||
                lower.includes('แพ้') ||
                lower.includes('ขาดทุน')
            ) {
                icon = '↓';
                iconClass = 'loss';

            } else if (
                lower.includes('risk') ||
                lower.includes('drawdown') ||
                lower.includes('เสี่ยง')
            ) {
                icon = '!';
                iconClass = 'warning';

            } else if (
                lower.includes('profit') ||
                lower.includes('tp') ||
                lower.includes('ชนะ') ||
                lower.includes('กำไร')
            ) {
                icon = '✓';

            } else if (
                lower.includes('open') ||
                lower.includes('เปิด')
            ) {
                icon = '↑';
            }

            return `
                <div class="recent-item">
                    <div class="recent-icon ${iconClass}">
                        ${escapeHtml(icon)}
                    </div>
                    <div>
                        <div class="recent-name">
                            ${escapeHtml(title)}
                        </div>
                        <div class="recent-message">
                            ${escapeHtml(message)}
                        </div>
                        <div class="recent-time">
                            ${formatNotificationTime(time)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

/* =========================================================
   PROFILE / USER DISPLAY
   ========================================================= */

// โหลดโปรไฟล์เพื่อแสดงชื่อในข้อความต้อนรับและตัวอักษรในอวตาร
async function loadProfile() {
    try {
        const response =
            await apiFetch('/api/profile');

        if (!response.ok) return;

        const data =
            await response.json();

        const profile =
            data.user ||
            data.profile ||
            data;

        const name =
            profile.name ||
            profile.full_name ||
            profile.fullName ||
            profile.email ||
            'ผู้ใช้งาน';

        document
            .querySelectorAll('.welcome')
            .forEach(element => {
                element.textContent =
                    `ยินดีต้อนรับ, ${name}`;
            });

        const avatar =
            document.querySelector('.avatar');

        if (avatar) {
            avatar.textContent =
                name.charAt(0).toUpperCase();
        }

        loadChatIdFromProfile(profile);

    } catch (error) {
        console.error(
            'Load profile failed:',
            error
        );
    }
}

/* =========================================================
   LOGOUT
   ========================================================= */

// [หมายเหตุ] ผูกปุ่มออกจากระบบใน sidebar — ทำงานซ้ำกับ common.js (ผลเหมือนกัน คือล้าง token
// แล้วไปหน้า login)
document.addEventListener(
    'DOMContentLoaded',
    function () {
        document
            .querySelectorAll('.logout a')
            .forEach(link => {
                link.addEventListener(
                    'click',
                    function (event) {
                        event.preventDefault();

                        localStorage.removeItem(
                            TOKEN_KEY
                        );

                        window.location.href =
                            'login.html';
                    }
                );
            });
    }
);

/* =========================================================
   HELPERS
   ========================================================= */

// แปลงเวลาเป็นข้อความภาษาไทยอ่านง่าย (ถ้าแปลงไม่ได้แสดงค่าเดิมแบบ escape HTML)
function formatNotificationTime(value) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return escapeHtml(value);
    }

    return date.toLocaleString(
        'th-TH',
        {
            dateStyle: 'medium',
            timeStyle: 'short'
        }
    );
}

/* =========================================================
   INITIALIZE
   ========================================================= */

// [สรุป] เริ่มหน้า: ไม่มี token → ไปหน้า login / โหลดโปรไฟล์ + Chat ID →
// โหลดการตั้งค่าจากฐานข้อมูล → โหลดรายการแจ้งเตือนล่าสุด
// → ตรวจว่า API ตอบได้และแสดงสถานะการเชื่อมต่อ
async function initializeNotificationPage() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    // โหลด Profile + Chat ID
    await loadProfile();

    // โหลด Settings จาก Supabase
    await loadNotificationSettings();

    // โหลดรายการแจ้งเตือนล่าสุด
    await loadRecentNotifications();

    // ตรวจสอบ Backend API
    try {
        const response =
            await apiFetch('/api/notifications');

        if (response.ok) {
            setConnectionStatus(
                true,
                'ระบบแจ้งเตือนพร้อมใช้งาน'
            );
        } else {
            setConnectionStatus(
                false,
                'ระบบแจ้งเตือนยังไม่พร้อม'
            );
        }

    } catch (error) {
        console.error(
            'Initial notification API check failed:',
            error
        );

        setConnectionStatus(
            false,
            'ไม่สามารถเชื่อมต่อ Backend'
        );
    }
}

// เมื่อหน้าพร้อม เริ่มโหลดทุกอย่างของหน้าการแจ้งเตือน
document.addEventListener(
    'DOMContentLoaded',
    initializeNotificationPage
);
