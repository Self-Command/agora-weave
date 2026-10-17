type Schema = Record<string,unknown>;
export type ConfigDefinition = { key:string;owner:string;description:string;schema:Schema;default_value:unknown;
  status:'confirmed'|'engineering'|'provisional';scopes:string[];dependencies:string[];conflicts:string[];
  read_permission:string;write_permission:string;sensitive:boolean;effect_mode:'immediate'|'reload';consumer_ids:string[];
  existing_object_policy:string;validation_refs:string[] };
const all=['api','mobile','admin','sql','media','worker','ai','mcp','plugins'];
function definition(key:string,value:unknown,schema:Schema,description:string,status:ConfigDefinition['status']='confirmed',consumers=all,
  existing='new_operations'):ConfigDefinition {
  return { key,owner:key.split('.')[0],description,schema,default_value:value,status,scopes:['global','environment','module','plugin','user_group'],
    dependencies:[],conflicts:[],read_permission:'config.read',write_permission:`${key.split('.')[0]}.config.write`,sensitive:false,
    effect_mode:'immediate',consumer_ids:consumers,existing_object_policy:existing,validation_refs:[status==='confirmed'?'spec.initial-parameters':'research.RD-10'] };
}
const integer=(key:string,value:number,description:string,status:ConfigDefinition['status']='confirmed',max=Number.MAX_SAFE_INTEGER) =>
  definition(key,value,{ type:'integer',minimum:1,maximum:max },description,status);
const seconds=(key:string,value:number,description:string,status:ConfigDefinition['status']='confirmed')=>integer(key,value,description,status);
const enumeration=(key:string,value:string,options:string[],description:string,status:ConfigDefinition['status']='confirmed')=>
  definition(key,value,{ type:'string',enum:options },description,status);
const retained=(key:string,amount:number,unit:string,trigger:string)=>definition(key,{ amount,unit,trigger },{ type:'object',additionalProperties:false,
  required:['amount','unit','trigger'],properties:{ amount:{ type:'integer',minimum:1 },unit:{ const:unit },trigger:{ const:trigger } } },
  `Protected retention from ${trigger}; retaining data never grants ordinary reading.`,'confirmed',all,'preserve_original_trigger_and_shared_legal_interests');

