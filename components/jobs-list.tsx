'use client';
import {useEffect,useState} from 'react';
import {jobs} from '@/lib/jobs';
import {practiceAreas,countries,countryLabels,findPractice} from '@/lib/practice-areas';
import {filterJobs,jobSearchParams,readJobFilters,type JobFilters} from '@/lib/job-search';
import {JobCard} from './job-card';
const emptyFilters:JobFilters={practice:'',country:'',setting:'',query:'',all:false};
export function JobsList(){
 const [filters,setFilters]=useState<JobFilters>(emptyFilters);
 useEffect(()=>{const sync=()=>setFilters(readJobFilters(new URLSearchParams(window.location.search)));sync();window.addEventListener('popstate',sync);return ()=>window.removeEventListener('popstate',sync);},[]);
 function update(next:JobFilters,push=false){setFilters(next);const search=jobSearchParams(next);window.history[push?'pushState':'replaceState']({},'',`/jobs${search?'?'+search:''}`);}
 const selected=findPractice(filters.practice);
 const filtered=filterJobs(jobs,filters);
 const showResults=!!selected||filters.all;
 const registration=new URLSearchParams();if(selected)registration.set('practice',selected.slug);if(filters.country)registration.set('country',filters.country);if(filters.setting)registration.set('setting',filters.setting);
 return <>
  <div className="section-heading board-heading"><div><p className="eyebrow gold-dark">EXPLORE BY EXPERTISE</p><h2>{showResults?'Your opportunities.':'Choose your practice area.'}</h2></div>{showResults?<button className="text-link reset-link" onClick={()=>update({...filters,practice:'',all:false},true)}>← All practice areas</button>:<button className="text-link reset-link" onClick={()=>update({...filters,all:true},true)}>View all {jobs.length} opportunities →</button>}</div>
  <div className="filters opportunity-filters">
   <div className="field"><label htmlFor="country">Market</label><select id="country" value={filters.country} onChange={e=>update({...filters,country:e.target.value})}><option value="">All markets</option>{countries.map(c=><option key={c} value={c}>{countryLabels[c]}</option>)}</select></div>
   <div className="field"><label htmlFor="setting">Organisation</label><select id="setting" value={filters.setting} onChange={e=>update({...filters,setting:e.target.value})}><option value="">Law firms & in-house</option><option>Private practice</option><option>In-house</option></select></div>
   <div className="field"><label htmlFor="search">Role, expertise or location</label><input id="search" type="search" maxLength={150} placeholder="e.g. London, partner or conveyancer" value={filters.query} onChange={e=>update({...filters,query:e.target.value})}/></div>
  </div>
  {!showResults?<><div className="practice-picker">{practiceAreas.map((area,i)=>{const count=filterJobs(jobs,{...filters,practice:area.slug}).length;const query=jobSearchParams({...filters,practice:area.slug});return <a key={area.slug} className="practice-card" href={`/jobs?${query}`} onClick={e=>{if(e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();update({...filters,practice:area.slug},true);}}}><span className="eyebrow muted">{String(i+1).padStart(2,'0')} / {area.group}</span><h3>{area.name}</h3><span className="practice-count">{count?`${count} ${count===1?'opportunity':'opportunities'}`:'Register your interest'}<span aria-hidden="true">↗</span></span></a>})}</div><p className="small-print muted">Counts reflect your selected market, organisation and search. Confidential searches may also be discussed directly with our team.</p></>:<>
   <div className="results-heading"><div><p className="eyebrow gold-dark">{selected?.name||'ALL PRACTICE AREAS'}</p><p className="result-count" aria-live="polite">{filtered.length} {filtered.length===1?'advertised opportunity':'advertised opportunities'}{filters.country?` · ${countryLabels[filters.country]}`:''}</p></div><button className="text-link reset-link" onClick={()=>update({...emptyFilters,practice:filters.practice,all:filters.all})}>Clear filters</button></div>
   {filtered.length?<div className="jobs-grid">{filtered.map(job=><JobCard job={job} key={job.id}/>)}</div>:<div className="empty"><p className="eyebrow gold-dark">YOUR NEXT MOVE</p><h2>A conversation opens possibilities.</h2><p>No advertised opportunities currently match these preferences. Tell us about your experience and ambitions for a confidential discussion.</p><div className="actions empty-actions"><a className="button" href={`/apply?${registration.toString()}`}>Register your interest</a><a className="button outline" href="/contact">Speak with Lawsearch</a></div></div>}
  </>}
 </>;
}
