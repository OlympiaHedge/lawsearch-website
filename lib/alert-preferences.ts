import type {Job} from './jobs';
import {specialisms,normaliseSector} from './practice-areas';
// Retain existing subscription values when adding the expanded practice coverage.
export const alertRoles=[...new Set(['Residential conveyancing','Commercial property / real estate','Criminal defence','Private client','Family law','Corporate','Commercial','Licensed conveyancer','Conveyancing solicitor',...specialisms])];
export const alertAreas=['Fully remote','London','Romford','Manchester','St Ives','Nottingham','Leicester','Trowbridge','Cirencester','Birmingham','Bristol','Leeds','Liverpool','Sheffield','Newcastle','Cambridge','Oxford','Reading','Southampton','Cardiff','Clifton','Office location to be agreed','UK','US','UAE','New York','Washington, DC','Boston','Chicago','Los Angeles','San Francisco','Dubai','Abu Dhabi'];
export function jobRole(job:Job){
 if(/licensed conveyancer/i.test(job.title))return 'Licensed conveyancer';
 if(/conveyancing solicitor/i.test(job.title))return 'Conveyancing solicitor';
 if(job.sector==='Residential Property')return 'Residential conveyancing';
 return ({'Commercial Property / Real Estate':'Commercial property / real estate','Criminal Defence':'Criminal defence','Private Client':'Private client','Family Law':'Family law'} as Record<string,string>)[job.sector]||job.sector;
}
export function jobArea(job:Job){if(/fully remote/i.test(job.work+' '+job.location))return 'Fully remote';return alertAreas.filter(a=>!['Fully remote','UK','US','UAE'].includes(a)).find(a=>job.location.toLowerCase().includes(a.toLowerCase()))||job.location.split(' · ')[0];}
export function matches(job:Job,role:string,area:string){
 const sector=role==='Residential conveyancing'?'Residential Property':normaliseSector(role);
 const roleMatches=jobRole(job).toLowerCase()===role.toLowerCase()||job.practiceAreas.some(p=>p.toLowerCase()===sector.toLowerCase());
 return roleMatches&&(jobArea(job)===area||job.country===area);
}