/** Approved defaults plus explicitly classified engineering assumptions; no safety-off switch. */
export const definitions:ConfigDefinition[]=[
  seconds('auth.otp_lifetime_seconds',300,'OTP challenge lifetime.','engineering'),
  seconds('auth.otp_resend_seconds',60,'Minimum resend interval.','engineering'),
  integer('auth.otp_max_failures',5,'Failed attempts before challenge lock.','engineering'),
  integer('auth.otp_phone_hourly',5,'Phone send attempts per rolling hour.','engineering'),
  integer('auth.otp_phone_daily',10,'Phone send attempts per day.','engineering'),
  integer('auth.otp_ip_hourly',30,'Trusted-proxy IP send attempts per hour.','engineering'),
  seconds('auth.jwt_lifetime_seconds',600,'JWT expiry never substitutes for current authorization.','engineering'),
  seconds('auth.admin_idle_seconds',900,'Idle warning for administrators.','engineering'),
  seconds('auth.stepup_lifetime_seconds',300,'One-use action-bound challenge lifetime.','engineering'),
  seconds('auth.api_timeout_seconds',10,'Ordinary API request protection.','engineering'),
  seconds('auth.phone_change_cooldown_seconds',86400,'DEC-001 cooldown from authoritative completion.'),
  integer('profile.username_min_length',3,'ASCII username minimum length.','engineering',30),
  integer('profile.username_max_length',30,'ASCII username maximum length.','engineering',30),
  seconds('profile.username_change_seconds',2592000,'Username change interval.'),
  seconds('profile.old_username_hold_seconds',2592000,'Hold previous username from authoritative change.'),
  seconds('social.follow_request_expiry_seconds',2592000,'Expiry from request creation.'),
  seconds('social.follow_request_rejected_cooldown_seconds',2592000,'Cooldown after rejection or deletion.'),
  seconds('social.follow_request_cancelled_cooldown_seconds',604800,'Cooldown after cancellation or natural expiry.'),
  integer('content.body_limit',2000,'Normal post visible character limit.'),
  integer('content.long_body_limit',10000,'Long post visible character limit.'),
  integer('content.link_preview_limit',1,'At most one preview card per post.'),
  seconds('content.link_fetch_timeout_seconds',5,'Fetch protection; DNS and address checks apply at each redirect.','engineering'),
  integer('content.link_fetch_body_bytes',2097152,'Maximum fetched link body in binary bytes.','engineering'),
  integer('content.link_fetch_redirect_limit',3,'Maximum redirects; external fetch is unavailable to AI tools.','engineering'),
  integer('comments.body_limit',2000,'Comment visible character limit.','engineering'),
  integer('comments.image_limit',4,'Comment images; GIF is mutually exclusive.'),
  integer('polls.option_min',2,'Minimum number of options.'),integer('polls.option_max',4,'Maximum number of options.'),
  integer('polls.option_body_limit',100,'Visible characters in one option.','engineering'),
  seconds('polls.duration_min_seconds',300,'Minimum voting duration.'),seconds('polls.duration_max_seconds',604800,'Maximum voting duration.'),
  definition('drafts.conflict_policy','explicit_choice',{ const:'explicit_choice' },'CAS conflict requires an explicit choice.','engineering'),
  seconds('deletion.undo_seconds',10,'Undo window from real deletion.'),seconds('deletion.restore_seconds',2592000,'Restore window from real deletion.'),
  integer('media.image_count',9,'Image count per post; no video or GIF mixing.'),integer('media.image_bytes',10000000,'Decimal bytes per image.'),
  integer('media.video_count',1,'Video count per post.'),integer('media.video_bytes',200000000,'Decimal bytes per video.'),
  seconds('media.video_duration_seconds',300,'Maximum video duration.'),integer('media.gif_count',1,'GIF count per post.'),integer('media.gif_bytes',15000000,'Decimal bytes per GIF.'),
  enumeration('media.video_default','wifi_only',['always','wifi_only','never'],'Platform default; never overrides an explicit personal choice.'),
  definition('media.initially_muted',true,{ const:true },'Video starts muted; user playback action is local to the player.'),
  integer('dm.body_limit',4000,'Visible character limit for a normal direct message.','engineering'),
  integer('dm.request_body_limit',500,'Visible character limit for a stranger request.','engineering'),
  seconds('dm.request_expiry_seconds',2592000,'Expiry from request creation.'),
  seconds('dm.request_rejected_cooldown_seconds',2592000,'Cooldown after rejection, deletion or natural expiry.'),
  seconds('dm.request_cancelled_cooldown_seconds',604800,'Cooldown after sender cancellation.'),
  definition('dm.read_receipt_default',false,{ type:'boolean' },'Both parties must currently allow receipts.'),
  definition('notifications.delivery_policy','current_recipient',{ const:'current_recipient' },'Each delivery rechecks current recipient and lifecycle.','engineering'),
  integer('search.page_size',20,'Default page size.','engineering',50),integer('search.maximum_page_size',50,'Maximum page size.','engineering',50),
  definition('sharing.indexing_default',true,{ type:'boolean' },'Applies only to currently public targets and intersects author/target choices.'),
  enumeration('ranking.cold_start','recent',['recent'],'Use genuine recent eligible content when data is insufficient.','engineering'),
  definition('moderation.private_read_policy','case_specific',{ const:'case_specific' },'Moderation roles do not grant general private reading.','engineering'),
  definition('documents.required_registration_kinds',['terms','privacy'],{ type:'array',uniqueItems:true,items:{ enum:['terms','privacy','community_rules'] } },'Read the current published registration document set.','engineering'),
  integer('ai.daily_success_limit',20,'Successful completions per user per configured day.'),
  integer('ai.input_token_limit',8000,'Includes conversation context.'),integer('ai.output_token_limit',2000,'Maximum output tokens.'),
  enumeration('ai.day_timezone','Asia/Shanghai',['Asia/Shanghai'],'Daily usage timezone.','engineering'),
  seconds('ai.request_timeout_seconds',60,'Overall request protection.','engineering'),integer('ai.tool_call_limit',8,'Tool calls per request.','engineering'),
  integer('ai.tool_result_limit',20,'Rows per read-only tool result.','engineering',20),
  definition('ai.daily_cost_budget',null,{ type:['number','null'],minimum:0 },'No approved monetary budget means paid calls stay unavailable.','provisional',['api','ai','worker'],'do_not_rewind_settled_costs'),
  retained('retention.cancelled_account',30,'day','account_cancellation'),retained('retention.cancelled_author_content',30,'day','account_cancellation'),
  retained('retention.deleted_content',30,'day','real_deletion'),retained('retention.direct_messages',24,'month','last_conversation_activity'),
  retained('retention.deleted_ai_conversation',30,'day','user_deletion'),retained('retention.inactive_ai_conversation',12,'month','last_activity'),
  retained('retention.ai_metadata',30,'day','request_completion'),retained('retention.ai_debug',7,'day','debug_record_creation'),
  retained('retention.case_evidence',180,'day','case_closure'),retained('retention.admin_audit',1,'year','audit_creation'),
  retained('retention.auth_security',30,'day','security_event'),
  definition('retention.backup_rotation_days',90,{ type:'integer',minimum:1 },'Target requiring actual backup verification; not a measured guarantee.','provisional',all,'preserve_current_security_watermark'),
  definition('ui.supported_themes',['light','dark'],{ type:'array',items:{ enum:['light','dark'] },uniqueItems:true },'Theme choice stays local to the client.'),
  definition('plugins.protocol_version',1,{ const:1 },'Installed host protocol compatibility.','engineering'),
  definition('release.compatibility',{}, { type:'object',additionalProperties:{ type:'array',items:{ type:'string' } } },'Actual registered releases only.','engineering'),
  definition('sandbox.environments',['dev','test'],{ const:['dev','test'] },'Non-production validation environments.','engineering'),
];

export const safetyInvariants = Object.freeze({ current_authorization:true,ai_read_only:true,environment_isolation:true,required_audit:true,
  phone_change_restricted_actions:['phone.change','account.cancel','admin.roles.change','admin.keys.change','admin.security_config.change',
    'plugin.sensitive_permissions.approve','production.enable','purge.extra_permanent'] });

for (const entry of definitions) {
  if (entry.key.startsWith('ui.') || entry.key.startsWith('sharing.') || ['media.video_default','media.initially_muted'].includes(entry.key))
    entry.consumer_ids=[...entry.consumer_ids,'share'];
}
