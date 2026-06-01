// ============================================================
//  星光之下 - 爱豆模拟器  游戏引擎
// ============================================================

const SAVE_KEY = 'idol_simulator_save';

// ------ 存档系统 ------
function saveGame() {
  const data = {
    name: G.name, persona: G.persona, fandomColor: G.fandomColor,
    singing: G.singing, dancing: G.dancing, visuals: G.visuals, charisma: G.charisma,
    stamina: G.stamina, mental: G.mental,
    stage: G.stage, fame: G.fame, fans: G.fans, money: G.money,
    threat: G.threat, privacy: G.privacy,
    confronted: G.confronted, ignored: G.ignored, compromised: G.compromised,
    stalkerName: G.stalkerName, week: G.week, lastTrained: G.lastTrained,
    maxActions: G.maxActions, messages: G.messages, ended: G.ended,
    currentTheme: currentTheme,
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch(e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    G.name = d.name; G.persona = d.persona; G.fandomColor = d.fandomColor;
    G.singing = d.singing; G.dancing = d.dancing; G.visuals = d.visuals; G.charisma = d.charisma;
    G.stamina = d.stamina; G.mental = d.mental;
    G.stage = d.stage; G.fame = d.fame; G.fans = d.fans; G.money = d.money;
    G.threat = d.threat; G.privacy = d.privacy;
    G.confronted = d.confronted; G.ignored = d.ignored; G.compromised = d.compromised;
    G.stalkerName = d.stalkerName; G.week = d.week; G.lastTrained = d.lastTrained;
    G.maxActions = d.maxActions; G.messages = d.messages || []; G.ended = d.ended;
    G.selectedActions = [];
    if (d.currentTheme) { currentTheme = d.currentTheme; applyThemePreset(currentTheme); }
    return true;
  } catch(e) { return false; }
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch(e) { return false; }
}

function deleteSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
}

// ------ 游戏全局状态 ------
const G = {
  // 角色
  name: '',
  persona: '',
  fandomColor: '#ff69b4',

  // 属性 (0-100)
  singing: 40,
  dancing: 40,
  visuals: 40,
  charisma: 40,
  stamina: 100,
  mental: 100,

  // 事业
  stage: 'trainee',   // trainee | debuted | rising | top | legend
  fame: 0,
  fans: 0,
  money: 0,

  // 私生
  threat: 0,
  privacy: 100,

  // 关键选择计数（影响结局）
  confronted: 0,       // 硬刚次数
  ignored: 0,          // 冷处理次数
  compromised: 0,      // 妥协次数
  stalkerName: '',     // 私生代号

  // 时间
  week: 1,

  // 属性荒废追踪 (记录上次训练的周数)
  lastTrained: { singing: 0, dancing: 0, visuals: 0, charisma: 0 },

  // 本周已选行动
  selectedActions: [],
  maxActions: 2,

  // 消息记录
  messages: [],

  // 结局
  ended: false
};

// 创建时暂存属性
let createPoints = 40;
let createStats = { singing: 40, dancing: 40, visuals: 40, charisma: 40 };

// ------ 屏幕切换 ------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ------ 粒子背景 ------
function initParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (6 + Math.random() * 14) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
    container.appendChild(p);
  }
}

// ------ 主题预设 (c1主背景/c2卡片/c3强调/c4边框) ------
const THEMES = {
  t1: { c1:'#EBE4F4', c2:'#FFFEE8', c3:'#D2F1F6', c4:'#CBBFDB' },
  t2: { c1:'#FFDCBB', c2:'#FFFADB', c3:'#E3F0C7', c4:'#A6CACB' },
  t3: { c1:'#EAC0C3', c2:'#FAEDE5', c3:'#C7E3E0', c4:'#84B4C3' },
  t4: { c1:'#B8D4C3', c2:'#F7F9D7', c3:'#C9E2CB', c4:'#7CA09D' },
  t5: { c1:'#FFD4D8', c2:'#FFF6DE', c3:'#C7E2EA', c4:'#B8AAC8' },
};

let currentTheme = 't1';

function applyThemePreset(key) {
  currentTheme = key;
  const t = THEMES[key];
  if (!t) return;
  G.fandomColor = t.c4;
  const root = document.documentElement;
  root.style.setProperty('--fandom', t.c4);
  root.style.setProperty('--fandom-glow', t.c4 + '66');
  root.style.setProperty('--bg-deep', t.c1);
  root.style.setProperty('--bg-panel', t.c2);
  root.style.setProperty('--bg-card', t.c2);
  root.style.setProperty('--border', t.c4 + '60');
  root.style.setProperty('--text-primary', '#333');
  root.style.setProperty('--text-secondary', '#777');
  root.style.setProperty('--text-muted', '#999');
  root.style.setProperty('--bg-accent', t.c3);
  document.body.style.background = t.c1;
  document.querySelectorAll('.particle').forEach(p => p.style.background = t.c4);
}

// ------ 继续游戏 ------
function continueGame() {
  if (!loadGame()) return;
  document.getElementById('log-content').innerHTML = '';
  applyTheme();
  initGameUI();
  addLog('system', `欢迎回来，${G.name}。第${G.week}周，${stageLabel(G.stage)}阶段。`);
  updateAllUI();
  showScreen('screen-game');
}

// ------ 粒子开关 ------
function toggleParticles(on) { document.getElementById('particles').style.display = on ? '' : 'none'; }

// ------ 渲染主题选择网格 ------
function renderThemeGrid() {
  const items = Object.entries(THEMES).map(([key, t], i) => {
    const sel = key === currentTheme ? ' theme-swatch-selected' : '';
    const grad = `linear-gradient(180deg, ${t.c1} 0%, ${t.c2} 33%, ${t.c3} 66%, ${t.c4} 100%)`;
    return `<div class="theme-swatch${sel}" onclick="applyThemePreset('${key}');renderThemeGrid();" style="background:${grad};" title="模板${i+1}">
      <span>${i+1}</span>
    </div>`;
  }).join('');
  // 设置弹窗
  const grid = document.getElementById('theme-grid');
  if (grid) grid.innerHTML = items;
  // 标题画面
  const titleGrid = document.getElementById('title-theme-grid');
  if (titleGrid) titleGrid.innerHTML = items;
}

