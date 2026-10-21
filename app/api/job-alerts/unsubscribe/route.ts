
import {alertDB,hash} from '@/lib/job-alerts';
export async function POST(req:Request){try{const url=new URL(req.url);const data=await req.formData();const value=String(url.searchParams.get('token')||data.get('token')||'');if(!/^[a-f0-9-]{72}$/.test(value))return Response.json({error:'Invalid link.'},{status:400});const db=alertDB();
await db.prepare("DELETE FROM alert_deliveries WHERE subscription_id IN (SELECT id FROM alert_subscriptions WHERE unsubscribe_hash=?)").bind(await hash(value)).run();await db.prepare('DELETE FROM alert_subscriptions WHERE unsubscribe_hash=?').bind(await hash(value)).run();return Response.json({message:'You have been unsubscribed from this job alert.'});}catch{return Response.json({error:'Unable to process this request. Please try again.'},{status:503});}}
