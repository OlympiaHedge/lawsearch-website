
'use client';
import {useState} from 'react';
export function AlertAction({action,token}:{action:'confirm'|'unsubscribe';token:string}){const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);return <>{message?<p role="status">{message}</p>:<button className="button" disabled={busy||!token} onClick={async()=>{setBusy(true);try{const form=new FormData();form.set('token',token);const r=await fetch('/api/job-alerts/'+action,{method:'POST',body:form});const d=await r.json() as {message?:string;error?:string};setMessage(d.message||d.error||'Please try again.');}catch{setMessage('Unable to complete this request. Please try again later.');}finally{setBusy(false);}}}>{busy?'Please wait…':action==='confirm'?'Confirm job alerts':'Unsubscribe'}</button>}</>;}
