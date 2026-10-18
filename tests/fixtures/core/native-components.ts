import { readFileSync,existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve,dirname,relative } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Only native host elements are substituted. The actual component functions and React hooks run.
const require=createRequire(import.meta.url),cache=new Map<string,Record<string,unknown>>();
let scheme:'light'|'dark'='light';
export const nativeTheme=(value:'light'|'dark')=>{scheme=value;};
const hosts=Object.fromEntries(['ActivityIndicator','Image','KeyboardAvoidingView','Modal','Pressable','ScrollView','Text','TextInput','View'].map(name=>[name,name]));
export function nativeComponent(file:string):Record<string,unknown> {
  const full=resolve(file),path=relative(process.cwd(),full).replaceAll('\\','/');
  if(!/^(apps\/mobile\/src\/|packages\/design\/src\/)/.test(path))throw new Error('Native component fixture source outside its explicit scope');
  const previous=cache.get(full);if(previous)return previous;
  const module={exports:{} as Record<string,unknown>};cache.set(full,module.exports);
  const imported=(name:string):unknown=>{
    if(name==='react-native')return {...hosts,useColorScheme:()=>scheme,Platform:{OS:'android'},
      BackHandler:{addEventListener:()=>({remove:()=>{}})},StyleSheet:{create:(value:unknown)=>value,hairlineWidth:1}};
    if(name==='react-native-safe-area-context')return {SafeAreaView:'SafeAreaView'};
    if(name==='@expo/ui/jetpack-compose')return {Host:'Host',Button:'ComposeButton',Text:'ComposeText'};
    if(name==='react' || name==='react/jsx-runtime')return require(name);
    if(name.startsWith('.')) {
      if(name.endsWith('.png'))return {uri:name};
      const base=resolve(dirname(full),name),target=[base,base+'.ts',base+'.tsx'].find(candidate=>existsSync(candidate));
      if(target)return nativeComponent(target);
    }
    throw new Error('Unexpected native component import: '+name);
  };
  const output=ts.transpileModule(readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  runInNewContext(output,{module,exports:module.exports,require:imported},{filename:full});
  return module.exports;
}