// ------ 关闭介绍 ------
function closeIntro() {
  document.getElementById('screen-intro').classList.remove('active');
}

// ------ 打开主题设置 ------
function openSettings() {
  renderThemeGrid();
  showScreen('screen-settings');
}

// ------ 应用应援色主题 ------
function applyTheme() {
  applyThemePreset(currentTheme);
}

// ------ 开始游戏 ------
function startGame() {
  deleteSave();
  document.getElementById('btn-continue').style.display = 'none';
  showScreen('screen-create');
}

// ------ 角色创建：属性分配 ------
function adjustStat(stat, delta) {
  const newVal = createStats[stat] + delta;
  if (newVal < 0) return;
  const newPoints = createPoints - delta;
  if (newPoints < 0) return;
  createStats[stat] = newVal;
  createPoints = newPoints;
  document.getElementById('val-' + stat).textContent = newVal;
  document.getElementById('points-left').textContent = createPoints;
}

// ------ 确认创建 ------
function confirmCreate() {
  const name = document.getElementById('input-name').value.trim();
  if (!name) { shake(document.getElementById('input-name')); return; }

  const personaEl = document.querySelector('input[name="persona"]:checked');
  const personaMap = { cool: '高冷ACE', cute: '元气甜豆', sexy: '性感主舞', pure: '清纯门面' };

  G.name = name;
  G.persona = personaMap[personaEl.value];
  G.fandomColor = document.getElementById('input-color').value;
  G.singing = createStats.singing;
  G.dancing = createStats.dancing;
  G.visuals = createStats.visuals;
  G.charisma = createStats.charisma;
  G.stamina = 100;
  G.mental = 100;

  // 随机生成私生代号
  const stalkerNames = ['影子人偶', '深渊的爱', '永远注视你', '只属于我的星', '暗夜守护者', '第七号跟踪狂', '糖果与刀', '404_not_found'];
  G.stalkerName = stalkerNames[Math.floor(Math.random() * stalkerNames.length)];

  applyTheme();
  initGameUI();
  addLog('system', `练习生 "${G.name}" 正式签约。定位：${G.persona}。梦想之路，从今天开始。`);
  updateAllUI();
  saveGame();
  showScreen('screen-game');
}

function shake(el) {
  el.style.borderColor = 'var(--danger)';
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 400);
}

// 添加 shake 动画
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

// ------ 初始化游戏 UI ------
function initGameUI() {
  document.getElementById('disp-name').textContent = G.name;
  applyThemePreset(currentTheme);
}

// ------ 更新所有 UI ------
function updateAllUI() {
  // 顶栏
  document.getElementById('disp-week').textContent = G.week;
  document.getElementById('disp-stage').textContent = stageLabel(G.stage);
  document.getElementById('disp-fame').textContent = formatNum(G.fame);
  document.getElementById('disp-money').textContent = formatNum(G.money);
  document.getElementById('disp-mental').textContent = G.mental;

  // 属性条
  setBar('singing', G.singing);
  setBar('dancing', G.dancing);
  setBar('visuals', G.visuals);
  setBar('charisma', G.charisma);
  setBar('stamina', G.stamina);

  // 粉丝
  document.getElementById('disp-fans').textContent = formatNum(G.fans);

  // 威胁
  const threatPct = Math.min(100, G.threat);
  document.getElementById('threat-fill').style.width = threatPct + '%';
  document.getElementById('threat-label').textContent = threatLabel(G.threat);

  // 行动
  renderActions();
}

function setBar(stat, val) {
  const pct = Math.max(0, Math.min(100, val));
  document.getElementById('bar-' + stat).style.width = pct + '%';
  document.getElementById('txt-' + stat).textContent = Math.round(val);
}

function stageLabel(s) {
  const map = { trainee: '练习生', debuted: '已出道', rising: '上升期', top: '顶流', legend: '传奇' };
  return map[s] || s;
}

function threatLabel(v) {
  if (v < 10) return '安全';
  if (v < 30) return '轻微关注';
  if (v < 50) return '频繁骚扰';
  if (v < 70) return '严重跟踪';
  if (v < 90) return '危险入侵';
  return '生命威胁';
}

function formatNum(n) {
  if (n >= 10000) return (n / 10000).toFixed(0) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return Math.floor(n).toString();
}

