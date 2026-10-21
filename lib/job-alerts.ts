
import {env} from 'cloudflare:workers';
import {jobs,salaryEstimateNote} from './jobs';
import {matches} from './alert-preferences';
import {retryApplicationNotifications} from './application-notifications';
const settings=()=>env as unknown as {DB?:D1Database;RESEND_API_KEY?:string;ALERT_FROM_EMAIL?:string;ALERT_AUTOMATION_ENABLED?:string};
export function alertsReady(){const e=settings();return !!e.DB&&!!e.RESEND_API_KEY&&!!e.ALERT_FROM_EMAIL&&e.ALERT_AUTOMATION_ENABLED==='true';}
export function alertDB(){const db=settings().DB;if(!db)throw Error('Alert storage unavailable');return db;}
export async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(n=>n.toString(16).padStart(2,'0')).join('');}
export const token=()=>crypto.randomUUID()+crypto.randomUUID();
const base='https://law-search.co.uk';
export async function sendEmail(to:string,subject:string,text:string,key:string,unsubscribe?:string,options?:{attachments?:{filename:string;content:string}[];replyTo?:string}){const e=settings();if(!e.RESEND_API_KEY||!e.ALERT_FROM_EMAIL)throw Error('Email sending is not connected');const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${e.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:e.ALERT_FROM_EMAIL,to:[to],subject,text,reply_to:options?.replyTo||'jacob.fisher@hamptonhillsgroup.com',...(options?.attachments?{attachments:options.attachments}:{}),...(unsubscribe?{headers:{'List-Unsubscribe':`<${base}/api/job-alerts/unsubscribe?token=${unsubscribe}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}}:{})})});if(!response.ok)throw Error('Email provider declined the request');}
export type Subscription={id:string;email:string;phone:string;role:string;area:string;baseline:string;unsubscribe_token:string;created_at:number;status:string;confirmed_at:number};
export async function dispatchAlerts(){await retryApplicationNotifications();if(!alertsReady())return {ready:false,sent:0,reason:'Connect the email sender and scheduled updater before enabling alerts.'};const db=alertDB();const ownerQueue=await db.prepare("SELECT * FROM alert_subscriptions WHERE status IN ('active','pending') AND created_at>? AND NOT EXISTS (SELECT 1 FROM alert_deliveries d WHERE d.id='owner:'||alert_subscriptions.id||':'||alert_subscriptions.created_at AND d.sent_at IS NOT NULL) ORDER BY created_at LIMIT 20").bind(Date.now()-7*86400000).all<Subscription>();for(const signup of ownerQueue.results){try{await notifyOwner(signup);}catch{}}await db.prepare("DELETE FROM alert_subscriptions WHERE status='pending' AND created_at < ?").bind(Date.now()-7*86400000).run();const {results}=await db.prepare("SELECT * FROM alert_subscriptions WHERE status='active' ORDER BY id").all<Subscription>();let sent=0,failed=0;
for(const s of results){const old=new Set<string>(JSON.parse(s.baseline));for(const j of jobs){if(old.has(j.id)||!matches(j,s.role,s.area))continue;const id=s.id+':'+j.id;const previous=await db.prepare('SELECT sent_at,attempted_at FROM alert_deliveries WHERE id=?').bind(id).first<{sent_at:number|null;attempted_at:number}>();if(previous?.sent_at)continue;if(previous&&Date.now()-previous.attempted_at>23*3600000){failed++;continue;}if(sent+failed>=50)return {ready:true,sent,failed,more:true};await db.prepare('INSERT OR IGNORE INTO alert_deliveries (id,subscription_id,job_id,attempted_at) VALUES (?,?,?,?)').bind(id,s.id,j.id,Date.now()).run();const active=await db.prepare("SELECT id FROM alert_subscriptions WHERE id=? AND status='active'").bind(s.id).first();if(!active)continue;try{await sendEmail(s.email,`New ${j.title} role: ${j.location}`,`A new role matches your Lawsearch job alert.

${j.title}
${j.location}
${j.salaryEstimated?'Estimated base salary: ':''}${j.salary} per annum${j.salaryEstimated?'\n'+salaryEstimateNote:''}
${j.work}

${j.summary}

View the role and apply: ${base}/jobs/${j.id}

You're receiving this because you requested ${s.role} alerts for ${s.area}.
Unsubscribe: ${base}/job-alerts/unsubscribe?token=${s.unsubscribe_token}`,id,s.unsubscribe_token);await db.prepare('UPDATE alert_deliveries SET sent_at=? WHERE id=?').bind(Date.now(),id).run();sent++;}catch{failed++;}}
}return {ready:true,sent,failed};}

export async function notifyOwner(s:{id:string;email:string;phone:string;role:string;area:string;created_at:number;status:string}){const db=alertDB();const key=`owner:${s.id}:${s.created_at}`;const existing=await db.prepare('SELECT sent_at,attempted_at FROM alert_deliveries WHERE id=?').bind(key).first<{sent_at:number|null;attempted_at:number}>();if(existing?.sent_at)return;if(existing&&Date.now()-existing.attempted_at>23*3600000)return;await db.prepare('INSERT OR IGNORE INTO alert_deliveries (id,subscription_id,job_id,attempted_at) VALUES (?,?,?,?)').bind(key,s.id,'__owner_signup__',Date.now()).run();await sendEmail('jacob.fisher@hamptonhillsgroup.com',`New Lawsearch job alert: ${s.role} — ${s.area}`,`A visitor requested a Lawsearch job alert.\n\nEmail: ${s.email}\nPhone: ${s.phone}\nRoles: ${s.role}\nArea: ${s.area}\nEmail confirmation status: ${s.status}\n\nThey agreed to matching email alerts and calls about relevant roles. No texts.\n\nLawsearch | law-search.co.uk`,key);await db.prepare('UPDATE alert_deliveries SET sent_at=? WHERE id=?').bind(Date.now(),key).run();}
