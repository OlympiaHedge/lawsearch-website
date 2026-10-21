import {registerHooks} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import test,{beforeEach} from 'node:test';
const root=new URL('../',import.meta.url);
registerHooks({resolve(specifier,context,next){
 if(specifier==='cloudflare:workers')return {url:'data:text/javascript,export const env=globalThis.__applicationTestEnv',shortCircuit:true};
 if(specifier==='@/lib/admin')return {url:'data:text/javascript,export async function isRecruiter(){return false}',shortCircuit:true};
 if(specifier.startsWith('@/'))return next(new URL(specifier.slice(2)+'.ts',root).href,context);
 if(specifier.startsWith('.')&&context.parentURL?.endsWith('.ts')){const url=new URL(specifier+'.ts',context.parentURL);if(existsSync(fileURLToPath(url)))return next(url.href,context);}
 return next(specifier,context);
}});
const env=globalThis.__applicationTestEnv={};
const {POST}=await import('../app/api/applications/route.ts');
const {POST:retry}=await import('../app/api/applications/retry/route.ts');
const {GET:download}=await import('../app/api/cv/[id]/route.ts');
const {jobs,specialisms}=await import('../lib/jobs.ts');
const {notifyApplication,retryApplicationNotifications}=await import('../lib/application-notifications.ts');
let sqlite,objects,sends,decline;
beforeEach(()=>{
 sqlite=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('drizzle/',root)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('drizzle/'+f,root),'utf8'));
 objects=new Map();sends=[];decline=false;
 env.DB={prepare(sql){let args=[];const statement={bind(...values){args=values;return statement;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return sqlite.prepare(sql).run(...args);}};return statement;},async batch(statements){sqlite.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 env.BUCKET={async put(key,bytes){objects.set(key,bytes);},async get(key){const b=objects.get(key);return b?{async arrayBuffer(){return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}}:null;},async delete(key){objects.delete(key);}};
 env.RESEND_API_KEY='test-secret';env.ALERT_FROM_EMAIL='Lawsearch <jacob.fisher@hamptonhillsgroup.com>';
 globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');sends.push({payload:JSON.parse(init.body),key:init.headers['Idempotency-Key']});return new Response(JSON.stringify(decline?{error:'unavailable'}:{id:'test-email'}),{status:decline?503:200});};
});
function form({id=crypto.randomUUID(),job,documents=[],cv=new File(['%PDF-1.7\nTest CV'],'candidate.pdf'),...overrides}={}){const f=new FormData();for(const [key,value] of Object.entries({id,name:'Test Candidate',email:'test@example.com',phone:'07700900000',location:'London',sector:job?.sector||specialisms[0],jobId:job?.id||'',message:'Test application only',consent:'on',...overrides}))f.set(key,value);f.set('cv',cv);for(const file of documents)f.append('documents',file);return f;}
function request(f,origin='https://law-search.co.uk'){return new Request('https://law-search.co.uk/api/applications',{method:'POST',headers:{origin},body:f});}
const count=table=>sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
test('CV registration sends full details and exact CV bytes to Jacob',async()=>{const r=await POST(request(form()));assert.equal(r.status,201);assert.equal(count('applications'),1);assert.deepEqual(sends[0].payload.to,['jacob.fisher@hamptonhillsgroup.com']);assert.equal(sends[0].payload.reply_to,'test@example.com');assert.match(sends[0].payload.text,/Test Candidate[\s\S]*07700900000[\s\S]*London/);assert.equal(Buffer.from(sends[0].payload.attachments[0].content,'base64').toString(),'%PDF-1.7\nTest CV');});
test('job application includes selected role, CV and every supporting file',async()=>{const documents=[new File(['%PDF-1.7 Cover'],'cover.pdf'),new File([new Uint8Array([80,75,3,4,1])],'portfolio.docx'),new File([new Uint8Array([208,207,17,224,161,177,26,225,1])],'letter.doc')];const r=await POST(request(form({job:jobs[0],documents})));assert.equal(r.status,201);assert.match(sends[0].payload.subject,new RegExp(jobs[0].id.toUpperCase()));assert.equal(sends[0].payload.attachments.length,4);assert.equal(count('application_documents'),3);for(const document of documents){const attachment=sends[0].payload.attachments.find(a=>a.filename===document.name);assert.deepEqual(Buffer.from(attachment.content,'base64'),Buffer.from(await document.arrayBuffer()));}});
test('duplicate submission sends once and keeps original documents',async()=>{const id=crypto.randomUUID();assert.equal((await POST(request(form({id})))).status,201);assert.equal((await POST(request(form({id})))).status,200);assert.equal(sends.length,1);assert.equal(count('applications'),1);assert.equal(objects.size,1);});
test('provider failure retains files, reports failure and safely retries same id',async()=>{const id=crypto.randomUUID();decline=true;assert.equal((await POST(request(form({id})))).status,503);assert.equal(objects.size,1);assert.equal(count('applications'),1);assert.equal(sqlite.prepare('SELECT sent_at FROM application_notifications').get().sent_at,null);decline=false;assert.equal((await POST(request(form({id})))).status,200);assert.equal(sends[0].key,sends[1].key);assert.deepEqual(sends[0].payload,sends[1].payload);assert.ok(sqlite.prepare('SELECT sent_at FROM application_notifications').get().sent_at);});
test('queued failures can be retried by the delivery helper',async()=>{decline=true;await POST(request(form()));decline=false;assert.deepEqual(await retryApplicationNotifications(),{sent:1,failed:0});});
test('unconfirmed sends past the idempotency window are preserved for review',async()=>{decline=true;const id=crypto.randomUUID();await POST(request(form({id})));sqlite.prepare('UPDATE application_notifications SET attempted_at=?').run(Date.now()-24*3600000);await assert.rejects(notifyApplication(id),/manual review/);assert.equal(sends.length,1);assert.equal(objects.size,1);});
test('invalid files, excessive counts and oversized files send nothing',async()=>{for(const options of [{cv:new File(['fake'],'fake.pdf')},{cv:new File([new Uint8Array([208])],'short.doc')},{cv:new File(['%PDF-'+ 'a'.repeat(5*1024*1024)],'large.pdf')},{documents:Array.from({length:4},()=>new File(['%PDF-test'],'extra.pdf'))}])assert.equal((await POST(request(form(options)))).status,400);assert.equal(sends.length,0);assert.equal(objects.size,0);});
test('total upload size is enforced even without Content-Length',async()=>{const doc=()=>new File(['%PDF-'+ 'a'.repeat(4*1024*1024)],'extra.pdf');assert.equal((await POST(request(form({cv:doc(),documents:[doc(),doc()]})))).status,400);assert.equal(sends.length,0);});
test('foreign origins and missing email configuration are rejected before storage',async()=>{assert.equal((await POST(request(form(),'https://other.test'))).status,403);delete env.RESEND_API_KEY;assert.equal((await POST(request(form()))).status,503);assert.equal(count('applications'),0);});
test('private downloads and retry endpoints reject anonymous visitors',async()=>{assert.equal((await retry(request(form()))).status,403);assert.equal((await download(new Request('https://law-search.co.uk/api/cv/test'),{params:Promise.resolve({id:'test'})})).status,403);});
test('new commercial practice registrations reach the existing inbox',async()=>{const r=await POST(request(form({sector:'Banking & Finance'})));assert.equal(r.status,201);assert.match(sends[0].payload.text,/Banking & Finance/);assert.deepEqual(sends[0].payload.to,['jacob.fisher@hamptonhillsgroup.com']);});
test('previously loaded Property forms still accept the selected vacancy',async()=>{const job=jobs.find(j=>j.id==='ls-003');assert.equal((await POST(request(form({job,sector:'Property'})))).status,201);});
test('a practice mismatch or unknown category cannot submit a vacancy application',async()=>{assert.equal((await POST(request(form({job:jobs[0],sector:'Banking & Finance'})))).status,400);assert.equal((await POST(request(form({sector:'Unknown practice'})))).status,400);assert.equal(sends.length,0);});
