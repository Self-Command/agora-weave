import {createServer} from 'node:http';
import {execFile} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import process from 'node:process';
import {Buffer} from 'node:buffer';
import {TextDecoder} from 'node:util';
import {setTimeout,clearTimeout} from 'node:timers';

const prefix='/core/api/v1',origins=new Set(['http://127.0.0.1:3000','http://localhost:3000']);
const uuid='[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}';
const routes=[
  [/^\/feeds\/latest$/,['GET']], [new RegExp(`^/posts/${uuid}$`,'i'),['GET']],
  [/^\/posts$/,['POST']], [new RegExp(`^/posts/${uuid}/comments$`,'i'),['GET','POST']],
  [new RegExp(`^/profiles/${uuid}$`,'i'),['GET']], [/^\/me\/profile$/,['PATCH']],
  [new RegExp(`^/profiles/${uuid}/contents$`,'i'),['GET']],
  [/^\/reports$/,['POST']], [/^\/me\/reports$/,['GET']],
  [/^\/uploads$/,['POST']],
  [new RegExp(`^/uploads/${uuid}/parts/0$`,'i'),['PUT']],
  [new RegExp(`^/uploads/${uuid}/complete$`,'i'),['POST']],
  [new RegExp(`^/media/${uuid}$`,'i'),['GET']],
  [new RegExp(`^/resources/${uuid}/likes$`,'i'),['GET','PUT','DELETE']],
  [/^\/auth\/(challenges|verify|refresh|logout)$/,['POST']],
  [/^\/auth\/dev-test-login$/,['POST']],
  [/^\/auth\/password(?:\/(captcha|forgot))?$/,['POST']],
  [new RegExp(`^/auth/operations/${uuid}$`,'i'),['POST']],
  [/^\/documents\/current$/,['GET']], [/^\/me\/sessions$/,['GET']],
  [new RegExp(`^/me/blocks/${uuid}$`,'i'),['PUT','DELETE']],
  [new RegExp(`^/me/sessions/${uuid}$`,'i'),['DELETE']],
  [/^\/recovery-cases$/,['POST']], [new RegExp(`^/(recovery-cases|operations)/${uuid}$`,'i'),['GET']],
  [/^\/admin\/(session|accounts)$/,['GET']], [/^\/admin\/mfa\/factors$/,['GET','POST']],
  [/^\/admin\/(mfa\/(challenges|verify)|stepup)$/,['POST']],
  [/^\/admin\/config\/definitions$/,['GET']], [/^\/admin\/config\/(previews|releases|rollbacks)$/,['POST']],
  [/^\/admin\/(contents|cases)$/,['GET']],
  [new RegExp(`^/admin/revisions/${uuid}/decision-previews$`,'i'),['POST']],
  [new RegExp(`^/admin/revisions/${uuid}/decision$`,'i'),['POST']],
];
const headersFor=origin=>({'content-type':'application/json; charset=utf-8','cache-control':'no-store',
  'x-content-type-options':'nosniff',...(origin?{'access-control-allow-origin':origin,vary:'Origin'}:{})});
