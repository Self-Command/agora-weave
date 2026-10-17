import { useEffect,useState,useSyncExternalStore } from 'react';
import { ActivityIndicator,Pressable,Text,View,useColorScheme } from 'react-native';
import { themeFor } from '../../../../../packages/design/src/tokens';
import type { DeviceSession,RecoveryCase } from './api';
import type { createSecurityController } from './security-controller';
import type { createRecoveryController } from './recovery-controller';
import { AccountButton,AccountFootnote,AccountFrame,AccountIcon,AccountIntro,AccountNotice,AccountSheet,AccountTextAction } from './AccountLayout';

function displayTime(value:string) {
  const time=new Date(value);
  if (!Number.isFinite(time.getTime())) return '时间暂不可用';
  return time.toLocaleString('zh-CN',{ year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit' });
}
function LoadingDevices() {
  const colors=themeFor(useColorScheme());
  return <View accessibilityLabel="正在读取设备列表" accessibilityState={{ busy:true }}>
    <View className="flex-row items-center gap-[9px] py-3">
      <ActivityIndicator size="small" color={colors.secondary} />
      <Text className="text-[12px] leading-[22px] text-secondary">正在读取设备列表</Text>
    </View>
    {[0,1].map(index=><View key={index} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="gap-3 border-b border-line py-[19px]">
      <View className="h-3 w-full rounded bg-surface" /><View className="h-[10px] w-3/5 rounded bg-surface" />
    </View>)}
  </View>;
}
type SecurityController=ReturnType<typeof createSecurityController>;
export function SecurityPage({ controller,onBack,onRecovery,visible=true }: {
  controller:SecurityController;onBack:()=>void;onRecovery:(trusted:boolean)=>void;visible?:boolean;
}) {
  const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot),colors=themeFor(useColorScheme());
  const [confirmation,setConfirmation]=useState<{type:'revoke';item:DeviceSession}|{type:'logout'}|null>(null);
  useEffect(()=>{ if (!state.active||!visible) setConfirmation(null); },[state.active,visible]);
  const pending=state.pendingRevocation,unknown=!!pending||state.pendingLogout;
  if (!state.active) return <AccountFrame title="账号安全" onBack={onBack}><AccountNotice text="返回前台后将重新核验登录设备。" /></AccountFrame>;
  if (state.errorCode==='SESSION_INVALID') return <AccountFrame title="账号安全" onBack={onBack}>
    <AccountIntro compact title="登录已失效" copy="为保护账号安全，请重新登录后查看设备。" />
    <View className="flex-row items-start gap-[13px] py-[22px]">
      <AccountIcon name="shield" color={colors.secondary} />
      <View className="flex-1"><Text className="mb-2 text-[15px] font-medium text-fg">此会话已不可用</Text>
        <Text className="text-[12px] leading-[22px] text-secondary">旧设备列表已清除，不再显示账号信息。</Text></View>
    </View>
    <AccountButton title="重新登录" onPress={onBack} />
  </AccountFrame>;
  return <AccountFrame title="账号安全" onBack={onBack} onRefresh={state.busy?undefined:()=>{ void controller.load(); }} bodyClassName="pt-7">
    <AccountIntro compact title="保护你的账号" copy="查看登录设备，管理账号安全。" />
    <View>
      <Text accessibilityRole="header" className="pb-3 text-[11px] text-secondary">登录设备</Text>
      {state.loading&&!state.items.length ? <LoadingDevices /> : state.items.map(item=>{
        const revoking=state.busy&&state.revokingId===item.id,unconfirmed=pending?.target===item.id;
        const trusted=item.current&&!!item.trusted_at&&Date.parse(item.trusted_at)<=Date.now();
        return <View key={item.id} className="flex-row flex-wrap items-start gap-[13px] border-b border-line py-[19px]">
          <View className="w-6 pt-[3px]"><AccountIcon name={item.current||!/desktop|browser|浏览器|桌面|电脑/i.test(item.device_label)?'phone':'desktop'} color={colors.secondary} /></View>
          <View className="min-w-[120px] flex-1">
            <Text className="text-[14px] font-medium leading-[23px] text-fg">{item.device_label || (item.current?'当前设备':'登录设备')}</Text>
            <Text className="mt-[5px] text-[11px] leading-5 text-secondary">{item.current?'本次登录':'登录时间'} · {displayTime(item.created_at)}</Text>
            {item.current ? <View className="mt-1 flex-row items-center gap-[5px]">
              <View className="h-1 w-1 rounded-full bg-accent" /><Text className="text-[10px] leading-4 text-accent">{trusted?'当前设备 · 可信会话':'当前设备'}</Text>
            </View> : null}
            {revoking||unconfirmed ? <Text accessibilityLiveRegion="polite" className="mt-[5px] text-[11px] leading-5 text-secondary">{revoking?'正在撤销登录':'撤销结果未确认'}</Text> : null}
          </View>
          {!item.current ? <Pressable accessibilityRole="button" accessibilityLabel={`${revoking?'正在撤销':'撤销'}${item.device_label||'此设备'}登录`}
            accessibilityState={{ disabled:state.busy||unknown,...(revoking?{busy:true}:{}) }} disabled={state.busy||unknown}
            onPress={()=>setConfirmation({ type:'revoke',item })} className="mt-px min-h-12 min-w-12 items-center justify-center rounded-[22px] border border-line px-[13px] py-2">
            {revoking ? <ActivityIndicator size="small" color={colors.secondary} /> : <Text className={`text-[12px] leading-5 ${unconfirmed?'text-secondary':'text-fg'}`}>{unconfirmed?'待确认':'撤销'}</Text>}
          </Pressable> : null}
        </View>;
      })}
      {!state.loading&&!state.error&&state.items.length===0 ? <Text className="py-3 text-[12px] leading-[22px] text-secondary">暂未读到登录设备，请刷新后重试。</Text> : null}
      {!state.loading&&!state.next&&state.items.length>0&&state.items.every(item=>item.current) ? <Text className="mt-[14px] text-[12px] leading-[22px] text-secondary">没有其他登录设备。</Text> : null}
      {state.next ? <AccountTextAction title={state.loading?'正在读取':'加载更多设备'} disabled={state.loading||state.busy} onPress={()=>{ void controller.load(state.next!); }} /> : null}
      {unknown ? <View className="gap-0">
        <AccountNotice error text={state.error&&state.errorCode!=='NETWORK_UNCONFIRMED'&&state.errorCode!=='SERVICE_UNAVAILABLE'?state.error:
          state.pendingLogout?'网络中断，尚不能确认当前登录是否已退出。请查询操作结果。':'网络中断，尚不能确认该设备是否已退出。请查询操作结果。'} />
        <AccountButton secondary title={state.pendingLogout?'查询退出结果':'查询撤销结果'} busy={state.busy}
          onPress={()=>{ void (state.pendingLogout?controller.queryLogout():controller.queryRevocation()); }} />
      </View> : null}
      {state.error&&!unknown ? <View className="mt-3"><AccountNotice error text={state.error} />
        <AccountTextAction title="重新加载" disabled={state.busy} onPress={()=>{ void controller.load(); }} /></View> : null}
      {state.notice ? <View className="mt-[14px]"><AccountNotice text={state.notice} /></View> : null}
      <Text className="mt-[14px] text-[12px] leading-[22px] text-secondary">撤销后，该设备需要重新登录才能继续访问。</Text>
    </View>
    <View>
      <Pressable accessibilityRole="button" onPress={()=>onRecovery(controller.canRequestTrustedRecovery())} disabled={state.busy}
        accessibilityState={{ disabled:state.busy }} className="min-h-[60px] flex-row items-center gap-3 border-b border-line py-3">
        <AccountIcon name="key" size={20} /><View className="flex-1">
          <Text className="text-[13px] leading-[23px] text-fg">账号恢复</Text>
          <Text className="mt-[3px] text-[11px] leading-5 text-secondary">无法使用原手机号时，申请核验账号归属</Text>
        </View><AccountIcon name="right" size={15} color={colors.secondary} />
      </Pressable>
      <View className="mt-[10px]"><AccountTextAction secondary title="退出当前登录" disabled={state.busy||unknown} onPress={()=>setConfirmation({ type:'logout' })} /></View>
    </View>
    <AccountSheet visible={!!confirmation&&visible} title={confirmation?.type==='revoke'?'撤销此设备登录？':'退出当前登录？'}
      copy={confirmation?.type==='revoke'?'撤销后，该设备的后续访问将被拒绝，需要重新登录。当前设备不受影响。':'将撤销当前会话，并清除本机登录信息与受限缓存。'} onClose={()=>setConfirmation(null)}>
      <AccountButton title={confirmation?.type==='revoke'?'撤销登录':'退出登录'} disabled={state.busy} onPress={()=>{
        const action=confirmation;setConfirmation(null);
        if (action?.type==='revoke') void controller.revoke(action.item);else if (action) void controller.logout();
      }} />
    </AccountSheet>
  </AccountFrame>;
}

const caseCopy:Record<RecoveryCase['state'],{title:string;copy:string;label:string}>={
  received:{ title:'申请已受理',copy:'我们已收到申请，接下来将核验账号归属。',label:'已受理' },
  reviewing:{ title:'正在核验账号归属',copy:'请等待当前申请的核验结果，无需重复提交。',label:'核验中' },
  need_evidence:{ title:'需要补充证据',copy:'现有材料不足以确认账号归属，请按受控核验流程补充证据。',label:'需补证' },
  rejected:{ title:'本次申请未通过',copy:'目前提供的证明不足以核验账号归属，本次申请未恢复账号。',label:'已拒绝' },
  approved:{ title:'已批准，等待恢复执行',copy:'核验已通过，账号恢复尚未执行。当前手机号与登录权限尚未因此改变。',label:'已批准待执行' },
};
function CaseDetail({ label,value }: {label:string;value:string}) {
  return <View className="flex-row items-start justify-between gap-3 py-[10px]">
    <Text className="text-[12px] leading-[21px] text-secondary">{label}</Text>
    <Text selectable className="min-w-0 flex-1 text-right text-[12px] leading-[21px] text-fg">{value}</Text>
  </View>;
}
export function RecoveryPage({ controller,trusted,onBack,onClose }: {
  controller:ReturnType<typeof createRecoveryController>;trusted:boolean;onBack:()=>void;onClose:()=>void;
}) {
  const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot),colors=themeFor(useColorScheme());
  const [mode,setMode]=useState<'manual'|'trusted'>('manual');
  const record=state.record,copy=record?caseCopy[record.state]:null,unknown=!!state.pending;
  const trustedBlocked=!trusted||state.errorCode==='FORBIDDEN',selected=state.pending?.mode||mode;
  useEffect(()=>{ if (trustedBlocked&&mode==='trusted'&&!unknown) setMode('manual'); },[trustedBlocked,mode,unknown]);
  if (!state.active) return <AccountFrame title="账号恢复" onBack={onBack} onClose={onClose}><AccountNotice text="返回前台后将重新核验申请状态。" /></AccountFrame>;
  if (state.errorCode==='SESSION_INVALID') return <AccountFrame title="账号恢复" onBack={onBack} onClose={onClose}>
    <AccountIntro compact title="登录已失效" copy="请重新登录后，通过受控流程查询恢复申请。" />
    <AccountNotice text="本页申请信息已清除。" /><AccountButton title="重新登录" onPress={onClose} />
  </AccountFrame>;
  return <AccountFrame title="账号恢复" onBack={onBack} onClose={onClose}>
    <AccountIntro compact title={copy?.title||(state.caseId?'查询恢复申请':'找回你的账号')}
      copy={copy?.copy||(state.caseId?'正在重新核验当前申请状态。':'无法使用原手机号时，可以申请核验账号归属。无法提供有效证明的账号，可能无法找回。')} />
    {record&&copy ? <>
      <View>
        <View className="flex-row items-center gap-[9px] pt-[7px]">
          <AccountIcon name={record.state==='need_evidence'?'file':'clock'} size={19} color={colors.secondary} />
          <Text accessibilityLiveRegion="polite" className="text-[14px] font-medium leading-6 text-fg">{copy.label}</Text>
        </View>
        <View className="mt-[15px] border-y border-line py-[10px]">
          <CaseDetail label="申请编号" value={record.id} />
          <CaseDetail label="申请方式" value={record.mode==='trusted'?'可信会话核验':record.mode==='manual'?'人工核验':'紧急核验'} />
          <CaseDetail label="更新时间" value={displayTime(record.updated_at)} />
        </View>
      </View>
      {record.state==='need_evidence' ? <AccountNotice text="请通过受控渠道补充证据，勿公开验证码或登录凭据。" /> : null}
      {state.error ? <AccountNotice error text="暂时无法读取申请状态，请稍后重试。" /> : null}
      <AccountButton secondary title="刷新申请状态" busy={state.busy} onPress={()=>{ void controller.refresh(); }} />
      <AccountFootnote>申请受理或核验通过均不代表恢复已完成。{'\n'}无法证明归属的账号，可能无法找回。</AccountFootnote>
    </> : state.caseId ? <>
      {state.busy ? <View className="flex-row items-center gap-[9px]"><ActivityIndicator size="small" color={colors.secondary} />
        <Text className="text-[12px] leading-[22px] text-secondary">正在读取当前申请状态</Text></View> : null}
      {state.error ? <AccountNotice error text="当前申请状态暂时不可用，请重新查询。" /> : null}
      <AccountButton secondary title="刷新申请状态" busy={state.busy} onPress={()=>{ void controller.refresh(); }} />
      <AccountFootnote>申请受理或核验通过均不代表恢复已完成。</AccountFootnote>
    </> : <>
      {trustedBlocked ? <AccountNotice text={state.errorCode==='FORBIDDEN'?'当前会话无法使用可信恢复，资格或保护期由服务端核验。请选择人工核验。':'当前会话不满足可信恢复资格，可选择人工核验。'} /> : null}
      <View accessibilityRole="radiogroup" accessibilityLabel="恢复申请方式">
        {(['manual','trusted'] as const).map(option=>{
          const disabled=state.busy||unknown||(option==='trusted'&&trustedBlocked),checked=selected===option;
          return <Pressable key={option} accessibilityRole="radio" accessibilityLabel={option==='manual'?'人工核验':'可信会话核验'}
            accessibilityState={{ selected:checked,checked,disabled }} disabled={disabled} onPress={()=>setMode(option)}
            className="min-h-[88px] flex-row items-start gap-3 border-b border-line py-[18px]">
            <View className="pt-[2px]"><AccountIcon name={option==='manual'?'file':'shield'} size={20} color={colors.secondary} /></View>
            <View className="flex-1">
              <Text className={`text-[14px] font-medium leading-6 ${disabled?'text-secondary':'text-fg'}`}>{option==='manual'?'人工核验':'可信会话核验'}</Text>
              <Text className="mt-[6px] text-[12px] leading-[22px] text-secondary">{option==='manual'?'提交申请，由受控流程核验账号归属。':'使用仍有效的可信登录会话申请，资格由服务端核验。'}</Text>
            </View>
            <View className="mt-1 h-[18px] w-[18px] items-center justify-center rounded-full border border-control-line">
              {checked ? <View className="h-3 w-3 rounded-full bg-fg" /> : null}
            </View>
          </Pressable>;
        })}
      </View>
      {unknown ? <AccountNotice error text={state.error&&state.errorCode!=='NETWORK_UNCONFIRMED'?state.error:'提交结果尚未确认，请先查询。确认前请勿重复发起申请。'} /> :
        state.error&&state.errorCode!=='FORBIDDEN' ? <AccountNotice error text="暂时无法提交申请，所选方式已保留，请稍后重试。" /> : null}
      <AccountButton title={unknown?'查询本次申请':state.busy?'正在提交申请':'提交恢复申请'} busy={state.busy}
        onPress={()=>{ void (unknown?controller.queryPending():controller.submit(mode)); }} />
      <AccountFootnote>申请不会直接更改手机号或恢复账号权限。</AccountFootnote>
    </>}
  </AccountFrame>;
}