// ------ 行动系统 ------
function getActions() {
  const all = {
    // 通用
    rest: { label: '休息', desc: '恢复体力与精神', cost: null, available: () => true, effect: () => { G.stamina = Math.min(100, G.stamina + 30); G.mental = Math.min(100, G.mental + 10); addLog('system', '你好好休息了一下，感觉精力恢复了不少。'); } },

    vocal_train: { label: '声乐训练', desc: '唱功 +3~6（80以上 +5~9），体力 -10', cost: null, available: () => G.stamina >= 10, effect: () => { G.lastTrained.singing = G.week; const boosted = G.singing >= 80; const g = boosted ? rand(5,9) : rand(3,6); G.singing = Math.min(100, G.singing + g); G.stamina -= 10; addLog('good', `声乐训练完成，唱功 +${g}。${boosted ? '高水准训练效果显著提升！' : ''}`); } },

    dance_train: { label: '舞蹈训练', desc: '舞蹈 +3~6（80以上 +5~9），体力 -15', cost: null, available: () => G.stamina >= 15, effect: () => { G.lastTrained.dancing = G.week; const boosted = G.dancing >= 80; const g = boosted ? rand(5,9) : rand(3,6); G.dancing = Math.min(100, G.dancing + g); G.stamina -= 15; addLog('good', `舞蹈训练完成，舞蹈 +${g}。${boosted ? '高水准训练效果显著提升！' : ''}`); } },

    physical_train: { label: '形体训练', desc: '颜值 +2~4（80以上 +4~7），体力恢复 +5', cost: null, available: () => true, effect: () => { G.lastTrained.visuals = G.week; const boosted = G.visuals >= 80; const g = boosted ? rand(4,7) : rand(2,4); G.visuals = Math.min(100, G.visuals + g); G.stamina = Math.min(100, G.stamina + 5); addLog('good', `形体训练完成，颜值 +${g}。${boosted ? '高水准训练效果显著提升！' : ''}`); } },

    practice: { label: '舞台排练', desc: '魅力 +3~5（80以上 +5~8），体力 -10', cost: null, available: () => G.stamina >= 10, effect: () => { G.lastTrained.charisma = G.week; const boosted = G.charisma >= 80; const g = boosted ? rand(5,8) : rand(3,5); G.charisma = Math.min(100, G.charisma + g); G.stamina -= 10; addLog('good', `舞台排练顺利完成，魅力 +${g}。${boosted ? '高水准训练效果显著提升！' : ''}`); } },

    evaluation: { label: '月末考核', desc: '根据属性获得人气 +5~25', cost: null, available: () => G.stage === 'trainee', effect: () => { const avg = (G.singing + G.dancing + G.visuals + G.charisma) / 4; const f = rand(5, 15) + Math.floor(avg / 10); G.fame += f; addLog('good', `月末考核表现优异，人气 +${f}。`); checkStageUp(); } },

    cover_song: { label: '发布翻唱', desc: '唱功相关人气 +5~15', cost: null, available: () => G.stage === 'trainee' && G.singing >= 10, effect: () => { const f = rand(5, 15) + Math.floor(G.singing / 15); G.fame += f; addLog('fame', `翻唱视频小火了一把，人气 +${f}。`); checkStageUp(); } },

    busking: { label: '街头路演', desc: '魅力相关人气 +8~20，体力 -15', cost: null, available: () => G.stage === 'trainee' && G.stamina >= 15, effect: () => { G.stamina -= 15; const f = rand(8, 20) + Math.floor(G.charisma / 12); G.fame += f; G.fans += rand(10, 50); addLog('fame', `街头路演吸引了不少路人驻足，人气 +${f}。`); checkStageUp(); } },

    // 出道后
    release_single: { label: '发行单曲', desc: '人气 +20~40，粉丝增长', cost: 50, available: () => G.money >= 50, effect: () => { G.money -= 50; const f = rand(20,40); G.fame += f; G.fans += rand(200,500); addLog('fame', `单曲发布，登上音乐榜，人气 +${f}。`); checkStageUp(); } },

    release_album: { label: '发行专辑', desc: '人气 +50~100，大量涨粉', cost: 200, available: () => G.money >= 200, effect: () => { G.money -= 200; const f = rand(50,100); G.fame += f; G.fans += rand(1000,3000); addLog('fame', `专辑大卖，人气 +${f}。`); checkStageUp(); } },

    music_show: { label: '打歌节目', desc: '人气 +15~30，与唱功/舞蹈相关', cost: 10, available: () => G.money >= 10, effect: () => { G.money -= 10; const avg = (G.singing + G.dancing) / 2; const f = rand(15,30) + Math.floor(avg / 10); G.fame += f; addLog('fame', `打歌舞台表现出色，人气 +${f}。`); checkStageUp(); } },

    variety_show: { label: '综艺节目', desc: '人气 +20~50，与魅力相关', cost: 5, available: () => G.money >= 5, effect: () => { G.money -= 5; const bonus = Math.floor(G.charisma / 10); const f = rand(20,50) + bonus; G.fame += f; G.fans += rand(500,1500); addLog('fame', `综艺感十足，人气 +${f}。`); checkStageUp(); } },

    endorsement: { label: '品牌代言', desc: '赚钱 +80~200万，人气 +10~20', cost: null, available: () => G.fame >= 200, effect: () => { const m = rand(80,200); G.money += m; G.fame += rand(10,20); addLog('good', `拿下新代言，收入 +${m}万。`); } },

    fan_meeting: { label: '粉丝见面会', desc: '涨粉 +1000~3000，体力 -20', cost: 20, available: () => G.money >= 20 && G.stamina >= 20, effect: () => { G.money -= 20; G.stamina -= 20; const fans = rand(1000,3000); G.fans += fans; G.mental = Math.min(100, G.mental + 5); addLog('good', `粉丝见面会圆满成功，新增粉丝 +${fans}。`); } },

    concert: { label: '演唱会', desc: '人气 +80~150，大量收入与涨粉', cost: 100, available: () => G.money >= 100 && G.stamina >= 30, effect: () => { G.money -= 100; G.stamina -= 30; const f = rand(80,150); const m = rand(200,500); const fans = rand(5000,15000); G.fame += f; G.money += m; G.fans += fans; addLog('fame', `演唱会大获成功！人气 +${f}，收入 +${m}万，粉丝 +${fans}。`); checkStageUp(); } },

    world_tour: { label: '世界巡演', desc: '人气 +150~300，巨量收入', cost: 500, available: () => G.money >= 500 && G.stamina >= 50, effect: () => { G.money -= 500; G.stamina -= 50; const f = rand(150,300); const m = rand(800,2000); G.fame += f; G.money += m; G.fans += rand(20000,50000); addLog('fame', `世界巡演席卷全球，人气 +${f}，收入 +${m}万。`); checkStageUp(); } },

    acting: { label: '挑战演技', desc: '转型演员，人气 +40~80', cost: null, available: () => G.fame >= 500 && G.charisma >= 30, effect: () => { const f = rand(40,80); G.fame += f; G.charisma = Math.min(100, G.charisma + rand(3,8)); addLog('fame', `首次触电大银幕，演技获得认可，人气 +${f}。`); checkStageUp(); } },

    award: { label: '冲击奖项', desc: '需高属性，人气暴涨', cost: 30, available: () => G.money >= 30 && G.fame >= 1000 && (G.singing + G.dancing + G.charisma) >= 150, effect: () => { G.money -= 30; const f = rand(100,300); G.fame += f; G.fans += rand(10000,50000); addLog('fame', `获奖了！人气暴增 +${f}。`); checkStageUp(); } },

    produce: { label: '担任制作人', desc: '培养新人，稳定收益', cost: 200, available: () => G.stage === 'legend', effect: () => { G.money -= 200; G.money += rand(300,600); G.fame += rand(20,50); addLog('good', `以制作人身份推出新团，收益颇丰。`); } },

    private_chat: { label: '私联粉丝', desc: '换资源但私生盯上风险大增', cost: null, available: () => G.fame >= 100, effect: () => { const m = rand(30,80); const t = rand(15,30); G.money += m; G.threat += t; G.fame += rand(10,20); addLog('warn', `私下联系了富婆粉，获得资源 +${m}万，但私生威胁 +${t}。`); triggerSasaengEvent('private'); } },

    // 粉丝量解锁
    travel: { label: '出门旅游', desc: '放松身心，恢复精神，粉丝偶遇+人气', cost: 10, available: () => G.fans >= 3000 && G.money >= 10 && G.stamina >= 10, effect: () => { G.money -= 10; G.stamina -= 10; G.mental = Math.min(100, G.mental + 20); const f = rand(5, 15); G.fame += f; addLog('system', `难得出去旅游散心，心理健康恢复。路上被粉丝认出，人气 +${f}。`); } },

    charity: { label: '慈善活动', desc: '提升形象，人气与魅力增长', cost: 30, available: () => G.fans >= 5000 && G.money >= 30, effect: () => { G.money -= 30; G.charisma = Math.min(100, G.charisma + rand(3, 6)); const f = rand(15, 30); G.fame += f; addLog('good', `参加慈善活动，公众好感度上升，人气 +${f}，魅力提升。`); } },

    fashion_week: { label: '时装周', desc: '颜值相关，人气+收入', cost: 15, available: () => G.fans >= 8000 && G.visuals >= 40 && G.money >= 15, effect: () => { G.money -= 15; const bonus = Math.floor(G.visuals / 10); const f = rand(20, 40) + bonus; G.fame += f; G.money += rand(50, 120); addLog('fame', `时装周造型出圈，人气 +${f}，获得品牌合作邀约。`); } },

    collab_stage: { label: '合作舞台', desc: '与其他艺人合作，人气+魅力', cost: null, available: () => G.fans >= 10000 && G.charisma >= 50 && G.stamina >= 20, effect: () => { G.stamina -= 20; const f = rand(30, 60); G.charisma = Math.min(100, G.charisma + rand(2, 5)); G.fame += f; addLog('fame', `合作舞台引发热议，人气 +${f}，圈了不少新粉。`); checkStageUp(); } },
  };

  // 根据不同阶段返回可选行动
  const available = [];
  for (const [key, act] of Object.entries(all)) {
    if (act.available()) available.push({ key, ...act });
  }
  return available;
}

