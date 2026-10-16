(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const paths = {
    back: '<path d="m14 5-7 7 7 7"/>',close: '<path d="m6 6 12 12M6 18 18 6"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
    desktop: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4M7 21h10"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m-6 0 3-3"/>',
    right: '<path d="m9 5 7 7-7 7"/>',refresh: '<path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',file: '<path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8M8 16h5"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
  const pages = { login: '手机号登录',register: '邀请加入',otp: '验证码',security: '账号安全',recovery: '恢复申请' };
  const scenes = {
    login: ['正常','校验错误','服务不可用','处理中'],register: ['正常','校验错误','条款加载失败','处理中'],
    otp: ['正常','验证码错误','验证码过期','重发倒计时'],security: ['正常','加载中','网络失败','空状态','会话失效'],
    recovery: ['正常','已受理','核验中','需补证','保护期','服务不可用'],
  };
  const state = { page: null,scene: '正常',phone: '',invitation: '',adult: false,consent: false,otp: '',
    purpose: 'login',recoveryMode: 'manual',removed: false,countdown: 0 };
  const navigation = document.createElement('div');
  navigation.className = 'prototype-navigation';
  navigation.innerHTML = `<label>页面<select id="prototype-page" aria-label="选择原型页面"><optgroup label="已接受的 v6 页面">${[['home','首页'],['discover','发现'],['ai','AI'],['messages','私信'],['me','我的']].map(([id,name]) => `<option value="${id}">${name}</option>`).join('')}</optgroup><optgroup label="账号页面 · 待验收">${Object.entries(pages).map(([id,name]) => `<option value="${id}">${name}</option>`).join('')}</optgroup></select></label><label id="prototype-scene-label" hidden>状态<select id="prototype-scene" aria-label="选择原型状态"></select></label><span class="prototype-review-label" id="prototype-review-label">v6 已接受参考 · 原型只使用合成数据</span>`;
  document.querySelector('.studio-bar').after(navigation);
  const pageSelect = byId('prototype-page'),sceneSelect = byId('prototype-scene');
  const action = (name,label,classes = 'account-primary',disabled = false) => `<button class="${classes}" data-account-action="${name}"${disabled ? ' disabled' : ''}>${label}</button>`;
  const tap = (name,label,svgName) => `<button class="tap" data-account-action="${name}" aria-label="${label}">${icon(svgName)}</button>`;
  const feedback = (text,error = false) => `<div class="account-feedback${error ? ' error' : ''}" role="${error ? 'alert' : 'status'}">${icon(error ? 'alert' : 'shield')}<span>${text}</span></div>`;
  const intro = (title,copy) => `<div class="account-intro"><h1>${title}</h1><p>${copy}</p></div>`;
  function phoneField() {
    const invalid = state.scene === '校验错误' && (state.page !== 'register' || !/^1[3-9]\d{9}$/.test(state.phone.replace(/\s/g,'')));
    return `<div><label class="account-field-label" for="account-phone">手机号</label><div class="account-input-row${invalid ? ' invalid' : ''}"><span class="account-prefix">+86</span><input id="account-phone" data-account-field="phone" type="tel" inputmode="tel" autocomplete="off" placeholder="请输入手机号" value="${escape(state.phone)}"${state.scene === '处理中' ? ' disabled' : ''}></div>${invalid ? '<p class="account-field-error">请输入有效的手机号</p>' : ''}</div>`;
  }
  function login() {
    return `${intro('欢迎回来','使用手机号和短信验证码登录。')}<div class="account-form">${phoneField()}${state.scene === '服务不可用' ? feedback('短信服务暂时不可用，请稍后重试。输入已保留。',true) : ''}<div class="account-actions">${action('send-code',state.scene === '处理中' ? '<i class="account-spinner"></i>正在获取验证码' : '获取验证码','account-primary',state.scene === '处理中')}</div></div><div class="account-alternate">还没有账号？${action('register','使用邀请码加入','account-text-button')}</div><p class="account-footnote">验证码登录，无需设置密码。</p>`;
  }
  function register() {
    const termsFailed = state.scene === '条款加载失败';
    return `${intro('加入社区','用一个有效邀请码，开启新的交流。')}<div class="account-form">${phoneField()}<div><label class="account-field-label" for="account-invitation">邀请码</label><div class="account-input-row"><input id="account-invitation" data-account-field="invitation" value="${escape(state.invitation)}" placeholder="输入你的邀请码" autocomplete="off" spellcheck="false"${state.scene === '处理中' ? ' disabled' : ''}></div></div><div><label class="account-choice"><input type="checkbox" data-account-field="adult"${state.adult ? ' checked' : ''}><span>我主动声明已满 18 岁<small>此声明不代表平台已核验实际年龄。</small></span></label><label class="account-choice"><input type="checkbox" data-account-field="consent"${state.consent ? ' checked' : ''}${termsFailed ? ' disabled' : ''}><span>我已阅读并同意<button type="button" class="account-terms-link" data-account-action="terms">《社区条款》</button></span></label></div>${termsFailed ? feedback('当前条款未能加载，请重试。加载前无法完成同意。',true) + action('retry-terms','重新加载条款','account-text-button') : ''}${action('send-code',state.scene === '处理中' ? '<i class="account-spinner"></i>正在获取验证码' : '获取验证码','account-primary',termsFailed || state.scene === '处理中' || !state.adult || !state.consent)}</div><div class="account-alternate">已有账号？${action('login','去登录','account-text-button')}</div>`;
  }
  function otp() {
    const mask = state.phone.length >= 7 ? `${escape(state.phone.slice(0,3))} **** ${escape(state.phone.slice(-4))}` : '138 **** 0086';
    return `${intro('输入验证码',`请输入发送至 +86 ${mask} 的验证码。`)}<div class="account-form"><div><label class="account-field-label" for="account-otp">6 位短信验证码</label><div class="account-input-row account-otp-row${state.scene === '验证码错误' ? ' invalid' : ''}"><input id="account-otp" data-account-field="otp" value="${escape(state.otp)}" placeholder="······" inputmode="numeric" autocomplete="off" maxlength="6" aria-label="6 位短信验证码"></div>${state.scene === '验证码错误' ? '<p class="account-field-error">验证码不正确，请检查后重试</p>' : ''}<div class="account-code-caption"><span class="account-helper">${state.scene === '验证码过期' ? '验证码已过期' : '验证码 5 分钟内有效'}</span>${action('resend',state.countdown ? `${state.countdown} 秒后重发` : '重新获取','account-text-button',state.countdown > 0)}</div></div>${action('verify',state.purpose === 'register' ? '同意并加入' : '登录','account-primary',state.scene === '验证码过期')}<div class="account-alternate">${action('change-phone','更换手机号','account-text-button')}</div></div><p class="account-footnote">请勿向他人透露短信验证码。</p>`;
  }
  function deviceRow(name,description,current = false) {
    return `<div class="account-device-row"><div class="account-device-icon">${icon(current ? 'phone' : 'desktop')}</div><div class="account-device-copy"><h3>${name}</h3><p>${description}</p>${current ? '<span class="account-device-tag">当前设备 · 可信会话</span>' : ''}</div>${current ? '' : action('revoke','撤销','account-revoke')}</div>`;
  }
  function security() {
    if (state.scene === '会话失效') return `${intro('登录已失效','为保护账号安全，请重新登录后查看设备。')}<div class="account-blank">${icon('shield')}<div><h3>此会话已不可用</h3><p>旧设备列表已清除，不再显示账号信息。</p></div></div>${action('login','重新登录')}`;
    let list = deviceRow('当前 Android 设备','本次登录 · 刚刚',true) + (state.removed ? '' : deviceRow('桌面浏览器','最近活动 · 昨天 18:42'));
    if (state.scene === '加载中') list = `<div class="account-loading"><i class="account-spinner"></i>正在读取设备列表</div>${[1,2].map(() => '<div class="account-device-row"><div class="account-device-copy"><div class="account-skeleton"></div><div class="account-skeleton short"></div></div></div>').join('')}`;
    if (state.scene === '网络失败') list = feedback('暂时无法读取设备列表，请检查网络后重试。',true) + action('refresh','重新加载','account-text-button');
    if (state.scene === '空状态') list = `<div class="account-blank">${icon('phone')}<div><h3>暂无可显示的设备</h3><p>刷新后查看当前有效的登录设备。</p></div></div>`;
    return `${intro('保护你的账号','查看登录设备，管理账号安全。')}<section><h2 class="account-section-label">登录设备</h2>${list}<p class="account-helper" style="margin-top:14px">撤销后，该设备需要重新登录才能继续访问。</p></section><section>${`<button class="account-menu-row" data-account-action="recovery">${icon('key')}<span>账号恢复<small>无法使用原手机号时，申请核验账号归属</small></span>${icon('right')}</button>`}${action('logout','退出当前登录','account-logout')}</section>`;
  }
  function recovery() {
    const statuses = { '已受理': '申请已受理','核验中': '正在核验账号归属','需补证': '需要补充证据' };
    if (statuses[state.scene]) return `${intro(statuses[state.scene],state.scene === '需补证' ? '现有材料不足以确认账号归属，请按核验流程补充证据。' : '申请受理不代表恢复成功。核验资料不足时，可能无法找回账号。')}<section><div class="account-case-status">${icon(state.scene === '需补证' ? 'file' : 'clock')}${state.scene}</div><dl class="account-case-details"><div><dt>申请编号</dt><dd>RC-20261016-0086</dd></div><div><dt>申请方式</dt><dd>人工核验</dd></div><div><dt>更新时间</dt><dd>2026/10/16 18:42</dd></div></dl></section>${state.scene === '需补证' ? feedback('请通过受控渠道补充证据，勿公开验证码或登录凭据。') : ''}<div class="account-actions">${action('refresh-case','刷新申请状态','account-secondary')}</div><p class="account-footnote">恢复结果以核验与实际执行为准。</p>`;
    return `${intro('找回你的账号','无法使用原手机号时，可以申请核验账号归属。无法提供有效证明的账号，可能无法找回。')}${state.scene === '保护期' ? feedback('当前处于手机号变更保护期，可继续申请人工核验。') : ''}<div><label class="account-recovery-option">${icon('file')}<span><strong>人工核验</strong><small>提交申请，由受控流程核验账号归属。</small></span><input type="radio" name="recovery-mode" data-account-mode="manual"${state.recoveryMode === 'manual' ? ' checked' : ''}></label><label class="account-recovery-option">${icon('shield')}<span><strong>可信会话核验</strong><small>使用仍有效的可信登录会话申请，资格由服务端核验。</small></span><input type="radio" name="recovery-mode" data-account-mode="trusted"${state.recoveryMode === 'trusted' ? ' checked' : ''}${state.scene === '保护期' ? ' disabled' : ''}></label></div>${state.scene === '服务不可用' ? feedback('申请结果暂时无法确认，输入已保留。请重试查询或提交同一申请。',true) : ''}<div class="account-actions">${action('request-recovery','提交恢复申请')}</div><p class="account-footnote">申请不会直接更改手机号或恢复账号权限。</p>`;
  }
  function attachBoardPages() {
    if (byId('board-account-pages')) return;
    const group = document.createElement('div'); group.id = 'board-account-pages';
    group.innerHTML = `<div class="board-account-title">账号页面 · 待验收</div>${Object.entries(pages).map(([id,name]) => `<button class="board-page" data-account-page="${id}">${icon(id === 'security' ? 'shield' : 'phone')}<span>${name}</span></button>`).join('')}`;
    byId('board-pages').append(group);
  }
  function render() {
    if (!state.page) return;
    pageSelect.value = state.page;
    pageSelect.querySelectorAll('option').forEach(option => option.toggleAttribute('selected',option.value === state.page));
    byId('prototype-scene-label').hidden = false;
    sceneSelect.innerHTML = scenes[state.page].map(scene => `<option${state.scene === scene ? ' selected' : ''}>${scene}</option>`).join('');
    byId('prototype-review-label').textContent = '账号原型 · 待用户验收 · 合成数据，无真实短信或账号操作';
    byId('app-sheet').innerHTML = '';
    const titles = { login: '登录',register: '邀请加入',otp: '验证码',security: '账号安全',recovery: '账号恢复' };
    const content = { login,register,otp,security,recovery }[state.page]();
    byId('app-layer').innerHTML = `<section class="layer account-prototype account-${state.page}" role="dialog" aria-modal="true" aria-label="${titles[state.page]}"><header class="native-header"><div class="header-left">${tap('back','返回','back')}</div><h2 class="native-title">${titles[state.page]}</h2><div class="header-right">${state.page === 'security' ? tap('refresh','刷新设备列表','refresh') : tap('close','返回社区','close')}</div></header><div class="layer-body"><div class="account-content">${content}</div></div><div class="home-indicator" aria-hidden="true"></div></section>`;
    document.querySelectorAll('#board-pages .board-page').forEach(button => button.classList.toggle('selected',button.dataset.accountPage === state.page));
  }
  function open(page) { state.page = page; state.scene = '正常'; if (page === 'otp') state.countdown = 60; render(); }
  function close() {
    state.page = null; byId('app-layer').innerHTML = ''; byId('app-sheet').innerHTML = '';
    byId('prototype-scene-label').hidden = true; pageSelect.value = document.querySelector('#app-tabs .selected')?.dataset.page || 'home';
    byId('prototype-review-label').textContent = 'v6 已接受参考 · 原型只使用合成数据';
  }
  function sheet(title,copy,button) {
    byId('app-sheet').innerHTML = `<div class="sheet-scrim" data-account-action="dismiss"><section class="bottom-sheet account-prototype-sheet" role="dialog" aria-modal="true" aria-label="${title}"><div class="sheet-handle" aria-hidden="true"></div><h2>${title}</h2><p>${copy}</p><div class="account-actions">${button}</div>${action('dismiss','取消','account-text-button')}</section></div>`;
  }
  pageSelect.addEventListener('change',() => {
    if (pages[pageSelect.value]) open(pageSelect.value);
    else { const base = pageSelect.value; close(); document.querySelector(`#board-pages [data-page="${base}"]`)?.click(); pageSelect.value = base; }
  });
  sceneSelect.addEventListener('change',() => { state.scene = sceneSelect.value; if (state.scene === '重发倒计时') state.countdown = 60; if (state.scene === '保护期') state.recoveryMode = 'manual'; render(); });
  document.addEventListener('input',event => {
    const field = event.target.dataset.accountField;
    if (!field) return;
    if (field === 'adult' || field === 'consent') state[field] = event.target.checked;
    else { state[field] = event.target.value; if (field === 'otp') { state.otp = state.otp.replace(/\D/g,'').slice(0,6); event.target.value = state.otp; } }
    if (state.page === 'register') { const button = document.querySelector('[data-account-action="send-code"]'); if (button) button.disabled = !state.adult || !state.consent || state.scene === '条款加载失败'; }
  });
  document.addEventListener('change',event => { if (event.target.dataset.accountMode) state.recoveryMode = event.target.dataset.accountMode; });
  document.addEventListener('click',event => {
    const button = event.target.closest('[data-account-action],[data-account-page],[data-act="account-security"]');
    if (!button || button.disabled) return;
    if (button.classList.contains('sheet-scrim') && event.target !== button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (button.dataset.accountPage) { open(button.dataset.accountPage); return; }
    if (button.dataset.act === 'account-security') { open('security'); return; }
    const name = button.dataset.accountAction;
    if (pages[name]) { open(name); return; }
    if (name === 'close') { close(); return; }
    if (name === 'back') { if (state.page === 'recovery') open('security'); else if (state.page === 'otp') open(state.purpose); else if (state.page === 'register') open('login'); else close(); return; }
    if (name === 'dismiss') { byId('app-sheet').innerHTML = ''; return; }
    if (name === 'terms') { sheet('社区条款','此处为条款阅读区域的原型示例。生产页面须展示服务端当前发布的完整条款；当前原型不会收集真实同意或创建账号。',action('dismiss','已阅读','account-secondary')); return; }
    if (name === 'retry-terms' || name === 'refresh') { state.scene = '正常'; render(); return; }
    if (name === 'send-code') {
      if (!/^1[3-9]\d{9}$/.test(state.phone.replace(/\s/g,'')) || state.page === 'register' && !state.invitation.trim()) { state.scene = '校验错误'; render(); return; }
      state.purpose = state.page; open('otp'); return;
    }
    if (name === 'change-phone') { open(state.purpose); return; }
    if (name === 'resend') { state.countdown = 60; state.scene = '正常'; render(); return; }
    if (name === 'verify') { if (!/^\d{6}$/.test(state.otp)) { state.scene = '验证码错误'; render(); } else sheet('登录流程预览','页面衔接已演示。此原型没有发送短信、验证真实身份或创建登录会话。',action('security','预览账号安全','account-secondary')); return; }
    if (name === 'revoke') { sheet('撤销此设备登录？','撤销后，该设备的后续访问将被拒绝，需要重新登录。当前设备不受影响。',action('confirm-revoke','撤销登录')); return; }
    if (name === 'confirm-revoke') { state.removed = true; render(); return; }
    if (name === 'logout') { sheet('退出当前登录？','将撤销当前会话，并清除本机登录信息与受限缓存。',action('login','退出登录')); return; }
    if (name === 'request-recovery') { state.scene = '已受理'; render(); return; }
    if (name === 'refresh-case') { state.scene = state.scene === '已受理' ? '核验中' : state.scene; render(); }
  },true);
  new MutationObserver(attachBoardPages).observe(byId('board-pages'),{ childList: true });
  attachBoardPages();
  setInterval(() => {
    if (!state.countdown) return;
    state.countdown--;
    const button = document.querySelector('[data-account-action="resend"]');
    if (button) { button.textContent = state.countdown ? `${state.countdown} 秒后重发` : '重新获取'; button.disabled = state.countdown > 0; }
  },1000);
  const initial = new URL(location.href).searchParams.get('account');
  if (pages[initial]) open(initial);
})();
