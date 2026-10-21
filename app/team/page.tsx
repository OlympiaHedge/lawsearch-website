import {Shell} from '@/components/site-shell';
import {companyPhone,companyPhoneHref,companyLinkedIn,team} from '@/lib/team';

export const metadata = {
  title: 'Meet the team',
  description: 'Meet the people behind Lawsearch: Jacob Fisher, Rachael Griffiths, Daniel Muchui and Patrick Guest. Legal search and relationships across the UK, UAE and US.',
};

export default function Team() {
  return <Shell>
    <section className="page-hero">
      <p className="eyebrow gold">THE PEOPLE BEHIND LAWSEARCH</p>
      <h1>Shared ambition.<br/><em>Personal commitment.</em></h1>
      <p>Meet the people building lasting relationships with lawyers, law firms and legal teams across the UK, UAE and US.</p>
    </section>
    <section className="page-content" aria-label="Lawsearch team">
      <div className="section-heading team-intro"><div><p className="eyebrow gold-dark">MEET THE TEAM</p><h2>Experience behind<br/><em>every conversation.</em></h2></div><p>Specialist recruitment, thoughtful candidate engagement and the operational expertise that supports every appointment.</p></div>
      <div className="team-grid">
        {team.map(person => <article className="team-card" key={person.email}>
          <div className="team-card-heading"><span className="team-initials" aria-hidden="true">{person.initials}</span><p className="eyebrow gold-dark">{person.focus}</p></div>
          <h2>{person.name}</h2>
          <p className="team-role">{person.role}</p>
          <div className="team-biography">{person.biography.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div>
          <a className="text-link team-email" href={`mailto:${person.email}`}>{person.email}</a>
        </article>)}
      </div>
      <section className="team-linkedin" aria-labelledby="linkedin-heading">
        <div className="linkedin-community"><span className="linkedin-mark" aria-hidden="true">in</span><p className="eyebrow gold">OUR LINKEDIN COMMUNITY</p><p className="linkedin-number">4,000<span>approximately</span></p><p>Legal followers.<br/>Conversations that move careers forward.</p></div>
        <div className="linkedin-copy"><p className="eyebrow gold">STAY CONNECTED WITH LAWSEARCH</p><h2 id="linkedin-heading">Legal insight.<br/><em>Your next opportunity.</em></h2><p>Join our community of around 4,000 legal followers on LinkedIn. Follow the Lawsearch company page for the latest legal news, market perspectives and legal positions with leading law firms and in-house teams.</p><p>Whether you are considering your next move or keeping an eye on the market, stay connected to the conversations and opportunities shaping the profession.</p><a className="button gold-button" href={companyLinkedIn} target="_blank" rel="noopener noreferrer">Follow Lawsearch on LinkedIn <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>
      </section>
      <div className="team-phone">
        <div><h2>Prefer a conversation?</h2><p>Call Lawsearch to speak with our team.</p></div>
        <a className="button" href={companyPhoneHref}>{companyPhone}</a>
      </div>
    </section>
  </Shell>;
}
