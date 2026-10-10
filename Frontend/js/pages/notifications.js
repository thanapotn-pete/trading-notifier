/* =========================================================
   NOTIFICATION PAGE - API
   ========================================================= */

const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
const TOKEN_KEY = 'auth_token';

let notificationSettings = null;
let saveSettingsTimer = null;
let isLoadingSettings = false;
let isSavingSettings = false;

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function apiFetch(path, options = {}) {
    // แนบ token และจัดการ session หมดอายุ (401) ที่ App.apiFetch ที่เดียว
    return App.apiFetch(path, options);
}

/* =========================================================
   NOTIFICATION SETTINGS - DATABASE
   ========================================================= */

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

function scheduleSaveNotificationSettings() {
    clearTimeout(saveSettingsTimer);

    saveSettingsTimer = setTimeout(() => {
        saveNotificationSettings(false, false);
    }, 300);
}

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

function loadChatIdFromProfile(profile) {
    const input = document.getElementById('chatId');

    if (!input || !profile) return;

    if (profile.telegram_chat_id !== undefined &&
        profile.telegram_chat_id !== null) {
        input.value = profile.telegram_chat_id;
    }
}

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

document.addEventListener(
    'DOMContentLoaded',
    initializeNotificationPage
);
