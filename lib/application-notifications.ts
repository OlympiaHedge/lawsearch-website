import {env} from 'cloudflare:workers';
import {getJob} from './jobs';
import {sendEmail} from './job-alerts';

export const applicationRecipient='jacob.fisher@hamptonhillsgroup.com';
export type ApplicationRecord={id:string;name:string;email:string;phone:string;sector:string;location:string;job_id:string;message:string;filename:string;object_key:string;created_at:number};
export type ApplicationDocument={filename:string;object_key:string};
export function applicationEmailReady(){const e=env as unknown as {RESEND_API_KEY?:string;ALERT_FROM_EMAIL?:string};return !!e.RESEND_API_KEY&&!!e.ALERT_FROM_EMAIL;}

export async function notifyApplication(id:string){
 if(!env.DB||!env.BUCKET)throw Error('Application storage unavailable');
 const db=env.DB,now=Date.now();
 const state=await db.prepare('SELECT sent_at,attempted_at FROM application_notifications WHERE application_id=?').bind(id).first<{sent_at:number|null;attempted_at:number|null}>();
 if(state?.sent_at)return;
 // Resend retains idempotency keys for 24 hours. Preserve uncertain older sends for manual review.
 if(state?.attempted_at&&now-state.attempted_at>23*3600000)throw Error('Delivery requires manual review');
 const a=await db.prepare('SELECT * FROM applications WHERE id=?').bind(id).first<ApplicationRecord>();
 if(!a)throw Error('Application unavailable');
 const documents=await db.prepare('SELECT filename,object_key FROM application_documents WHERE application_id=? ORDER BY object_key').bind(id).all<ApplicationDocument>();
 const attachments=[];
 for(const document of [{filename:a.filename,object_key:a.object_key},...documents.results]){
  const object=await env.BUCKET.get(document.object_key);if(!object)throw Error('Application document unavailable');
  const bytes=new Uint8Array(await object.arrayBuffer());let binary='';
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  attachments.push({filename:document.filename,content:btoa(binary)});
 }
 await db.prepare('INSERT INTO application_notifications (application_id,attempted_at) VALUES (?,?) ON CONFLICT(application_id) DO UPDATE SET attempted_at=COALESCE(application_notifications.attempted_at,excluded.attempted_at)').bind(id,now).run();
 const job=getJob(a.job_id),reference=id.slice(0,8).toUpperCase();
 const subject=job?`Lawsearch application: ${job.title} (${job.id.toUpperCase()}) — ${a.name}`:`Lawsearch CV registration — ${a.name}`;
 const text=[job?'New job application':'New CV registration',`Reference: ${reference}`,`Submitted: ${new Date(a.created_at).toISOString()}`,'',`Name: ${a.name}`,`Email: ${a.email}`,`Phone: ${a.phone}`,`Location: ${a.location}`,`Practice area: ${a.sector}`,`Role: ${job?`${job.title} — ${job.location} (${job.id.toUpperCase()})`:'General CV registration'}`,'','Candidate message:',a.message||'(No message supplied)','','Uploaded documents:',...attachments.map(f=>f.filename),'','The CV and all supporting documents are attached.','Lawsearch | https://law-search.co.uk'].join('\n');
 try{
  await sendEmail(applicationRecipient,subject,text,`application:${id}`,undefined,{attachments,replyTo:a.email});
  await db.prepare("UPDATE application_notifications SET sent_at=?,last_error=NULL WHERE application_id=?").bind(Date.now(),id).run();
 }catch{
  await db.prepare("UPDATE application_notifications SET last_error='Email delivery was not confirmed' WHERE application_id=?").bind(id).run();
  throw Error('Application email delivery was not confirmed');
 }
}

export async function retryApplicationNotifications(){
 if(!env.DB)throw Error('Application storage unavailable');
 const {results}=await env.DB.prepare('SELECT application_id FROM application_notifications WHERE sent_at IS NULL AND (attempted_at IS NULL OR attempted_at>?) ORDER BY application_id LIMIT 10').bind(Date.now()-23*3600000).all<{application_id:string}>();
 let sent=0,failed=0;for(const row of results){try{await notifyApplication(row.application_id);sent++;}catch{failed++;}}
 return {sent,failed};
}
