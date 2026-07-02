import { demoPeople, getPerson } from './demoUsers';

const now = new Date();
export const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();
export const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
export const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

const img = (seed: string, w = 800, h = 400) => {
  // picsum's numeric /id/{n} space has gaps (some ids 404), so a hashed id
  // can point at a missing image. The /seed/{string}/... endpoint hashes
  // the seed itself and always resolves to a valid deterministic image.
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
};

// ─── COMMUNITIES (exactly 5 — one per global city) ─────────────────────────
const communityDefs = [
  { name: 'Hyderabad Community', slug: 'hyderabad-community', cat: 'Regional', city: 'Hyderabad', country: 'India', img: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=800&h=400&fit=crop&auto=format&q=70', members: 4820, posts: 1240, desc: 'Connect with people across Hyderabad — share local news, events and stories from the City of Pearls.' },
  { name: 'Tokyo Community', slug: 'tokyo-community', cat: 'Regional', city: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop&auto=format&q=70', members: 6310, posts: 1890, desc: 'A vibrant hub for Tokyo residents and fans of Japanese culture, food and technology.' },
  { name: 'New York Community', slug: 'new-york-community', cat: 'Regional', city: 'New York', country: 'USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop&auto=format&q=70', members: 7250, posts: 2150, desc: 'The meeting place for New Yorkers — neighbourhoods, events and everything in the Big Apple.' },
  { name: 'London Community', slug: 'london-community', cat: 'Regional', city: 'London', country: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop&auto=format&q=70', members: 5680, posts: 1670, desc: 'From the West End to Camden — connect with Londoners and explore life across the UK capital.' },
  { name: 'Sydney Community', slug: 'sydney-community', cat: 'Regional', city: 'Sydney', country: 'Australia', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=400&fit=crop&auto=format&q=70', members: 4190, posts: 1130, desc: 'Beaches, harbours and good vibes — the home for Sydney locals and Australia explorers.' },
];

export const allCommunities = communityDefs.map((c, i) => ({
  id: `community-${String(i + 1).padStart(3, '0')}`,
  slug: c.slug,
  name: c.name,
  description: c.desc,
  city: c.city,
  country: c.country,
  categoryId: `cat-${c.cat.toLowerCase()}`,
  category: { id: `cat-${c.cat.toLowerCase()}`, name: c.cat, slug: c.cat.toLowerCase().replace(/\s+/g, '-') },
  bannerImage: c.img,
  logoImage: c.img,
  isPrivate: false,
  memberCount: c.members,
  postCount: c.posts,
  status: 'APPROVED',
  moderators: demoPeople.slice(i, i + 2).map((p) => ({ ...p, role: 'MODERATOR' as const })),
  createdAt: daysAgo(90 - i * 3),
  updatedAt: daysAgo(i),
  _count: { members: c.members, posts: c.posts },
}));

// ─── JOBS ───────────────────────────────────────────────────────────────────
const jobDefs = [
  { title: 'Frontend Developer', company: 'TechNova Solutions', type: 'Full-time', salary: '₹8–14 LPA', loc: 'Bangalore', skills: ['React', 'TypeScript', 'Tailwind CSS'], website: 'https://careers.microsoft.com/' },
  { title: 'Backend Developer', company: 'CloudStack Inc', type: 'Full-time', salary: '₹10–18 LPA', loc: 'Hyderabad', skills: ['Node.js', 'PostgreSQL', 'Redis'], website: 'https://www.amazon.jobs/' },
  { title: 'Full Stack Developer', company: 'Digital Forge', type: 'Full-time', salary: '₹12–20 LPA', loc: 'Pune', skills: ['React', 'Node.js', 'MongoDB'], website: 'https://careers.ibm.com/' },
  { title: 'React Developer', company: 'AppCraft Studio', type: 'Full-time', salary: '₹7–12 LPA', loc: 'Remote', skills: ['React', 'Redux', 'Next.js'], website: 'https://www.atlassian.com/company/careers' },
  { title: 'Node.js Developer', company: 'ServerLogic', type: 'Contract', salary: '₹9–15 LPA', loc: 'Chennai', skills: ['Node.js', 'Express', 'AWS'], website: 'https://www.oracle.com/careers/' },
  { title: 'Python Developer', company: 'DataPulse AI', type: 'Full-time', salary: '₹10–16 LPA', loc: 'Bangalore', skills: ['Python', 'Django', 'FastAPI'], website: 'https://careers.google.com/' },
  { title: 'Data Analyst', company: 'InsightMetrics', type: 'Full-time', salary: '₹6–10 LPA', loc: 'Mumbai', skills: ['SQL', 'Python', 'Tableau'], website: 'https://www.sap.com/india/about/careers.html' },
  { title: 'Data Scientist', company: 'MLWorks', type: 'Full-time', salary: '₹15–25 LPA', loc: 'Bangalore', skills: ['Python', 'TensorFlow', 'Statistics'], website: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
  { title: 'UI/UX Designer', company: 'DesignHive', type: 'Full-time', salary: '₹8–14 LPA', loc: 'Remote', skills: ['Figma', 'Prototyping', 'User Research'], website: 'https://www.adobe.com/careers.html' },
  { title: 'Graphic Designer', company: 'Creative Pulse', type: 'Part-time', salary: '₹4–7 LPA', loc: 'Delhi', skills: ['Photoshop', 'Illustrator', 'Branding'], website: 'https://www.canva.com/careers/' },
  { title: 'Marketing Executive', company: 'BrandWave Media', type: 'Full-time', salary: '₹5–9 LPA', loc: 'Mumbai', skills: ['Digital Marketing', 'SEO', 'Content Strategy'], website: 'https://www.hubspot.com/careers' },
  { title: 'HR Executive', company: 'PeopleFirst Corp', type: 'Full-time', salary: '₹5–8 LPA', loc: 'Hyderabad', skills: ['Recruitment', 'HRMS', 'Employee Relations'], website: 'https://jobs.workday.com/' },
  { title: 'Sales Executive', company: 'GrowthEdge Sales', type: 'Full-time', salary: '₹4–8 LPA + incentives', loc: 'Chennai', skills: ['B2B Sales', 'CRM', 'Negotiation'], website: 'https://www.zoho.com/careers.html' },
  { title: 'Civil Engineer', company: 'BuildRight Infrastructure', type: 'Full-time', salary: '₹6–12 LPA', loc: 'Pune', skills: ['AutoCAD', 'Project Management', 'Structural Design'], website: 'https://www.larsentoubro.com/corporate/careers/' },
  { title: 'Mechanical Engineer', company: 'Precision Motors', type: 'Full-time', salary: '₹7–13 LPA', loc: 'Chennai', skills: ['SolidWorks', 'Manufacturing', 'Quality Control'], website: 'https://www.tatamotors.com/careers/' },
  { title: 'Electrical Engineer', company: 'PowerGrid Solutions', type: 'Full-time', salary: '₹7–14 LPA', loc: 'Bangalore', skills: ['Circuit Design', 'PLC', 'Electrical Safety'], website: 'https://www.siemens.com/global/en/company/jobs.html' },
  { title: 'Teacher', company: 'Bright Future Academy', type: 'Full-time', salary: '₹3–6 LPA', loc: 'Local', skills: ['Teaching', 'Curriculum Design', 'Communication'], website: 'https://byjus.com/careers/' },
  { title: 'Accountant', company: 'FinTrust Associates', type: 'Full-time', salary: '₹4–8 LPA', loc: 'Mumbai', skills: ['Tally', 'GST', 'Financial Reporting'], website: 'https://www2.deloitte.com/us/en/careers.html' },
  { title: 'Staff Nurse', company: 'City General Hospital', type: 'Full-time', salary: '₹3–6 LPA', loc: 'Local', skills: ['Patient Care', 'ICU', 'Medical Records'], website: 'https://www.apollohospitals.com/careers/' },
];

export const allJobs = jobDefs.map((j, i) => {
  const author = demoPeople[i % demoPeople.length];
  return {
    id: `job-${String(i + 1).padStart(3, '0')}`,
    title: j.title,
    company: j.company,
    companyLogo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(j.company)}`,
    type: j.type,
    salary: j.salary,
    location: j.loc,
    description: `${j.company} is hiring a talented ${j.title} to join our growing team. You'll work on exciting projects that impact our local community and beyond. We offer competitive compensation, flexible work arrangements, and a collaborative culture.`,
    skills: j.skills,
    website: j.website,
    authorId: author.id,
    author: { id: author.id, name: author.name, profileImage: author.profileImage },
    createdAt: daysAgo(i * 2),
    applicants: 15 + i * 7,
  };
});

// ─── EVENTS (15 — global showcase plus hometown community events) ──────────
const eventDefs = [
  { title: 'Hyderabad Tech Expo 2026', type: 'Tech Expo', loc: 'HITEC City Convention Centre, Hyderabad, India', days: 6, img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop&auto=format&q=70', attendees: 1200, desc: 'India\'s biggest hometown tech showcase — AI, robotics and startups under one roof at HITEC City, Hyderabad.' },
  { title: 'Tokyo Cultural Festival', type: 'Cultural Festival', loc: 'Ueno Park, Tokyo, Japan', days: 14, img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=400&fit=crop&auto=format&q=70', attendees: 2500, desc: 'Experience traditional dance, lantern parades and authentic Japanese cuisine in the heart of Tokyo.' },
  { title: 'New York Startup Summit', type: 'Startup Summit', loc: 'Javits Center, New York, USA', days: 21, img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&auto=format&q=70', attendees: 1800, desc: 'Pitch nights, investor panels and networking with the brightest founders in the Big Apple.' },
  { title: 'London Music Carnival', type: 'Music Concert', loc: 'Hyde Park, London, United Kingdom', days: 30, img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop&auto=format&q=70', attendees: 5000, desc: 'A day of live performances from world-class artists across multiple stages in Hyde Park.' },
  { title: 'Sydney Food Festival', type: 'Food Festival', loc: 'Darling Harbour, Sydney, Australia', days: 18, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop&auto=format&q=70', attendees: 3200, desc: 'Taste signature dishes from top chefs and local vendors along the waterfront at Darling Harbour.' },
  { title: 'Hyderabad Startup Summit', type: 'Startup Summit', loc: 'T-Hub, Hyderabad, India', days: 9, img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop&auto=format&q=70', attendees: 950, desc: 'Pitch competitions, VC panels and founder meetups at India\'s largest startup incubator, T-Hub.' },
  { title: 'AI Innovation Conference', type: 'Tech Conference', loc: 'Hyderabad International Convention Centre, India', days: 12, img: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&h=400&fit=crop&auto=format&q=70', attendees: 1600, desc: 'Deep-dive keynotes and hands-on workshops on generative AI, machine learning, and applied robotics.' },
  { title: 'Food Carnival', type: 'Food Festival', loc: 'Necklace Road Grounds, Hyderabad, India', days: 4, img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop&auto=format&q=70', attendees: 4200, desc: 'A weekend of street food stalls, live cooking battles, and dessert pop-ups from 50+ local vendors.' },
  { title: 'Music Festival', type: 'Music Concert', loc: 'People\'s Plaza, Hyderabad, India', days: 25, img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop&auto=format&q=70', attendees: 6000, desc: 'A three-stage music extravaganza featuring indie, EDM, and classical fusion artists.' },
  { title: 'Marathon', type: 'Sports', loc: 'Tank Bund, Hyderabad, India', days: 15, img: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=400&fit=crop&auto=format&q=70', attendees: 8000, desc: 'A city-wide 21K/10K/5K run around Hussain Sagar, open to all fitness levels, with medals for finishers.' },
  { title: 'Book Fair', type: 'Literature', loc: 'NTR Stadium Grounds, Hyderabad, India', days: 20, img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=400&fit=crop&auto=format&q=70', attendees: 2100, desc: 'Browse thousands of titles from 200+ publishers, meet authors, and attend storytelling sessions for kids.' },
  { title: 'Cultural Night', type: 'Cultural Festival', loc: 'Shilparamam, Hyderabad, India', days: 11, img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop&auto=format&q=70', attendees: 1750, desc: 'An evening of classical dance, folk music, and regional cuisine celebrating our community\'s diversity.' },
  { title: 'Photography Workshop', type: 'Workshop', loc: 'Kalakriti Art Gallery, Hyderabad, India', days: 8, img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=400&fit=crop&auto=format&q=70', attendees: 120, desc: 'Hands-on portrait and street photography masterclass led by award-winning local photographers.' },
  { title: 'Robotics Expo', type: 'Tech Expo', loc: 'Gachibowli Stadium, Hyderabad, India', days: 17, img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&auto=format&q=70', attendees: 1400, desc: 'Live robot battles, drone demos, and student showcases from engineering colleges across the region.' },
  { title: 'Career Fair', type: 'Career', loc: 'HICC Novotel, Hyderabad, India', days: 5, img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop&auto=format&q=70', attendees: 3000, desc: 'Meet recruiters from 80+ companies, attend resume clinics, and land your next opportunity on the spot.' },
];

export const allEvents = eventDefs.map((e, i) => {
  const date = new Date(now.getTime() + e.days * 86400000);
  date.setHours(10 + (i % 8), 0, 0, 0);
  const endDate = new Date(date.getTime() + 3 * 3600000);
  const org = demoPeople[i % demoPeople.length];
  const comm = allCommunities[i % allCommunities.length];
  return {
    id: `event-${String(i + 1).padStart(3, '0')}`,
    title: e.title,
    description: e.desc,
    date: date.toISOString(),
    endDate: endDate.toISOString(),
    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    location: e.loc,
    isOnline: false,
    status: 'UPCOMING',
    category: e.type,
    bannerImage: e.img,
    communityId: comm.id,
    organizerId: org.id,
    maxParticipants: e.attendees * 2,
    community: { id: comm.id, name: comm.name, slug: comm.slug },
    organizer: { id: org.id, name: org.name, username: org.username, profileImage: org.profileImage },
    _count: { participants: e.attendees },
    comments: 5 + i * 2,
    createdAt: daysAgo(10 - i),
  };
});

// ─── NEWS ───────────────────────────────────────────────────────────────────
const newsDefs = [
  { cat: 'Politics', title: 'City Council Approves ₹500 Crore Infrastructure Budget', summary: 'Major allocation for roads, water supply, and public transport upgrades across all wards.', loc: 'GHMC Head Office, Hyderabad' },
  { cat: 'Education', title: 'New STEM Labs Open in 50 Public Schools', summary: 'State government initiative brings robotics and coding labs to underserved schools.', loc: 'Kukatpally, Hyderabad' },
  { cat: 'Technology', title: 'Local Startup Raises ₹50 Crore Series A Funding', summary: 'AgriTech platform FarmLink plans to onboard 1 lakh farmers across rural districts.', loc: 'T-Hub, Hyderabad' },
  { cat: 'Healthcare', title: 'Free Health Checkup Camps Across 20 Wards This Month', summary: 'Municipal health department partners with local hospitals for preventive care drives.', loc: 'Secunderabad, Hyderabad' },
  { cat: 'Environment', title: 'Green Park Renovation Project Gets Green Light', summary: '₹12 crore plan adds eco-friendly amenities, amphitheater, and children\'s learning garden.', loc: 'KBR Park, Hyderabad' },
  { cat: 'Transportation', title: 'New Metro Line to Connect Outer Suburbs by 2027', summary: 'Transport authority announces expansion benefiting 2 million residents.', loc: 'Miyapur, Hyderabad' },
  { cat: 'Business', title: 'Small Business Grant Program Launches with ₹100 Crore Fund', summary: 'Local entrepreneurs can apply for zero-interest loans up to ₹10 lakhs.', loc: 'Begumpet, Hyderabad' },
  { cat: 'Sports', title: 'City Team Wins State Cricket Championship', summary: 'Historic victory after 15 years brings home the trophy to cheering fans.', loc: 'Uppal Stadium, Hyderabad' },
  { cat: 'Culture', title: 'Annual Cultural Festival to Feature Artists from 20 Countries', summary: 'Five-day celebration of art, dance, and cuisine at the Heritage Grounds.', loc: 'Shilparamam, Hyderabad' },
  { cat: 'Politics', title: 'New Ward Boundaries Finalized After Census Review', summary: 'Redistricting ensures better representation for growing suburban areas.', loc: 'LB Nagar, Hyderabad' },
  { cat: 'Education', title: 'Scholarship Portal Opens for Merit-Based Awards', summary: '500 scholarships available for students pursuing higher education locally.', loc: 'Ameerpet, Hyderabad' },
  { cat: 'Technology', title: 'Free Wi-Fi Hotspots Installed at 100 Public Locations', summary: 'Digital inclusion initiative covers parks, libraries, and bus stations.', loc: 'Gachibowli, Hyderabad' },
  { cat: 'Healthcare', title: 'New 500-Bed Super Specialty Hospital Inaugurated', summary: 'State-of-the-art facility offers cardiac, neuro, and oncology services.', loc: 'Banjara Hills, Hyderabad' },
  { cat: 'Environment', title: 'Plastic Ban Enforcement Drives Reduce Waste by 40%', summary: 'Community compliance and awareness campaigns show significant impact.', loc: 'Jubilee Hills, Hyderabad' },
  { cat: 'Transportation', title: 'Electric Bus Fleet Expanded to 200 Vehicles', summary: 'Clean energy transition accelerates with new charging infrastructure.', loc: 'Mehdipatnam, Hyderabad' },
  { cat: 'Business', title: 'Local Handicraft Exporters See 30% Growth', summary: 'Global demand for traditional crafts boosts rural artisan incomes.', loc: 'Charminar, Hyderabad' },
  { cat: 'Sports', title: 'Youth Football Academy Opens Registration', summary: 'Free coaching for ages 8-16 at the new municipal sports complex.', loc: 'Malkajgiri, Hyderabad' },
  { cat: 'Culture', title: 'Heritage Museum Launches Virtual Tour Platform', summary: 'Explore 500 years of local history from anywhere in the world.', loc: 'Salar Jung Museum, Hyderabad' },
  { cat: 'Education', title: 'Hyderabad Public Library Reopens After Digital Overhaul', summary: 'Newly renovated central library adds 200 study pods, e-book kiosks, and a maker space for students.', loc: 'Afzal Gunj, Hyderabad' },
  { cat: 'Healthcare', title: 'Mobile Health Vans to Reach 40 Remote Colonies', summary: 'New fleet of mobile clinics brings free diagnostics and vaccinations directly to underserved neighborhoods.', loc: 'Rajendranagar, Hyderabad' },
  { cat: 'Environment', title: 'Community Tree Plantation Drive Crosses 1 Lakh Saplings', summary: 'Volunteers and school groups mark a major environmental milestone ahead of monsoon season.', loc: 'Kokapet, Hyderabad' },
  { cat: 'Technology', title: 'City Launches AI-Powered Traffic Management Pilot', summary: 'Smart signals at 25 junctions aim to cut average commute times by 15% during peak hours.', loc: 'Hitech City, Hyderabad' },
  { cat: 'Culture', title: 'Weekend Farmers Market Returns to Necklace Road', summary: 'Over 80 local vendors will sell organic produce, handmade crafts, and street food every Saturday.', loc: 'Necklace Road, Hyderabad' },
];

const newsImages = ['1571091718767-18b5b1457add', '1625246333195-78d9c38ad449', '1519331379826-f10be5486c6f', '1576091160399-112ba8d25d1f', '1504711434969-e33886168f5c', '1544627737-d9e3c37a2c6d'];

export const allNews = newsDefs.map((n, i) => {
  const author = demoPeople[i % demoPeople.length];
  return {
    id: `news-${String(i + 1).padStart(3, '0')}`,
    title: n.title,
    summary: n.summary,
    content: `${n.summary}\n\nIn a significant development for the local community, officials announced comprehensive measures that will benefit residents across all demographics. Community leaders have praised the initiative, noting its potential to create lasting positive change.\n\nLocal experts weigh in on the implications, with many calling it a step in the right direction. Public consultations will continue over the coming weeks to gather feedback and refine implementation plans.`,
    category: n.cat,
    location: n.loc,
    image: img(newsImages[i % newsImages.length]),
    authorId: author.id,
    author: { id: author.id, name: author.name, username: author.username, profileImage: author.profileImage },
    views: 1200 + i * 340,
    likes: 45 + i * 12,
    commentCount: 8 + i * 3,
    shareCount: 5 + i,
    readTime: `${3 + (i % 4)} min read`,
    createdAt: daysAgo(i),
    trending: i < 4,
  };
});

// ─── TOURISM (72 destinations — 12 across each of 6 categories) ────────────
type TourismCategory = 'Nature' | 'Heritage' | 'Hill Station' | 'Wildlife' | 'Beach' | 'Adventure';

interface TourismDef {
  name: string; type: TourismCategory; loc: string; rating: number; desc: string;
  fee: string; hours: string; season: string; tip: string;
}

const tourismDefs: TourismDef[] = [
  // Nature (12)
  { name: 'Kerala Backwaters', type: 'Nature', loc: 'Alleppey, Kerala', rating: 4.8, desc: 'A serene network of lagoons and canals best explored aboard a traditional houseboat.', fee: '₹500 Boat Ride', hours: '8:00 AM – 5:00 PM (houseboat check-in)', season: 'September – March', tip: 'Book an overnight houseboat for the best sunset views over the lagoons.' },
  { name: 'Valley of Flowers', type: 'Nature', loc: 'Chamoli, Uttarakhand', rating: 4.8, desc: 'A UNESCO-listed alpine valley that erupts into a carpet of wildflowers every monsoon.', fee: '₹150 (Indian) / ₹600 (Foreign)', hours: '7:00 AM – 2:00 PM (June – Oct only)', season: 'July – September', tip: 'Carry rain gear — this UNESCO valley is only accessible during the monsoon bloom.' },
  { name: 'Chilika Lake', type: 'Nature', loc: 'Puri, Odisha', rating: 4.5, desc: 'Asia\'s largest brackish water lagoon, home to migratory birds and Irrawaddy dolphins.', fee: '₹300 Boat Safari', hours: '6:00 AM – 5:00 PM', season: 'November – February', tip: 'Hire a licensed boatman from Satapada for dolphin-spotting safaris.' },
  { name: 'Sundarbans Mangroves', type: 'Nature', loc: 'South 24 Parganas, West Bengal', rating: 4.6, desc: 'The world\'s largest mangrove forest, a maze of tidal waterways and dense green canopy.', fee: '₹60 (Indian) / ₹500 (Foreign) + boat charges', hours: '7:00 AM – 4:00 PM (boat permits)', season: 'October – March', tip: 'Government-approved guides are mandatory; carry insect repellent.' },
  { name: 'Western Ghats Trail', type: 'Nature', loc: 'Sahyadri Range, Maharashtra', rating: 4.6, desc: 'A UNESCO biodiversity hotspot of misty ridgelines, waterfalls, and endemic flora.', fee: 'Free', hours: 'Open year-round, daylight hours', season: 'October – February', tip: 'Wear grip-soled shoes — the trails get slippery after rain.' },
  { name: 'Dandeli Forest', type: 'Nature', loc: 'Uttara Kannada, Karnataka', rating: 4.5, desc: 'A dense deciduous forest along the Kali river, popular for river rafting and birdwatching.', fee: '₹100 Safari Permit', hours: '6:00 AM – 6:00 PM', season: 'October – May', tip: 'Pre-book river rafting slots online during peak monsoon season.' },
  { name: 'Wayanad Greenery', type: 'Nature', loc: 'Wayanad, Kerala', rating: 4.7, desc: 'Rolling spice plantations, waterfalls, and ancient caves set in the Western Ghats.', fee: '₹40 Entry', hours: '7:00 AM – 6:00 PM', season: 'October – May', tip: 'Combine a visit with the nearby Edakkal Caves for a full day trip.' },
  { name: 'Bhitarkanika Mangroves', type: 'Nature', loc: 'Kendrapara, Odisha', rating: 4.4, desc: 'A remote mangrove ecosystem and crocodile sanctuary reachable only by boat.', fee: '₹100 (Indian) / ₹500 (Foreign) + boat', hours: '7:30 AM – 4:30 PM', season: 'December – March', tip: 'Boats depart early morning from Khola jetty; book a day ahead.' },
  { name: 'Khajjiar Meadows', type: 'Nature', loc: 'Chamba, Himachal Pradesh', rating: 4.6, desc: 'A saucer-shaped alpine meadow ringed by deodar forests, often called "Mini Switzerland".', fee: 'Free', hours: 'Open 24 hours', season: 'March – June', tip: 'Try paragliding for aerial views of the meadow and surrounding pines.' },
  { name: 'Araku Valley', type: 'Nature', loc: 'Visakhapatnam, Andhra Pradesh', rating: 4.5, desc: 'A scenic hill valley of coffee plantations, waterfalls, and tribal culture.', fee: '₹30 (Coffee Museum entry)', hours: '10:00 AM – 5:00 PM', season: 'October – March', tip: 'Take the scenic Kirandul Passenger train through the Eastern Ghats.' },
  { name: 'Loktak Lake', type: 'Nature', loc: 'Bishnupur, Manipur', rating: 4.5, desc: 'The largest freshwater lake in Northeast India, famous for its floating phumdi islands.', fee: '₹20 Boat Ride', hours: '7:00 AM – 5:00 PM', season: 'November – March', tip: 'Visit Sendra Island viewpoint for the best view of the floating phumdis.' },
  { name: 'Majuli River Island', type: 'Nature', loc: 'Jorhat, Assam', rating: 4.4, desc: 'The world\'s largest river island, with Vaishnavite monasteries and vast wetlands.', fee: '₹50 Ferry Ticket', hours: '6:00 AM – 6:00 PM (last ferry)', season: 'October – March', tip: 'Ferries depend on river levels — confirm schedules a day in advance.' },
  // Heritage (12)
  { name: 'Taj Mahal', type: 'Heritage', loc: 'Agra, Uttar Pradesh', rating: 4.9, desc: 'The legendary white marble mausoleum and UNESCO World Heritage Site, a timeless symbol of love.', fee: '₹50 (Indian) / ₹1,100 (Foreign)', hours: '6:00 AM – 6:30 PM (closed Fridays)', season: 'October – March', tip: 'Visit at sunrise to avoid crowds and see the marble shift colour in early light.' },
  { name: 'Hampi Ruins', type: 'Heritage', loc: 'Ballari, Karnataka', rating: 4.8, desc: 'A UNESCO World Heritage Site of dramatic boulder landscapes and the ruins of the Vijayanagara Empire.', fee: '₹40 (Indian) / ₹600 (Foreign)', hours: '6:00 AM – 6:00 PM', season: 'November – February', tip: 'Rent a bicycle to explore the sprawling ruins spread across boulder-strewn terrain.' },
  { name: 'Charminar', type: 'Heritage', loc: 'Hyderabad, Telangana', rating: 4.7, desc: 'A 16th-century mosque and iconic monument with four grand minarets, the beating heart of the Old City.', fee: '₹25 (Indian) / ₹300 (Foreign)', hours: '9:30 AM – 5:30 PM', season: 'October – February', tip: 'Explore the Laad Bazaar right next door for pearls and bangles.' },
  { name: 'Golconda Fort', type: 'Heritage', loc: 'Hyderabad, Telangana', rating: 4.6, desc: 'A majestic 16th-century fortress famed for its acoustic engineering and diamond trade history.', fee: '₹40 (Indian) / ₹200 (Foreign)', hours: '9:00 AM – 5:30 PM (sound & light show at 7 PM)', season: 'September – March', tip: 'Clap at the entrance dome and listen for the echo at the summit — a famous acoustic trick.' },
  { name: 'Mysore Palace', type: 'Heritage', loc: 'Mysuru, Karnataka', rating: 4.8, desc: 'A resplendent Indo-Saracenic palace, dazzlingly lit up on Sundays and festival nights.', fee: '₹100', hours: '10:00 AM – 5:30 PM', season: 'October – March', tip: 'Visit on a Sunday evening when nearly 100,000 lights illuminate the palace.' },
  { name: 'Qutub Minar', type: 'Heritage', loc: 'Delhi', rating: 4.7, desc: 'A soaring 73-metre minaret of fluted red sandstone, the tallest brick minaret in the world.', fee: '₹35 (Indian) / ₹550 (Foreign)', hours: '7:00 AM – 5:00 PM', season: 'November – March', tip: 'Combine your visit with the nearby Iron Pillar and Alai Darwaza.' },
  { name: 'Fatehpur Sikri', type: 'Heritage', loc: 'Agra, Uttar Pradesh', rating: 4.6, desc: 'A perfectly preserved Mughal capital of red sandstone palaces, courtyards, and mosques.', fee: '₹50 (Indian) / ₹610 (Foreign)', hours: '6:00 AM – 6:00 PM', season: 'October – March', tip: 'Hire a certified guide at the entrance to unlock the site\'s Mughal history.' },
  { name: 'Konark Sun Temple', type: 'Heritage', loc: 'Konark, Odisha', rating: 4.7, desc: 'A 13th-century temple carved as a colossal chariot for the sun god, rich with intricate stonework.', fee: '₹40', hours: '6:00 AM – 8:00 PM', season: 'November – February', tip: 'Attend the annual Konark Dance Festival held every December.' },
  { name: 'Ajanta Caves', type: 'Heritage', loc: 'Aurangabad, Maharashtra', rating: 4.7, desc: 'Rock-cut Buddhist caves adorned with 2,000-year-old paintings and sculptures.', fee: '₹40', hours: '9:00 AM – 5:00 PM (closed Mondays)', season: 'November – March', tip: 'Carry a flashlight — several caves have dim natural lighting.' },
  { name: 'Ellora Caves', type: 'Heritage', loc: 'Aurangabad, Maharashtra', rating: 4.7, desc: 'A UNESCO site of 34 monasteries and temples carved from a single basalt cliff.', fee: '₹40', hours: '6:00 AM – 6:00 PM (closed Tuesdays)', season: 'November – March', tip: 'Start early to explore Kailasa Temple, the world\'s largest monolithic structure, before the heat sets in.' },
  { name: 'Khajuraho Temples', type: 'Heritage', loc: 'Chhatarpur, Madhya Pradesh', rating: 4.6, desc: 'Medieval Hindu and Jain temples celebrated for their exquisite, intricate carvings.', fee: '₹40 (Indian) / ₹600 (Foreign)', hours: '6:00 AM – 6:00 PM (light show at 6:30 PM)', season: 'October – March', tip: 'Watch the evening sound-and-light show for context on the temple carvings.' },
  { name: 'Jaisalmer Fort', type: 'Heritage', loc: 'Jaisalmer, Rajasthan', rating: 4.7, desc: 'A living "Golden Fort" of honey-hued sandstone rising from the Thar Desert.', fee: 'Free (Fort Museum ₹50)', hours: 'Open 24 hours (shops 9 AM – 8 PM)', season: 'October – March', tip: 'Stay overnight inside the fort for a magical desert sunset view.' },
  // Hill Station (12)
  { name: 'Ooty', type: 'Hill Station', loc: 'Nilgiris, Tamil Nadu', rating: 4.7, desc: 'The "Queen of Hill Stations", known for its tea gardens, botanical gardens, and the toy train.', fee: 'Free (Botanical Garden ₹50)', hours: 'Open year-round; garden 7 AM – 6:30 PM', season: 'April – June, September – November', tip: 'Ride the UNESCO-listed Nilgiri Mountain Railway toy train for panoramic tea-garden views.' },
  { name: 'Manali', type: 'Hill Station', loc: 'Kullu, Himachal Pradesh', rating: 4.7, desc: 'A snow-capped Himalayan retreat popular for adventure sports, apple orchards, and Solang Valley.', fee: 'Free', hours: 'Open year-round', season: 'March – June, October – February', tip: 'Book Rohtang Pass permits in advance during peak summer season.' },
  { name: 'Shimla', type: 'Hill Station', loc: 'Shimla, Himachal Pradesh', rating: 4.6, desc: 'The former British summer capital, with colonial architecture and pine-clad ridges.', fee: 'Free', hours: 'Open year-round; Mall Road till 10 PM', season: 'March – June, December – January', tip: 'Walk the Ridge and Mall Road at sunset for the best mountain views.' },
  { name: 'Darjeeling', type: 'Hill Station', loc: 'Darjeeling, West Bengal', rating: 4.7, desc: 'Famous for its tea estates, the toy train, and sweeping views of Kangchenjunga.', fee: 'Free (Toy Train ₹450)', hours: 'Open year-round; train departs 8 AM & 1 PM', season: 'March – May, October – November', tip: 'Wake up early for sunrise views of Kangchenjunga from Tiger Hill.' },
  { name: 'Coorg', type: 'Hill Station', loc: 'Kodagu, Karnataka', rating: 4.7, desc: '"Scotland of India" — misty coffee estates, waterfalls, and Kodava culture.', fee: 'Free', hours: 'Open year-round', season: 'October – March', tip: 'Visit during the coffee blossom season (March–April) for a fragrant countryside.' },
  { name: 'Mussoorie', type: 'Hill Station', loc: 'Dehradun, Uttarakhand', rating: 4.5, desc: 'The "Queen of the Hills", with panoramic views of the Doon Valley and Himalayan peaks.', fee: 'Free (Cable car ₹150)', hours: 'Open year-round; cable car 8 AM – 10 PM', season: 'March – June, September – November', tip: 'Take the cable car to Gun Hill for sweeping Doon Valley views.' },
  { name: 'Nainital', type: 'Hill Station', loc: 'Nainital, Uttarakhand', rating: 4.6, desc: 'A lake town cradled by seven hills, popular for boating and colonial-era charm.', fee: 'Free (Boating ₹200)', hours: 'Open year-round; boating 8 AM – 6 PM', season: 'March – June, September – November', tip: 'Rent a paddle boat on Naini Lake at sunset.' },
  { name: 'Kodaikanal', type: 'Hill Station', loc: 'Dindigul, Tamil Nadu', rating: 4.6, desc: 'A serene lake town of pine forests, waterfalls, and star-shaped botanical gardens.', fee: 'Free (Boat Club ₹100)', hours: 'Open year-round; boat club 9 AM – 5 PM', season: 'April – June, September – October', tip: 'Rent a bicycle to loop around the star-shaped lake.' },
  { name: 'Gulmarg', type: 'Hill Station', loc: 'Baramulla, Jammu & Kashmir', rating: 4.8, desc: 'A meadow-of-flowers turned premier ski resort, with Asia\'s highest gondola.', fee: 'Free (Gondola ₹900)', hours: 'Open year-round; gondola 10 AM – 5 PM', season: 'December – February, April – June', tip: 'Book the Gondola early morning to avoid long queues in ski season.' },
  { name: 'Lansdowne', type: 'Hill Station', loc: 'Pauri Garhwal, Uttarakhand', rating: 4.4, desc: 'A quiet, uncrowded cantonment town of oak and pine forests, ideal for a peaceful retreat.', fee: 'Free', hours: 'Open year-round', season: 'March – June, September – November', tip: 'A great offbeat escape — carry cash as ATMs are limited.' },
  { name: 'Yercaud', type: 'Hill Station', loc: 'Salem, Tamil Nadu', rating: 4.4, desc: 'A laid-back hill station of coffee plantations and orange groves in the Shevaroy Hills.', fee: 'Free (Boating ₹80)', hours: 'Open year-round; boating 9 AM – 5:30 PM', season: 'April – June, September – November', tip: 'Visit the Killiyur Falls just outside town during monsoon.' },
  { name: 'Kalimpong', type: 'Hill Station', loc: 'Kalimpong, West Bengal', rating: 4.5, desc: 'A charming Himalayan town of monasteries, nurseries, and views of the Teesta valley.', fee: 'Free', hours: 'Open year-round', season: 'March – May, October – December', tip: 'Explore the Himalayan nurseries famous for orchids and cacti.' },
  // Wildlife (12)
  { name: 'Jim Corbett National Park', type: 'Wildlife', loc: 'Nainital, Uttarakhand', rating: 4.8, desc: 'India\'s oldest national park, renowned for its Bengal tiger population and river valleys.', fee: '₹200 (Indian) / ₹1,500 (Foreign) + Jeep Safari ₹5,000', hours: '6:00 AM – 9:00 AM, 2:00 PM – 5:30 PM (safari slots)', season: 'November – June', tip: 'Book jeep safari permits weeks in advance during peak winter season.' },
  { name: 'Ranthambore National Park', type: 'Wildlife', loc: 'Sawai Madhopur, Rajasthan', rating: 4.7, desc: 'A former royal hunting ground turned premier tiger reserve set amid ancient ruins.', fee: '₹150 (Indian) / ₹1,000 (Foreign) + Safari ₹1,200/seat', hours: '6:30 AM – 10:00 AM, 2:30 PM – 6:00 PM', season: 'October – June', tip: 'Zone 3 and 6 have the highest tiger sighting probability — request them while booking.' },
  { name: 'Kaziranga National Park', type: 'Wildlife', loc: 'Golaghat, Assam', rating: 4.8, desc: 'A UNESCO site protecting two-thirds of the world\'s one-horned rhinoceroses.', fee: '₹100 (Indian) / ₹650 (Foreign) + Elephant Safari ₹2,250', hours: '5:30 AM – 8:00 AM (elephant), 8:00 AM – 11:00 AM (jeep)', season: 'November – April', tip: 'The early-morning elephant safari offers the closest rhino encounters.' },
  { name: 'Bandipur National Park', type: 'Wildlife', loc: 'Chamarajanagar, Karnataka', rating: 4.6, desc: 'A biodiversity-rich tiger reserve within the Nilgiri Biosphere, home to elephants and leopards.', fee: '₹300 Bus Safari / ₹1,800 Jeep Safari', hours: '6:00 AM – 9:00 AM, 3:00 PM – 6:00 PM', season: 'October – May', tip: 'Keep noise to a minimum — the reserve enforces strict silence rules during safaris.' },
  { name: 'Gir Forest National Park', type: 'Wildlife', loc: 'Junagadh, Gujarat', rating: 4.7, desc: 'The last wild refuge of the Asiatic lion, a dry deciduous forest teeming with wildlife.', fee: '₹150 (Indian) / ₹2,200 (Foreign) + Safari fee', hours: '6:00 AM – 9:00 AM, 3:00 PM – 6:00 PM', season: 'December – March', tip: 'Book gypsy safari permits online well ahead, as slots fill up quickly in winter.' },
  { name: 'Periyar Wildlife Sanctuary', type: 'Wildlife', loc: 'Thekkady, Kerala', rating: 4.6, desc: 'A misty reserve centred on a scenic lake, known for boat safaris spotting wild elephants.', fee: '₹50 Entry + Boat Safari ₹200', hours: '7:00 AM – 4:00 PM (boat rides every 2 hours)', season: 'September – April', tip: 'Opt for the bamboo rafting trek for a more immersive, off-the-beaten-path experience.' },
  { name: 'Sundarbans Tiger Reserve', type: 'Wildlife', loc: 'South 24 Parganas, West Bengal', rating: 4.5, desc: 'A mangrove wilderness that shelters the elusive Royal Bengal tiger.', fee: '₹60 (Indian) / ₹500 (Foreign) + boat charges', hours: '7:00 AM – 4:00 PM (boat permits)', season: 'November – February', tip: 'Carry binoculars — tiger sightings are rare, but birdlife is abundant.' },
  { name: 'Kanha National Park', type: 'Wildlife', loc: 'Mandla, Madhya Pradesh', rating: 4.7, desc: 'The inspiration for "The Jungle Book", with sal forests and thriving tiger populations.', fee: '₹250 (Indian) / ₹1,500 (Foreign) + Safari ₹4,500', hours: '6:00 AM – 11:00 AM, 3:00 PM – 5:30 PM', season: 'February – April', tip: 'Visit the Kanha Museum for context before heading into the core zone.' },
  { name: 'Nagarhole National Park', type: 'Wildlife', loc: 'Kodagu, Karnataka', rating: 4.6, desc: 'A lush reserve along the Kabini river, famed for large elephant herds and tiger sightings.', fee: '₹300 Bus Safari / ₹2,000 Jeep Safari', hours: '6:00 AM – 9:00 AM, 3:30 PM – 6:00 PM', season: 'October – May', tip: 'Combine with a stay at a Kabini riverside resort for the best wildlife access.' },
  { name: 'Pench National Park', type: 'Wildlife', loc: 'Seoni, Madhya Pradesh', rating: 4.5, desc: 'A teak-forest reserve straddling Madhya Pradesh and Maharashtra, rich in tiger and deer.', fee: '₹150 (Indian) / ₹1,200 (Foreign) + Safari ₹3,500', hours: '6:00 AM – 11:00 AM, 3:00 PM – 5:30 PM', season: 'February – April', tip: 'Early morning safaris offer the best chance of spotting the park\'s leopards.' },
  { name: 'Bharatpur Bird Sanctuary', type: 'Wildlife', loc: 'Bharatpur, Rajasthan', rating: 4.5, desc: 'A UNESCO wetland famed for thousands of migratory birds, including the rare Siberian crane.', fee: '₹75 (Indian) / ₹500 (Foreign)', hours: '6:00 AM – 5:00 PM', season: 'October – February', tip: 'Rent a cycle-rickshaw guided by local birders for expert spotting.' },
  { name: 'Satpura National Park', type: 'Wildlife', loc: 'Hoshangabad, Madhya Pradesh', rating: 4.4, desc: 'A rugged, less-crowded reserve offering walking and canoe safaris through dense forest.', fee: '₹200 Entry + Canoe Safari ₹1,500', hours: '6:00 AM – 10:00 AM, 3:00 PM – 6:00 PM', season: 'February – April', tip: 'One of the few reserves allowing walking safaris — book this unique experience ahead.' },
  // Beach (12)
  { name: 'Goa Beaches', type: 'Beach', loc: 'Goa', rating: 4.7, desc: 'Sun-soaked golden beaches, vibrant nightlife, water sports, and relaxed Portuguese-era charm.', fee: 'Free', hours: 'Open 24 hours (shacks 9 AM – 11 PM)', season: 'November – February', tip: 'North Goa is lively with nightlife; South Goa is quieter and more scenic.' },
  { name: 'Varkala Beach', type: 'Beach', loc: 'Thiruvananthapuram, Kerala', rating: 4.6, desc: 'A dramatic red laterite cliff overlooking golden sands and the Arabian Sea.', fee: 'Free', hours: 'Open 24 hours', season: 'September – March', tip: 'Watch the sunset from the clifftop cafés lining the beach.' },
  { name: 'Gokarna Beach', type: 'Beach', loc: 'Uttara Kannada, Karnataka', rating: 4.5, desc: 'A laid-back pilgrim town with pristine, less-crowded beaches perfect for backpackers.', fee: 'Free', hours: 'Open 24 hours', season: 'October – March', tip: 'Trek between Om Beach and Kudle Beach along the coastal trail.' },
  { name: 'Radhanagar Beach', type: 'Beach', loc: 'Havelock Island, Andaman & Nicobar', rating: 4.8, desc: 'Consistently ranked among Asia\'s best beaches, with powder-white sand and turquoise water.', fee: 'Free (Ferry to Havelock ₹1,200 return)', hours: 'Sunrise – 6:00 PM', season: 'November – April', tip: 'Arrive early — the ferry from Port Blair fills up quickly in peak season.' },
  { name: 'Marina Beach', type: 'Beach', loc: 'Chennai, Tamil Nadu', rating: 4.3, desc: 'One of the world\'s longest urban beaches, a bustling promenade along the Bay of Bengal.', fee: 'Free', hours: 'Open 24 hours (best 4–8 AM, 4–9 PM)', season: 'November – February', tip: 'Avoid swimming — strong undercurrents make it unsafe; enjoy the promenade instead.' },
  { name: 'Kovalam Beach', type: 'Beach', loc: 'Thiruvananthapuram, Kerala', rating: 4.5, desc: 'A crescent-shaped beach with a lighthouse, backed by coconut groves and Ayurvedic resorts.', fee: 'Free (Lighthouse ₹25)', hours: 'Open 24 hours; lighthouse 9 AM – 5 PM', season: 'September – March', tip: 'Book an Ayurvedic massage at one of the beachside wellness centres.' },
  { name: 'Puri Beach', type: 'Beach', loc: 'Puri, Odisha', rating: 4.4, desc: 'A sacred coastal town beach beside the Jagannath Temple, lively with local fishing culture.', fee: 'Free', hours: 'Open 24 hours', season: 'October – March', tip: 'Visit the Jagannath Temple nearby, but dress modestly.' },
  { name: 'Digha Beach', type: 'Beach', loc: 'Purba Medinipur, West Bengal', rating: 4.2, desc: 'A popular Bengal getaway with a wide, gently sloping shoreline.', fee: 'Free', hours: 'Open 24 hours', season: 'October – February', tip: 'Visit the nearby Marine Aquarium and Research Centre.' },
  { name: 'Alappuzha Beach', type: 'Beach', loc: 'Alappuzha, Kerala', rating: 4.4, desc: 'A quiet beach beside the backwaters, with a historic century-old pier.', fee: 'Free', hours: 'Open 24 hours', season: 'September – March', tip: 'Combine your beach visit with a backwater houseboat cruise.' },
  { name: 'Tarkarli Beach', type: 'Beach', loc: 'Sindhudurg, Maharashtra', rating: 4.6, desc: 'Clear turquoise waters ideal for scuba diving and snorkelling along the Konkan coast.', fee: 'Free (Scuba diving ₹2,500)', hours: 'Sunrise – Sunset (dive centres 8 AM – 4 PM)', season: 'November – May', tip: 'Book scuba diving trips a day in advance during peak season.' },
  { name: 'Diu Beach', type: 'Beach', loc: 'Diu', rating: 4.4, desc: 'A tranquil former Portuguese colony with clean beaches and a laid-back atmosphere.', fee: 'Free', hours: 'Open 24 hours', season: 'October – March', tip: 'Rent a scooter to explore nearby Naida Caves and St. Paul\'s Church.' },
  { name: 'Rameswaram Beach', type: 'Beach', loc: 'Ramanathapuram, Tamil Nadu', rating: 4.5, desc: 'A sacred coastal town where the Bay of Bengal meets the Indian Ocean near Adam\'s Bridge.', fee: 'Free', hours: 'Open 24 hours', season: 'October – March', tip: 'Visit Dhanushkodi\'s ghost town nearby for a surreal landscape.' },
  // Adventure (12)
  { name: 'Rishikesh River Rafting', type: 'Adventure', loc: 'Rishikesh, Uttarakhand', rating: 4.8, desc: 'World-class white-water rafting on the Ganges, plus bungee jumping and yoga retreats.', fee: '₹500 – ₹1,500 (per rapid grade)', hours: '9:00 AM – 4:00 PM', season: 'March – June, September – November', tip: 'Grade III–IV rapids are best between March–June; wear a certified life jacket.' },
  { name: 'Leh-Ladakh Biking Trail', type: 'Adventure', loc: 'Leh, Ladakh', rating: 4.9, desc: 'A legendary high-altitude motorbike route past some of the world\'s highest motorable passes.', fee: '₹1,500 – ₹3,000/day (bike rental)', hours: 'Open May – September (daylight riding only)', season: 'June – September', tip: 'Spend 2 days acclimatizing in Leh before attempting high passes.' },
  { name: 'Manali Paragliding', type: 'Adventure', loc: 'Solang Valley, Himachal Pradesh', rating: 4.6, desc: 'Tandem paragliding over the dramatic Solang Valley with views of snow-capped peaks.', fee: '₹1,200 – ₹2,500 (tandem flight)', hours: '10:00 AM – 4:00 PM (weather permitting)', season: 'March – June, September – November', tip: 'Book morning slots — winds get too strong for flying by afternoon.' },
  { name: 'Auli Skiing Slopes', type: 'Adventure', loc: 'Chamoli, Uttarakhand', rating: 4.6, desc: 'India\'s premier ski destination, with slopes framed by Nanda Devi views.', fee: '₹3,000 – ₹6,000 (gear + gondola package)', hours: '9:00 AM – 4:00 PM (December – March)', season: 'December – March', tip: 'First-timers should hire an instructor for the initial two runs.' },
  { name: 'Bir Billing Paragliding', type: 'Adventure', loc: 'Kangra, Himachal Pradesh', rating: 4.8, desc: 'One of the world\'s best paragliding sites, hosting international championships.', fee: '₹2,000 – ₹3,500 (tandem flight)', hours: '10:00 AM – 5:00 PM', season: 'March – June, September – November', tip: 'Book with FAI-certified pilots for cross-country tandem flights.' },
  { name: 'Spiti Valley Trek', type: 'Adventure', loc: 'Lahaul and Spiti, Himachal Pradesh', rating: 4.8, desc: 'A cold desert trekking circuit of monasteries, moonscapes, and remote villages.', fee: '₹8,000 – ₹15,000 (multi-day guided trek)', hours: 'Open May – October', season: 'June – September', tip: 'Carry altitude sickness medication and acclimatize gradually.' },
  { name: 'Chadar Trek', type: 'Adventure', loc: 'Zanskar, Ladakh', rating: 4.7, desc: 'A legendary winter trek across the frozen Zanskar river.', fee: '₹18,000 – ₹25,000 (permit + guide package)', hours: 'Open mid-January – February only', season: 'Mid-January – February', tip: 'Only attempt with a registered operator — ice conditions change daily.' },
  { name: 'Havelock Scuba Diving', type: 'Adventure', loc: 'Havelock Island, Andaman & Nicobar', rating: 4.7, desc: 'World-class coral reef diving with vibrant marine life in crystal-clear waters.', fee: '₹4,500 – ₹8,000 (per dive package)', hours: '8:00 AM – 4:00 PM', season: 'November – April', tip: 'PADI certification courses are available for complete beginners.' },
  { name: 'Coorg Zip-lining', type: 'Adventure', loc: 'Kodagu, Karnataka', rating: 4.4, desc: 'Zip-line and canopy adventure courses through coffee-estate forest canopy.', fee: '₹800 – ₹1,500', hours: '9:00 AM – 5:00 PM', season: 'October – May', tip: 'Combine with a coffee plantation tour for a full adventure day.' },
  { name: 'Kasol Trekking Trail', type: 'Adventure', loc: 'Kullu, Himachal Pradesh', rating: 4.5, desc: 'A backpacker hub and gateway to the Parvati Valley\'s riverside trekking trails.', fee: '₹500 (guide fee; trails are free)', hours: 'Open year-round (best Apr–Jun, Sep–Nov)', season: 'April – June, September – November', tip: 'Carry a valid ID — the trail passes through restricted border areas.' },
  { name: 'Kolad River Rafting', type: 'Adventure', loc: 'Raigad, Maharashtra', rating: 4.4, desc: 'A weekend rafting getaway on the Kundalika river near Mumbai and Pune.', fee: '₹700 – ₹1,200', hours: '8:00 AM – 3:00 PM', season: 'June – September', tip: 'Best enjoyed as a day trip from Mumbai or Pune on weekends.' },
  { name: 'Solang Valley Adventure Park', type: 'Adventure', loc: 'Manali, Himachal Pradesh', rating: 4.5, desc: 'Zorbing, cable cars, and seasonal skiing in a dramatic glacial valley.', fee: '₹300 – ₹2,000 (activity-wise)', hours: '9:00 AM – 5:00 PM', season: 'December – March, April – June', tip: 'Take the cable car up for paragliding launch points with valley views.' },
];

const genericHotelPool = ['Radisson Blu', 'Taj Gateway', 'The Fern Resort', 'Lemon Tree Premier', 'Ginger Hotels', 'ITC Welcomgroup'];

const STATE_TOURISM_CONTACTS: Record<string, string> = {
  'Kerala': 'Kerala Tourism Helpline: 1800-11-2596 (toll-free)',
  'Uttarakhand': 'Uttarakhand Tourism Helpline: 1364 (toll-free)',
  'Odisha': 'Odisha Tourism Helpline: 1800-208-1414',
  'West Bengal': 'West Bengal Tourism Helpline: 1800-345-3538',
  'Maharashtra': 'Maharashtra Tourism (MTDC): 1800-22-1868',
  'Karnataka': 'Karnataka Tourism Helpline: 1800-425-5323',
  'Himachal Pradesh': 'Himachal Pradesh Tourism: 1800-180-8077',
  'Andhra Pradesh': 'AP Tourism Helpline: 1800-425-0333',
  'Manipur': 'Manipur Tourism Office: 0385-2220802',
  'Assam': 'Assam Tourism Helpline: 1800-345-3611',
  'Uttar Pradesh': 'UP Tourism Helpline: 1800-1800-11',
  'Telangana': 'Telangana Tourism: 040-2341-4334',
  'Delhi': 'Delhi Tourism Helpline: 1800-11-1363',
  'Madhya Pradesh': 'MP Tourism Board: 0755-2778383',
  'Rajasthan': 'Rajasthan Tourism Helpline: 1800-11-1363',
  'Tamil Nadu': 'Tamil Nadu Tourism: 044-2533-3850',
  'Jammu & Kashmir': 'J&K Tourism Department: 0194-2452690',
  'Gujarat': 'Gujarat Tourism Helpline: 1800-200-5080',
  'Goa': 'Goa Tourism Development Corp: 0832-2437132',
  'Andaman & Nicobar': 'Andaman Tourism Office: 03192-232694',
  'Diu': 'Diu Tourism Office: 02875-252653',
  'Ladakh': 'Ladakh Tourism Office: 01982-252094',
};

function contactFor(loc: string): string {
  const state = loc.includes(',') ? loc.split(',').pop()!.trim() : loc.trim();
  return STATE_TOURISM_CONTACTS[state] || 'Incredible India Tourism Helpline: 1800-11-1363 (toll-free, 24x7)';
}

export const allTourism = tourismDefs.map((t, i) => {
  const nearby = [tourismDefs[(i + 3) % tourismDefs.length].name, tourismDefs[(i + 7) % tourismDefs.length].name];
  return {
    id: `tourism-${String(i + 1).padStart(3, '0')}`,
    name: t.name,
    type: t.type,
    category: t.type,
    description: t.desc,
    location: t.loc,
    rating: t.rating,
    reviewCount: 50 + i * 17,
    reviews: [
      { id: `tour-rev-${i}-1`, rating: 5, comment: `${t.name} completely lived up to the hype — a must-visit!`, author: demoPeople[i % demoPeople.length].name, createdAt: daysAgo(4) },
      { id: `tour-rev-${i}-2`, rating: 4, comment: 'Beautiful place, go early to beat the crowds.', author: demoPeople[(i + 2) % demoPeople.length].name, createdAt: daysAgo(12) },
    ],
    images: [img(t.name), img(`${t.name}-2`, 400, 300), img(`${t.name}-3`, 400, 300)],
    image: img(t.name),
    entryFee: t.fee,
    openingTime: t.hours,
    bestTime: t.season,
    bestSeason: t.season,
    travelTips: t.tip,
    contactInfo: contactFor(t.loc),
    nearbyAttractions: nearby,
    nearbyHotels: [genericHotelPool[i % genericHotelPool.length], genericHotelPool[(i + 3) % genericHotelPool.length]],
    mapUrl: `https://maps.google.com/?q=${encodeURIComponent(t.name + ' ' + t.loc)}`,
    createdAt: daysAgo(90 - i),
  };
});

// ─── GOVERNMENT SERVICES ────────────────────────────────────────────────────
const govDefs = [
  { name: 'Aadhaar Services', cat: 'Identity', desc: 'Apply for new Aadhaar, update details, download e-Aadhaar, and check enrollment status.', link: 'https://uidai.gov.in' },
  { name: 'Passport Application', cat: 'Identity', desc: 'Apply for a fresh passport, renewal, tatkal service, and track your application status.', link: 'https://passportindia.gov.in' },
  { name: 'PAN Card Services', cat: 'Identity', desc: 'Apply for a new PAN card, request corrections, reprint, and link PAN with Aadhaar online.', link: 'https://incometax.gov.in' },
  { name: 'Driving Licence Services', cat: 'Transport', desc: 'Apply for a learner\'s licence, permanent licence, renewal, and check status online.', link: 'https://parivahan.gov.in' },
  { name: 'Property Tax Payment', cat: 'Civic', desc: 'View dues, pay property tax online, and download payment receipts for your property.', link: 'https://serviceonline.gov.in' },
];

export const allGovServices = govDefs.map((g, i) => ({
  id: `gov-${String(i + 1).padStart(3, '0')}`,
  name: g.name,
  category: g.cat,
  description: g.desc,
  link: g.link,
  processingTime: `${3 + (i % 5)}-${7 + (i % 5)} business days`,
  documents: ['Aadhaar Card', 'Proof of Address', 'Passport Photo'],
  fee: i % 3 === 0 ? 'Free' : `₹${50 + i * 10}`,
  icon: '🏛️',
  createdAt: daysAgo(60),
}));

// ─── MARKETPLACE (30+ products across common shopping categories) ──────────
const productDefs = [
  // Electronics
  { name: 'Laptop', cat: 'Electronics', price: 48999, seller: 0, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&auto=format&q=70', desc: '15.6" full-HD laptop with a fast SSD, ideal for work and study.' },
  { name: 'Gaming PC', cat: 'Electronics', price: 89999, seller: 1, img: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=400&h=400&fit=crop&auto=format&q=70', desc: 'High-performance desktop tower built for demanding modern games.' },
  { name: 'Smartphone', cat: 'Electronics', price: 24999, seller: 2, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Latest-gen smartphone with a triple-camera setup and AMOLED display.' },
  { name: 'Tablet', cat: 'Electronics', price: 19999, seller: 3, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&auto=format&q=70', desc: '10.5" tablet with stylus support, great for note-taking and media.' },
  { name: 'DSLR Camera', cat: 'Electronics', price: 39999, seller: 4, img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop&auto=format&q=70', desc: '24MP DSLR camera with an 18-55mm kit lens, perfect for beginners.' },
  { name: 'Smart TV', cat: 'Electronics', price: 27999, seller: 0, img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&auto=format&q=70', desc: '43" 4K smart LED TV with built-in streaming apps.' },
  { name: 'Headphones', cat: 'Electronics', price: 3499, seller: 1, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Over-ear headphones with active noise cancellation and deep bass.' },
  { name: 'Smart Watch', cat: 'Electronics', price: 4999, seller: 2, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Water-resistant smart watch that tracks heart rate, sleep and workouts.' },
  // Furniture
  { name: 'Sofa', cat: 'Furniture', price: 18999, seller: 3, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&auto=format&q=70', desc: '3-seater fabric sofa with plush cushions for the living room.' },
  { name: 'Dining Table', cat: 'Furniture', price: 22999, seller: 4, img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop&auto=format&q=70', desc: '6-seater solid wood dining table with matching chairs.' },
  { name: 'Office Chair', cat: 'Furniture', price: 2600, seller: 0, img: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Ergonomic office chair with lumbar support.' },
  { name: 'Study Table', cat: 'Furniture', price: 3200, seller: 1, img: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Compact study table made from solid wood.' },
  { name: 'Wardrobe', cat: 'Furniture', price: 15999, seller: 2, img: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=400&h=400&fit=crop&auto=format&q=70', desc: '3-door wardrobe with mirror and ample storage space.' },
  // Home
  { name: 'Wall Clock', cat: 'Home', price: 899, seller: 3, img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop&auto=format&q=70', desc: 'A beautifully crafted handmade wooden wall clock with a smooth, silent movement.' },
  { name: 'Fan', cat: 'Home', price: 2199, seller: 4, img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop&auto=format&q=70', desc: 'High-speed ceiling fan with energy-efficient BLDC motor.' },
  { name: 'Refrigerator', cat: 'Home', price: 26999, seller: 0, img: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&auto=format&q=70', desc: '260L frost-free double-door refrigerator with a 3-star rating.' },
  { name: 'Washing Machine', cat: 'Home', price: 21999, seller: 1, img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Fully automatic 7kg front-load washing machine.' },
  { name: 'Microwave', cat: 'Home', price: 5499, seller: 2, img: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&h=400&fit=crop&auto=format&q=70', desc: '20L solo microwave oven, compact and easy to use.' },
  // Sports
  { name: 'Cricket Bat', cat: 'Sports', price: 3999, seller: 3, img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=400&fit=crop&auto=format&q=70', desc: 'English willow cricket bat, tournament grade.' },
  { name: 'Football', cat: 'Sports', price: 1299, seller: 4, img: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Official size-5 match football with durable synthetic leather.' },
  { name: 'Mountain Bicycle', cat: 'Sports', price: 12999, seller: 0, img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Lightweight 21-speed mountain bicycle with front suspension and all-terrain tyres.' },
  { name: 'Dumbbells', cat: 'Sports', price: 2499, seller: 1, img: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Adjustable rubber-coated dumbbell pair, 2x10kg.' },
  // Fashion
  { name: 'Running Shoes', cat: 'Fashion', price: 2200, seller: 2, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Lightweight running shoes built for speed and comfort.' },
  { name: 'Jacket', cat: 'Fashion', price: 1799, seller: 3, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Water-resistant windbreaker jacket for all-season wear.' },
  { name: 'Backpack', cat: 'Fashion', price: 1499, seller: 4, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&auto=format&q=70', desc: '35L travel backpack with a padded laptop compartment.' },
  // Books
  { name: 'Programming Books', cat: 'Books', price: 999, seller: 0, img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Bundle of best-selling programming and software engineering books.' },
  { name: 'Novels', cat: 'Books', price: 599, seller: 1, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Curated collection of best-selling fiction novels.' },
  // Kitchen
  { name: 'Mixer Grinder', cat: 'Kitchen', price: 2999, seller: 2, img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop&auto=format&q=70', desc: '750W mixer grinder with 3 stainless steel jars.' },
  { name: 'Air Fryer', cat: 'Kitchen', price: 5999, seller: 3, img: 'https://images.unsplash.com/photo-1585237017125-24baf8d7406f?w=400&h=400&fit=crop&auto=format&q=70', desc: '4.5L digital air fryer for healthier, oil-free cooking.' },
  // Gaming
  { name: 'PlayStation', cat: 'Gaming', price: 49999, seller: 4, img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Next-gen gaming console with a DualSense controller included.' },
  { name: 'Xbox Controller', cat: 'Gaming', price: 4999, seller: 0, img: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Wireless controller with textured grip and low-latency connection.' },
];

export const allProducts = productDefs.map((p, i) => {
  const seller = demoPeople[p.seller % demoPeople.length];
  return {
    id: `product-${String(i + 1).padStart(3, '0')}`,
    name: p.name,
    description: p.desc,
    price: p.price,
    category: p.cat,
    images: [p.img],
    image: p.img,
    rating: 4.3 + (i % 6) / 10,
    reviewCount: 18 + i * 7,
    stock: 3 + (i % 20),
    website: `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`,
    sellerId: seller.id,
    seller: { id: seller.id, name: seller.name, username: seller.username, profileImage: seller.profileImage, rating: 4.5 + (i % 4) / 10 },
    reviews: [
      { id: `rev-${i}-1`, rating: 5, comment: 'Excellent quality! Highly recommend.', author: demoPeople[(i + 1) % demoPeople.length].name, createdAt: daysAgo(5) },
      { id: `rev-${i}-2`, rating: 4, comment: 'Good product, fast delivery.', author: demoPeople[(i + 2) % demoPeople.length].name, createdAt: daysAgo(10) },
    ],
    inStock: true,
    createdAt: daysAgo(i * 3),
  };
});

// ─── EDUCATION (exactly 5 — unique resources) ───────────────────────────────
export const allCourses = [
  { id: 'course-001', title: 'AI & Machine Learning Academy', provider: 'DeepMind Institute', category: 'Technology', duration: '16 weeks', fee: '₹45,000', free: false, certification: true, mode: 'Online', rating: 4.9, students: 1240, image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 'course-002', title: 'Full Stack Web Development', provider: 'CodeCraft Academy', category: 'Technology', duration: '20 weeks', fee: '₹38,000', free: false, certification: true, mode: 'Hybrid', rating: 4.8, students: 980, image: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 'course-003', title: 'Cloud Computing Essentials', provider: 'CloudPro Training', category: 'Technology', duration: '10 weeks', fee: '₹28,000', free: false, certification: true, mode: 'Online', rating: 4.7, students: 760, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 'course-004', title: 'Cybersecurity Training', provider: 'SecureNet Labs', category: 'Technology', duration: '12 weeks', fee: '₹32,000', free: false, certification: true, mode: 'Online', rating: 4.8, students: 640, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop&auto=format&q=70' },
  { id: 'course-005', title: 'Data Science Masterclass', provider: 'DataWiz Institute', category: 'Technology', duration: '18 weeks', fee: '₹42,000', free: false, certification: true, mode: 'Hybrid', rating: 4.9, students: 1120, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format&q=70' },
];

export const allScholarships = [
  { id: 'sch-001', name: 'Merit Scholarship for Engineering Students', title: 'Merit Scholarship for Engineering Students', amount: '₹1,00,000/year', deadline: daysFromNow(30), eligibility: '80%+ in 12th, family income < ₹8 LPA' },
  { id: 'sch-002', name: 'Women in STEM Grant', title: 'Women in STEM Grant', amount: '₹50,000', deadline: daysFromNow(45), eligibility: 'Female students in Science/Technology fields' },
  { id: 'sch-003', name: 'Rural Education Support Fund', title: 'Rural Education Support Fund', amount: 'Full tuition', deadline: daysFromNow(60), eligibility: 'Students from rural areas, merit-based' },
  { id: 'sch-004', name: 'Sports Excellence Scholarship', title: 'Sports Excellence Scholarship', amount: '₹75,000/year', deadline: daysFromNow(20), eligibility: 'State/national level sports achievement' },
];

// ─── HEALTHCARE ─────────────────────────────────────────────────────────────
const unsplashPhoto = (id: string, w = 800, h = 400) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;

export const allHospitals = [
  { id: 'hosp-001', name: 'Apollo Hospitals Hyderabad', type: 'Multi-specialty', address: 'Jubilee Hills, Hyderabad, Telangana', phone: '+91-40-2360-7777', rating: 4.5, beds: 500, emergency: true, distance: '1.2 km', specialities: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency'], image: unsplashPhoto('1587351021759-3e566b6af7cc') },
  { id: 'hosp-002', name: 'Care Hospitals', type: 'Primary Care', address: 'Banjara Hills, Hyderabad, Telangana', phone: '+91-40-6165-6565', rating: 4.3, beds: 50, emergency: false, distance: '2.8 km', specialities: ['General Medicine', 'Pediatrics', 'Dermatology'], image: unsplashPhoto('1516549655169-df83a0774514') },
  { id: 'hosp-003', name: 'Rainbow Children\'s Hospital', type: 'Pediatric', address: 'Banjara Hills, Hyderabad, Telangana', phone: '+91-40-4466-4466', rating: 4.7, beds: 200, emergency: true, distance: '3.5 km', specialities: ['Pediatrics', 'Neonatology', 'Child Surgery'], image: unsplashPhoto('1631563019676-dade0dbdb8fc') },
  { id: 'hosp-004', name: 'AyurVAID Wellness Center', type: 'Alternative Medicine', address: 'Jubilee Hills, Hyderabad, Telangana', phone: '+91-40-2354-9090', rating: 4.4, beds: 30, emergency: false, distance: '4.1 km', specialities: ['Ayurveda', 'Yoga Therapy', 'Panchakarma'], image: unsplashPhoto('1544161515-4ab6ce6db874') },
  { id: 'hosp-005', name: 'AIG Hospitals', type: 'Multi-specialty', address: 'Gachibowli, Hyderabad, Telangana', phone: '+91-40-4244-4222', rating: 4.8, beds: 350, emergency: true, distance: '5.0 km', specialities: ['Cardiology', 'Cardiac Surgery', 'ICU'], image: unsplashPhoto('1538108149393-fbbd81895907') },
  { id: 'hosp-006', name: 'Yashoda Hospitals', type: 'Primary Care', address: 'Somajiguda, Hyderabad, Telangana', phone: '+91-40-4567-4567', rating: 4.2, beds: 25, emergency: false, distance: '0.8 km', specialities: ['General Medicine', 'Vaccination', 'Family Health'], image: unsplashPhoto('1551076805-e1869033e561') },
];

export const allHealthSchemes = [
  { id: 'hs-001', name: 'Ayushman Bharat', description: 'Health coverage up to ₹5 lakh per family per year for secondary and tertiary care.', eligibility: 'SECC database listed families', color: 'from-green-600/20 to-emerald-600/20', border: 'border-green-500/20' },
  { id: 'hs-002', name: 'Free Medicine Scheme', description: 'Essential medicines provided free at government health centers.', eligibility: 'All residents with valid ID', color: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/20' },
  { id: 'hs-003', name: 'Maternal Health Program', description: 'Free prenatal care, delivery, and postnatal support for expecting mothers.', eligibility: 'Pregnant women registered at local PHC', color: 'from-pink-600/20 to-rose-600/20', border: 'border-pink-500/20' },
  { id: 'hs-004', name: 'Senior Citizen Health Card', description: 'Discounted consultations and free health checkups for citizens above 60.', eligibility: 'Age 60+, local residence proof', color: 'from-purple-600/20 to-violet-600/20', border: 'border-purple-500/20' },
];

// ─── DASHBOARD ANALYTICS ────────────────────────────────────────────────────
export const dashboardAnalytics = {
  stats: {
    totalUsers: 12450,
    activeUsers: 3890,
    totalCommunities: allCommunities.length,
    totalPosts: 8420,
    totalEvents: allEvents.length,
    totalJobs: allJobs.length,
    newUsersThisWeek: 234,
    engagementRate: 67.5,
  },
  communityGrowth: [
    { month: 'Jan', members: 8200 }, { month: 'Feb', members: 9100 }, { month: 'Mar', members: 9800 },
    { month: 'Apr', members: 10500 }, { month: 'May', members: 11200 }, { month: 'Jun', members: 12450 },
  ],
  jobStats: { open: allJobs.length, applied: 1240, filled: 89, remote: 4 },
  eventStats: { upcoming: allEvents.length, thisMonth: 5, totalAttendees: 5420 },
  trendingCommunities: allCommunities.slice(0, 5).map((c) => ({ id: c.id, name: c.name, slug: c.slug, memberCount: c.memberCount, growth: `+${5 + Math.floor(Math.random() * 15)}%` })),
  trendingJobs: allJobs.slice(0, 4).map((j) => ({ id: j.id, title: j.title, company: j.company, applicants: j.applicants })),
  trendingNews: allNews.slice(0, 4).map((n) => ({ id: n.id, title: n.title, views: n.views, category: n.category })),
};

// ─── POSTS (varied content) ─────────────────────────────────────────────────
const postTemplates = [
  { content: 'Just finished setting up our community garden! 🌱 Who wants to join the weekend planting session?', commIdx: 12 },
  { content: 'Looking for co-founders for a local delivery startup. DM if interested! #startup #hometown', commIdx: 1 },
  { content: 'Best sunset spot in the city? Share your favorite viewpoints! 📸', commIdx: 4 },
  { content: 'Weekly book club meeting this Saturday at 4 PM. We\'re discussing "The Alchemist".', commIdx: 10 },
  { content: 'PSA: Free coding workshop for beginners next week at the library. No experience needed!', commIdx: 2 },
  { content: 'Our neighborhood cleanup drive collected 200kg of waste! Proud of this community 💚', commIdx: 12 },
  { content: 'Anyone playing Valorant tonight? Looking for a 5-stack from the local gaming community.', commIdx: 7 },
  { content: 'Farmers market this Sunday — fresh organic produce directly from local farms!', commIdx: 5 },
  { content: 'Just launched my photography portfolio. Would love feedback from fellow artists!', commIdx: 4 },
  { content: 'College fest planning committee meeting tomorrow. All students welcome!', commIdx: 14 },
  { content: 'Morning run group starting 6 AM at Central Park. All fitness levels welcome! 🏃', commIdx: 6 },
  { content: 'Local business owners — let\'s discuss the new tax policies at our monthly meetup.', commIdx: 11 },
  { content: 'Open mic night this Friday! Musicians, poets, comedians — sign up now 🎤', commIdx: 8 },
  { content: 'New indie film screening at the community center. Support local filmmakers!', commIdx: 9 },
  { content: 'Travel tips for the upcoming monsoon season — share your experiences!', commIdx: 13 },
  { content: '📢 ANNOUNCEMENT: City marathon registration is now open! Early bird discount ends Friday.', commIdx: 6, type: 'ANNOUNCEMENT' },
  { content: '📢 ANNOUNCEMENT: New metro station opening next month near Tech Park.', commIdx: 0, type: 'ANNOUNCEMENT' },
  { content: 'Women entrepreneurs meetup — networking, mentorship, and funding opportunities.', commIdx: 3 },
  { content: 'Built my first React Native app! Happy to help others getting started with mobile dev.', commIdx: 2 },
  { content: 'Who\'s attending the startup expo next week? Let\'s connect beforehand!', commIdx: 1 },
];

export function buildAllPosts(currentUserId = 'demo-user-001') {
  return postTemplates.map((t, i) => {
    const author = demoPeople[i % demoPeople.length];
    // commIdx values were authored for a larger community list; clamp into range
    // so we never index past the 5 communities and crash at module load.
    const comm = allCommunities[t.commIdx % allCommunities.length];
    const likes = 12 + (i * 17) % 200;
    const comments = 3 + (i * 7) % 50;
    return {
      id: `post-${String(i + 1).padStart(3, '0')}`,
      content: t.content,
      type: t.type || 'TEXT',
      images: i % 4 === 0 ? [img(postTemplates[i % postTemplates.length].commIdx === 4 ? '1452587925148-ce544e77e70d' : '1504674900247-0877df9cc836')] : [],
      authorId: author.id,
      communityId: comm.id,
      createdAt: hoursAgo(i * 3 + 1),
      updatedAt: hoursAgo(i * 3),
      likeCount: likes,
      commentCount: comments,
      shareCount: 2 + (i % 15),
      isLiked: i % 5 === 0,
      isPinned: t.type === 'ANNOUNCEMENT',
      author: { id: author.id, name: author.name, username: author.username, profileImage: author.profileImage },
      community: { id: comm.id, name: comm.name, slug: comm.slug },
      _count: { likes, comments },
    };
  });
}

export function buildCommentsForPost(postId: string, count = 5) {
  const commentTexts = [
    'Great post! Thanks for sharing.',
    'This is exactly what our community needed.',
    'Count me in! 🙌',
    'Has anyone tried this before? Would love to hear experiences.',
    'Sharing this with my friends!',
    'Amazing initiative. Proud to be part of this community.',
    'When is the next one happening?',
    'Can we get more details about this?',
    'Love this! Keep up the great work.',
    'I\'ve been looking for something like this. Thank you!',
  ];
  // Derive a stable numeric seed from the postId. IDs created at runtime are
  // base-36 (e.g. "post-mqz060g9s7"), so parseInt() returns NaN — fall back to a
  // char-sum so freshly created posts get valid authors instead of crashing.
  const rawSeed = parseInt(postId.split('-')[1] || '1', 10);
  const seed = Number.isNaN(rawSeed)
    ? postId.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    : rawSeed;
  return Array.from({ length: count }, (_, i) => {
    const author = demoPeople[(seed + i) % demoPeople.length] || demoPeople[i % demoPeople.length];
    return {
      id: `comment-${postId}-${i}`,
      postId,
      content: commentTexts[(i + seed) % commentTexts.length],
      authorId: author.id,
      author: { id: author.id, name: author.name, username: author.username, profileImage: author.profileImage },
      likeCount: 1 + (i % 8),
      createdAt: hoursAgo(i + 1),
    };
  });
}

// In-memory bookmark store for demo mode
const userBookmarks: Map<string, Set<string>> = new Map();

export function toggleBookmark(userId: string, targetType: string, targetId: string): boolean {
  const key = `${userId}:${targetType}`;
  if (!userBookmarks.has(key)) userBookmarks.set(key, new Set());
  const set = userBookmarks.get(key)!;
  const fullKey = targetId;
  if (set.has(fullKey)) { set.delete(fullKey); return false; }
  set.add(fullKey); return true;
}

export function getBookmarks(userId: string, targetType?: string) {
  const results: { targetType: string; targetId: string; item: any }[] = [];
  for (const [key, set] of userBookmarks.entries()) {
    const [uid, type] = key.split(':');
    if (uid !== userId) continue;
    if (targetType && type !== targetType) continue;
    for (const id of set) {
      let item: any = null;
      if (type === 'jobs') item = allJobs.find((j) => j.id === id);
      else if (type === 'news') item = allNews.find((n) => n.id === id);
      else if (type === 'marketplace') item = allProducts.find((p) => p.id === id);
      else if (type === 'events') item = allEvents.find((e) => e.id === id);
      if (item) results.push({ targetType: type, targetId: id, item });
    }
  }
  return results;
}

export function isBookmarked(userId: string, targetType: string, targetId: string): boolean {
  const key = `${userId}:${targetType}`;
  return userBookmarks.get(key)?.has(targetId) ?? false;
}

// Lookup helpers
export function getCommunityBySlug(slug: string) { return allCommunities.find((c) => c.slug === slug); }
export function getCommunityById(id: string) { return allCommunities.find((c) => c.id === id); }
export function getEventById(id: string) { return allEvents.find((e) => e.id === id); }
export function getJobById(id: string) { return allJobs.find((j) => j.id === id); }
export function getNewsById(id: string) { return allNews.find((n) => n.id === id); }
export function getTourismById(id: string) { return allTourism.find((t) => t.id === id); }
export function getGovById(id: string) { return allGovServices.find((g) => g.id === id); }
export function getProductById(id: string) { return allProducts.find((p) => p.id === id); }
