'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'CO2_Evidence_Ledger_RC6_STAGE.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Script RC6 not found');new vm.Script(script);
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',files:[],hidden:false,listeners:{},addEventListener(k,v){this.listeners[k]=v;},reset(){},classList:{toggle(){}},appendChild(){},remove(){}});return elements.get(id)}
const storage=new Map();const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const document={getElementById:el,querySelectorAll(){return []},createElement(){return{click(){},remove(){}}},body:{appendChild(){}}};
class TestFormData { constructor(form){this.fields=form.fields;} get(k){return this.fields[k]??null;} }
const window={print(){}};const sandbox={window,document,localStorage,crypto:webcrypto,TextEncoder,Blob,structuredClone,console,Date,Number,Math,Array,Set,Map,JSON,String,Error,URL,FormData:TestFormData,confirm:()=>true,setTimeout:()=>{}};
vm.createContext(sandbox);new vm.Script(script).runInContext(sandbox);const t=window.CO2LabTest;
const checks=[];
async function test(name,fn){let passed=false,detail='';try{passed=!!await fn()}catch(e){detail=String(e)}checks.push({name,passed,detail});if(!passed)console.log('FAIL',name,detail);}
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const p={id:id(1),name:'Piloto TEST',org:'Organización ficticia',intervention:'Caso sintético',created:'2026-11-19T04:00:00.000Z'};
const f={id:id(2),name:'Factor no oficial TEST',value:2.5,unit:'litro',uncertainty:0,source:'Hipótesis sintética',year:2026,scope:'1'};
const ff={id:id(3),name:'Factor electricidad TEST',value:0.2,unit:'kWh',uncertainty:0,source:'Factor sintético',year:2026,scope:'2'};
const a={id:id(4),projectId:p.id,factorId:f.id,period:'baseline',date:'2026-01-01',quantity:1000,unit:'litro',uncertainty:0,provenance:'Estimación',reference:'Ejemplo sintético'};
const b={id:id(5),projectId:p.id,factorId:ff.id,period:'baseline',date:'2026-01-01',quantity:500,unit:'kWh',uncertainty:0,provenance:'Estimación',reference:'Ejemplo sintético'};
const e={id:id(6),projectId:p.id,filename:'factura-SINTETICA.txt',kind:'Factura',description:'NO REAL',hash:'0'.repeat(64),size:17,created:'2026-11-19T04:00:00.000Z'};
const sc={id:id(7),projectId:p.id,factorId:ff.id,baseline:1000,intervention:500,uncertainty:0,assumption:'Caso contrafactual sintético',created:'2026-11-19T04:00:00.000Z'};
async function ledger(d){let i=30;for(const collection of ['projects','factors','activities','scenarios','evidences'])for(const record of d[collection]){const recordSnapshot=JSON.stringify(record),prev=d.events.at(-1)?.hash||'GENESIS';const evt={id:id(i++),ts:'2026-11-19T05:00:00.000Z',action:'create',entity:collection,recordId:record.id,prev,recordHash:await t.sha256(recordSnapshot),recordSnapshot};evt.hash=await t.sha256(JSON.stringify(t.eventInput(evt)));d.events.push(evt);}return d;}
async function main(){
  const evidenceBytes=fs.readFileSync(path.join(root,'tests','fixtures','factura-SINTETICA.txt'));
  e.hash=await t.sha256(evidenceBytes.toString('utf8'));e.size=evidenceBytes.length;
  const demo=await ledger({...t.blank(),projects:[p],factors:[f,ff],activities:[a,b],scenarios:[sc],evidences:[e]});
  const clone=x=>JSON.parse(JSON.stringify(x));
  await test('Sintaxis JS RC6 válida',()=>!!script);
  await test('Versión RC6 independiente de RC5',()=>t.version==='co2-evidence-rc6');
  await test('Leyenda sin blockchain ni certificación',()=>html.includes('sin cadena de bloques distribuida')&&html.includes('sin certificación'));
  await test('Sin llamadas externas automáticas',()=>!(/\bfetch\s*\(|XMLHttpRequest\b|WebSocket\b/.test(script)));
  await test('RC6 inicializa interfaz',()=>el('metrics').innerHTML.includes('Proyectos'));
  await test('RC6 vacío es estructuralmente válido',()=>t.validate(t.blank())===true);
  await test('RC6 válido y cadena correcta',async()=>{const x=await t.verifyLedger(demo);return x.ok&&x.events===7&&x.records===7&&x.externalAnchor===false});
  await test('RC6 suma emisiones 2,6 t sintético',()=>((t.computeActivity(a,demo).kg+t.computeActivity(b,demo).kg)/1000)===2.6);
  await test('Conversión energía 1 MWh a kWh',()=>t.convert(1,'MWh','kWh')===1000);
  await test('Rechaza unidades incompatibles',()=>{try{t.convert(10,'kWh','litro');return false}catch{return true}});
  await test('Escenario de 100 kg hipotéticos',()=>t.calcScenario(sc,demo).difference===100);
  await test('Rechaza fecha imposible 2026-02-30',()=>!t.validate({...demo,activities:[{...a,date:'2026-02-30'},b]}));
  await test('Acepta bisiesto 2024-02-29',()=>t.validate({...demo,activities:[{...a,date:'2024-02-29'},b]}));
  await test('Rechaza actividad de unidad incompatible',()=>!t.validate({...demo,activities:[{...a,unit:'kWh'},b]}));
  await test('Rechaza IDs repetidos',()=>!t.validate({...demo,projects:[p,p]}));
  await test('Rechaza factor negativo',()=>!t.validate({...demo,factors:[{...f,value:-1},ff]}));
  await test('Rechaza factor infinito',()=>!t.validate({...demo,factors:[{...f,value:Infinity},ff]}));
  await test('Rechaza factor sin fuente',()=>!t.validate({...demo,factors:[{...f,source:''},ff]}));
  await test('Rechaza SHA de evidencia inválido',()=>!t.validate({...demo,evidences:[{...e,hash:'xyz'}]}));
  await test('Rechaza modificación de un registro',async()=>{let x=clone(demo);x.projects[0].name='alterado';return !(await t.verifyLedger(x)).ok});
  await test('Rechaza modificación de la huella del registro',async()=>{let x=clone(demo);x.events[0].recordHash='f'.repeat(64);return !(await t.verifyLedger(x)).ok});
  await test('Rechaza modificación de la huella del evento',async()=>{let x=clone(demo);x.events[0].hash='a'.repeat(64);return !(await t.verifyLedger(x)).ok});
  await test('Rechaza alteración de registro histórico',async()=>{let x=clone(demo);x.events[0].recordSnapshot='{}';return !(await t.verifyLedger(x)).ok});
  await test('Rechaza reordenación de eventos',async()=>{let x=clone(demo);[x.events[1],x.events[2]]=[x.events[2],x.events[1]];return !(await t.verifyLedger(x)).ok});
  await test('Rechaza eliminación de evento intermedio',async()=>{let x=clone(demo);x.events.splice(2,1);return !(await t.verifyLedger(x)).ok});
  await test('Rechaza eliminación de un registro final',async()=>{let x=clone(demo);x.evidences=[];return !(await t.verifyLedger(x)).ok});
  await test('Rechaza evento duplicado',async()=>{let x=clone(demo);x.events.push({...x.events[0],id:id(999)});return !(await t.verifyLedger(x)).ok});
  await test('Rechaza proyecto huérfano',async()=>{let x=clone(demo);x.activities[0].projectId='inexistente';return !(await t.verifyLedger(x)).ok});
  await test('Rechaza referencia de factor inexistente',async()=>{let x=clone(demo);x.activities[0].factorId='inexistente';return !(await t.verifyLedger(x)).ok});
  await test('Rechaza falta de un evento de creación',async()=>{let x=clone(demo);x.events=[];return !(await t.verifyLedger(x)).ok});
  await test('Rechaza versión RC5 tratada como RC6',async()=>!(await t.verifyLedger({...demo,version:'co2-evidence-rc5'})).ok);
  await test('Migración RC5 etiqueta origen y no declara historia verificada',async()=>{let l=clone(demo);l.version='co2-evidence-rc5';l.events=[];const migrated=await t.migrateLegacy(l);const ver=await t.verifyLedger(migrated);return ver.ok&&migrated.migration.origin==='RC5'&&migrated.migration.originalEventCount===0;});
  await test('Migración RC5 inválida se rechaza',async()=>{try{await t.migrateLegacy({version:'co2-evidence-rc5',projects:[]});return false}catch{return true}});
  await test('Comprobador de afirmaciones evita certificación',()=>t.assessment('dummy','scenario').conclusion.includes('no se autoriza'));
  await test('Exportación conserva JSON de cadena local',()=>script.includes('JSON.stringify(db,null,2)'));
  await test('Mecanismo CSV anti-formulas sigue presente',()=>script.includes("/^[\\x00-\\x20]*[=+@\\-]/"));
  // Exercise import event against a synthetic tampered file; storage must not mutate.
  const previous=storage.get('co2blockchain-evidence-rc6');
  let bad=clone(demo);bad.projects[0].name='CAMBIADO';el('importJSON').files=[{size:JSON.stringify(bad).length,text:async()=>JSON.stringify(bad)}];
  await el('importButton').listeners.click();
  await test('Importación manipulada NO modifica almacenamiento',()=>storage.get('co2blockchain-evidence-rc6')===previous&&el('status').textContent.includes('rechazada'));
  // Valid import
  el('importJSON').files=[{size:JSON.stringify(demo).length,text:async()=>JSON.stringify(demo)}];
  await el('importButton').listeners.click();
  await test('Importación válida persiste datos',()=>JSON.parse(storage.get('co2blockchain-evidence-rc6')).projects.length===1);
  await test('Verificación local posterior a importación',async()=> (await t.verifyLedger(JSON.parse(storage.get('co2blockchain-evidence-rc6')))).ok);
  // Actual UI listener -> commit -> localStorage -> verification.
  let didReset=false;
  await el('projectForm').listeners.submit({preventDefault(){},target:{fields:{name:'Otro proyecto TEST',org:'Ficticia',intervention:'Prueba de formulario'},reset(){didReset=true;}}});
  await test('Formulario real de alta persiste nueva entidad',()=>JSON.parse(storage.get('co2blockchain-evidence-rc6')).projects.length===2);
  await test('Formulario completo limpia campos tras alta',()=>didReset);
  await test('Formulario añade evento SHA-256 verificable',async()=>{const next=JSON.parse(storage.get('co2blockchain-evidence-rc6'));return next.events.length===8 && (await t.verifyLedger(next)).ok;});
  // Simulate refresh and verify persistence without writing.
  await test('Persistencia JSON soporta recarga lógica',async()=>{const snapshot=JSON.parse(storage.get('co2blockchain-evidence-rc6'));return snapshot.projects.some(p=>p.name==='Otro proyecto TEST') && (await t.verifyLedger(snapshot)).ok;});

  // Report
  const report={scope:'RC6 Node VM unit/integration harness, localStorage simulated; no browser E2E or remote services',timestamp:new Date().toISOString(),pass:checks.filter(x=>x.passed).length,fail:checks.filter(x=>!x.passed).length,checks};
  fs.writeFileSync(path.join(root,'tests','results.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(root,'tests','synthetic_rc6.json'),JSON.stringify(demo,null,2));
  fs.writeFileSync(path.join(root,'tests','synthetic_tampered_rc6.json'),JSON.stringify({...demo,projects:[{...p,name:'MANIPULADO'}]},null,2));
  console.log('SUMMARY',report.pass+'/'+checks.length,'passed;',report.fail,'failed');if(report.fail)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
