import Link from 'next/link';
import {Shell} from '@/components/site-shell';
import {companyPhone, companyPhoneHref, team} from '@/lib/team';

export const metadata={title:'Contact Lawsearch'};

export default function Contact(){return <Shell>
  <section className="page-hero"><p className="eyebrow gold">LET’S TALK</p><h1>A conversation today.<br/><em>A new possibility tomorrow.</em></h1><p>Whether you’re planning your next career move or your next appointment, we’d like to hear from you.</p></section>
  <section className="page-content"><div className="content-grid">
    <div className="prose">
      <h2>Speak with our recruiters.</h2>
      {team.filter(person => person.initials === 'JF' || person.initials === 'DM').map(person => <div className="recruiter-contact" key={person.email}>
        <h3>{person.name}</h3><p>{person.role}</p>
        <a className="text-link team-email" href={`mailto:${person.email}`}>{person.email}</a>
      </div>)}
      <h3>A time that suits you</h3><p>Email us with your preferred times and a few details about what you’d like to discuss. We can arrange a phone or Teams conversation.</p>
      <Link className="text-link" href="/team">Meet the full team</Link>
      <h3>Looking for your next role?</h3><p>Send your CV securely with your location and career preferences.</p><Link className="button" style={{marginTop:22}} href="/apply">Register your CV</Link>
    </div>
    <aside className="contact-box"><h3>LawSearch Talent Ltd</h3><p>Part of Hampton Hills Group</p><p><a href={companyPhoneHref}>{companyPhone}</a></p><p>101 Victoria Avenue<br/>Bloxwich<br/>WS3 3EJ</p><p className="muted">Recruiting across England and Wales.<br/>Meetings by arrangement.</p></aside>
  </div></section>
</Shell>}