function renderActions() {
  const container = document.getElementById('actions-list');
  const remaining = G.maxActions - G.selectedActions.length;
  document.getElementById('actions-remaining').textContent = remaining;
  document.getElementById('btn-next-week').disabled = G.selectedActions.length === 0;

  const actions = getActions();
  container.innerHTML = actions.map(a => {
    const selected = G.selectedActions.includes(a.key);
    const disabled = !selected && G.selectedActions.length >= G.maxActions;
    return `<button class="action-btn ${selected ? 'selected' : ''}"
      ${disabled ? 'disabled' : ''}
      onclick="toggleAction('${a.key}')">
      <span>${a.label}</span>
      <span class="action-cost">${a.desc}</span>
    </button>`;
  }).join('');
}

function toggleAction(key) {
  const idx = G.selectedActions.indexOf(key);
  if (idx >= 0) {
    G.selectedActions.splice(idx, 1);
  } else if (G.selectedActions.length < G.maxActions) {
    G.selectedActions.push(key);
  }
  renderActions();
}

// ------ 进入下一周 ------
function nextWeek() {
  if (G.selectedActions.length === 0) return;

  // 执行行动
  const actions = getActions();
  for (const key of G.selectedActions) {
    const act = actions.find(a => a.key === key);
    if (act) act.effect();
  }

  // 随机事件
  rollRandomEvent();

  // 私生影响
  sasaengTick();

  // 属性荒废衰减：满点后四周未训练扣5
  applyDecay();

  // 体力自然恢复
  G.stamina = Math.min(100, G.stamina + 5);

  // 时间前进
  G.week++;
  G.selectedActions = [];

  // 检查结局
  if (checkEnding()) { saveGame(); return; }

  updateAllUI();

  autoScrollLog();
  saveGame();
}

// ------ 阶段升级 ------
function checkStageUp() {
  const prev = G.stage;
  if (G.fame >= 10000 && G.stage !== 'legend') G.stage = 'legend';
  else if (G.fame >= 2000 && (G.stage === 'trainee' || G.stage === 'debutted' || G.stage === 'rising')) G.stage = 'top';
  else if (G.fame >= 500 && (G.stage === 'trainee' || G.stage === 'debutted')) G.stage = 'rising';
  else if (G.fame >= 100 && G.stage === 'trainee') G.stage = 'debutted';

  if (G.stage !== prev) {
    G.maxActions = G.stage === 'trainee' ? 2 : G.stage === 'debutted' ? 2 : 3;
    const labels = { debuted: '正式出道！', rising: '上升期到来！', top: '登顶顶流！', legend: '成为传奇！' };
    addLog('fame', `${labels[G.stage]} 你已进入"${stageLabel(G.stage)}"阶段。新的机会与挑战在等待着你。`);
    // 名气上升必然引来私生
    if (G.stage === 'rising' || G.stage === 'top') {
      G.threat += rand(10, 20);
      addLog('sasaeng', `👁️ 随着名气增长，你感到暗处多了许多注视的目光……`);
    }
    document.getElementById('disp-stage').textContent = stageLabel(G.stage);
  }
}

