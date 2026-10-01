import Link from 'next/link';
import {jobs} from '@/lib/jobs';
export function JobCard({job}:{job:typeof jobs[number]}){return <article className="job-card"><div className="job-top"><span className="eyebrow">{job.sector}</span><span className="tag">Permanent</span></div><h3><Link href={`/jobs/${job.id}`}>{job.title}</Link></h3><p className="location">{job.location}</p><p className="salary">{job.salary}<span> per annum</span></p><p className="work">{job.work}</p><Link className="text-link" href={`/jobs/${job.id}`}>View opportunity</Link></article>}
