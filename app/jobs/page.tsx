import {Shell} from '@/components/site-shell';
import {JobsList} from '@/components/jobs-list';
export const metadata={title:'Legal careers'};
export default function Jobs(){return <Shell><section className="page-hero"><p className="eyebrow gold">YOUR NEXT CHAPTER</p><h1>Legal careers.<br/><em>Personal possibilities.</em></h1><p>Explore our current recruitment briefs. Find a role that fits your experience, ambitions and way of working.</p></section><section className="page-content"><JobsList/><p className="small-print muted">Salary ranges depend on experience and the individual vacancy. Availability and full terms are confirmed before introduction.</p></section></Shell>}