// ------ 随机事件系统 ------
function rollRandomEvent() {
  const roll = Math.random();

  // 30% 概率触发随机事件
  if (roll > 0.3) return;

  const events = [];

  // 通用事件
  events.push({
    id: 'scout',
    title: '星探偶遇',
    text: '一位知名制作人在公司附近看到了你，对你的气质印象深刻。',
    choices: [
      { text: '主动上前打招呼 (+魅力)', effect: () => { G.charisma = Math.min(100, G.charisma + 5); G.fame += 10; addLog('good', '制作人记住了你的名字！魅力 +5，人气 +10。'); } },
      { text: '保持低调', effect: () => { addLog('system', '你选择了低调，也许下次还会有机会。'); } },
    ],
    condition: () => G.fame < 500,
  });

  events.push({
    id: 'rumor',
    title: '网络谣言',
    text: '有人在网上散布关于你的不实传闻。粉丝们在等你的回应。',
    choices: [
      { text: '立即发声明澄清 (+人气)', effect: () => { G.fame += 15; G.charisma += 2; addLog('good', '及时澄清获得粉丝理解，人气 +15。'); } },
      { text: '冷处理不回应', effect: () => { G.mental -= 5; addLog('bad', '沉默让谣言发酵，你感到心力交瘁。心理健康 -5。'); } },
    ],
    condition: () => G.fame >= 50,
  });

  events.push({
    id: 'collab',
    title: '合作邀约',
    text: '一位当红爱豆想邀请你合作一首单曲，但这需要投入大量时间排练。',
    choices: [
      { text: '接受合作 (+人气, -体力)', effect: () => { G.fame += rand(30,60); G.stamina -= 20; addLog('fame', '合作单曲大热！人气飙升。'); } },
      { text: '婉拒，专注自己', effect: () => { addLog('system', '你选择了专注自身发展。虽然没有合作的热度，但稳扎稳打也不错。'); } },
    ],
    condition: () => G.fame >= 200,
  });

  // 私生专属事件
  events.push({
    id: 'stalker_spotted',
    title: '👁️ 可疑身影',
    text: '你离开公司时，注意到一辆陌生的黑色轿车停在马路对面。车窗漆黑，看不清里面是否有人。',
    choices: [
      { text: '硬刚——走过去质问', effect: () => { G.confronted++; G.threat += 10; addLog('sasaeng', '你走过去敲车窗，车子猛地发动逃走了。但第二天你收到一条私信："你生气的样子真可爱。"私生威胁 +10。'); triggerSasaengMsg('confront'); } },
      { text: '冷处理——快步离开', effect: () => { G.ignored++; G.threat += 5; addLog('sasaeng', '你快步走回公司，但心里总觉得有人盯着你。接下来一周，你频繁收到未署名的礼物。私生威胁 +5。'); triggerSasaengMsg('ignore'); } },
      { text: '妥协——假装没看到', effect: () => { G.compromised++; G.mental -= 10; addLog('sasaeng', '你假装没看到，绕路走了。但从此你变得小心翼翼，不敢独自出门。心理健康 -10。'); } },
    ],
    condition: () => G.threat >= 15,
  });

  events.push({
    id: 'info_leak',
    title: '🚨 隐私泄露',
    text: '你的手机号、家庭住址被人公开在社交平台上。大量陌生电话和信息涌入你的手机。',
    choices: [
      { text: '硬刚——报警+公开声明', effect: () => { G.confronted++; G.fame += rand(-30,30); G.threat += rand(-10, 20); G.privacy -= 20; addLog('warn', '你选择报警并公开警告私生。部分粉丝支持你，但也有人说你"小题大做"。'); triggerSasaengMsg('leak_confront'); } },
      { text: '冷处理——换号搬家', effect: () => { G.ignored++; G.money -= 30; G.threat += 10; G.privacy -= 30; addLog('bad', '你花了30万搬家换号，但私生很快又找到了你。你觉得无处可逃……'); triggerSasaengMsg('leak_ignore'); } },
      { text: '妥协——试图沟通', effect: () => { G.compromised++; G.mental -= 20; G.threat += 20; addLog('sasaeng', '你试图与对方沟通，希望ta停止。但这反而让对方觉得你"在乎"ta。骚扰变本加厉。心理健康 -20。'); triggerSasaengMsg('leak_compromise'); } },
    ],
    condition: () => G.threat >= 40,
  });

  events.push({
    id: 'airport_chase',
    title: '✈️ 机场围堵',
    text: '你结束海外行程回国，机场被私生和代拍围得水泄不通。有人伸手抓你的衣服，有人贴脸拍照。',
    choices: [
      { text: '硬刚——怒斥+推搡', effect: () => { G.confronted++; G.fame += rand(-50,-10); G.mental -= 10; addLog('bad', '你的视频被发到网上，被断章取义成"耍大牌"。全网黑了一周。人气 -50。'); } },
      { text: '冷处理——低头快走', effect: () => { G.ignored++; G.stamina -= 15; addLog('warn', '你在保镖护送下艰难穿过人群。虽然狼狈但没出大事。体力 -15。'); } },
      { text: '妥协——停下让他们拍', effect: () => { G.compromised++; G.threat += 15; G.mental -= 5; addLog('sasaeng', '你停下来配合拍照。此后每次机场都有人蹲守，越来越多。私生威胁 +15。'); } },
    ],
    condition: () => G.threat >= 30,
  });

  events.push({
    id: 'hotel_invasion',
    title: '🏨 酒店入侵',
    text: '你在酒店房间休息时，突然有人用房卡打开了你的房门——是私生通过非法手段获取的。你惊恐万分。',
    choices: [
      { text: '硬刚——报警+召开发布会', effect: () => { G.confronted++; G.threat -= 20; G.fame += 50; G.mental -= 15; addLog('good', '事件引起社会关注，警方介入调查。你的勇敢让更多人开始重视私生问题。人气 +50，私生威胁 -20。'); } },
      { text: '冷处理——换酒店+加强安保', effect: () => { G.ignored++; G.money -= 50; G.threat += 5; addLog('warn', '你连夜换了酒店，雇了私人保镖。但安全感已经被彻底打碎。花费50万。'); } },
      { text: '妥协——请求公司保护', effect: () => { G.compromised++; G.mental -= 25; G.threat += 10; addLog('bad', '公司只给你加派了一个助理。你不敢再一个人住酒店了。心理健康 -25。'); } },
    ],
    condition: () => G.threat >= 60,
  });

  events.push({
    id: 'strange_gift',
    title: '🎁 诡异礼物',
    text: '你在公司收到一个匿名包裹，打开后发现里面是一束玫瑰——和一张你昨天在练习室睡觉的照片。',
    choices: [
      { text: '硬刚——公开警告+追查寄件人', effect: () => { G.confronted++; G.threat += 5; addLog('warn', '你公开发文警告私生，但对方似乎更兴奋了。之后礼物反而变多了。私生威胁 +5。'); triggerSasaengMsg('confront'); } },
      { text: '冷处理——扔掉+加强门禁', effect: () => { G.ignored++; G.money -= 10; addLog('system', '你默默扔掉了礼物，让公司升级了门禁系统。花10万。但心里总觉得不踏实。'); } },
      { text: '妥协——发动态感谢"粉丝的礼物"', effect: () => { G.compromised++; G.threat += 10; G.fame += 5; addLog('sasaeng', '你发动态感谢了"暖心礼物"。其他粉丝很开心，但那个私生发来私信："你喜欢就好，明天还有。"私生威胁 +10。'); } },
    ],
    condition: () => G.threat >= 25,
  });

  events.push({
    id: 'online_attack',
    title: '💻 网络暴力',
    text: '一夜之间，你的黑话题冲上热搜。私生扒出你出道前的照片、家庭信息，断章取义地编造黑料。',
    choices: [
      { text: '硬刚——发律师函+全平台澄清', effect: () => { G.confronted++; G.money -= 20; G.fame += rand(-20, 30); addLog('warn', '律师函起到了一定震慑作用，但部分路人已被洗脑。花费20万。'); } },
      { text: '冷处理——等热度过去', effect: () => { G.ignored++; G.mental -= 15; G.fame -= 10; addLog('bad', '黑料持续发酵了一周才逐渐平息。你的心理健康受到了严重影响。人气 -10，心理健康 -15。'); } },
      { text: '妥协——请大粉帮忙控评', effect: () => { G.compromised++; G.threat += 5; addLog('system', '大粉帮你组织了控评，局势有所缓和。但你欠了粉丝人情，以后不好拒绝了。'); } },
    ],
    condition: () => G.fame >= 300 && G.threat >= 20,
  });

  events.push({
    id: 'dating_rumor',
    title: '绯闻风暴',
    text: '有媒体拍到你与某当红艺人同框，恋爱传闻甚嚣尘上。对方粉丝和你的粉丝吵成一片。',
    choices: [
      { text: '公开否认+专注事业', effect: () => { G.fame += 20; G.charisma += 3; addLog('good', '你干净利落地否认并宣布新作品，把热度转化成了关注度。人气 +20。'); } },
      { text: '暧昧不回应，炒热度', effect: () => { G.fame += rand(30, 60); G.threat += 10; addLog('warn', '热度是有了，但对方粉丝开始疯狂扒你的黑料。私生借机获取了更多你的信息。私生威胁 +10。'); } },
      { text: '承认恋情', effect: () => { G.fame += rand(-30, 10); G.fans -= rand(500, 2000); addLog('bad', '部分粉丝脱粉回踩。但也有一些粉丝祝福你。"至少你诚实。"'); } },
    ],
    condition: () => G.fame >= 500,
  });

  // 筛选满足条件的事件
  const valid = events.filter(e => e.condition());

  if (valid.length === 0) return;

  const event = valid[Math.floor(Math.random() * valid.length)];
  showEvent(event);
}

