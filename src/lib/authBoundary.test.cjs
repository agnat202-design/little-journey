const assert=require('node:assert/strict'),vm=require('node:vm'),{build}=require('esbuild');
(async()=>{
let states=[],index=0,effect,listener,replaced='';
const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),useState(initial){const n=index++;if(!(n in states))states[n]=typeof initial==='function'?initial():initial;return[states[n],v=>states[n]=v];},useEffect(fn){effect=fn;}};
const session={user:{id:'account'}};
const testClient={auth:{onAuthStateChange(fn){listener=fn;return{data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session},error:null})}};
const code=(await build({entryPoints:['src/components/AuthBoundary.tsx'],bundle:true,write:false,platform:'node',format:'cjs',jsx:'transform',tsconfigRaw:{compilerOptions:{jsx:'react'}},external:['react'],define:{'import.meta.env':'{}'},plugins:[{name:'stubs',setup(build){build.onLoad({filter:/[\\/]lib[\\/]supabase.ts$/},()=>({contents:'export const getSupabaseClient=()=>testClient;',loader:'ts'}));build.onLoad({filter:/[\\/](App|HouseholdGate).tsx$/},args=>({contents:'export default function '+(args.path.endsWith('App.tsx')?'App':'HouseholdGate')+'(){return null;}',loader:'tsx'}));}}]})).outputFiles[0].text;
const moduleStub={exports:{}};
vm.runInNewContext(code,{module:moduleStub,exports:moduleStub.exports,require:()=>React,React,testClient,URL,URLSearchParams,window:{location:{href:'https://example.com/?error=access_denied&keep=1#error_description=old',search:'?error=access_denied&keep=1',hash:'#error_description=old'},history:{state:null,replaceState(_s,_t,url){replaced=url;}}}});
const render=()=>{index=0;return moduleStub.exports.default();};const text=t=>!t?'':typeof t!=='object'?String(t):(t.props.children||[]).flat(Infinity).map(text).join('');
(async()=>{assert.ok(text(render()).includes('Login dibatalkan'));effect();await new Promise(r=>setImmediate(r));const signed=render();assert.ok(!text(signed).includes('Login dibatalkan'));assert.ok(!text(signed).includes('Keluar'));assert.ok(replaced.includes('keep=1'));assert.ok(!replaced.includes('error'));listener('SIGNED_IN',session);render();listener('SIGNED_OUT',null);assert.ok(!text(render()).includes('Login dibatalkan'));console.log('PASS auth boundary: stale OAuth error cleared on session restore/sign-in, URL cleaned, no signed-in banner, no stale error after logout');})().catch(e=>{console.error(e);process.exitCode=1;});

})().catch(e=>{console.error(e);process.exitCode=1;});
