import type {Job} from './jobs';
import {findPractice,normaliseSector,countries} from './practice-areas';
export type JobFilters={practice:string;country:string;setting:string;query:string;all:boolean};
export function readJobFilters(params:URLSearchParams):JobFilters{
 const raw=params.get('practice')||'';
 const practice=findPractice(raw)?.slug||findPractice(normaliseSector(raw))?.slug||'';
 const country=params.get('country')||'';
 const setting=params.get('setting')||'';
 return {practice,country:countries.some(c=>c===country)?country:'',setting:['Private practice','In-house'].includes(setting)?setting:'',query:(params.get('q')||'').slice(0,150),all:params.get('view')==='all'};
}
export function jobSearchParams(filters:JobFilters){
 const params=new URLSearchParams();
 if(filters.practice)params.set('practice',filters.practice);
 if(filters.country)params.set('country',filters.country);
 if(filters.setting)params.set('setting',filters.setting);
 if(filters.query)params.set('q',filters.query);
 if(filters.all&&!filters.practice)params.set('view','all');
 return params.toString();
}
export function filterJobs(jobs:Job[],filters:JobFilters){
 const area=findPractice(filters.practice);
 const words=filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return jobs.filter(job=>(!area||job.practiceAreas.includes(area.name))&&(!filters.country||job.country===filters.country)&&(!filters.setting||job.setting===filters.setting)&&words.every(word=>`${job.title} ${job.location} ${job.sector} ${job.summary} ${job.work}`.toLowerCase().includes(word)));
}