// ------ 显示事件弹窗 ------
let currentEvent = null;
function showEvent(eventObj) {
  currentEvent = eventObj;
  document.getElementById('modal-title').textContent = eventObj.title;
  document.getElementById('modal-body').textContent = eventObj.text;

  const choicesDiv = document.getElementById('modal-choices');
  choicesDiv.innerHTML = eventObj.choices.map((c, i) =>
    `<button class="modal-choice-btn" onclick="chooseEvent(${i})">${c.text}</button>`
  ).join('');

  showScreen('screen-event');
}

function chooseEvent(idx) {
  if (!currentEvent) return;
  currentEvent.choices[idx].effect();
  currentEvent = null;
  showScreen('screen-game');
  updateAllUI();
  saveGame();
}

// ------ 属性衰减 ------
function applyDecay() {
  const stats = [
    { key: 'singing', label: '唱功' },
    { key: 'dancing', label: '舞蹈' },
    { key: 'visuals', label: '颜值' },
    { key: 'charisma', label: '魅力' },
  ];
  for (const s of stats) {
    // 满点且四周未训练
    if (G[s.key] >= 100 && G.week - G.lastTrained[s.key] >= 4) {
      G[s.key] = Math.max(0, G[s.key] - 5);
      G.lastTrained[s.key] = G.week; // 重置，避免连续扣
      addLog('bad', `${s.label}荒废太久，退步了！${s.label} -5。`);
    }
  }
}

// ------ 私生系统 ------
function sasaengTick() {
  // 名气越高，私生威胁自然增长
  const fameGrowth = Math.floor(G.fame / 200);
  G.threat = Math.min(100, G.threat + fameGrowth);

  // 心理健康下降
  if (G.threat > 30) G.mental = Math.max(0, G.mental - Math.floor(G.threat / 25));

  // 随机私生消息
  if (G.threat >= 10 && Math.random() < Math.min(0.6, G.threat / 100)) {
    triggerSasaengMsg('tick');
  }
}

function triggerSasaengEvent(source) {
  // 事件触发的消息延迟
  setTimeout(() => {
    if (source === 'private') {
      addSasaengMsg('我知道你昨天见谁了……', null);
      setTimeout(() => addSasaengMsg('她的ID我也知道哦', null), 800);
      setTimeout(() => addSasaengMsg('你最好小心一点 😊', null), 1600);
    }
  }, 1500);
}

function triggerSasaengMsg(event) {
  const msgs = {
    confront: [
      '你敢这样对我？你会后悔的。',
      '既然你不领情，那我也不用客气了 😈',
      '你的所有行程我都知道。我们走着瞧。',
    ],
    ignore: [
      '我知道你看到我了。',
      '不理我也没关系，我会等你。',
      '今天凌晨3点你又失眠了吧？我都知道。',
    ],
    leak_confront: [
      '报j也没用。我爱你有什么错？',
      '你以为法律能保护你？天真。',
      '下一个地址我也有了。你搬不掉的。',
    ],
    leak_ignore: [
      '换号码了？没关系，我已经有了新号码。',
      '你搬到哪里我都会找到你。因为我是你的影子。',
    ],
    leak_compromise: [
      '谢谢你回我消息！我们果然是双向奔赴！',
      '从现在起，你就是我的了。我会好好"保护"你的。',
      '不要和其他粉丝走太近。我会吃醋的。',
    ],
    tick: [
      '今天在咖啡厅看到你，你今天好美。',
      '你的新发型很适合你。是的，我看到了。',
      '明天下午3点你有行程对吧？我会去的。',
      '昨晚你发的那条动态是在暗示什么吗？',
      '你的家门密码换了吗？我试了一下打不开了。',
      '你穿那件黑色卫衣很好看。特别是配那条牛仔裤。',
      '我今天又给你寄了礼物。记得查收。',
      '为什么你不回我私信？我知道你看到了。',
      '我就在你公司楼下。出来见一面好吗？就一面。',
      '你的经纪人手机号是138xxxx吧？我打给他了。',
      '你家门口那盆花该浇水了。顺便说一句，花很漂亮。',
      '你和XX爱豆走得太近了。我不喜欢。离ta远点。',
      '你昨晚11点23分关的灯。我就在对面楼上看着。',
      '生日快乐。虽然你从来不告诉我们你的真实生日，但我知道。',
      '你扔在垃圾桶里的那张废纸我捡走了。是你的笔迹，真好看。',
      '你妈妈今天给你打了电话对吧？她说让你多穿点。',
      '我梦到你了。梦里你对我笑了。',
      '你的血液样本我已经有了。你的一切我都了解。',
      '不要搬家。上次搬家让我很难过。答应我好吗？',
      '我今天摸到了你扔掉的矿泉水瓶。间接kiss了呢 ^_^',
      '你的一根头发我收藏在相框里了。',
      '你的航班我已经订好了。我们坐同一班飞机哦。',
      '我不是在跟踪你。我只是……恰好和你同路。永远同路。',
    ],
  };

  const pool = msgs[event] || msgs.tick;
  const msg = pool[Math.floor(Math.random() * pool.length)];
  addSasaengMsg(msg, G.stalkerName);
}

