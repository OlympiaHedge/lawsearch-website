export const practiceAreas = [
  {slug:'corporate-commercial', name:'Corporate & Commercial', group:'Business & finance', description:'Mergers and acquisitions, corporate advisory, governance and commercial contracts. Introductions shaped around transactional experience, sector knowledge and commercial judgement.'},
  {slug:'banking-finance', name:'Banking & Finance', group:'Business & finance', description:'Lending, structured finance, capital markets and financial services legal teams. Opportunities for lawyers advising on complex transactions and the legal needs of financial institutions.'},
  {slug:'private-equity-funds', name:'Private Equity & Investment Funds', group:'Business & finance', description:'Private equity transactions, fund formation, investment management and portfolio advisory. Career conversations built around your technical experience and investment-sector interests.'},
  {slug:'litigation-arbitration', name:'Litigation & International Arbitration', group:'Disputes & advisory', description:'Commercial disputes, contentious advisory and domestic and international arbitration. We look at the nature of your practice, your clients and the platform you want to build.'},
  {slug:'regulatory-compliance', name:'Regulatory, Compliance & Investigations', group:'Disputes & advisory', description:'Financial regulation, business compliance, enforcement and investigations. Recruitment for lawyers working at the intersection of legal advice, governance and commercial risk.'},
  {slug:'employment-pensions', name:'Employment & Pensions', group:'Disputes & advisory', description:'Employment advisory, workplace disputes, incentives and pensions. We explore opportunities across specialist practices, full-service firms and in-house teams.'},
  {slug:'technology-ip-data', name:'Technology, IP & Data Protection', group:'Business & finance', description:'Technology transactions, intellectual property, privacy and data protection. Connections for lawyers advising innovative businesses and navigating evolving commercial and regulatory questions.'},
  {slug:'energy-infrastructure', name:'Energy, Infrastructure & Projects', group:'Business & finance', description:'Energy, construction, infrastructure and project development. We discuss the sectors, transactions and international exposure that matter to your next appointment.'},
  {slug:'tax', name:'Tax', group:'Business & finance', description:'Corporate, transactional and private wealth tax. Introductions informed by your advisory experience, client base and the technical focus of your practice.'},
  {slug:'restructuring-insolvency', name:'Restructuring & Insolvency', group:'Disputes & advisory', description:'Restructuring, insolvency, distressed transactions and related disputes. A considered approach to appointments across law firms and commercial legal teams.'},
  {slug:'residential-property', name:'Residential Property', group:'Property & private practice', description:'Residential conveyancing, secured lending and property team leadership. We recruit solicitors, licensed conveyancers, legal executives and experienced fee-earners.'},
  {slug:'commercial-property', name:'Commercial Property / Real Estate', group:'Property & private practice', description:'Real estate investment, development, commercial leasing and property finance. We consider your transaction experience, sector interests and ambitions for your client relationships.'},
  {slug:'private-client', name:'Private Client', group:'Property & private practice', description:'Wills, probate, trusts, estate planning, Court of Protection and contentious probate. Opportunities for lawyers supporting individuals, families and private wealth clients.'},
  {slug:'family-law', name:'Family Law', group:'Property & private practice', description:'Divorce, financial remedies, children matters and wider family practice. We take time to understand the work, support and environment that will suit you.'},
  {slug:'criminal-defence', name:'Criminal Defence', group:'Disputes & advisory', description:'Criminal defence, police station work, court advocacy and business crime. Clear conversations about caseloads, duty commitments, progression and working arrangements.'},
  {slug:'immigration', name:'Immigration', group:'Disputes & advisory', description:'Business immigration, individual applications and immigration litigation. Introductions aligned with your jurisdictional experience, client focus and career priorities.'},
];
export const specialisms = practiceAreas.map(area => area.name);
export const countries = ['UK', 'US', 'UAE'] as const;
export const countryLabels: Record<string,string> = {UK:'United Kingdom', US:'United States', UAE:'United Arab Emirates'};
export function findPractice(value:string){
  return practiceAreas.find(area => area.slug === value || area.name === value);
}
// Keep previously loaded forms and saved registrations compatible with the new categories.
export function normaliseSector(value:string){
  if(value==='Property')return 'Residential Property';
  if(value==='Corporate'||value==='Commercial')return 'Corporate & Commercial';
  return findPractice(value)?.name || value;
}
export function isApplicationSector(value:string){return specialisms.includes(normaliseSector(value));}
