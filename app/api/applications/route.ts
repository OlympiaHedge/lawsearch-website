import {env} from 'cloudflare:workers';
import {getJob} from '@/lib/jobs';
import {isApplicationSector,normaliseSector} from '@/lib/practice-areas';
import {applicationEmailReady,notifyApplication} from '@/lib/application-notifications';
const fail=(error:string,status=400)=>Response.json({error},{status});
const maxFile=5*1024*1024,maxTotal=10*1024*1024;
export async function POST(request:Request){
 const storedKeys:string[]=[];let saved=false;
 try{
  const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return fail('Please submit from the Lawsearch website.',403);
  if(Number(request.headers.get('content-length')||0)>maxTotal+1024*1024)return fail('Please keep all documents under 10 MB in total.',413);
  if(!env.DB||!env.BUCKET||!applicationEmailReady())return fail('Applications are temporarily unavailable. Please email jacob.fisher@hamptonhillsgroup.com or try again later.',503);
  const form=await request.formData();if(form.get('website'))return fail('Unable to accept this submission.');
  const read=(key:string)=>typeof form.get(key)==='string'?String(form.get(key)).trim():'';
  const id=read('id'),name=read('name'),email=read('email'),phone=read('phone'),sector=read('sector'),location=read('location'),jobId=read('jobId'),message=read('message');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return fail('Please reload the form and try again.');
  if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||/[\r\n]/.test(name+email)||email.length>254||phone.length<5||phone.length>40||location.length<2||location.length>150||!isApplicationSector(sector)||message.length>3000||form.get('consent')!=='on')return fail('Please complete all required details and acknowledge the privacy notice.');
  if(jobId&&(!getJob(jobId)||getJob(jobId)?.sector!==normaliseSector(sector)))return fail('Please select the practice area for the chosen role.');
  const cv=form.get('cv'),supporting=form.getAll('documents').filter(f=>!(f instanceof File&&f.size===0&&f.name===''));
  if(!(cv instanceof File)||!cv.size)return fail('Attach a PDF, DOC or DOCX CV up to 5 MB.');
  if(supporting.length>3)return fail('Attach up to three supporting documents.');
  const files=[cv,...supporting];let total=0;const uploads=[];
  for(const [index,file] of files.entries()){
   if(!(file instanceof File)||!file.size||file.size>maxFile)return fail('Each document must be a PDF, DOC or DOCX up to 5 MB.');
   total+=file.size;if(total>maxTotal)return fail('Please keep all documents under 10 MB in total.');
   const extension=file.name.split('.').pop()?.toLowerCase();if(!['pdf','doc','docx'].includes(extension||''))return fail('Documents must be PDF, DOC or DOCX files.');
   const bytes=new Uint8Array(await file.arrayBuffer());
   const magic=extension==='pdf'?new TextDecoder().decode(bytes.slice(0,5))==='%PDF-':extension==='doc'?bytes.length>=8&&bytes.slice(0,8).every((b,i)=>b===[208,207,17,224,161,177,26,225][i]):bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4;
   if(!magic)return fail('A document does not match its file type. Please export it again.');
   uploads.push({bytes,filename:file.name.replace(/[^a-zA-Z0-9._ -]/g,'_').slice(-180),key:index===0?`cvs/${id}.${extension}`:`applications/${id}/${index}.${extension}`});
  }
  const reference=id.slice(0,8).toUpperCase();
  const exists=await env.DB.prepare('SELECT id FROM applications WHERE id = ?').bind(id).first();
  if(exists){await notifyApplication(id);return Response.json({reference});}
  const now=Date.now(),ip=request.headers.get('cf-connecting-ip')||'preview';const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+Math.floor(now/3600000)));const key=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  const limit=await env.DB.prepare('INSERT INTO submission_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count = count+1 RETURNING count').bind(key,now+3600000).first<{count:number}>();
  if((limit?.count||0)>6)return fail('Too many submissions. Please try again in an hour or contact Lawsearch by email.',429);
  await env.DB.prepare('DELETE FROM submission_limits WHERE expires < ?').bind(now).run();
  for(const upload of uploads){await env.BUCKET.put(upload.key,upload.bytes,{httpMetadata:{contentType:'application/octet-stream'}});storedKeys.push(upload.key);}
  const first=uploads[0];
  await env.DB.batch([
   env.DB.prepare('INSERT INTO applications (id,name,email,phone,sector,location,job_id,message,filename,object_key,created_at,consent_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,name,email,phone,sector,location,jobId,message,first.filename,first.key,now,'2026-10-17'),
   ...uploads.slice(1).map(f=>env.DB!.prepare('INSERT INTO application_documents (object_key,application_id,filename) VALUES (?,?,?)').bind(f.key,id,f.filename)),
   env.DB.prepare('INSERT INTO application_notifications (application_id) VALUES (?)').bind(id)
  ]);
  saved=true;
  await notifyApplication(id);
  return Response.json({reference},{status:201});
 }catch{
  if(!saved&&storedKeys.length&&env.DB){try{const existing=await env.DB.prepare('SELECT id FROM applications WHERE id=?').bind(storedKeys[0].split('/')[1].split('.')[0]).first();saved=!!existing;}catch{saved=true;}}
  if(!saved&&env.BUCKET)for(const key of storedKeys)await env.BUCKET.delete(key).catch(()=>{});
  return fail(saved?'Your application and documents are saved, but the email could not be confirmed. Please press submit again to retry delivery, or contact jacob.fisher@hamptonhillsgroup.com.':'We could not confirm your submission. Your entered details have been kept. Please try again or email jacob.fisher@hamptonhillsgroup.com.',503);
 }
}