const write=(response,status,body,origin)=>{if(!response.destroyed&&!response.writableEnded) response.writeHead(status,headersFor(origin)).end(body);};
const fail=(response,status,code,origin)=>write(response,status,JSON.stringify({code}),origin);
const duplicate=(request,name)=>request.rawHeaders.filter((value,index)=>index%2===0&&value.toLowerCase()===name).length>1;
function target(raw) {
  if(typeof raw!=='string'||raw.length>4096||!raw.startsWith(prefix+'/')||/[\\#\s]/.test(raw)) return null;
  const pathname=raw.split('?')[0];
  if(pathname.includes('%')||pathname.includes('//')||pathname.split('/').some(part=>part==='.'||part==='..')) return null;
  const path=pathname.slice(prefix.length),route=routes.find(([pattern])=>pattern.test(path));
  return route?{path:raw,methods:route[1],password:/^\/auth\/password(?:\/(captcha|forgot))?$/.test(path),
    media:/^\/media\//.test(path),binary:/^\/uploads\/.+\/parts\/0$/.test(path)}:null;
}
function bodyOf(request,binary=false) {
  return new Promise((resolve,reject)=>{
    let size=0,parts=[],done=false;
    const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);request.removeListener('data',data);
      request.removeListener('end',end);request.removeListener('error',bad);request.removeListener('aborted',bad);
      if(error){request.resume();reject(error);}else resolve(value);};
    const bad=()=>finish(400),data=chunk=>{size+=chunk.length;if(size>(binary?10000000:16384))finish(413);else parts.push(chunk);};
    const end=()=>{try {
      const bytes=Buffer.concat(parts);
      if(binary) return finish(bytes.length?null:400,bytes);
      const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes),value=JSON.parse(text);
      if(!value||typeof value!=='object'||Array.isArray(value))return finish(400);
      finish(null,text);
    }catch{finish(400);}finally{parts=[];}};
    const timer=setTimeout(()=>finish(408),10000);
    request.on('data',data).once('end',end).once('error',bad).once('aborted',bad);
  });
}

/** Loopback-only development transport. /status proves process readiness only.
 * The production core remains responsible for identity, ownership and all business decisions.
 */