function addSasaengMsg(text, sender) {
  const name = sender || G.stalkerName;
  G.messages.push({ from: name, text, time: new Date() });
  // 如果消息窗口打开则实时更新
  const chat = document.getElementById('chat-window');
  if (chat && document.getElementById('screen-messages').classList.contains('active')) {
    appendChatBubble(chat, 'sasaeng', name, text);
    chat.scrollTop = chat.scrollHeight;
  }
}

// ------ 消息窗口 ------
function openMessages() {
  const chat = document.getElementById('chat-window');
  chat.innerHTML = '';

  if (G.messages.length === 0) {
    chat.innerHTML = '<div class="chat-bubble system-msg">暂无私信</div>';
  } else {
    for (const m of G.messages) {
      appendChatBubble(chat, 'sasaeng', m.from, m.text);
    }
  }

  showScreen('screen-messages');
  chat.scrollTop = chat.scrollHeight;
}

function closeMessages() {
  showScreen('screen-game');
}

function appendChatBubble(container, cls, sender, text) {
  const div = document.createElement('div');
  div.className = 'chat-bubble ' + cls;
  div.innerHTML = `<strong>${sender}</strong><br>${text}`;
  container.appendChild(div);
}

// ------ 日志自动滚动 ------
function autoScrollLog() {
  const parent = document.getElementById('event-log');
  if (parent) parent.scrollTop = parent.scrollHeight;
}

// ------ 日志系统 ------
function addLog(type, text) {
  const container = document.getElementById('log-content');
  const parent = document.getElementById('event-log');
  const div = document.createElement('div');
  div.className = 'log-entry ' + type;
  div.textContent = `[第${G.week}周] ${text}`;
  container.appendChild(div);
  if (parent) parent.scrollTop = parent.scrollHeight;
}

// ------ 结局系统 ------
function checkEnding() {
  const w = G.week;
  let ending = null;

  // 硬刚路线结局
  if (G.confronted >= 5 && G.threat >= 80 && G.fame < 500) {
    ending = 'hard_confront_low';
  } else if (G.confronted >= 5 && G.threat >= 80 && G.fame >= 1000) {
    ending = 'hard_confront_high';
  }
  // 妥协路线结局
  else if (G.compromised >= 5 && G.mental <= 20) {
    ending = 'compromise_break';
  } else if (G.compromised >= 5 && G.mental > 20 && G.fame >= 2000) {
    ending = 'compromise_top';
  }
  // 冷处理路线结局
  else if (G.ignored >= 6 && G.threat >= 90) {
    ending = 'ignore_escalate';
  }
  // 心理健康崩溃
  else if (G.mental <= 0) {
    ending = 'mental_break';
  }
  // 传奇结局
  else if (G.stage === 'legend' && G.threat < 50 && G.mental >= 50) {
    ending = 'legend_safe';
  } else if (G.stage === 'legend' && G.threat >= 50) {
    ending = 'legend_dark';
  }
  // 时间结局（40周）
  else if (w >= 40 && G.fame >= 2000) {
    ending = 'year_top';
  } else if (w >= 40 && G.fame < 2000 && G.fame >= 100) {
    ending = 'year_mid';
  } else if (w >= 40 && G.fame < 100) {
    ending = 'year_fail';
  }
  // 威胁爆表
  else if (G.threat >= 100 && G.privacy <= 0) {
    ending = 'threat_max';
  }

  if (ending) {
    showEnding(ending);
    return true;
  }
  return false;
}

