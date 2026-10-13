(()=>{
  const paths={
    home:'<path d="m3 10 9-7 9 7v10h-6v-7H9v7H3Z"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/>',
    ai:'<path d="M12 2.5 15 9l6.5 3-6.5 3-3 6.5L9 15l-6.5-3L9 9Z"/><path d="M12 8v8M8 12h8" stroke-width="1.2"/>',
    chat:'<path d="M21 11.5A8.5 8.5 0 0 1 12.5 20H3l1.6-4.6A8.5 8.5 0 1 1 21 11.5Z"/>',
    user:'<circle cx="12" cy="7.5" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1Z"/>',
    bell:'<path d="M5 16h14l-2-3V8a5 5 0 0 0-10 0v5Z"/><path d="M10 20h4"/>',
    history:'<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6M12 7v5l3 2"/>',
    edit:'<path d="m16 3 5 5M13 6l-9 9-1 6 6-1L21 8a2.8 2.8 0 0 0-4-4Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    down:'<path d="m7 10 5 5 5-5"/>',
    right:'<path d="m9 5 7 7-7 7"/>',
    back:'<path d="m14 5-7 7 7 7"/>',
    up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
    mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m4 17 5-5 4 4 3-3 5 5"/>',
    file:'<path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8M8 16h5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    repost:'<path d="m5 3-3 3 3 3M2 6h15a3 3 0 0 1 3 3v2M19 21l3-3-3-3m3 3H7a3 3 0 0 1-3-3v-2"/>',
    share:'<path d="M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',
    settings:'<path d="m9 3-.7 2.1-2 .8-2-.8-1.6 2.8 1.4 1.6L4 12l-1.4 1.5 1.6 2.8 2-.7 2 .8L9 19h3l.7-2.6 2-.8 2 .7 1.6-2.8L17 12l.3-2.5 1.4-1.6-1.6-2.8-2 .8-2-.8L12 3Z" transform="translate(1 1)"/><circle cx="12" cy="12" r="3"/>',
    more:'<circle cx="5" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="19" cy="12" r=".8" fill="currentColor"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    folder:'<path d="M3 6h7l2 3h9v11H3Z"/><path d="M3 6V4h7l2 2h8v3"/>',
    trash:'<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    sliders:'<path d="M4 7h7m4 0h5M4 17h3m4 0h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    poll:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
    video:'<rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 9 4-3v12l-4-3"/>',
    link:'<path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
    send:'<path d="m3 3 19 9-19 9 3-9Z M6 12h16"/>'
    ,block:'<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>'
    ,flag:'<path d="M5 22V3h14l-3 5 3 5H5"/>'
    ,mute:'<path d="M11 4 6 8H3v8h3l5 4V4ZM15 9l6 6m0-6-6 6"/>'
    ,uninterested:'<circle cx="12" cy="12" r="9"/><path d="M8 9h.01M16 9h.01M8 17a4 4 0 0 1 8 0"/>'
    ,posts:'<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M7 9h10M7 14h6"/>'
    ,users:'<circle cx="9" cy="7" r="3.5"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 4a3.5 3.5 0 0 1 0 7m2 4a6 6 0 0 1 3 6"/>'
    ,clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'
    ,star:'<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9Z"/>'
    ,at:'<circle cx="12" cy="12" r="4"/><path d="M16 8v7a3 3 0 0 0 6 0v-3a10 10 0 1 0-4 8"/>'
    ,inbox:'<path d="M3 14h5l2 3h4l2-3h5M3 14l3-9h12l3 9v6H3Z"/>'
    ,calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6M17 2v6M3 11h18M8 15h2M14 15h2"/>'
    ,pin:'<path d="M19 9a7 7 0 0 1-7 12 7 7 0 0 1-7-12 7 7 0 0 1 14 0Z"/><circle cx="12" cy="9" r="2.5"/>'
    ,gif:'<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M7 10H5v4h3v-2H6M11 10v4M15 14v-4h3m-3 2h2" stroke-width="1.4"/>'
    ,hash:'<path d="M9 3 7 21M17 3l-2 18M4 9h17M3 16h17"/>'
    ,expand:'<path d="M14 3h7v7M21 3l-7 7M10 21H3v-7m0 7 7-7"/>'
    ,verified:'<path d="m12 1.5 2.5 1.6 3-.2 1.2 2.7 2.6 1.4-.3 3 1.5 2.5-1.7 2.4.1 3-2.7 1.2-1.4 2.6-3-.4-2.5 1.3-2.4-1.7-3 .1-1.2-2.7-2.6-1.4.4-3L1.4 11l1.7-2.4-.1-3 2.7-1.2 1.4-2.6 3 .4Z" fill="currentColor" stroke="none"/><path d="m7.4 11.9 3 3 6.2-6.2" stroke="white" stroke-width="2.2"/>'
  };
  const icon=(name,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.more}</svg>`;
  const pages=[['home','首页','home'],['discover','发现','search'],['ai','AI','ai'],['messages','私信','chat'],['me','我的','user']];
  const state={page:'home',feed:'推荐',profileTab:'posts',model:'默认模型',theme:'light',conversation:false,previous:'home',postDraft:'',replyDraft:'',replyTarget:'林野',editorMode:'post',detailScroll:0,commentSort:'最新',postVisibility:'公开',replyPermission:'所有人可回复'};
  const people=[
    {id:'linye',name:'林野',initial:'林',tone:'warm',bio:'阅读、散步，记下没想完的事。',interest:'阅读',dm:'direct'},
    {id:'chenche',name:'陈澈',initial:'澈',tone:'blue',bio:'把一个大目标，拆成今天的小事。',interest:'创作',dm:'direct'},
    {id:'xiamu',name:'夏木',initial:'夏',tone:'moss',bio:'留意城市里不起眼的角落。',interest:'生活',dm:'direct'},
    {id:'yuanshan',name:'远山',initial:'远',tone:'moss',bio:'分享最近读到的好故事。',interest:'阅读',dm:'request'},
    {id:'xu',name:'序言',initial:'序',tone:'lilac',bio:'边做边想，偶尔写写过程。',interest:'创作',dm:'request'},
    {id:'qiao',name:'乔安',initial:'乔',tone:'warm',bio:'喜欢胶片和周末的长步行。',interest:'生活',dm:'closed'}
  ];
  const ui={social:'following',following:new Set(['linye','chenche','xiamu']),followers:new Set(['chenche','xiamu','yuanshan']),followRequests:new Set(['xu','qiao']),dmRequests:new Set(['yuanshan','xu']),acceptedDm:new Set(),saved:true,emptyDrafts:false,dmFilter:'全部',dmQuery:'',unread:new Set(['linye','xiamu']),peopleQuery:'',interest:'全部',interaction:'quotes',interactionSort:'最新',layerReturn:null,profilePerson:null,chatPerson:null,chatPending:false,pendingSent:new Set(),blocked:new Set(),muted:new Set()};
  const person=id=>people.find(p=>p.id===id)||people.find(p=>p.name===id)||people[0];
  const followingCount=()=>18+ui.following.size-3;
  const followersCount=()=>32+ui.followers.size-3;
  let toastTimer;
  const $=id=>document.getElementById(id);
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tap=(name,act,label,extra='')=>`<button class="tap" data-act="${act}" data-choice="native-${act}" aria-label="${label}" title="${label}" ${extra}>${icon(name)}</button>`;
  const avatar=(initial,tone='',extra='')=>`<div class="avatar ${tone} ${extra}" aria-hidden="true">${initial}</div>`;
  const badge=()=>`<span class="verified-badge" role="img" aria-label="认证标记（设计示例）" title="认证标记 · 设计示例">${icon('verified')}</span>`;
  const indicator='<div class="home-indicator" aria-hidden="true"></div>';
  function toast(text){clearTimeout(toastTimer);$('app-toast').innerHTML=`<div class="toast">${safe(text)}</div>`;toastTimer=setTimeout(()=>$('app-toast').innerHTML='',3900);}
  function dismiss(){ $('app-sheet').innerHTML=''; }
  function sheet(title,content,subtitle=''){
    $('app-sheet').innerHTML=`<div class="sheet-scrim" data-act="dismiss-sheet"><section class="bottom-sheet" role="dialog" aria-modal="true" aria-label="${safe(title)}"><div class="sheet-handle" aria-hidden="true"></div><h2>${title}</h2>${subtitle?`<p class="sheet-subtitle">${subtitle}</p>`:''}${content}<div class="sheet-dismiss">${tap('close','dismiss-sheet','关闭面板')}</div></section></div>`;
  }
  function accountMenu(){
    const links=[['user','个人主页','go-me'],['folder','云端草稿','drafts'],['bookmark','我的收藏','bookmarks'],['trash','最近删除','trash']];
    $('app-sheet').innerHTML=`<div class="drawer-scrim" data-act="dismiss-sheet"><aside class="account-drawer" role="dialog" aria-modal="true" aria-label="账号侧边栏"><header class="drawer-header"><h2>我的账号</h2>${tap('close','dismiss-sheet','关闭侧边栏')}</header><button class="drawer-identity" data-act="go-me" data-choice="native-drawer-profile" aria-label="查看个人主页">${avatar('我','lilac')}<strong>我的名字 ${badge()}</strong><span>@myname</span></button><div class="drawer-follow"><button data-act="following"><b>${followingCount()}</b> 关注</button><button data-act="followers"><b>${followersCount()}</b> 粉丝</button></div><nav class="drawer-nav" aria-label="个人内容">${links.map(([i,t,a])=>`<button class="drawer-row ${a==='go-me'&&state.page==='me'?'selected':''}" data-act="${a}" data-choice="native-drawer-${a}" aria-label="${t}" title="${t}">${icon(i)}<span>${t}</span></button>`).join('')}<button class="drawer-row" data-act="follow-requests">${icon('users')}<span>关注请求</span><i class="count-badge">${ui.followRequests.size}</i></button></nav><footer class="drawer-footer"><button class="drawer-row" data-act="settings" data-choice="native-drawer-settings" aria-label="设置与隐私" title="设置与隐私">${icon('settings')}<span>设置与隐私</span>${icon('right','chevron')}</button></footer></aside><div class="drawer-safe-area">${indicator}</div></div>`;
  }
  function option(name,title,description,act,attrs='',trailing=''){
    return `<button class="sheet-option" data-act="${act}" data-choice="native-${act}" aria-label="${safe(title)}" title="${safe(title)}" ${attrs}>${icon(name)}<span>${title}${description?`<small>${description}</small>`:''}</span>${trailing}</button>`;
  }
  function layer(title,content,right='',bottom=''){
    dismiss();
    ui.layerReturn=null;
    $('app-layer').innerHTML=`<section class="layer" role="dialog" aria-modal="true" aria-label="${safe(title)}"><header class="native-header"><div class="header-left">${tap('back','close-layer','返回')}</div><h2 class="native-title">${title}</h2><div class="header-right">${right}</div></header><div class="layer-body">${content}</div>${bottom}${indicator}</section>`;
  }
  const feedTabs=()=>`<div class="feed-tabs" role="tablist" aria-label="动态类型">${['推荐','关注','最新'].map(t=>`<button class="${state.feed===t?'selected':''}" data-feed="${t}" data-choice="native-feed-${t}" role="tab" aria-selected="${state.feed===t}" aria-label="${t}" title="${t}">${t}</button>`).join('')}</div>`;
  const postTools=()=>`<div class="post-tools">${tap('chat','post-detail','评论')}${tap('repost','repost','转发或引用')}${tap('heart','like','点赞')}${tap('bookmark','bookmark','收藏')}${tap('share','share','分享')}</div>`;
  const byline=(name,time,verified=false)=>`<div class="byline"><b>${name}</b>${verified?badge():''}<span class="when">· ${time}</span><button class="tap more" data-act="post-menu" aria-label="帖子操作">${icon('more')}</button></div>`;
  function firstPost(){return `<article class="feed-post">${avatar('林','warm')}<div class="post-copy">${byline('林野','12 分钟')}<div class="body-copy" data-act="post-detail" data-choice="native-open-post">最近有个小发现：<br>比起把好句子收藏起来，我更想记下它为什么让我停下来。<br><br>你们会怎样记录读到的好想法？</div><p class="hashtag">#阅读与表达</p>${postTools()}</div></article>`;}
  function home(){return feedTabs()+firstPost()+`<article class="feed-post">${avatar('澈','blue')}<div class="post-copy">${byline('陈澈','35 分钟')}<p class="body-copy" data-act="post-detail">把一本书拆成自己的问题。今天试了一个很简单的记录方法。</p><div class="media-note" data-act="post-detail"><span class="small-label">NOTES / 01</span><strong>记录，<br>然后再想一遍。</strong><div class="book">A note<br>to self.</div></div>${postTools()}</div></article><article class="feed-post">${avatar('序','lilac')}<div class="post-copy">${byline('序言','1 小时')}<p class="body-copy">你通常怎么整理零散的灵感？</p>${['随手记录','集中整理','边做边想'].map(t=>`<button class="poll-row" data-act="vote"><i class="poll-radio"></i>${t}</button>`).join('')}<p class="small-meta poll-meta">单选投票 · 结束后可看最终结果</p>${postTools()}</div></article>`;}
  function discover(){return `<div class="scroll-pad"><button class="native-search" data-act="search">${icon('search')}<span>搜索帖子、用户和话题</span></button><div class="heading-row"><h3>最近讨论</h3>${tap('right','topics','查看全部话题')}</div>${[['阅读与表达','记录那些让你停下来的想法'],['动手做点东西','项目、过程，以及中途的发现'],['城市里的小事','不同视角，重新认识日常']].map(([title,desc])=>`<button class="topic-row" data-act="post-detail" style="width:100%;text-align:left"><span class="topic-symbol">#</span><span class="topic-copy"><b>${title}</b><p>${desc}</p></span>${icon('right','chevron')}</button>`).join('')}<div class="heading-row"><h3>发现更多人</h3>${tap('right','recommend-users','查看推荐用户')}</div><div class="discovery-people">${people.filter(p=>!ui.blocked.has(p.id)&&!ui.following.has(p.id)).map(p=>`<button class="discovery-person" data-act="view-person" data-person-id="${p.id}">${avatar(p.initial,p.tone)}<b>${p.name}</b><span>${p.interest}</span></button>`).join('')||'<p class="small-meta">稍后再来看看新的推荐。</p>'}</div><div class="heading-row"><h3>值得一读</h3>${tap('star','curation-info','人工精选说明')}</div><article class="editorial" data-act="post-detail"><div class="editorial-label">一段还在继续的讨论</div><h3>如何把一个很大的目标，<br>变成今天能开始的小事。</h3><p>来自社区的经验与不同答案</p></article></div></div>`;}
  function ai(){return `<section class="ai-area"><div class="ai-scroll" id="ai-scroll">${welcome()}</div><footer class="ai-input-region"><div class="ai-input-card"><textarea id="ai-input" rows="2" aria-label="向 AI 提问" placeholder="问问社区里的事…"></textarea><div class="composer-toolbar"><div class="composer-left">${tap('plus','extensions','添加附件与扩展')}<button class="model-select" data-act="models" data-choice="native-model-picker" aria-label="选择模型"><span id="model-name">${state.model}</span>${icon('down')}</button></div><div class="composer-right"><button class="tap composer-mic" data-act="voice-pending" data-choice="native-voice" aria-label="语音输入，能力待确认">${icon('mic')}</button><button class="tap" data-act="ask-ai" data-choice="native-send-ai" aria-label="发送问题"><span class="send-circle">${icon('up')}</span></button></div></div></div><p class="ai-fineprint">回答可能有误，请结合来源判断。</p></footer></section>`;}
  function welcome(){return `<div class="ai-welcome"><div class="assistant-emblem">${icon('ai')}</div><h1>想了解社区里的什么？</h1><p>搜索、总结，或者发现新的讨论。</p><div class="suggestion-strip"><button data-act="ask-ai" data-prompt="最近大家在讨论什么？" data-choice="native-prompt-topics">最近在聊什么</button><button data-act="select-source" data-choice="native-select-post">总结一条讨论</button><button data-act="ask-ai" data-prompt="寻找阅读笔记的讨论">找相关帖子</button></div></div>`;}
  function messages(){return `<div class="history-search"><div class="native-search">${icon('search')}<input id="dm-search" aria-label="搜索会话" placeholder="搜索会话" value="${safe(ui.dmQuery)}"></div></div><button class="request-line" data-act="requests" data-choice="native-dm-requests">${icon('inbox')}<span>私信请求</span><i class="count-badge">${ui.dmRequests.size}</i>${icon('right','chevron')}</button><div class="chat-list" id="dm-list">${dmList()}</div>`;}
  function dmList(){
    const items=[['linye','刚刚','我也在试这种记录方式。'],['chenche','昨天','谢谢分享，我们可以继续聊聊。'],['xiamu','周一','收到，下次一起交流。'],...[...ui.acceptedDm].map(id=>[id,'刚刚','已接受请求，可以开始交流。'])];
    const list=items.filter(([id,time,text])=>!ui.blocked.has(id)&&(ui.dmFilter!=='未读'||ui.unread.has(id))&&(`${person(id).name} ${text}`.includes(ui.dmQuery.trim())));
    return list.length?list.map(([id,time,text])=>{const p=person(id);return `<button class="chat-item" data-act="open-chat" data-person="${p.name}">${avatar(p.initial,p.tone)}<span class="chat-copy"><span class="name-line"><strong>${p.name}</strong><span class="when">${time}</span></span><p>${text}</p></span>${ui.unread.has(id)?'<i class="unread-dot" aria-label="未读"></i>':''}</button>`;}).join(''):empty('chat',ui.dmQuery?'没有找到会话':'暂时没有未读消息',ui.dmQuery?'换一个名字或关键词试试。':'新消息会显示在这里。');
  }
  function profileTabs(){return [['posts','posts','帖子'],['replies','chat','回复'],['reposts','repost','转发'],['media','image','媒体']].map(([id,i,t])=>`<button role="tab" class="${state.profileTab===id?'selected':''}" data-act="profile-tab" data-profile-tab="${id}" data-choice="native-profile-${id}" aria-label="${t}" title="${t}" aria-selected="${state.profileTab===id}">${icon(i)}<span>${t}</span></button>`).join('');}
  function profileContent(){
    if(state.profileTab==='media')return `<div class="profile-media"><button class="profile-media-tile" data-act="post-detail" aria-label="查看我的图片帖子"><div class="media-art" aria-hidden="true"></div></button></div>`;
    if(state.profileTab==='reposts')return `<div class="repost-note">${icon('repost')}<span>我的名字转发了</span></div>${firstPost()}`;
    return `<article class="feed-post">${avatar('我','lilac')}<div class="post-copy">${byline('我的名字','昨天',true)}${state.profileTab==='replies'?'<p class="small-meta" style="margin:6px 0">回复 @linye</p>':''}<p class="body-copy" data-act="post-detail">${state.profileTab==='replies'?'我会先写下当时的问题，再记住那个让我停下来的理由。':'想法不一定要完整，先留下一个可以继续的开头。'}</p>${postTools()}</div></article>`;
  }
  function me(){return `<div class="profile-cover" aria-hidden="true"><div class="cover-orbit"></div><div class="cover-horizon"></div></div><section class="profile-head"><div class="profile-top">${avatar('我','lilac')}<div class="profile-actions">${tap('share','share-profile','分享个人主页')}${tap('edit','edit-profile','编辑个人资料')}</div></div><h2 class="profile-name">我的名字 ${badge()}</h2><p class="profile-handle">@myname</p><p class="profile-bio">把想分享的留下来，也遇见不同的想法。</p><div class="profile-meta"><span>${icon('pin')}上海</span><span>${icon('calendar')}2026 年 10 月加入</span></div><div class="follow-meta"><button data-act="following" aria-label="18 人关注"><b>18</b> 关注</button><button data-act="followers" aria-label="32 位粉丝"><b>32</b> 粉丝</button></div></section><div class="feed-tabs icon-tabs profile-tabs" role="tablist" aria-label="个人内容分类">${profileTabs()}</div><div id="profile-content">${profileContent()}</div>`;}
  function notifications(){return `<div class="feed-tabs icon-tabs" role="tablist" aria-label="通知类型"><button class="selected" role="tab" aria-selected="true" aria-label="全部通知" title="全部通知">${icon('bell')}</button><button data-act="notification-mentions" role="tab" aria-selected="false" aria-label="提及" title="提及">${icon('at')}</button><button data-act="notification-comments" role="tab" aria-selected="false" aria-label="回复" title="回复">${icon('chat')}</button></div><article class="notice-row">${icon('chat','notice-icon')}<div>${avatar('澈','blue')}<p><b>陈澈</b> 回复了你的帖子</p><small>我会把笔记写成问题，下次再试着回答。</small><p class="small-meta" style="margin-top:9px;font-size:10px">12 分钟前</p></div></article><article class="notice-row">${icon('user','notice-icon')}<div>${avatar('夏','moss')}<p><b>夏木</b> 关注了你</p><p class="small-meta" style="margin-top:9px;font-size:10px">1 小时前</p></div></article><article class="notice-row">${icon('heart','notice-icon')}<div>${avatar('林','warm')}<p><b>林野</b> 赞了你的帖子</p><small>想法不一定要完整，先留下一个可以继续的开头。</small><p class="small-meta" style="margin-top:9px;font-size:10px">昨天</p></div></article>`;}
  function render(){
    dismiss();$('app-layer').innerHTML='';
    const title={home:'社区',discover:'发现',ai:'AI 助手',messages:'私信',me:'个人主页',notifications:'通知'}[state.page];
    const leading=state.page==='notifications'?tap('back','back-notifications','返回'): `<button class="tap" data-act="account-menu" data-choice="native-account-menu" aria-label="个人菜单">${avatar('我','','self')}</button>`;
    let trailing=tap('bell','notifications','通知');
    if(state.page==='ai')trailing=tap('history','history','历史会话')+tap('edit','new-chat','新建会话');
    if(state.page==='me')trailing=tap('search','search-profile','搜索我的内容')+tap('more','profile-menu','个人主页操作');
    if(state.page==='notifications')trailing='';
    if(state.page==='discover')trailing=tap('search','search','搜索社区')+tap('bell','notifications','通知');
    if(state.page==='messages')trailing=`<button class="dm-filter" data-act="dm-filter" aria-label="筛选会话">${ui.dmFilter}${icon('down')}</button>`+tap('edit','new-dm','新建私信');
    $('app-header').innerHTML=`<div class="header-left">${leading}</div><h2 class="native-title">${title}</h2><div class="header-right">${trailing}</div>`;
    $('app-screen').className='screen'+(state.page==='ai'?' ai-screen':'');
    $('app-screen').innerHTML=({home,discover,ai,messages,me,notifications}[state.page])();
    if(state.page==='me'){const following=$('app-screen').querySelector('.follow-meta [data-act="following"]');const followers=$('app-screen').querySelector('.follow-meta [data-act="followers"]');following.innerHTML=`<b>${followingCount()}</b> 关注`;followers.innerHTML=`<b>${followersCount()}</b> 粉丝`;following.setAttribute('aria-label',`${followingCount()} 人关注`);followers.setAttribute('aria-label',`${followersCount()} 位粉丝`);}
    $('app-screen').scrollTop=0;
    $('app-tabs').innerHTML=pages.map(([id,name,i])=>`<button class="nav-tab ${state.page===id?'selected':''}" data-page="${id}" data-choice="native-tab-${id}" aria-label="${name}" title="${name}" ${state.page===id?'aria-current="page"':''}><span class="tab-symbol">${icon(i)}</span></button>`).join('');
    $('board-pages').innerHTML=[...pages,['notifications','通知','bell']].map(([id,name,i])=>`<button class="board-page ${state.page===id?'selected':''}" data-page="${id}" data-choice="native-board-${id}">${icon(i)}<span>${name}</span></button>`).join('')+`<div class="board-divider"></div><button class="board-page" data-act="post-detail" data-choice="native-board-detail">${icon('posts')}<span>帖子详情</span></button><button class="board-page" data-act="focus-comments" data-choice="native-board-comments">${icon('chat')}<span>评论嵌套</span></button><button class="board-page" data-act="compose" data-choice="native-board-compose">${icon('plus')}<span>发布帖子</span></button><button class="board-page" data-act="account-menu" data-choice="native-board-drawer">${icon('user')}<span>账号侧边栏</span></button>`;
    $('board-pages').insertAdjacentHTML('beforeend',`<div class="board-divider"></div>${[['users','following','关注与粉丝'],['users','recommend-users','发现用户'],['bookmark','bookmarks','我的收藏'],['bookmark','bookmarks-empty','收藏空状态'],['folder','drafts-empty','草稿空状态'],['chat','new-dm','新建私信'],['inbox','requests','私信请求'],['repost','view-quotes','转发与引用'],['more','preview-post-menu','帖子菜单']].map(([i,a,t])=>`<button class="board-page" data-act="${a}" data-choice="native-board-${a}">${icon(i)}<span>${t}</span></button>`).join('')}`);
    $('compose-fab').innerHTML=icon('plus');$('compose-fab').classList.toggle('hidden',!['home','discover','me'].includes(state.page));
    state.conversation=false;
  }
  function ask(question){
    if(state.page!=='ai'){state.page='ai';render();}
    $('app-layer').innerHTML='';dismiss();
    const value=question||$('ai-input').value.trim()||'最近大家在讨论什么？';
    $('ai-scroll').innerHTML=`<div class="ai-conversation"><div class="user-bubble">${safe(value)}</div><div class="assistant-label">${icon('ai')}<span>AI 助手</span></div><div class="assistant-prose">可以从“把摘录变成问题”开始。<br><br>在这段示例讨论里，大家提到：记录让自己停下来的原因，再用自己的话重新回答，会比单纯收藏更容易继续思考。</div><button class="native-source" data-act="post-detail" data-choice="native-ai-source">${icon('file')}<span>把零散笔记变成自己的想法<small>林野 · 公开讨论 · 来源 01</small></span>${icon('right','chevron')}</button><div class="answer-toolbar">${tap('copy','copy-answer','复制回答')}${tap('repost','retry-ai','重新生成')}${tap('heart','answer-feedback','反馈')}</div><p class="small-meta" style="margin-top:15px">这是设计示例，未实际检索或调用模型。</p></div>`;
    $('ai-input').value='';state.conversation=true;$('ai-scroll').scrollTop=0;
  }
  function models(){sheet('选择模型',`<div class="sheet-group">${[['默认模型','使用管理员配置的默认模型'],['快速模型','示意选项 · 具体模型待定'],['推理模型','示意选项 · 具体模型待定']].map(([name,desc])=>option('ai',name,desc,'pick-model',`data-model="${name}"`,state.model===name?icon('check','check'):'')).join('')}</div>`,'草图中的名称为占位，实际可用模型尚待配置。');}
  function extensions(){sheet('添加到对话',`<div class="sheet-group">${option('image','图片','文件格式与识图能力待确认','image-pending','', '<i class="pending-label">待确认</i>')}${option('file','文件','文档解析范围待确认','file-pending','', '<i class="pending-label">待确认</i>')}${option('link','社区帖子','选择有权访问且允许 AI 使用的内容','select-source')}</div><div class="sheet-group">${option('sliders','更多工具','联网搜索、语音等仅预留入口','more-tools')}</div>`);}
  function history(){layer('历史会话',`<div class="history-search"><div class="native-search">${icon('search')}<input aria-label="搜索历史会话" placeholder="搜索会话"></div></div><div class="history-group">今天</div><button class="history-row" data-act="open-history" data-prompt="寻找关于阅读笔记的讨论" data-choice="native-history-item">${icon('chat')}<span>寻找阅读笔记的方法<small>刚刚</small></span>${icon('more')}</button><button class="history-row" data-act="open-history" data-prompt="最近大家在讨论什么？">${icon('chat')}<span>最近的社区讨论<small>上午</small></span>${icon('more')}</button><div class="history-group">过去 7 天</div><button class="history-row" data-act="open-history" data-prompt="如何把一个大目标拆开？">${icon('chat')}<span>从一个小目标开始<small>周一</small></span>${icon('more')}</button>`,tap('edit','new-chat','新建会话'));}
  function compose(mode='post'){
    state.editorMode=mode;
    const reply=mode==='reply';
    const draft=reply?state.replyDraft:state.postDraft;
    const tools=reply?tap('image','reply-image','添加回复图片')+tap('gif','reply-gif','添加回复 GIF'):tap('image','post-image','添加图片')+tap('video','post-video','添加视频')+tap('gif','post-gif','添加 GIF')+tap('poll','post-poll','创建投票')+tap('link','post-link','添加链接')+tap('ai','post-ai-settings','AI 使用与网页收录设置')+tap('plus','append-thread','续写帖子串');
    const audience=reply?`<div class="reply-scope-note">${icon('globe')}<span>沿用原帖可见范围</span></div>`:`<button class="audience-chip" data-act="post-visibility">${icon(state.postVisibility==='公开'?'globe':'users')}<span>${state.postVisibility}</span>${icon('down')}</button><button class="audience-chip" data-act="reply-audience">${icon('chat')}<span>${state.replyPermission}</span>${icon('down')}</button>`;
    layer(reply?'回复':'发布帖子',`<div class="compose-editor-row">${avatar('我','lilac')}<div class="compose-field">${reply?`<p class="reply-context">回复 <span>${safe(state.replyTarget)}</span></p>`:''}<textarea id="post-editor" aria-label="${reply?'回复正文':'帖子正文'}" placeholder="${reply?'写下你的回复…':'有什么想分享的？'}">${safe(draft)}</textarea></div></div>`,`<button class="publish-button" data-act="${reply?'publish-reply':'publish'}" ${draft.trim()?'':'disabled'}>${reply?'回复':'发布'}</button>`,`<footer class="publish-dock"><div class="audience-row">${audience}</div><div class="publishing-tools">${tools}</div></footer>`);
    const editor=$('app-layer').querySelector('.layer');editor.classList.add('composer-layer');
    editor.querySelector('.header-left').innerHTML=tap('close','close-composer','关闭编辑器');
    editor.querySelector('.layer-body').classList.add('composer-body');
  }
  function countAction(i,a,label,count='',extra=''){return `<button class="count-action" data-act="${a}" aria-label="${label}" title="${label}" ${extra}>${icon(i)}${count!==''?`<span>${count}</span>`:''}</button>`;}
  function commentRow(name,handle,tone,initial,time,text,child=false,verified=false){return `<article class="comment-row ${child?'child':''}"><div class="comment-avatar">${avatar(initial,tone)}</div><div class="comment-copy"><div class="comment-byline"><strong>${name}</strong>${verified?badge():''}<span>@${handle} · ${time}</span>${tap('more','post-menu','评论操作')}</div>${child?'<p class="comment-context">回复 @chenche</p>':''}<p class="comment-text">${text}</p><div class="comment-actions">${countAction('chat','start-reply',`回复 ${name}`,child?'':'1',`data-reply-name="${name}"`)}${countAction('repost','repost','转发或引用评论')}${countAction('heart','like','点赞评论',child?'2':'4')}${countAction('share','share','分享评论')}</div></div></article>`;}
  function comments(){return `<section class="comments-list" id="comments-list" aria-label="评论与回复"><div class="comment-thread">${commentRow('陈澈','chenche','blue','澈','12 分钟','我会把笔记写成一个问题。过几天再看时，试着用自己的话回答。')}${commentRow('林野','linye','warm','林','10 分钟','这个方法不错，提醒自己别只收藏不思考。',true,true)}</div><div class="comment-thread single">${commentRow('夏木','xiamu','moss','夏','20 分钟','我也会记下当时的感受，再留一点空白给下次的想法。')}</div></section>`;}
  function replyDock(){return `<footer class="reply-dock"><div class="reply-pill">${avatar('我','lilac')}<input id="reply-input" aria-label="回复内容" placeholder="${state.replyTarget==='林野'?'发布你的回复':`回复 ${state.replyTarget}…`}" value="${safe(state.replyDraft.replace(/\n/g,' '))}"><div class="reply-tools">${tap('image','reply-image','添加回复图片')}${tap('gif','reply-gif','添加回复 GIF')}${tap('expand','expand-reply','展开发表回复')}${tap('up','send-reply','发送回复',state.replyDraft.trim()?'':'hidden')}</div></div></footer>`;}
  function detail(){
    layer('帖子',`<article class="post-detail"><div class="detail-author">${avatar('林','warm')}<div class="detail-author-copy"><strong>林野 ${badge()}</strong><span>@linye</span></div><button class="follow-button" data-act="follow-author">关注</button>${tap('more','post-menu','帖子操作')}</div><div class="detail-text">最近有个小发现：<br>比起把好句子收藏起来，我更想记下它为什么让我停下来。<br><br>你们会怎样记录读到的好想法？</div><div class="detail-media"><div class="media-note"><span class="small-label">NOTES / 01</span><strong>记下问题，<br>也留下新的想法。</strong><div class="book">A note<br>to self.</div></div></div><p class="detail-timestamp">2026 年 10 月 13 日 · 14:10</p><div class="detail-actions">${countAction('chat','focus-reply','回复帖子','3')}${countAction('repost','repost','转发或引用','1')}${countAction('heart','like','点赞帖子','12')}${countAction('bookmark','bookmark','收藏帖子','3')}${countAction('share','share','分享帖子')}</div></article><div class="comments-heading" id="comments-heading"><button data-act="sort-comments" aria-label="评论排序">${state.commentSort}${icon('down')}</button><button data-act="view-quotes">查看引用${icon('right')}</button></div>${comments()}`,tap('ai','summarize','请 AI 总结这段讨论'),replyDock());
    $('app-layer').querySelector('.layer').classList.add('detail-layer');
  }
  function focusComments(){detail();const heading=$('comments-heading');$('app-layer').querySelector('.layer-body').scrollTop=heading.offsetTop-$('app-layer').querySelector('.layer-body').offsetTop;}
  function updateReplyButton(){const control=document.querySelector('.reply-tools [data-act="send-reply"]');if(control)control.hidden=!state.replyDraft.trim();}
  function closeComposer(){if(state.editorMode==='reply'){detail();$('app-layer').querySelector('.layer-body').scrollTop=state.detailScroll;}else{$('app-layer').innerHTML='';}}
  function settings(){layer('设置',`<div class="scroll-pad"><div class="profile-links" style="margin:0">${[['user','账号与手机号','account-security'],['user','关注审批与粉丝','follower-settings'],['ai','AI 使用设置','ai-settings'],['globe','搜索引擎收录','seo-settings'],['sliders','内容偏好','content-settings'],['sliders','内容屏蔽与拉黑','mute-settings'],['chat','私信与回执','dm-settings'],['bell','通知与推送','push-settings']].map(([i,t,a])=>`<button class="settings-row" data-act="${a}">${icon(i)}<span>${t}</span>${icon('right','chevron')}</button>`).join('')}</div><p class="small-meta" style="padding:18px 5px">隐私与安全设置沿用此前确认的规则。</p></div>`);}
  function chat(name='林野',pending=false){
    const p=person(name);ui.chatPerson=p.id;ui.chatPending=pending;ui.unread.delete(p.id);
    layer(p.name,`<div class="chat-thread" id="message-thread"><div class="chat-person-context">${avatar(p.initial,p.tone)}<strong>${p.name}</strong><span>@${p.id}</span></div><p class="chat-date">今天</p>${pending?`<p class="inline-note">对方尚未接受私信请求。可以发送一条介绍，接受后再继续交流。</p>`:'<div class="message-bubble">我也在试这种记录方式。</div><div class="message-bubble mine">很高兴能一起交流。</div><div class="small-meta" style="text-align:right">已送达</div>'}${ui.pendingSent.has(p.id)?'<p class="inline-note">请求已发送，等待对方接受。</p>':''}</div>`,tap('more','chat-options','会话操作'),`<div class="layer-bottom"><div class="layer-input"><input id="dm-input" aria-label="私信内容" placeholder="${pending?'写一条介绍…':'发送消息…'}" ${ui.pendingSent.has(p.id)?'disabled':''}>${tap('plus','dm-attachment','添加私信附件')}${tap('up','send-dm','发送私信',ui.pendingSent.has(p.id)?'disabled':'')}</div></div>`);
    ui.layerReturn=()=>{state.page='messages';render();};
  }
  function empty(i,title,description,action='',label=''){return `<section class="native-empty"><div class="empty-symbol">${icon(i)}</div><h3>${title}</h3><p>${description}</p>${action?`<button class="solid-button" data-act="${action}">${label}</button>`:''}</section>`;}
  function searchbar(id,label,placeholder,value=''){return `<div class="history-search"><div class="native-search">${icon('search')}<input id="${id}" aria-label="${label}" placeholder="${placeholder}" value="${safe(value)}"></div></div>`;}
  function markPreview(a){document.querySelectorAll('#board-pages .board-page').forEach(b=>b.classList.toggle('selected',b.dataset.act===a));}
  function userRow(p,mode='recommend'){
    const attrs=`data-person-id="${p.id}"`;let controls='';
    if(mode==='requests')controls=`<div class="request-actions"><button class="solid-button small" data-act="approve-follow" ${attrs}>批准</button>${tap('close','end-follow-request',`结束 ${p.name} 的关注请求`,attrs)}</div>`;
    else if(mode==='dm')controls=p.dm==='closed'?'<span class="person-unavailable">不接收私信</span>':icon('right','chevron');
    else controls=`<div class="person-actions"><button class="follow-button ${ui.following.has(p.id)?'following':''}" data-act="toggle-follow" ${attrs} aria-label="${ui.following.has(p.id)?'取消关注':'关注'} ${p.name}">${ui.following.has(p.id)?'已关注':'关注'}</button>${mode==='followers'?tap('more','follower-options',`${p.name} 的粉丝操作`,attrs):''}</div>`;
    const act=mode==='dm'?'select-recipient':'view-person';
    return `<article class="person-row" data-person-row="${p.id}"><button class="person-avatar" data-act="${act}" ${attrs} aria-label="${mode==='dm'?'私信':'查看'} ${p.name}" ${mode==='dm'&&p.dm==='closed'?'disabled':''}>${avatar(p.initial,p.tone)}</button><div class="person-copy"><button class="person-name" data-act="${act}" ${attrs} ${mode==='dm'&&p.dm==='closed'?'disabled':''}>${p.name}<span>@${p.id}</span></button>${mode==='dm'?'':`<p>${p.bio}</p>`}</div>${controls}</article>`;
  }
  function social(tab='following'){
    ui.social=tab;ui.peopleQuery='';
    const tabs=[['following',`关注 ${followingCount()}`],['followers',`粉丝 ${followersCount()}`],['requests',`请求 ${ui.followRequests.size}`]];
    layer('关注与粉丝',`<div class="feed-tabs relationship-tabs" role="tablist" aria-label="关注关系">${tabs.map(([id,t])=>`<button class="${tab===id?'selected':''}" data-act="social-tab" data-social-tab="${id}" role="tab" aria-selected="${tab===id}">${t}</button>`).join('')}</div>${tab==='requests'?'<p class="inline-note">新关注需要批准。开启审批前已有的粉丝继续保留。</p>':searchbar('people-search','搜索关注关系','搜索昵称或用户名')}<div id="people-list">${socialList()}</div>`,tap('users','recommend-users','发现更多用户'));
    markPreview('following');
  }
  function socialList(){
    const ids=ui.social==='following'?ui.following:ui.social==='followers'?ui.followers:ui.followRequests;
    const list=people.filter(p=>ids.has(p.id)&&!ui.blocked.has(p.id)&&(`${p.name} ${p.id}`.includes(ui.peopleQuery)));
    return list.length?list.map(p=>userRow(p,ui.social==='requests'?'requests':ui.social)).join(''):empty('users',ui.social==='requests'?'没有待处理的关注请求':'没有找到用户',ui.social==='requests'?'新的关注申请会出现在这里。':'换一个关键词，或去发现更多用户。');
  }
  function recommendations(){
    layer('发现用户',`<section class="people-intro"><p class="section-eyebrow">从共同兴趣开始</p><h3>遇见值得聊的人</h3><p>看看他们分享的内容，再决定是否关注。</p></section><div class="interest-pills" role="tablist" aria-label="用户兴趣">${['全部','阅读','创作','生活'].map(t=>`<button class="${ui.interest===t?'selected':''}" data-act="people-interest" data-interest="${t}" role="tab" aria-selected="${ui.interest===t}">${t}</button>`).join('')}</div><div id="recommend-list">${people.filter(p=>!ui.blocked.has(p.id)&&(ui.interest==='全部'||p.interest===ui.interest)).map(p=>userRow(p)).join('')}</div>`);
    markPreview('recommend-users');
  }
  function viewPerson(id){
    const previous=ui.layerReturn;const returnMarkup=$('app-layer').innerHTML;const scroll=$('app-layer').querySelector('.layer-body')?.scrollTop||0;const p=person(id);ui.profilePerson=p.id;
    layer(p.name,`<div class="profile-cover profile-cover-other" aria-hidden="true"></div><section class="other-profile"><div class="other-profile-top">${avatar(p.initial,p.tone)}<div class="person-actions">${tap('chat','person-dm',`私信 ${p.name}`,`data-person-id="${p.id}"`)}<button class="follow-button ${ui.following.has(p.id)?'following':''}" data-act="toggle-follow" data-person-id="${p.id}">${ui.following.has(p.id)?'已关注':'关注'}</button></div></div><h3>${p.name}</h3><p class="profile-handle">@${p.id}</p><p class="profile-bio">${p.bio}</p></section><div class="profile-section-title">帖子</div>${p.id==='linye'?firstPost():`<article class="feed-post">${avatar(p.initial,p.tone)}<div class="post-copy">${byline(p.name,'昨天')}<p class="body-copy">${p.interest==='创作'?'今天做了一点小尝试，留下一个明天能继续的开头。':p.interest==='生活'?'走了一条平时不会走的路，看见了些有意思的小事。':'最近在试着把阅读笔记写成问题，给下次阅读留一点线索。'}</p>${postTools()}</div></article>`}`,tap('more','person-options','用户操作',`data-person-id="${p.id}"`));
    ui.layerReturn=()=>{$('app-layer').innerHTML=returnMarkup;ui.layerReturn=previous;const body=$('app-layer').querySelector('.layer-body');if(body)body.scrollTop=scroll;};
  }
  function bookmarks(emptyState=false){
    if(emptyState)ui.saved=false;
    layer('我的收藏',`${searchbar('bookmark-search','搜索收藏','搜索收藏的帖子')}<p class="list-caption">${icon('bookmark')}仅自己可见</p><div id="bookmark-list">${bookmarkList()}</div>`,tap('more','bookmark-options','收藏操作'));
    markPreview(emptyState?'bookmarks-empty':'bookmarks');
  }
  function bookmarkList(query=''){
    if(!ui.saved)return empty('bookmark','为想再看的内容留个位置','在帖子上点收藏，以后就能在这里找到。','go-discover','发现内容');
    if(query&&!('阅读 笔记 思考 林野'.includes(query)))return empty('search','没有找到收藏','换一个关键词试试。');
    return firstPost()+`<article class="unavailable-card">${icon('file')}<div><b>原帖不可见</b><p>原帖当前的访问权限已变更。</p></div>${tap('bookmark','remove-unavailable','移除此收藏')}</article>`;
  }
  function drafts(emptyState=false){
    ui.emptyDrafts=emptyState;
    layer('云端草稿',`${searchbar('draft-search','搜索草稿','搜索草稿')}<div id="draft-list">${emptyState?empty('folder','还没有草稿','没写完的想法可以先存下来，再继续。','compose','开始写帖子'):`<p class="list-caption">仅自己可见 · 继续编辑</p><button class="draft-row" data-act="compose"><span class="draft-mark">${icon('file')}</span><span><b>一段还没写完的想法</b><small>从一个问题开始，把最近的阅读串起来。</small><i>今天 · 文字草稿</i></span>${icon('right','chevron')}</button>`}</div>`,tap('plus','compose','写新帖子'));
    markPreview(emptyState?'drafts-empty':'');
  }
  function newDm(){
    ui.peopleQuery='';
    layer('新建私信',`${searchbar('recipient-search','搜索私信接收人','搜索昵称或用户名')}<p class="list-caption">选择一个人</p><div id="recipient-list">${people.filter(p=>!ui.blocked.has(p.id)).map(p=>userRow(p,'dm')).join('')}</div>`);
    markPreview('new-dm');
  }
  function requests(){
    layer('私信请求',`<p class="inline-note">接受前，这些消息不会进入正常会话。</p><div class="chat-list">${ui.dmRequests.size?[...ui.dmRequests].filter(id=>!ui.blocked.has(id)).map(id=>{const p=person(id);return `<button class="chat-item" data-act="preview-request" data-person-id="${id}">${avatar(p.initial,p.tone)}<span class="chat-copy"><span class="name-line"><strong>${p.name}</strong><span class="when">今天</span></span><p>你好，看到你分享的帖子，想交流一下。</p></span>${icon('right','chevron')}</button>`;}).join(''):empty('inbox','没有待处理的私信请求','新的请求会出现在这里。')}</div>`);
    ui.layerReturn=()=>{state.page='messages';render();};markPreview('requests');
  }
  function previewRequest(id){
    const p=person(id);ui.chatPerson=id;
    layer('私信请求',`<div class="request-preview"><div class="request-person">${avatar(p.initial,p.tone)}<h3>${p.name}</h3><span>@${p.id}</span><p>${p.bio}</p></div><p class="chat-date">今天</p><div class="message-bubble">你好，看到你分享的帖子，想交流一下。</div><p class="request-explanation">接受后可以开始交流。删除只移除这条请求，不会自动接受。</p></div>`,tap('more','request-options','请求操作',`data-person-id="${id}"`),`<footer class="request-decision"><button class="outline-button" data-act="delete-dm-request" data-person-id="${id}">删除</button><button class="solid-button" data-act="accept-dm-request" data-person-id="${id}">接受</button></footer>`);
    ui.layerReturn=requests;
  }
  function interactions(tab='quotes'){
    ui.interaction=tab;
    const count=tab==='quotes'?2:3;
    layer('转发与引用',`<div class="feed-tabs two-tabs" role="tablist" aria-label="转发与引用类型"><button class="${tab==='quotes'?'selected':''}" data-act="interaction-tab" data-interaction-tab="quotes" role="tab" aria-selected="${tab==='quotes'}">引用 2</button><button class="${tab==='reposts'?'selected':''}" data-act="interaction-tab" data-interaction-tab="reposts" role="tab" aria-selected="${tab==='reposts'}">转发 3</button></div><p class="list-caption">${icon('clock')}${ui.interactionSort} · ${count} 条可见记录</p>${tab==='quotes'?['chenche','xiamu'].map(id=>{const p=person(id);return `<article class="feed-post quote-record">${avatar(p.initial,p.tone)}<div class="post-copy">${byline(p.name,'1 小时')}<p class="body-copy">${id==='chenche'?'收藏之后，再留一句自己的理解。':'试了这个方法，确实更容易接着想。'}</p><button class="quote-preview" data-act="post-detail"><b>林野 <span>@linye</span></b><p>比起把好句子收藏起来，我更想记下它为什么让我停下来。</p></button>${postTools()}</div></article>`;}).join(''):people.slice(1,4).map(p=>userRow(p)).join('')}`,tap('sliders','interaction-sort','互动记录排序'));
    if(ui.interactionSort==='最早'){
      const body=$('app-layer').querySelector('.layer-body');
      [...body.querySelectorAll(tab==='quotes'?'.quote-record':'.person-row')].reverse().forEach(row=>body.appendChild(row));
    }
    ui.layerReturn=detail;markPreview('view-quotes');
  }
  function postMenu(own=false,comment=false,id='linye'){
    const name=person(id).name;
    sheet(comment?'评论操作':'帖子操作',`${own?`<div class="sheet-group">${option('edit','编辑帖子','','edit-own-post')}${option('trash','删除帖子','','delete-own-post')}</div>`:`<div class="sheet-group">${comment?'':option('uninterested','不感兴趣','减少相似内容推荐','not-interested')}${option('mute',`屏蔽 ${name}`,'隐藏其内容，保留关注关系','mute-person',`data-person-id="${id}"`)}${option('block',`拉黑 ${name}`,'停止双方的关注与互动','block-person',`data-person-id="${id}"`)}</div>`}<div class="sheet-group">${option('flag',comment?'举报评论':'举报帖子','','report-content')}${comment?'':option('repost','查看转发与引用','','view-quotes')}</div>`);
  }
  function reportContent(){
    sheet('举报内容',`<div class="sheet-group">${['骚扰与攻击','垃圾内容','违法或有害内容','其他原因'].map(t=>option('flag',t,'','submit-demo-report',`data-reason="${t}"`)).join('')}</div>`,'只提交处理这次举报所需的内容。');
  }
  function editProfile(){layer('编辑个人资料',`<div class="profile-edit"><label>名字<input aria-label="名字" value="我的名字"></label><label>简介<textarea aria-label="个人简介">把想分享的留下来，也遇见不同的想法。</textarea></label><label>所在地<input aria-label="所在地" value="上海"></label></div>`,tap('check','save-profile','保存个人资料'));}
  document.addEventListener('input',e=>{
    if(e.target.id==='dm-search'){ui.dmQuery=e.target.value;$('dm-list').innerHTML=dmList();}
    if(e.target.id==='people-search'){ui.peopleQuery=e.target.value.trim();$('people-list').innerHTML=socialList();}
    if(e.target.id==='bookmark-search')$('bookmark-list').innerHTML=bookmarkList(e.target.value.trim());
    if(e.target.id==='draft-search'&&!ui.emptyDrafts){const row=document.querySelector('.draft-row');if(row)row.hidden=!!e.target.value&&!row.textContent.includes(e.target.value);}
    if(e.target.id==='recipient-search')$('recipient-list').innerHTML=people.filter(p=>!ui.blocked.has(p.id)&&(`${p.name} ${p.id}`.includes(e.target.value.trim()))).map(p=>userRow(p,'dm')).join('')||empty('search','没有找到用户','换一个昵称或用户名试试。');
    if(e.target.id==='reply-input'){state.replyDraft=e.target.value;updateReplyButton();}
    if(e.target.id==='post-editor'){if(state.editorMode==='reply')state.replyDraft=e.target.value;else state.postDraft=e.target.value;const publish=document.querySelector('.publish-button');if(publish)publish.disabled=!e.target.value.trim();}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('app-sheet').innerHTML){dismiss();return;}if(document.querySelector('.composer-layer'))closeComposer();else $('app-layer').innerHTML='';}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('button[data-act],button[data-page],button[data-theme],button[data-feed],.sheet-scrim[data-act],.drawer-scrim[data-act],[data-act="post-detail"]');
    if(!b)return;
    if((b.classList.contains('sheet-scrim')||b.classList.contains('drawer-scrim'))&&e.target!==b)return;
    if(b.dataset.theme){state.theme=b.dataset.theme;$('device').dataset.theme=state.theme;document.querySelectorAll('.theme-control button').forEach(x=>x.classList.toggle('selected',x===b));return;}
    if(b.dataset.page){state.page=b.dataset.page;render();return;}
    if(b.dataset.feed){state.feed=b.dataset.feed;render();return;}
    const a=b.dataset.act;
    if(a==='dismiss-sheet'){dismiss();return;}
    if(a==='close-layer'){if(ui.layerReturn){const back=ui.layerReturn;back();}else $('app-layer').innerHTML='';return;}
    if(a==='following'||a==='followers'||a==='follow-requests'){social(a==='follow-requests'?'requests':a);return;}
    if(a==='social-tab'){social(b.dataset.socialTab);return;}
    if(a==='recommend-users'){recommendations();return;}
    if(a==='people-interest'){ui.interest=b.dataset.interest;recommendations();return;}
    if(a==='toggle-follow'){
      const id=b.dataset.personId;
      ui.following.has(id)?ui.following.delete(id):ui.following.add(id);
      b.textContent=ui.following.has(id)?'已关注':'关注';b.classList.toggle('following',ui.following.has(id));b.setAttribute('aria-label',`${ui.following.has(id)?'取消关注':'关注'} ${person(id).name}`);
      if(document.querySelector('.relationship-tabs'))document.querySelector('[data-social-tab="following"]').textContent=`关注 ${followingCount()}`;
      return;
    }
    if(a==='view-person'){viewPerson(b.dataset.personId);return;}
    if(a==='approve-follow'){ui.followRequests.delete(b.dataset.personId);ui.followers.add(b.dataset.personId);social('requests');return;}
    if(a==='end-follow-request'){ui.followRequests.delete(b.dataset.personId);social('requests');toast('请求已结束。示例发送者看到统一的结束状态。');return;}
    if(a==='follower-options'){const id=b.dataset.personId;sheet('粉丝操作',`<div class="sheet-group">${option('users','移除此粉丝','解除关注关系；仍可查看公开内容','confirm-remove-follower',`data-person-id="${id}"`)}${option('block','拉黑用户','停止双方的关注与互动','block-person',`data-person-id="${id}"`)}</div>`);return;}
    if(a==='confirm-remove-follower'){const id=b.dataset.personId;sheet(`移除 ${person(id).name}？`,`<p class="menu-summary">移除后，对方失去基于关注关系查看的内容。公开内容仍可查看；未开启审批时仍可能重新关注。</p><div class="sheet-group">${option('users','确认移除','','remove-follower',`data-person-id="${id}"`)}</div>`);return;}
    if(a==='remove-follower'){ui.followers.delete(b.dataset.personId);social('followers');return;}
    if(a==='bookmarks'||a==='bookmarks-empty'){bookmarks(a==='bookmarks-empty');return;}
    if(a==='bookmark-options'){sheet('收藏',`<div class="sheet-group">${option('bookmark','查看空状态','切换设计示例','bookmarks-empty')}${option('bookmark','恢复有内容的示例','','restore-bookmarks')}</div>`);return;}
    if(a==='restore-bookmarks'){ui.saved=true;bookmarks();return;}
    if(a==='remove-unavailable'){b.closest('.unavailable-card').remove();return;}
    if(a==='bookmark'){ui.saved=!ui.saved;b.setAttribute('aria-pressed',ui.saved);b.classList.toggle('saved',ui.saved);toast(ui.saved?'已加入示例收藏。':'已移出示例收藏。');return;}
    if(a==='drafts'||a==='drafts-empty'){drafts(a==='drafts-empty');return;}
    if(a==='go-discover'){state.page='discover';render();return;}
    if(a==='dm-filter'){sheet('会话筛选',`<div class="sheet-group">${['全部','未读'].map(t=>option('chat',t,'','pick-dm-filter',`data-filter="${t}"`,ui.dmFilter===t?icon('check','check'):'')).join('')}</div><div class="sheet-group">${option('inbox','私信请求','','requests')}${option('check','全部标为已读','','read-all')}</div>`);return;}
    if(a==='pick-dm-filter'){ui.dmFilter=b.dataset.filter;state.page='messages';render();return;}
    if(a==='read-all'){ui.unread.clear();state.page='messages';render();return;}
    if(a==='new-dm'){newDm();return;}
    if(a==='select-recipient'||a==='person-dm'){
      const p=person(b.dataset.personId);if(p.dm==='closed'){toast('对方不接收新的私信。');return;}
      chat(p.name,p.dm==='request'&&!ui.acceptedDm.has(p.id));return;
    }
    if(a==='requests'){requests();return;}
    if(a==='preview-request'){previewRequest(b.dataset.personId);return;}
    if(a==='accept-dm-request'){ui.dmRequests.delete(b.dataset.personId);ui.acceptedDm.add(b.dataset.personId);chat(person(b.dataset.personId).name);return;}
    if(a==='delete-dm-request'){ui.dmRequests.delete(b.dataset.personId);requests();return;}
    if(a==='request-options'){sheet('请求操作',`<div class="sheet-group">${option('block','拉黑用户','停止双方互动','block-person',`data-person-id="${b.dataset.personId}"`)}${option('flag','举报消息','只提交与本次举报相关的内容','report-content')}</div>`);return;}
    if(a==='send-dm'){const input=$('dm-input');const text=input?.value.trim();if(!text)return;const p=person(ui.chatPerson);if(ui.blocked.has(p.id)||p.dm==='closed'){toast('当前不能发送消息。');return;}if(ui.chatPending&&ui.pendingSent.has(p.id))return;const thread=$('message-thread');thread.insertAdjacentHTML('beforeend',`<div class="message-bubble mine">${safe(text)}</div><p class="small-meta" style="text-align:right">${ui.chatPending?'请求已发送，等待接受':'发送示例'}</p>`);input.value='';if(ui.chatPending){ui.pendingSent.add(p.id);input.disabled=true;b.disabled=true;}thread.parentElement.scrollTop=thread.parentElement.scrollHeight;return;}
    if(a==='dm-attachment'){sheet('添加到私信',`<div class="sheet-group">${option('image','图片','','demo-dm-media')}${option('gif','GIF','','demo-dm-media')}${option('link','链接','','demo-dm-media')}</div>`);return;}
    if(a==='demo-dm-media'){dismiss();toast('附件入口示例；不会上传真实文件。');return;}
    if(a==='chat-options'){sheet('会话操作',`<div class="sheet-group">${option('bell','免打扰','','demo-dm-mute')}${option('flag','举报消息','','report-content')}${option('block','拉黑用户','','block-person',`data-person-id="${ui.chatPerson}"`)}</div>`);return;}
    if(a==='demo-dm-mute'){dismiss();toast('免打扰示例已开启。');return;}
    if(a==='view-quotes'){interactions();return;}
    if(a==='interaction-tab'){interactions(b.dataset.interactionTab);return;}
    if(a==='interaction-sort'){sheet('记录排序',`<div class="sheet-group">${['最新','最早'].map(t=>option('clock',t,'','set-interaction-sort',`data-sort="${t}"`)).join('')}</div>`);return;}
    if(a==='set-interaction-sort'){ui.interactionSort=b.dataset.sort;interactions(ui.interaction);return;}
    if(a==='preview-post-menu'){postMenu();markPreview(a);return;}
    if(a==='post-menu'){const row=b.closest('.comment-row,.feed-post');const name=row?.querySelector('.comment-byline strong,.byline b')?.textContent;postMenu(!!b.closest('#profile-content'),!!b.closest('.comment-row'),person(name||'linye').id);return;}
    if(a==='not-interested'){dismiss();toast('已记录示例反馈，减少相似内容推荐。');return;}
    if(a==='mute-person'){ui.muted.add(b.dataset.personId);dismiss();toast('内容屏蔽示例已开启，关注关系保留。');return;}
    if(a==='person-options'){sheet('用户操作',`<div class="sheet-group">${option('mute','屏蔽用户','','mute-person',`data-person-id="${b.dataset.personId}"`)}${option('block','拉黑用户','','block-person',`data-person-id="${b.dataset.personId}"`)}${option('flag','举报用户','','report-content')}</div>`);return;}
    if(a==='block-person'){const id=b.dataset.personId;sheet(`拉黑 ${person(id).name}？`,`<p class="menu-summary">双方关注关系解除，并停止新的关注、私信与互动。解除后不会自动恢复关注。</p><div class="sheet-group">${option('block','确认拉黑','','confirm-block',`data-person-id="${id}"`)}</div>`);return;}
    if(a==='confirm-block'){ui.blocked.add(b.dataset.personId);ui.following.delete(b.dataset.personId);ui.followers.delete(b.dataset.personId);ui.followRequests.delete(b.dataset.personId);ui.dmRequests.delete(b.dataset.personId);dismiss();$('app-layer').innerHTML='';render();toast('已演示拉黑后的关系变更。');return;}
    if(a==='report-content'){reportContent();return;}
    if(a==='submit-demo-report'){dismiss();toast('已到达举报提交入口；草图不提交真实举报。');return;}
    if(a==='edit-own-post'){compose();return;}
    if(a==='delete-own-post'){sheet('删除帖子？',`<p class="menu-summary">删除后停止展示正文、媒体及相关讨论。其他用户的转发与引用只保留删除占位。</p><div class="sheet-group">${option('trash','确认删除示例','','confirm-delete-post')}</div>`);return;}
    if(a==='confirm-delete-post'){dismiss();toast('已演示删除入口；不会修改真实内容。');return;}
    if(a==='close-composer'){closeComposer();return;}
    if(a==='models'){models();return;}
    if(a==='pick-model'){state.model=b.dataset.model;if($('model-name'))$('model-name').textContent=state.model;dismiss();return;}
    if(a==='extensions'){extensions();return;}
    if(a==='more-tools'){sheet('更多工具',`<div class="sheet-group">${option('search','社区检索','按当前权限检索社区内容','community-tool')}${option('globe','联网搜索','具体能力待确认','web-pending','', '<i class="pending-label">待确认</i>')}${option('mic','语音输入','具体能力待确认','voice-pending','', '<i class="pending-label">待确认</i>')}${option('image','生成图片','具体能力待确认','imagegen-pending','', '<i class="pending-label">待确认</i>')}</div>`);return;}
    if(a.endsWith('-pending')){dismiss();toast('这里先展示扩展入口，实际能力随后确认。不会上传文件、联网或调用模型。');return;}
    if(a==='community-tool'){dismiss();toast('社区检索会遵循当前用户权限与作者的 AI 使用设置。');return;}
    if(a==='history'){history();return;}
    if(a==='new-chat'){state.page='ai';render();return;}
    if(a==='ask-ai'||a==='open-history'){ask(b.dataset.prompt);return;}
    if(a==='retry-ai'){ask('再换一种方式整理这段讨论。');return;}
    if(a==='select-source'){sheet('选择社区内容',`<div class="sheet-group">${option('file','把零散笔记变成自己的想法','公开 · 允许 AI 总结','source-public')}${option('file','一条关注者可见帖子','选中后重新校验并确认处理','source-restricted')}</div>`,'选中内容必须满足当前权限与作者的 AI 设置。');return;}
    if(a==='source-public'){ask('总结这条公开讨论。');return;}
    if(a==='source-restricted'){sheet('确认内容处理',`<p class="menu-summary">你已主动选择一条有权阅读、且作者允许总结的内容。必要正文将发送给已批准的 AI 服务商。</p><p class="small-meta" style="padding:10px 4px 20px">服务商与数据处理说明尚待确定。此处仅演示确认流程。</p><div class="sheet-group">${option('check','确认后分析','发送前仍需再次检查权限','source-confirm')}</div>`);return;}
    if(a==='source-confirm'){dismiss();toast('已到达确认入口。草图不会向任何服务商发送内容。');return;}
    if(a==='compose'){compose();return;}
    if(a==='post-detail'){detail();return;}
    if(a==='focus-comments'){focusComments();return;}
    if(a==='focus-reply'){$('reply-input').focus();return;}
    if(a==='start-reply'){state.replyTarget=b.dataset.replyName;$('reply-input').placeholder=`回复 ${state.replyTarget}…`;$('reply-input').focus();return;}
    if(a==='expand-reply'){state.detailScroll=$('app-layer').querySelector('.layer-body').scrollTop;compose('reply');return;}
    if(a==='reply-image'||a==='reply-gif'){toast('已演示回复附件入口。草图不会上传或发布文件。');return;}
    if(a==='send-reply'||a==='publish-reply'){toast('已到达回复入口。草图不会发布真实内容。');return;}
    if(a==='follow-author'){b.textContent=b.textContent==='关注'?'已关注':'关注';b.classList.toggle('following');return;}
    if(a==='sort-comments'){sheet('评论排序',`<div class="sheet-group">${['最新','热门'].map(t=>option(t==='最新'?'clock':'star',t,'','pick-comment-sort',`data-sort="${t}"`,state.commentSort===t?icon('check','check'):'')).join('')}</div>`);return;}
    if(a==='pick-comment-sort'){state.commentSort=b.dataset.sort;dismiss();document.querySelector('.comments-heading [data-act="sort-comments"]').innerHTML=state.commentSort+icon('down');return;}
    if(a==='summarize'){state.page='ai';render();ask('总结这段关于阅读笔记的讨论。');return;}
    if(a==='notifications'){state.previous=state.page;state.page='notifications';render();return;}
    if(a==='back-notifications'){state.page=state.previous==='notifications'?'home':state.previous;render();return;}
    if(a==='settings'){settings();return;}
    if(a==='account-menu'){accountMenu();return;}
    if(a==='go-me'){state.page='me';render();return;}
    if(a==='profile-tab'){state.profileTab=b.dataset.profileTab;document.querySelector('.profile-tabs').innerHTML=profileTabs();$('profile-content').innerHTML=profileContent();return;}
    if(a==='profile-menu'){sheet('个人主页',`<div class="sheet-group glyph-group">${option('share','分享个人主页','','share-profile')}${option('edit','编辑个人资料','','edit-profile')}</div>`);return;}
    if(a==='edit-profile'){editProfile();return;}
    if(a==='save-profile'){$('app-layer').innerHTML='';toast('已演示保存入口。设计稿不会保存真实资料。');return;}
    if(a==='share-profile'){sheet('分享个人主页',`<div class="sheet-group glyph-group">${option('copy','复制个人主页链接','','copy-profile-link')}${option('share','系统分享','','system-share-profile')}</div>`);return;}
    if(a==='copy-profile-link'||a==='system-share-profile'){dismiss();toast('已演示个人主页分享入口。此处为虚构账号。');return;}
    if(a==='search-profile'){layer('搜索我的内容',`<div class="history-search"><div class="native-search">${icon('search')}<input aria-label="搜索我的内容" placeholder="搜索我的帖子"></div></div>${profileContent()}`);return;}
    if(a==='search-chat'){layer('搜索私信',`<div class="history-search"><div class="native-search">${icon('search')}<input aria-label="搜索私信" placeholder="搜索名字或消息"></div></div>`);return;}
    if(a==='open-chat'){chat(b.dataset.person);return;}
    if(a==='requests'){layer('私信请求',`<div class="scroll-pad">${avatar('远','moss')}<h3 style="font-size:16px;margin-top:13px">远山</h3><p class="body-copy" style="margin-top:18px">你好，看到你关于阅读记录的帖子，想交流一下。</p><p class="small-meta" style="margin-top:28px">接受后进入正常会话。拒绝或删除请求不会自动接受。</p><div class="profile-links" style="margin:20px 0">${option('check','接受请求','','accept-request')}${option('close','拒绝请求','','reject-request')}${option('bell','举报或拉黑','','report')}</div></div>`);return;}
    if(a==='accept-request'){chat('远山');return;}
    if(a==='reject-request'){$('app-layer').innerHTML='';toast('请求已结束。发送方不会看到拒绝或删除的区别。');return;}
    if(a==='post-menu'){sheet('帖子操作',`<div class="sheet-group glyph-group">${option('bookmark','收藏','','bookmark')}${option('share','分享链接','','share')}${option('sliders','屏蔽这类内容','','mute')}${option('bell','举报','','report')}</div>`);return;}
    if(a==='repost'){sheet('转发或引用',`<div class="sheet-group glyph-group">${option('repost','转发','保留原帖访问规则','demo-repost')}${option('edit','引用','写下自己的看法','quote')}</div>`);return;}
    if(a==='quote'){compose();toast('引用关系继承原帖权限；这里先演示编辑入口。');return;}
    if(a==='like'){b.classList.toggle('liked');b.setAttribute('aria-pressed',b.classList.contains('liked'));return;}
    if(a==='post-visibility'){sheet('可见范围',`<div class="sheet-group">${option('globe','公开','所有人可以查看','visibility-set','data-visibility="公开"')}${option('users','关注者可见','当前获准的关注者可以查看','visibility-set','data-visibility="关注者可见"')}${option('user','仅自己可见','仅作者可以查看','visibility-set','data-visibility="仅自己可见"')}</div>`);return;}
    if(a==='visibility-set'){state.postVisibility=b.dataset.visibility;dismiss();const chip=document.querySelector('.audience-chip[data-act="post-visibility"]');chip.innerHTML=icon(state.postVisibility==='公开'?'globe':state.postVisibility==='仅自己可见'?'user':'users')+`<span>${state.postVisibility}</span>`+icon('down');return;}
    if(a==='reply-audience'){sheet('谁可以回复',`<div class="sheet-group">${[['globe','所有人可回复','仍须有权阅读原帖'],['users','我关注的人','有权阅读、且作者关注的用户'],['at','仅提及的人','有权阅读、且原帖提及的用户'],['close','关闭回复','保留已有回复，停止新回复']].map(([i,t,d])=>option(i,t,d,'reply-permission-set',`data-permission="${t}"`)).join('')}</div>`);return;}
    if(a==='reply-permission-set'){state.replyPermission=b.dataset.permission;dismiss();document.querySelector('.audience-chip[data-act="reply-audience"] span').textContent=state.replyPermission;return;}
    if(a==='drafts'){layer('云端草稿',`<div class="history-group">继续编辑</div><button class="history-row" data-act="compose">${icon('file')}<span>一段还没写完的想法<small>文字草稿 · 仅自己可见</small></span>${icon('right')}</button><p class="small-meta" style="padding:18px 20px">跨设备编辑冲突时提示选择。</p>`);return;}
    if(a==='search'){layer('搜索',`<div class="history-search"><div class="native-search">${icon('search')}<input aria-label="搜索社区" placeholder="搜索帖子、话题或用户"></div></div><div class="feed-tabs icon-tabs" role="tablist" aria-label="搜索类型"><button class="selected" role="tab" aria-selected="true" aria-label="帖子" title="帖子">${icon('posts')}</button><button role="tab" aria-selected="false" aria-label="用户" title="用户">${icon('users')}</button><button role="tab" aria-selected="false" aria-label="话题" title="话题">${icon('hash')}</button></div>${firstPost()}`);return;}
    if(a==='publish'){toast('已到达发布入口。草图不会发布或保存真实内容。');return;}
    if(a==='copy-answer'){toast('已演示复制入口；内容为布局示例。');return;}
    const messages={vote:'进行中的投票在成功投票后显示结果；结束后对有权阅读者展示。',share:'公开分享网页只读，受限内容仍需重新校验权限。',bookmark:'收藏仅自己管理，重新打开时检查内容权限。',bookmarks:'收藏内容仅自己管理；此页会在业务流程稿中展开。',trash:'最近删除中可按规则恢复，具体期限仍待确认。',report:'举报仅提交必要证据，并提供处理结果和申诉入口。',reply:'回复继承原帖可见性与回复设置。',mute:'内容屏蔽与账号拉黑沿用此前确认的规则。','send-dm':'草图不会发送真实私信。','post-ai-settings':'逐帖设置只能进一步收紧账户允许的 AI 用途；网页收录独立设置。','content-settings':'这里管理内容偏好、自动播放与屏蔽。','new-dm':'发起新私信前检查接收方当前设置。','append-thread':'下一条帖子沿用整个帖子串的可见范围。'};
    dismiss();toast(messages[a]||'这个入口会在后续流程设计中展开。');
  });
  render();social();
})();