export function createLocalCoreApi({environment,forward}) {
  if(!['dev','test'].includes(environment)||typeof forward!=='function')throw new Error('Invalid local core API configuration');
  let active=0;
  const server=createServer(async(request,response)=>{
    const host=request.headers.host,origin=request.headers.origin;
    const hostname=typeof host==='string'&&/^(127\.0\.0\.1|localhost|\[::1\]|10\.0\.2\.2)(?::([0-9]{1,5}))?$/.exec(host);
    if(!hostname||hostname[2]&&(Number(hostname[2])!==request.socket.localPort)||duplicate(request,'host')||
      duplicate(request,'origin')||origin!==undefined&&!origins.has(origin))return fail(response,403,'FORBIDDEN');
    if(request.url==='/status'&&request.method==='GET')return write(response,200,JSON.stringify({ready:true,environment}),origin);
    const route=target(request.url);
    if(!route)return fail(response,404,'NOT_FOUND',origin);
    if(request.method==='OPTIONS') {
      const desired=request.headers['access-control-request-method'],requested=request.headers['access-control-request-headers'];
      if(!origin||!route.methods.includes(desired)||typeof requested==='string'&&requested.split(',').some(name=>
        !['authorization','content-type','x-client-release','x-operation-id'].includes(name.trim().toLowerCase())))return fail(response,403,'FORBIDDEN',origin);
      response.writeHead(204,{...headersFor(origin),'access-control-allow-methods':desired,
        'access-control-allow-headers':'Authorization, Content-Type, X-Client-Release, X-Operation-Id'}).end();return;
    }
    if(!route.methods.includes(request.method))return fail(response,405,'METHOD_NOT_ALLOWED',origin);
    if(active>=4)return fail(response,503,'SERVICE_UNAVAILABLE',origin);
    const authorization=request.headers.authorization,release=request.headers['x-client-release'];
    if(duplicate(request,'authorization')||authorization!==undefined&&(typeof authorization!=='string'||authorization.length>8192||
      !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authorization))||duplicate(request,'x-client-release')||
      release!==undefined&&(typeof release!=='string'||!/^[-\w.]{1,128}$/.test(release)))return fail(response,400,'INVALID_INPUT',origin);
    const operation=request.headers['x-operation-id'];
    if(route.binary && (duplicate(request,'x-operation-id') || typeof operation!=='string' ||
      !new RegExp(`^${uuid}$`,'i').test(operation)))return fail(response,400,'INVALID_INPUT',origin);
    const passwordHeaders={};
    if(route.password) {
      const proof=[['x-admin-password-time',/^\d{10}$/],['x-admin-password-nonce',new RegExp(`^${uuid}$`,'i')],['x-admin-password-signature',/^[a-f0-9]{64}$/]];
      const present=proof.some(([name])=>request.headers[name]!==undefined);
      if(present&&origin)return fail(response,403,'FORBIDDEN',origin);
      for(const [name,pattern] of proof) {
        const value=request.headers[name];
        if(duplicate(request,name)||present&&(typeof value!=='string'||value.trim()!==value||!pattern.test(value)))return fail(response,400,'INVALID_INPUT',origin);
        if(present)passwordHeaders[name]=value;
      }
    }
    const declared=request.headers['content-length'];
    if(duplicate(request,'content-length')||declared!==undefined&&(!/^\d+$/.test(declared)||Number(declared)>(route.binary?10000000:16384)))return fail(response,413,'REQUEST_TOO_LARGE',origin);
    const writing=request.method==='POST'||request.method==='PUT'||request.method==='PATCH'||request.method==='DELETE';
    if(writing&&!(route.binary?request.headers['content-type']==='application/octet-stream':
      /^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type']||''))||
      !writing&&(request.headers['transfer-encoding']||declared!==undefined&&Number(declared)>0))return fail(response,400,'INVALID_INPUT',origin);
    active++;
    try {
      let body;
      if(writing)try{body=await bodyOf(request,route.binary);}catch(status){return fail(response,Number(status),'INVALID_INPUT',origin);}
      const headers={accept:route.media?'image/*':'application/json',
        'content-type':route.binary?'application/octet-stream':'application/json',
        ...(authorization?{authorization}:{}),...(release?{'x-client-release':release}:{}),
        ...(route.binary?{'x-operation-id':operation,'content-length':String(body.length)}:{}),...passwordHeaders};
      let timer;
      try {
        const result=await Promise.race([Promise.resolve().then(()=>forward({path:route.path,method:request.method,headers,body,media:route.media,binary:route.binary})),
          new Promise((_resolve,reject)=>{timer=setTimeout(()=>reject(new Error('Unavailable')),25000);})]);
        if(route.media) {
          if(!result || ![200,206].includes(result.status) || !Buffer.isBuffer(result.body) ||
            result.body.length<1 || result.body.length>10000000 || !result.headers ||
            !/^image\/(?:jpeg|png|webp|avif)$/.test(result.headers['content-type']||'')) {
            const code=result?.status===401?'SESSION_INVALID':result?.status===404?'NOT_FOUND':'SERVICE_UNAVAILABLE';
            return fail(response,code==='SESSION_INVALID'?401:code==='NOT_FOUND'?404:503,code,origin);
          }
          response.writeHead(200,{...headersFor(origin),'content-type':result.headers['content-type'],
            'content-length':String(result.body.length),'content-security-policy':"sandbox; default-src 'none'",
            'x-robots-tag':'noindex'}).end(result.body);
          return;
        }
        if(!result||!Number.isInteger(result.status)||result.status<200||result.status>=300&&result.status<400||result.status>599||
          typeof result.body!=='string'||Buffer.byteLength(result.body,'utf8')>1048576)throw new Error('Unavailable');
        const parsed=JSON.parse(result.body);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Unavailable');
        write(response,result.status,result.body,origin);
      }catch{fail(response,503,'SERVICE_UNAVAILABLE',origin);}finally{clearTimeout(timer);}
    }finally{active--;}
  });
  server.requestTimeout=10000;server.headersTimeout=10000;server.maxHeadersCount=40;
  const listen=server.listen.bind(server);
  // Do not let a manager or embedding caller accidentally bind a public interface.
  server.listen=(port=0,callback)=>{
    if(!Number.isInteger(port)||port<0||port>65535||callback!==undefined&&typeof callback!=='function')throw new Error('Loopback port required');
    return listen({port,host:'127.0.0.1'},callback);
  };
  return server;
}

