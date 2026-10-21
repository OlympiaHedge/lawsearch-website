import {JobAlertForm} from './job-alert-form';
import {jobArea,jobRole} from '@/lib/alert-preferences';
import {jobs} from '@/lib/jobs';
export function JobCard({job}:{job:typeof jobs[number]}){return <article className="job-card"><div className="job-top"><span className="eyebrow">{job.practiceAreas.join(' · ')}</span><span className="tag">Permanent</span></div><h3><a href={`/jobs/${job.id}`}>{job.title}</a></h3><p className="location">{job.location}</p><p className="salary">{job.salary}{/£|\$|AED/.test(job.salary)&&<span> per annum</span>}</p><p className="work">{job.work}</p><a className="text-link" href={`/jobs/${job.id}`}>View opportunity</a><JobAlertForm id={job.id} role={jobRole(job)} area={jobArea(job)}/></article>}