function showEnding(ending) {
  G.ended = true;
  const endings = {
    hard_confront_low: {
      title: '悲壮的反抗者',
      sub: '你选择了硬刚，但你的声音还不够大',
      epilogue: `你一次次站出来对抗私生，但由于知名度有限，你的声音被淹没在网络的喧嚣中。私生变本加厉地报复你——造谣、人肉、全网抹黑。你被公司雪藏，最后黯然退圈。\n\n但你说："至少我没有跪下。"`,
      color: '#ff6644',
    },
    hard_confront_high: {
      title: '破晓之光',
      sub: '你的勇敢，照亮了整个行业',
      epilogue: `你凭借顶流的影响力，公开对抗私生饭现象。你的发声引发全社会关注，推动了相关立法。虽然过程痛苦，但你的勇敢保护了无数后辈。\n\n你成为了行业的标杆——不只因为才华，更因为勇气。`,
      color: '#ffd700',
    },
    compromise_break: {
      title: '金丝雀的笼子',
      sub: '你妥协了太多次，直到失去自我',
      epilogue: `为了换取资源和安宁，你一次次妥协。私生控制了你的社交账号，决定了你能见谁、不能见谁。公司觉得你"麻烦太多"，不再给你资源。\n\n你成了笼中的金丝雀——漂亮，但没有自由。`,
      color: '#888899',
    },
    compromise_top: {
      title: '带刺的皇冠',
      sub: '你站上了巅峰，但脚下是深渊',
      epilogue: `你成为了顶流，拥有千万粉丝、无数代言。但只有你自己知道——你的手机被监控，你的行程被控制，你的每一个决定都要经过"ta"的同意。\n\n聚光灯下的你光芒万丈，聚光灯后的你，无路可逃。`,
      color: '#aa66ff',
    },
    ignore_escalate: {
      title: '沉默的代价',
      sub: '你以为不理ta，ta就会放弃。你错了。',
      epilogue: `你对所有骚扰选择了沉默和回避。但沉默被解读为默许，回避被当作欲擒故纵。私生的行为逐步升级——从跟踪到入侵，从网络到现实。\n\n事情最终以一起恶性事件登上社会新闻。你退出了娱乐圈，但阴影从未散去。`,
      color: '#ff2266',
    },
    mental_break: {
      title: '星光的尽头',
      sub: '光鲜的背后，是一颗破碎的心',
      epilogue: `长期的骚扰与压力击垮了你。你无法再站上舞台，无法再面对镜头。公司宣布你"因健康原因暂停活动"。\n\n在精神病院的窗前，你看着远处的广告牌——那是曾经的你。`,
      color: '#444466',
    },
    legend_safe: {
      title: '永恒的花路',
      sub: '你成为了传奇，且始终安然无恙',
      epilogue: `你是这个时代最耀眼的明星。你不仅拥有才华和美貌，更拥有智慧与勇气。你建立了完善的安保体系，与粉丝保持健康的距离，成为行业的榜样。\n\n多年后，人们依然记得那个在花路上从容前行的你。`,
      color: '#ffd700',
    },
    legend_dark: {
      title: '沾血的皇冠',
      sub: '传奇的背后，是无人知晓的伤痕',
      epilogue: `你登上了行业的巅峰，但私生的阴影如影随形。你的传奇故事被万人传颂，但只有你知道每一个失眠的夜晚、每一次惊恐的回头。\n\n"成为传奇的代价，值得吗？"你在自传的最后一页写道，"我不知道。"`,
      color: '#cc8844',
    },
    year_top: {
      title: '巅峰之上',
      sub: '一年之内，你站上了顶峰',
      epilogue: `你用一年的时间从练习生走到了顶流。你的名字家喻户晓，你的应援色遍布世界。虽然路上有荆棘，但你走过来了。\n\n未来的路还很长，但你已经证明了自己。`,
      color: '#ffd700',
    },
    year_mid: {
      title: '平凡的星光',
      sub: '你成为了一个不错的爱豆',
      epilogue: `你没有成为顶流，但你有了稳定的粉丝群和不错的收入。你过上了体面的艺人生活，偶尔上上综艺，发发单曲。\n\n也许这就是大多数爱豆的终局——不是传奇，但也曾闪耀过。`,
      color: '#88aacc',
    },
    year_fail: {
      title: '被遗忘的流星',
      sub: '你没能等到属于自己的舞台',
      epilogue: `一年的练习生涯没有等来出道的机会。也许是天赋不够，也许是运气不好。你最终选择了离开。\n\n但谁说流星就不美呢？至少你尝试过。`,
      color: '#666688',
    },
    threat_max: {
      title: '深渊吞噬',
      sub: '私生的黑暗完全吞噬了你',
      epilogue: `你的生活被私生彻底摧毁。没有隐私，没有安全，没有自由。你消失在了公众视野中——没有人知道你去了哪里。\n\n有人说你退圈了，有人说你出国了。只有你知道真相：你只是想要平静地活着。`,
      color: '#000000',
    },
  };

  const e = endings[ending];
  document.getElementById('ending-title').textContent = e.title;
  document.getElementById('ending-title').style.color = e.color;
  document.getElementById('ending-subtitle').textContent = e.sub;
  document.getElementById('ending-epilogue').textContent = e.epilogue;

  document.getElementById('ending-stats').innerHTML = `
    <div class="stat-item"><span>艺名</span><span>${G.name}</span></div>
    <div class="stat-item"><span>定位</span><span>${G.persona}</span></div>
    <div class="stat-item"><span>最终人气</span><span>${formatNum(G.fame)}</span></div>
    <div class="stat-item"><span>粉丝数</span><span>${formatNum(G.fans)}</span></div>
    <div class="stat-item"><span>资产</span><span>${formatNum(G.money)}万</span></div>
    <div class="stat-item"><span>私生威胁</span><span>${Math.floor(G.threat)}</span></div>
    <div class="stat-item"><span>总周数</span><span>${G.week}</span></div>
    <div class="stat-item"><span>硬刚/冷处理/妥协</span><span>${G.confronted}/${G.ignored}/${G.compromised}</span></div>
  `;

  applyTheme();
  deleteSave();
  document.getElementById('btn-continue').style.display = 'none';
  showScreen('screen-ending');
}

// ------ 重新开始 ------
function restartGame() {
  G.name = '';
  G.persona = '';
  G.fandomColor = '#ff69b4';
  G.singing = 40; G.dancing = 40; G.visuals = 40; G.charisma = 40;
  G.stamina = 100; G.mental = 100;
  G.stage = 'trainee'; G.fame = 0; G.fans = 0; G.money = 0;
  G.threat = 0; G.privacy = 100;
  G.confronted = 0; G.ignored = 0; G.compromised = 0;
  G.week = 1; G.lastTrained = { singing: 0, dancing: 0, visuals: 0, charisma: 0 };
  G.selectedActions = []; G.maxActions = 2;
  G.messages = []; G.ended = false;
  createPoints = 40;
  createStats = { singing: 40, dancing: 40, visuals: 40, charisma: 40 };

  document.getElementById('log-content').innerHTML = '';
  document.getElementById('chat-window').innerHTML = '';
  document.getElementById('input-name').value = '';
  document.getElementById('input-color').value = '#ff69b4';
  document.getElementById('color-hex').textContent = '#ff69b4';
  document.getElementById('val-singing').textContent = '40';
  document.getElementById('val-dancing').textContent = '40';
  document.getElementById('val-visuals').textContent = '40';
  document.getElementById('val-charisma').textContent = '40';
  document.getElementById('points-left').textContent = '40';

  currentTheme = 't1';
  applyThemePreset('t1');
  deleteSave();
  document.getElementById('btn-continue').style.display = 'none';
  showScreen('screen-title');
}

// ------ 工具函数 ------
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ------ 初始化 ------
applyThemePreset('t1');
initParticles();
showScreen('screen-title');
renderThemeGrid();
if (hasSave()) document.getElementById('btn-continue').style.display = '';
