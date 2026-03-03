/* ═══════════════════════════════════════
   nav.js  —  漢堡選單開關（全站共用）
   每個頁面底部都 <script src="js/nav.js">
═══════════════════════════════════════ */
document.getElementById('menu_open').addEventListener('click', () => {
  document.getElementById('menu_mobile').classList.add('open');
  document.body.style.overflow = 'hidden'; // 防止背景捲動
});

const closeMenu = () => {
  document.getElementById('menu_mobile').classList.remove('open');
  document.body.style.overflow = '';
};

document.getElementById('menu_close').addEventListener('click', closeMenu);

// 點選單連結也關閉
document.querySelectorAll('.menu_mobile_list a').forEach(a => {
  a.addEventListener('click', closeMenu);
});