// Curl config is data on stdin; never a shell command, argv secret or logging payload.
const curlQuote=value=>'"'+String(value).replaceAll('\\','\\\\').replaceAll('"','\\"').replaceAll('\r','\\r').replaceAll('\n','\\n').replaceAll('\t','\\t')+'"';
export function curlRequestConfig(url,method,headers,body,include=false) {
  return [`url = ${curlQuote(url)}`,`request = ${curlQuote(method)}`,
    'globoff','silent','show-error','max-time = 20',`max-filesize = ${include?10000000:1048576}`,
    ...(include?['include']:[]),'write-out = "\\n%{http_code}"',
    ...Object.entries(headers).map(([name,value])=>`header = ${curlQuote(name+': '+value)}`),
    ...(body===undefined?[]:[`data = ${curlQuote(body)}`])].join('\n')+'\n';
}
async function main() {
  const port=Number(process.argv[2]),environment=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT;
  if(!/^\d{4,5}$/.test(process.argv[2]||'')||port<1024||port>65535||process.argv.length!==3||process.env.AGORAWEAVE_EXECUTION_SOURCE!=='local')throw new Error('Local configuration required');
  const {readLocalRuntime}=await import('../ci/local-services.ts'),{coreComposeArguments}=await import('../ci/core-database.ts');
  const runtime=readLocalRuntime();
  if(runtime.environment!==environment)throw new Error('Local configuration required');
  const key=readFileSync(runtime.environment_file,'utf8').split(/\r?\n/).find(line=>line.startsWith('ANON_KEY='))?.slice(9);
  if(!key||!/^[-\w.]{16,8192}$/.test(key))throw new Error('Local configuration required');
  const server=createLocalCoreApi({environment,forward:({path,method,headers,body,media,binary})=>new Promise((resolve,reject)=>{
    const config=curlRequestConfig('http://api-gw:8000/functions/v1'+path,method,{apikey:key,...headers},binary?undefined:body,media);
    const binaryScript=`set -eu
cfg=$(mktemp)
payload=$(mktemp)
trap 'rm -f "$cfg" "$payload"' EXIT
IFS= read -r size
case "$size" in ''|*[!0-9]*) exit 1;; esac
dd bs=1 count="$size" of="$cfg" 2>/dev/null
cat > "$payload"
printf 'data-binary = "@%s"\\n' "$payload" >> "$cfg"
curl --config "$cfg"`;
    const command=binary?['sh','-c',binaryScript]:['curl','--config','-'];
    const child=execFile('docker',[...coreComposeArguments(),'exec','-T','db',...command],
      {encoding:media?undefined:'utf8',timeout:25000,maxBuffer:media?10500000:1048581,windowsHide:true},(error,stdout)=>{
        if(error)return reject(new Error('Unavailable'));
        if(media) {
          if(!Buffer.isBuffer(stdout))return reject(new Error('Unavailable'));
          const headerEnd=stdout.indexOf(Buffer.from('\r\n\r\n'));
          const end=stdout.lastIndexOf(10);
          if(headerEnd<0||end<headerEnd+4||!/^\d{3}$/.test(stdout.subarray(end+1).toString('ascii')))
            return reject(new Error('Unavailable'));
          const head=stdout.subarray(0,headerEnd).toString('latin1');
          const status=Number(stdout.subarray(end+1).toString('ascii'));
          const type=/^content-type:\s*([^\r\n;]+)/im.exec(head)?.[1]?.trim().toLowerCase();
          return resolve({status,headers:{'content-type':type},body:stdout.subarray(headerEnd+4,end)});
        }
        const end=stdout.lastIndexOf('\n'),status=stdout.slice(end+1);
        if(end<0||!/^\d{3}$/.test(status))return reject(new Error('Unavailable'));
        resolve({status:Number(status),body:stdout.slice(0,end)});
      });
    child.stdin.on('error',()=>{});
    if(binary) {
      const configBytes=Buffer.from(config,'utf8');
      child.stdin.write(Buffer.from(String(configBytes.length)+'\n'));
      child.stdin.write(configBytes);
      child.stdin.end(body);
    } else child.stdin.end(config);
  })});
  server.on('error',()=>{process.stderr.write('Local core API unavailable\n');process.exitCode=1;});
  server.listen(port);
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)void main().catch(()=>{process.stderr.write('Local core API unavailable\n');process.exitCode=1;});
