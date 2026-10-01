import {env} from 'cloudflare:workers';
import {specialisms,getJob} from '@/lib/jobs';
const fail=(error:string,status=400)=>Response.json({error},{status});
export async function POST(request:Request){
 let objectKey:string|undefined;
 try{
  const origin=request.headers.get('origin');if(!origin||new URL(origin).host!==new URL(request.url).host)return fail('Please submit from the Lawsearch website.',403);
  if(Number(request.headers.get('content-length')||0)>6*1024*1024)return fail('Please use a CV smaller than 5 MB.',413);
  if(!env.DB||!env.BUCKET)return fail('Applications are temporarily unavailable. Please email Lawsearch or try again later.',503);
  const form=await request.formData();if(form.get('website'))return fail('Unable to accept this submission.');
  const read=(key:string)=>typeof form.get(key)==='string'?String(form.get(key)).trim():'';
  const id=read('id'),name=read('name'),email=read('email'),phone=read('phone'),sector=read('sector'),location=read('location'),jobId=read('jobId'),message=read('message');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return fail('Please reload the form and try again.');
  if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||phone.length<5||phone.length>40||location.length<2||location.length>150||!specialisms.includes(sector)||message.length>3000||form.get('consent')!=='on')return fail('Please complete all required details and acknowledge the privacy notice.');
  if(jobId&&(!getJob(jobId)||getJob(jobId)?.sector!==sector))return fail('Please select the practice area for the chosen role.');
  const file=form.get('cv');if(!(file instanceof File)||!file.size||file.size>5*1024*1024)return fail('Attach a PDF, DOC or DOCX CV up to 5 MB.');
  const extension=file.name.split('.').pop()?.toLowerCase();if(!['pdf','doc','docx'].includes(extension||''))return fail('CVs must be PDF, DOC or DOCX files.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const magic=extension==='pdf'?new TextDecoder().decode(bytes.slice(0,5))==='%PDF-':extension==='doc'?bytes.slice(0,8).every((b,i)=>b===[208,207,17,224,161,177,26,225][i]):bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4;
  if(!magic)return fail('The CV content does not match its file type. Please export your CV again.');
  const exists=await env.DB.prepare('SELECT id FROM applications WHERE id = ?').bind(id).first();if(exists)return Response.json({reference:id.slice(0,8).toUpperCase()});
  const now=Date.now(),ip=request.headers.get('cf-connecting-ip')||'preview';const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+Math.floor(now/3600000)));const key=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  const limit=await env.DB.prepare('INSERT INTO submission_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count = count+1 RETURNING count').bind(key,now+3600000).first<{count:number}>();
  if((limit?.count||0)>6)return fail('Too many submissions. Please try again in an hour or contact Lawsearch by email.',429);
  await env.DB.prepare('DELETE FROM submission_limits WHERE expires < ?').bind(now).run();
  const filename=file.name.replace(/[^a-zA-Z0-9._ -]/g,'_').slice(-180);objectKey=`cvs/${id}.${extension}`;
  await env.BUCKET.put(objectKey,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
  await env.DB.prepare('INSERT INTO applications (id,name,email,phone,sector,location,job_id,message,filename,object_key,created_at,consent_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,name,email,phone,sector,location,jobId,message,filename,objectKey,now,'2026-10-01').run();
  return Response.json({reference:id.slice(0,8).toUpperCase()},{status:201});
 }catch(error){if(objectKey&&env.BUCKET)await env.BUCKET.delete(objectKey).catch(()=>{});console.error('Application submission failed',error);return fail('Your application could not be saved. Please try again or email Lawsearch. Your entered details have been kept.',503);}
}
