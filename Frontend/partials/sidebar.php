<?php
/*
|--------------------------------------------------------------------------
| Sidebar (ใช้ร่วมกันทุกหน้า)
|--------------------------------------------------------------------------
| ก่อน include ให้กำหนด $activePage เป็นหนึ่งใน:
| dashboard, trade-history, statistics, reports, notifications, profile, admin
|--------------------------------------------------------------------------
*/
$activePage = $activePage ?? '';

function sidebar_item(string $key, string $href, string $icon, string $label, string $active): string
{
    $class = 'menu-item' . ($key === $active ? ' active' : '');

    return '<a href="' . $href . '" class="' . $class . '">'
        . '<i class="bi ' . $icon . '"></i>'
        . '<span>' . $label . '</span>'
        . '</a>';
}
?>
<aside class="sidebar">

    <!-- LOGO -->
    <div class="logo">
        <i class="bi bi-graph-up-arrow"></i>
        <span>TradeAnalytics</span>
    </div>

    <?= sidebar_item('dashboard', 'dashboard.php', 'bi-grid', 'Dashboard', $activePage) ?>
    <?= sidebar_item('trade-history', 'trade-history.php', 'bi-clock-history', 'ประวัติการเทรด', $activePage) ?>
    <?= sidebar_item('statistics', 'statistics.php', 'bi-bar-chart', 'สถิติการเทรด', $activePage) ?>
    <?= sidebar_item('reports', 'reports.php', 'bi-file-earmark-text', 'รายงาน', $activePage) ?>

    <!-- SETTING -->
    <div class="menu-title">การตั้งค่า</div>

    <?= sidebar_item('notifications', 'notifications.php', 'bi-telegram', 'การแจ้งเตือน', $activePage) ?>
    <?= sidebar_item('profile', 'profile.php', 'bi-person', 'บัญชีผู้ใช้งาน', $activePage) ?>

    <!-- ADMIN (js/common.js จะแสดงเมื่อบัญชีเป็น admin เท่านั้น) -->
    <a href="admin.php" class="menu-item<?= $activePage === 'admin' ? ' active' : '' ?>" id="adminMenuItem" style="display:none">
        <i class="bi bi-shield-lock"></i>
        <span>จัดการบัญชี</span>
    </a>

    <!-- LOGOUT -->
    <div class="logout">
        <a href="#">
            <i class="bi bi-box-arrow-right"></i>
            <span>ออกจากระบบ</span>
        </a>
    </div>

</aside>
