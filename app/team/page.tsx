import {Shell} from '@/components/site-shell';
import {companyPhone, companyPhoneHref, team} from '@/lib/team';

export const metadata = {
  title: 'Meet the team',
  description: 'Meet the Lawsearch team and contact our recruitment, candidate engagement, finance and operations specialists.',
};

export default function Team() {
  return <Shell>
    <section className="page-hero">
      <p className="eyebrow gold">THE PEOPLE BEHIND LAWSEARCH</p>
      <h1>Meet the team.<br/><em>A personal connection.</em></h1>
      <p>Speak directly with the people supporting your next career move, your next hire and our day-to-day operations.</p>
    </section>
    <section className="page-content" aria-label="Lawsearch team">
      <div className="team-grid">
        {team.map(person => <article className="team-card" key={person.email}>
          <span className="team-initials" aria-hidden="true">{person.initials}</span>
          <h2>{person.name}</h2>
          <p className="team-role">{person.role}</p>
          <a className="text-link team-email" href={`mailto:${person.email}`}>{person.email}</a>
        </article>)}
      </div>
      <div className="team-phone">
        <div><h2>Prefer a conversation?</h2><p>Call Lawsearch to speak with our team.</p></div>
        <a className="button" href={companyPhoneHref}>{companyPhone}</a>
      </div>
    </section>
  </Shell>;
}
