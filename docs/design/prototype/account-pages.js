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
    login: ['正常','校验错误','服务不可用','请求过频','处理中'],
    register: ['正常','校验错误','邀请码无效','条款加载中','条款加载失败','条款已更新','服务不可用','处理中'],
    otp: ['正常','验证码错误','验证码过期','错误次数用尽','重发倒计时','请求过频','条款已更新','服务不可用','验证中'],
    security: ['正常','加载中','网络失败','仅当前设备','撤销中','结果未确认','撤销完成','会话失效'],
    recovery: ['正常','可信资格不足','保护期','提交中','服务不可用','结果未确认','已受理','核验中','需补证','已拒绝','已批准待执行','会话失效'],
  };
  const state = { page: null,scene: '正常',phone: '',invitation: '',adult: false,consent: false,otp: '',
    purpose: 'login',recoveryMode: 'manual',removed: false,countdown: 0,errors: {},notice: '',termsVersion: 1 };
  let baseLayer = '',sheetReturnFocus = null;
  const navigation = document.createElement('div');
  navigation.className = 'prototype-navigation';
  navigation.innerHTML = `<label>页面<select id="prototype-page" aria-label="选择原型页面"><optgroup label="已接受的 v6 页面">${[['home','首页'],['discover','发现'],['ai','AI'],['messages','私信'],['me','我的']].map(([id,name]) => `<option value="${id}">${name}</option>`).join('')}</optgroup><optgroup label="账号页面 · 待验收">${Object.entries(pages).map(([id,name]) => `<option value="${id}">${name}</option>`).join('')}</optgroup></select></label><label id="prototype-scene-label" hidden>状态<select id="prototype-scene" aria-label="选择原型状态"></select></label><label>字号<select id="prototype-type" aria-label="原型字号"><option value="normal">标准</option><option value="large">大字 130%</option></select></label><button id="prototype-reset" class="prototype-reset">重置演示</button><span class="prototype-review-label" id="prototype-review-label">v6 已接受参考 · 原型只使用合成数据</span>`;
  document.querySelector('.studio-bar').after(navigation);
  const pageSelect = byId('prototype-page'),sceneSelect = byId('prototype-scene');
  const action = (name,label,classes = 'account-primary',disabled = false) => `<button class="${classes}" data-account-action="${name}"${disabled ? ' disabled' : ''}>${label}</button>`;
  const tap = (name,label,svgName) => `<button class="tap" data-account-action="${name}" aria-label="${label}">${icon(svgName)}</button>`;
  const feedback = (text,error = false) => `<div class="account-feedback${error ? ' error' : ''}" role="${error ? 'alert' : 'status'}">${icon(error ? 'alert' : 'shield')}<span>${text}</span></div>`;
  const intro = (title,copy) => `<div class="account-intro"><h1 tabindex="-1">${title}</h1><p>${copy}</p></div>`;
  const pending = () => ['处理中','验证中','提交中'].includes(state.scene);
  const termsUnavailable = () => ['条款加载中','条款加载失败'].includes(state.scene);
  function phoneField() {
    const invalid = Boolean(state.errors.phone);
    return `<div><label class="account-field-label" for="account-phone">手机号</label><div class="account-input-row${invalid ? ' invalid' : ''}"><span class="account-prefix">+86</span><input id="account-phone" data-account-field="phone" type="tel" inputmode="tel" autocomplete="off" maxlength="20" placeholder="请输入手机号" value="${escape(state.phone)}" aria-invalid="${invalid}"${invalid ? ' aria-describedby="phone-error"' : ''}${pending() ? ' disabled' : ''}></div>${invalid ? '<p id="phone-error" class="account-field-error">请输入有效的手机号</p>' : ''}</div>`;
  }
  function login() {
    return `${intro('欢迎回来','使用手机号和短信验证码登录。')}<div class="account-form">${phoneField()}${state.scene === '服务不可用' ? feedback('短信服务暂时不可用，请稍后重试。输入已保留。',true) : ''}${state.scene === '请求过频' ? feedback('获取验证码过于频繁，请在 60 秒后重试。',true) : ''}<div class="account-actions">${action('send-code',pending() ? '<i class="account-spinner"></i>正在获取验证码' : '获取验证码','account-primary',pending() || state.scene === '请求过频')}</div></div><div class="account-alternate">还没有账号？${action('register','使用邀请码加入','account-text-button')}</div><p class="account-footnote">验证码登录，无需设置密码。</p>`;
  }
  function register() {
    const invitationError = state.errors.invitation;
    return `${intro('加入社区','用一个有效邀请码，开启新的交流。')}<div class="account-form">${phoneField()}<div><label class="account-field-label" for="account-invitation">邀请码</label><div class="account-input-row${invitationError ? ' invalid' : ''}"><input id="account-invitation" data-account-field="invitation" value="${escape(state.invitation)}" placeholder="输入你的邀请码" autocomplete="off" spellcheck="false" aria-invalid="${Boolean(invitationError)}"${invitationError ? ' aria-describedby="invitation-error"' : ''}${pending() ? ' disabled' : ''}></div>${invitationError ? `<p id="invitation-error" class="account-field-error">${invitationError}</p>` : ''}</div><div><label class="account-choice"><input type="checkbox" data-account-field="adult"${state.adult ? ' checked' : ''}${pending() ? ' disabled' : ''}><span>我主动声明已满 18 岁<small>此声明不代表平台已核验实际年龄。</small></span></label><div class="account-choice"><input id="account-consent" type="checkbox" data-account-field="consent"${state.consent ? ' checked' : ''}${termsUnavailable() || pending() ? ' disabled' : ''}><div><label for="account-consent">我已阅读并同意当前版本的</label>${action('terms','《社区条款》','account-terms-link')}<small>条款版本 · 示例 v${state.termsVersion}</small></div></div></div>${state.scene === '条款加载中' ? '<div class="account-loading" role="status"><i class="account-spinner"></i>正在读取当前条款</div>' : ''}${state.scene === '条款加载失败' ? feedback('当前条款未能加载，请重试。加载前无法完成同意。',true) + action('retry-terms','重新加载条款','account-text-button') : ''}${state.scene === '条款已更新' ? feedback('社区条款已更新，请阅读当前版本并重新决定是否同意。手机号与邀请码已保留。') : ''}${state.scene === '服务不可用' ? feedback('暂时无法获取验证码，请稍后重试。输入与选择已保留。',true) : ''}${action('send-code',pending() ? '<i class="account-spinner"></i>正在获取验证码' : '获取验证码','account-primary',termsUnavailable() || pending() || !state.adult || !state.consent)}</div><div class="account-alternate">已有账号？${action('login','去登录','account-text-button')}</div>`;
  }
  function otp() {
    const phone = state.phone.replace(/\s/g,''),mask = phone.length === 11 ? `${escape(phone.slice(0,3))} **** ${escape(phone.slice(-4))}` : '138 **** 0086';
    const blocked = ['验证码过期','错误次数用尽','条款已更新'].includes(state.scene);
    const errors = { '验证码错误': '验证码不正确，请检查后重试。','验证码过期': '验证码已过期，请重新获取。',
      '错误次数用尽': '本次验证码的尝试次数已用尽，请重新获取。','服务不可用': '暂时无法验证，请稍后重试。输入已保留。',
      '请求过频': '请求过于频繁，请在 60 秒后重试。' };
    return `${intro('输入验证码',`请输入发送至 +86 ${mask} 的验证码。`)}<div class="account-form"><div><label class="account-field-label" for="account-otp">6 位短信验证码</label><div class="account-input-row account-otp-row${state.scene === '验证码错误' ? ' invalid' : ''}"><input id="account-otp" data-account-field="otp" value="${escape(state.otp)}" placeholder="······" inputmode="numeric" autocomplete="off" maxlength="6" aria-invalid="${state.scene === '验证码错误'}"${errors[state.scene] ? ' aria-describedby="otp-error"' : ''}${blocked || pending() ? ' disabled' : ''}></div>${errors[state.scene] ? `<p id="otp-error" class="account-field-error" role="alert">${errors[state.scene]}</p>` : ''}<div class="account-code-caption"><span class="account-helper">验证码 5 分钟内有效</span>${action('resend',state.countdown ? `${state.countdown} 秒后重发` : '重新获取','account-text-button',state.countdown > 0 || pending() || state.scene === '条款已更新')}</div></div>${state.scene === '条款已更新' ? feedback('社区条款已更新，本次注册尚未完成。请返回阅读并重新同意。') + action('review-new-terms','阅读当前条款') : action('verify',pending() ? '<i class="account-spinner"></i>正在验证' : state.purpose === 'register' ? '验证并加入' : '登录','account-primary',blocked || pending() || state.scene === '请求过频' || !/^\d{6}$/.test(state.otp))}<div class="account-alternate">${action('change-phone','更换手机号','account-text-button',pending())}</div></div><p class="account-footnote">请勿向他人透露短信验证码。</p>`;
  }
  function deviceRow(name,description,current = false) {
    const busy = state.scene === '撤销中',unknown = state.scene === '结果未确认';
    return `<div class="account-device-row"><div class="account-device-icon">${icon(current ? 'phone' : 'desktop')}</div><div class="account-device-copy"><h3>${name}</h3><p>${description}</p>${current ? '<span class="account-device-tag">当前设备 · 可信会话</span>' : ''}${!current && (busy || unknown) ? `<p role="status">${busy ? '正在撤销登录' : '撤销结果未确认'}</p>` : ''}</div>${current ? '' : action('revoke',busy ? '<i class="account-spinner"></i>' : unknown ? '待确认' : '撤销','account-revoke',busy || unknown)}</div>`;
  }
  function security() {
    if (state.scene === '会话失效') return `${intro('登录已失效','为保护账号安全，请重新登录后查看设备。')}<div class="account-blank">${icon('shield')}<div><h3>此会话已不可用</h3><p>旧设备列表已清除，不再显示账号信息。</p></div></div>${action('login','重新登录')}`;
    let list = deviceRow('当前 Android 设备','本次登录 · 刚刚',true) + (state.removed || ['仅当前设备','撤销完成'].includes(state.scene) ? '' : deviceRow('桌面浏览器','最近活动 · 昨天 18:42'));
    if (state.scene === '加载中') list = `<div class="account-loading"><i class="account-spinner"></i>正在读取设备列表</div>${[1,2].map(() => '<div class="account-device-row"><div class="account-device-copy"><div class="account-skeleton"></div><div class="account-skeleton short"></div></div></div>').join('')}`;
    if (state.scene === '网络失败') list = feedback('暂时无法读取设备列表，请检查网络后重试。',true) + action('refresh','重新加载','account-text-button');
    if (state.scene === '仅当前设备') list += '<p class="account-helper account-spaced">没有其他登录设备。</p>';
    if (state.scene === '撤销完成') list += feedback('该设备登录已撤销，当前设备不受影响。');
    if (state.scene === '结果未确认') list += feedback('网络中断，尚不能确认该设备是否已退出。请查询操作结果。',true) + action('query-revoke','查询撤销结果','account-secondary');
    return `${intro('保护你的账号','查看登录设备，管理账号安全。')}<section><h2 class="account-section-label">登录设备</h2>${list}<p class="account-helper account-spaced">撤销后，该设备需要重新登录才能继续访问。</p></section><section>${`<button class="account-menu-row" data-account-action="recovery">${icon('key')}<span>账号恢复<small>无法使用原手机号时，申请核验账号归属</small></span>${icon('right')}</button>`}${action('logout','退出当前登录','account-logout')}</section>`;
  }
  function recovery() {
    if (state.scene === '会话失效') return `${intro('登录已失效','请重新登录后，通过受控流程查询恢复申请。')}${feedback('本页申请信息已清除。')}${action('login','重新登录')}`;
    const statuses = { '已受理': ['申请已受理','我们已收到申请，接下来将核验账号归属。'],'核验中': ['正在核验账号归属','请等待当前申请的核验结果，无需重复提交。'],
      '需补证': ['需要补充证据','现有材料不足以确认账号归属，请按受控核验流程补充证据。'],'已拒绝': ['本次申请未通过','目前提供的证明不足以核验账号归属，本次申请未恢复账号。'],
      '已批准待执行': ['已批准，等待恢复执行','核验已通过，账号恢复尚未执行。当前手机号与登录权限尚未因此改变。'] };
    if (statuses[state.scene]) return `${intro(...statuses[state.scene])}<section><div class="account-case-status">${icon(state.scene === '需补证' ? 'file' : 'clock')}${state.scene}</div><dl class="account-case-details"><div><dt>申请编号</dt><dd>RC-20261016-0086</dd></div><div><dt>申请方式</dt><dd>${state.recoveryMode === 'trusted' ? '可信会话核验' : '人工核验'}</dd></div><div><dt>更新时间</dt><dd>2026/10/16 18:42</dd></div></dl></section>${state.scene === '需补证' ? feedback('请通过受控渠道补充证据，勿公开验证码或登录凭据。') : ''}<div class="account-actions">${action('refresh-case','刷新申请状态','account-secondary')}</div><p class="account-footnote">申请受理或核验通过均不代表恢复已完成。<br>无法证明归属的账号，可能无法找回。</p>`;
    const restricted = ['保护期','可信资格不足'].includes(state.scene),unknown = state.scene === '结果未确认';
    return `${intro('找回你的账号','无法使用原手机号时，可以申请核验账号归属。无法提供有效证明的账号，可能无法找回。')}${restricted ? feedback(state.scene === '保护期' ? '当前处于手机号变更后的 24 小时保护期，必要恢复须走人工核验。' : '当前会话不满足可信恢复资格，可选择人工核验。') : ''}<div><label class="account-recovery-option">${icon('file')}<span><strong>人工核验</strong><small>提交申请，由受控流程核验账号归属。</small></span><input type="radio" name="recovery-mode" data-account-mode="manual"${state.recoveryMode === 'manual' ? ' checked' : ''}${pending() || unknown ? ' disabled' : ''}></label><label class="account-recovery-option">${icon('shield')}<span><strong>可信会话核验</strong><small>使用仍有效的可信登录会话申请，资格由服务端核验。</small></span><input type="radio" name="recovery-mode" data-account-mode="trusted"${state.recoveryMode === 'trusted' ? ' checked' : ''}${restricted || pending() || unknown ? ' disabled' : ''}></label></div>${state.scene === '服务不可用' ? feedback('暂时无法提交申请，所选方式已保留，请稍后重试。',true) : ''}${unknown ? feedback('提交结果尚未确认，请先查询。确认前请勿重复发起申请。',true) : ''}<div class="account-actions">${action(unknown ? 'query-recovery' : 'request-recovery',pending() ? '<i class="account-spinner"></i>正在提交申请' : unknown ? '查询本次申请' : '提交恢复申请','account-primary',pending())}</div><p class="account-footnote">申请不会直接更改手机号或恢复账号权限。</p>`;
  }
  function attachBoardPages() {
    if (byId('board-account-pages')) return;
    const group = document.createElement('div'); group.id = 'board-account-pages';
    group.innerHTML = `<div class="board-account-title">账号页面 · 待验收</div>${Object.entries(pages).map(([id,name]) => `<button class="board-page" data-account-page="${id}">${icon(id === 'security' ? 'shield' : 'phone')}<span>${name}</span></button>`).join('')}`;
    byId('board-pages').append(group);
  }
  function phoneBackground(active) {
    ['app-header','app-screen','compose-fab'].forEach(id => { byId(id).inert = active; });
    document.querySelector('.tab-bar').inert = active;
  }
  function dismissSheet() {
    byId('app-sheet').innerHTML = '';
    document.querySelector('.account-prototype')?.removeAttribute('inert');
    if (sheetReturnFocus?.isConnected) sheetReturnFocus.focus();
    sheetReturnFocus = null;
  }
  function render(focus = true) {
    if (!state.page) return;
    dismissSheet(); phoneBackground(true);
    pageSelect.value = state.page;
    pageSelect.querySelectorAll('option').forEach(option => option.toggleAttribute('selected',option.value === state.page));
    byId('prototype-scene-label').hidden = false;
    sceneSelect.innerHTML = scenes[state.page].map(scene => `<option${state.scene === scene ? ' selected' : ''}>${scene}</option>`).join('');
    byId('prototype-review-label').textContent = '账号原型 r2 · 待验收 · 全部为合成数据，无真实短信或账号操作';
    const titles = { login: '登录',register: '邀请加入',otp: '验证码',security: '账号安全',recovery: '账号恢复' };
    const content = { login,register,otp,security,recovery }[state.page]();
    byId('app-layer').innerHTML = `<section class="layer account-prototype account-${state.page}" role="region" aria-label="${titles[state.page]}"><header class="native-header"><div class="header-left">${tap('back','返回','back')}</div><h2 class="native-title">${titles[state.page]}</h2><div class="header-right">${state.page === 'security' && state.scene !== '会话失效' ? tap('refresh','刷新设备列表','refresh') : tap('close','返回社区','close')}</div></header><div class="layer-body"><div class="account-content">${content}<p id="account-notice" class="account-live-notice" role="status">${escape(state.notice)}</p></div></div><div class="home-indicator" aria-hidden="true"></div></section>`;
    document.querySelectorAll('#board-pages .board-page').forEach(button => button.classList.toggle('selected',button.dataset.accountPage === state.page));
    if (focus) (document.querySelector('.account-prototype [aria-invalid="true"]') || document.querySelector('.account-intro h1'))?.focus();
  }
  function open(page) {
    if (!state.page) baseLayer = byId('app-layer').innerHTML;
    if (['login','register'].includes(page)) state.purpose = page;
    state.page = page; state.scene = '正常'; state.errors = {}; state.notice = '';
    if (page === 'otp') { state.countdown = 60; state.otp = ''; }
    render();
  }
  function close() {
    dismissSheet(); state.page = null; state.otp = ''; state.countdown = 0;
    byId('app-layer').innerHTML = baseLayer; baseLayer = ''; phoneBackground(false);
    byId('prototype-scene-label').hidden = true; pageSelect.value = document.querySelector('#app-tabs .selected')?.dataset.page || 'home';
    byId('prototype-review-label').textContent = 'v6 已接受参考 · 原型只使用合成数据';
    pageSelect.focus();
  }
  function sheet(title,copy,button,extra = '') {
    sheetReturnFocus = document.activeElement;
    document.querySelector('.account-prototype').inert = true;
    byId('app-sheet').innerHTML = `<div class="sheet-scrim" data-account-action="dismiss"><section class="bottom-sheet account-prototype-sheet" role="dialog" aria-modal="true" aria-label="${title}" tabindex="-1"><div class="sheet-handle" aria-hidden="true"></div><h2>${title}</h2><p>${copy}</p>${extra}<div class="account-actions">${button}</div>${action('dismiss','返回','account-text-button')}</section></div>`;
    document.querySelector('.account-prototype-sheet').focus();
  }
  pageSelect.addEventListener('change',() => {
    if (pages[pageSelect.value]) open(pageSelect.value);
    else { const base = pageSelect.value; close(); document.querySelector(`#board-pages [data-page="${base}"]`)?.click(); pageSelect.value = base; }
  });
  sceneSelect.addEventListener('change',() => {
    state.scene = sceneSelect.value; state.errors = {}; state.notice = '';
    if (state.scene === '校验错误') state.errors = { phone: true,...(state.page === 'register' ? { invitation: '请输入邀请码' } : {}) };
    if (state.scene === '邀请码无效') state.errors.invitation = '邀请码无效、已使用或已过期，请检查或联系邀请人。';
    if (state.scene.startsWith('条款')) { state.consent = false; if (state.scene === '条款已更新') state.termsVersion = 2; }
    if (['保护期','可信资格不足'].includes(state.scene)) state.recoveryMode = 'manual';
    if (state.page === 'security') state.removed = state.scene === '撤销完成';
    if (state.page === 'otp') state.countdown = ['验证码过期','错误次数用尽'].includes(state.scene) ? 0 : 60;
    render(false);
  });
  byId('prototype-type').addEventListener('change',event => byId('device').classList.toggle('account-large-type',event.target.value === 'large'));
  byId('prototype-reset').addEventListener('click',() => {
    const page = state.page || 'login';
    Object.assign(state,{ phone: '',invitation: '',adult: false,consent: false,otp: '',purpose: 'login',recoveryMode: 'manual',removed: false,countdown: 0,errors: {},notice: '',termsVersion: 1 });
    open(page);
  });
  document.addEventListener('input',event => {
    const field = event.target.dataset.accountField;
    if (!field) return;
    if (field === 'adult' || field === 'consent') state[field] = event.target.checked;
    else { state[field] = event.target.value; if (field === 'otp') { state.otp = state.otp.replace(/\D/g,'').slice(0,6); event.target.value = state.otp; } }
    if (field === 'phone') { state.otp = ''; state.countdown = 0; }
    if (state.errors[field]) { delete state.errors[field]; event.target.setAttribute('aria-invalid','false'); event.target.removeAttribute('aria-describedby'); event.target.closest('.account-input-row').classList.remove('invalid'); byId(`${field}-error`)?.remove(); }
    if (state.page === 'register') { const button = document.querySelector('[data-account-action="send-code"]'); if (button) button.disabled = !state.adult || !state.consent || termsUnavailable() || pending(); }
    const verify = document.querySelector('[data-account-action="verify"]');
    if (verify) verify.disabled = pending() || ['验证码过期','错误次数用尽','请求过频'].includes(state.scene) || !/^\d{6}$/.test(state.otp);
  });
  document.addEventListener('change',event => { if (event.target.dataset.accountMode) state.recoveryMode = event.target.dataset.accountMode; });
  document.addEventListener('keydown',event => {
    if (!state.page || !event.target.closest('.account-prototype,.account-prototype-sheet')) return;
    const dialog = document.querySelector('.account-prototype-sheet');
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); if (dialog) dismissSheet(); else close(); }
    if (event.key === 'Tab' && dialog) {
      const controls = [...dialog.querySelectorAll('button:not(:disabled),[tabindex="0"]')],first = controls[0],last = controls.at(-1);
      if (event.shiftKey && [first,dialog].includes(document.activeElement)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'Enter' && event.target.matches('input:not([type="checkbox"]):not([type="radio"])')) {
      event.preventDefault(); document.querySelector(state.page === 'otp' ? '[data-account-action="verify"]' : '[data-account-action="send-code"]')?.click();
    }
  },true);
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
    if (name === 'dismiss') { dismissSheet(); return; }
    if (name === 'terms') { sheet('社区条款',`示例 v${state.termsVersion} · 用于预览阅读布局，不构成正式协议。正式条款由当前已发布版本提供。`,action('dismiss','返回注册','account-secondary'),'<div class="account-terms-body"><h3>加入与账号安全</h3><p>邀请、手机验证和年满 18 岁的主动声明共同用于注册准入。请保管验证码，不向他人透露。</p><h3>阅读与明确同意</h3><p>阅读本页不会自动勾选同意。返回后由你主动选择；版本变更后须重新阅读并作出选择。</p><h3>隐私与恢复</h3><p>账号恢复通过受控流程核验归属。无法提供有效证明时，可能无法找回。</p></div>'); return; }
    if (name === 'retry-terms') { state.consent = false; state.scene = '正常'; render(); return; }
    if (name === 'refresh') { state.notice = '设备列表已刷新。'; if (['网络失败','加载中'].includes(state.scene)) state.scene = '正常'; render(); return; }
    if (name === 'send-code') {
      state.errors = {};
      if (!/^1[3-9]\d{9}$/.test(state.phone.replace(/\s/g,''))) state.errors.phone = true;
      if (state.page === 'register' && !state.invitation.trim()) state.errors.invitation = '请输入邀请码';
      if (Object.keys(state.errors).length) { state.scene = '校验错误'; render(); return; }
      if (state.page === 'register' && (!state.adult || !state.consent || termsUnavailable())) return;
      state.purpose = state.page; open('otp'); return;
    }
    if (name === 'change-phone') { state.otp = ''; state.countdown = 0; open(state.purpose); return; }
    if (name === 'resend') { state.otp = ''; state.countdown = 60; state.scene = '正常'; state.notice = '已重新获取验证码，请使用最新一条。'; render(); return; }
    if (name === 'review-new-terms') { open('register'); state.scene = '条款已更新'; state.consent = false; state.termsVersion = 2; render(); return; }
    if (name === 'verify') { if (!/^\d{6}$/.test(state.otp)) return; sheet('流程衔接预览','验证码界面的下一步为账号首页。此原型没有发送短信、核验身份或创建真实账号与会话。',action('security','继续预览账号安全','account-secondary')); return; }
    if (name === 'revoke') { sheet('撤销此设备登录？','撤销后，该设备的后续访问将被拒绝，需要重新登录。当前设备不受影响。',action('confirm-revoke','撤销登录')); return; }
    if (name === 'confirm-revoke' || name === 'query-revoke') { state.removed = true; state.scene = '撤销完成'; render(); return; }
    if (name === 'logout') { sheet('退出当前登录？','将撤销当前会话，并清除本机登录信息与受限缓存。',action('confirm-logout','退出登录')); return; }
    if (name === 'confirm-logout') { Object.assign(state,{ phone: '',invitation: '',adult: false,consent: false,otp: '',countdown: 0,removed: false,recoveryMode: 'manual' }); open('login'); return; }
    if (name === 'request-recovery' || name === 'query-recovery') { state.scene = '已受理'; render(); return; }
    if (name === 'refresh-case') { state.notice = '已查询，申请状态暂无变化。'; byId('account-notice').textContent = state.notice; }
  },true);
  new MutationObserver(attachBoardPages).observe(byId('board-pages'),{ childList: true });
  attachBoardPages();
  setInterval(() => {
    if (!state.countdown) return;
    state.countdown--;
    const button = document.querySelector('[data-account-action="resend"]');
    if (button) { button.textContent = state.countdown ? `${state.countdown} 秒后重发` : '重新获取'; button.disabled = state.countdown > 0 || pending() || state.scene === '条款已更新'; }
  },1000);
  const parameters = new URL(location.href).searchParams;
  const initial = parameters.get('page') || parameters.get('account');
  if (['light','dark'].includes(parameters.get('theme'))) document.querySelector(`.theme-control [data-theme="${parameters.get('theme')}"]`)?.click();
  if (pages[initial]) {
    open(initial);
    if (scenes[initial].includes(parameters.get('scene'))) { sceneSelect.value = parameters.get('scene'); sceneSelect.dispatchEvent(new Event('change')); }
  } else if (['home','discover','ai','messages','me'].includes(initial)) document.querySelector(`#board-pages [data-page="${initial}"]`)?.click();
  if (parameters.get('font') === 'large') { byId('prototype-type').value = 'large'; byId('prototype-type').dispatchEvent(new Event('change')); }
})();
