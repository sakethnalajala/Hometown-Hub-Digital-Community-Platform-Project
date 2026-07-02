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
  { title: 'Frontend Developer', company: 'TechNova Solutions', type: 'Full-time', salary: '₹8–14 LPA', loc: 'Bangalore', skills: ['React', 'TypeScript', 'Tailwind CSS'] },
  { title: 'Backend Developer', company: 'CloudStack Inc', type: 'Full-time', salary: '₹10–18 LPA', loc: 'Hyderabad', skills: ['Node.js', 'PostgreSQL', 'Redis'] },
  { title: 'Full Stack Developer', company: 'Digital Forge', type: 'Full-time', salary: '₹12–20 LPA', loc: 'Pune', skills: ['React', 'Node.js', 'MongoDB'] },
  { title: 'React Developer', company: 'AppCraft Studio', type: 'Full-time', salary: '₹7–12 LPA', loc: 'Remote', skills: ['React', 'Redux', 'Next.js'] },
  { title: 'Node.js Developer', company: 'ServerLogic', type: 'Contract', salary: '₹9–15 LPA', loc: 'Chennai', skills: ['Node.js', 'Express', 'AWS'] },
  { title: 'Python Developer', company: 'DataPulse AI', type: 'Full-time', salary: '₹10–16 LPA', loc: 'Bangalore', skills: ['Python', 'Django', 'FastAPI'] },
  { title: 'Data Analyst', company: 'InsightMetrics', type: 'Full-time', salary: '₹6–10 LPA', loc: 'Mumbai', skills: ['SQL', 'Python', 'Tableau'] },
  { title: 'Data Scientist', company: 'MLWorks', type: 'Full-time', salary: '₹15–25 LPA', loc: 'Bangalore', skills: ['Python', 'TensorFlow', 'Statistics'] },
  { title: 'UI/UX Designer', company: 'DesignHive', type: 'Full-time', salary: '₹8–14 LPA', loc: 'Remote', skills: ['Figma', 'Prototyping', 'User Research'] },
  { title: 'Graphic Designer', company: 'Creative Pulse', type: 'Part-time', salary: '₹4–7 LPA', loc: 'Delhi', skills: ['Photoshop', 'Illustrator', 'Branding'] },
  { title: 'Marketing Executive', company: 'BrandWave Media', type: 'Full-time', salary: '₹5–9 LPA', loc: 'Mumbai', skills: ['Digital Marketing', 'SEO', 'Content Strategy'] },
  { title: 'HR Executive', company: 'PeopleFirst Corp', type: 'Full-time', salary: '₹5–8 LPA', loc: 'Hyderabad', skills: ['Recruitment', 'HRMS', 'Employee Relations'] },
  { title: 'Sales Executive', company: 'GrowthEdge Sales', type: 'Full-time', salary: '₹4–8 LPA + incentives', loc: 'Chennai', skills: ['B2B Sales', 'CRM', 'Negotiation'] },
  { title: 'Civil Engineer', company: 'BuildRight Infrastructure', type: 'Full-time', salary: '₹6–12 LPA', loc: 'Pune', skills: ['AutoCAD', 'Project Management', 'Structural Design'] },
  { title: 'Mechanical Engineer', company: 'Precision Motors', type: 'Full-time', salary: '₹7–13 LPA', loc: 'Chennai', skills: ['SolidWorks', 'Manufacturing', 'Quality Control'] },
  { title: 'Electrical Engineer', company: 'PowerGrid Solutions', type: 'Full-time', salary: '₹7–14 LPA', loc: 'Bangalore', skills: ['Circuit Design', 'PLC', 'Electrical Safety'] },
  { title: 'Teacher', company: 'Bright Future Academy', type: 'Full-time', salary: '₹3–6 LPA', loc: 'Local', skills: ['Teaching', 'Curriculum Design', 'Communication'] },
  { title: 'Accountant', company: 'FinTrust Associates', type: 'Full-time', salary: '₹4–8 LPA', loc: 'Mumbai', skills: ['Tally', 'GST', 'Financial Reporting'] },
  { title: 'Staff Nurse', company: 'City General Hospital', type: 'Full-time', salary: '₹3–6 LPA', loc: 'Local', skills: ['Patient Care', 'ICU', 'Medical Records'] },
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
    authorId: author.id,
    author: { id: author.id, name: author.name, profileImage: author.profileImage },
    createdAt: daysAgo(i * 2),
    applicants: 15 + i * 7,
  };
});

// ─── EVENTS (exactly 5 — one per global city) ───────────────────────────────
const eventDefs = [
  { title: 'Hyderabad Tech Expo 2026', type: 'Tech Expo', loc: 'HITEC City Convention Centre, Hyderabad, India', days: 6, img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop&auto=format&q=70', attendees: 1200, desc: 'India\'s biggest hometown tech showcase — AI, robotics and startups under one roof at HITEC City, Hyderabad.' },
  { title: 'Tokyo Cultural Festival', type: 'Cultural Festival', loc: 'Ueno Park, Tokyo, Japan', days: 14, img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=400&fit=crop&auto=format&q=70', attendees: 2500, desc: 'Experience traditional dance, lantern parades and authentic Japanese cuisine in the heart of Tokyo.' },
  { title: 'New York Startup Summit', type: 'Startup Summit', loc: 'Javits Center, New York, USA', days: 21, img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&auto=format&q=70', attendees: 1800, desc: 'Pitch nights, investor panels and networking with the brightest founders in the Big Apple.' },
  { title: 'London Music Carnival', type: 'Music Concert', loc: 'Hyde Park, London, United Kingdom', days: 30, img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop&auto=format&q=70', attendees: 5000, desc: 'A day of live performances from world-class artists across multiple stages in Hyde Park.' },
  { title: 'Sydney Food Festival', type: 'Food Festival', loc: 'Darling Harbour, Sydney, Australia', days: 18, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop&auto=format&q=70', attendees: 3200, desc: 'Taste signature dishes from top chefs and local vendors along the waterfront at Darling Harbour.' },
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
  { cat: 'Politics', title: 'City Council Approves ₹500 Crore Infrastructure Budget', summary: 'Major allocation for roads, water supply, and public transport upgrades across all wards.' },
  { cat: 'Education', title: 'New STEM Labs Open in 50 Public Schools', summary: 'State government initiative brings robotics and coding labs to underserved schools.' },
  { cat: 'Technology', title: 'Local Startup Raises ₹50 Crore Series A Funding', summary: 'AgriTech platform FarmLink plans to onboard 1 lakh farmers across rural districts.' },
  { cat: 'Healthcare', title: 'Free Health Checkup Camps Across 20 Wards This Month', summary: 'Municipal health department partners with local hospitals for preventive care drives.' },
  { cat: 'Environment', title: 'Green Park Renovation Project Gets Green Light', summary: '₹12 crore plan adds eco-friendly amenities, amphitheater, and children\'s learning garden.' },
  { cat: 'Transportation', title: 'New Metro Line to Connect Outer Suburbs by 2027', summary: 'Transport authority announces expansion benefiting 2 million residents.' },
  { cat: 'Business', title: 'Small Business Grant Program Launches with ₹100 Crore Fund', summary: 'Local entrepreneurs can apply for zero-interest loans up to ₹10 lakhs.' },
  { cat: 'Sports', title: 'City Team Wins State Cricket Championship', summary: 'Historic victory after 15 years brings home the trophy to cheering fans.' },
  { cat: 'Culture', title: 'Annual Cultural Festival to Feature Artists from 20 Countries', summary: 'Five-day celebration of art, dance, and cuisine at the Heritage Grounds.' },
  { cat: 'Politics', title: 'New Ward Boundaries Finalized After Census Review', summary: 'Redistricting ensures better representation for growing suburban areas.' },
  { cat: 'Education', title: 'Scholarship Portal Opens for Merit-Based Awards', summary: '500 scholarships available for students pursuing higher education locally.' },
  { cat: 'Technology', title: 'Free Wi-Fi Hotspots Installed at 100 Public Locations', summary: 'Digital inclusion initiative covers parks, libraries, and bus stations.' },
  { cat: 'Healthcare', title: 'New 500-Bed Super Specialty Hospital Inaugurated', summary: 'State-of-the-art facility offers cardiac, neuro, and oncology services.' },
  { cat: 'Environment', title: 'Plastic Ban Enforcement Drives Reduce Waste by 40%', summary: 'Community compliance and awareness campaigns show significant impact.' },
  { cat: 'Transportation', title: 'Electric Bus Fleet Expanded to 200 Vehicles', summary: 'Clean energy transition accelerates with new charging infrastructure.' },
  { cat: 'Business', title: 'Local Handicraft Exporters See 30% Growth', summary: 'Global demand for traditional crafts boosts rural artisan incomes.' },
  { cat: 'Sports', title: 'Youth Football Academy Opens Registration', summary: 'Free coaching for ages 8-16 at the new municipal sports complex.' },
  { cat: 'Culture', title: 'Heritage Museum Launches Virtual Tour Platform', summary: 'Explore 500 years of local history from anywhere in the world.' },
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

// ─── TOURISM ────────────────────────────────────────────────────────────────
const tourismDefs = [
  { name: 'Heritage Fort & Museum', type: 'MONUMENT', loc: 'Old Town', rating: 4.8, img: '1564507592333-a60657ee0b0e' },
  { name: 'Grand Palace Hotel', type: 'HOTEL', loc: 'City Center', rating: 4.6, img: '1566073771259-6a8506099945' },
  { name: 'Spice Garden Restaurant', type: 'RESTAURANT', loc: 'Food Street', rating: 4.7, img: '1517248135467-4c7edcad34c4' },
  { name: 'Sacred Temple Complex', type: 'TEMPLE', loc: 'Temple Road', rating: 4.9, img: '1582510003544-4f00b300f827' },
  { name: 'Central Green Park', type: 'PARK', loc: 'Midtown', rating: 4.5, img: '1519331379826-f10be5486c6f' },
  { name: 'River Rafting Adventure', type: 'ACTIVITY', loc: 'River Valley', rating: 4.4, img: '1682687220062-8982fbdd6e03' },
  { name: 'Sunset Viewpoint', type: 'PLACE', loc: 'Hill Station Road', rating: 4.8, img: '1469854526616-dffba9b8615b' },
  { name: 'Royal Heritage Walk', type: 'GUIDE', loc: 'Old Town', rating: 4.7, img: '1555881400-74d4aca3a4c4' },
  { name: 'Lakefront Resort', type: 'HOTEL', loc: 'Lake District', rating: 4.5, img: '1571008887538-e7cc01336969' },
  { name: 'Street Food Market', type: 'RESTAURANT', loc: 'Night Bazaar', rating: 4.6, img: '1555939594-58d7cb561ad1' },
  { name: 'War Memorial', type: 'MONUMENT', loc: 'Civic Center', rating: 4.4, img: '1548013146-724797681b98' },
  { name: 'Botanical Gardens', type: 'PARK', loc: 'North Side', rating: 4.7, img: '1416879595882-3373a0480b05' },
  { name: 'Paragliding Experience', type: 'ACTIVITY', loc: 'Sky Hills', rating: 4.3, img: '1506905925346-be4210f7a501' },
  { name: 'Local Craft Village', type: 'PLACE', loc: 'Artisan Quarter', rating: 4.6, img: '1558618666-fcd25c85cd64' },
  { name: 'Heritage Food Tour', type: 'GUIDE', loc: 'Old Town', rating: 4.8, img: '1504674900247-0877df9cc836' },
];

export const allTourism = tourismDefs.map((t, i) => ({
  id: `tourism-${String(i + 1).padStart(3, '0')}`,
  name: t.name,
  type: t.type,
  description: `Discover ${t.name}, one of the most popular ${t.type.toLowerCase()} destinations in our hometown. Perfect for families, tourists, and locals alike.`,
  location: t.loc,
  rating: t.rating,
  reviewCount: 50 + i * 20,
  images: [img(t.img), img(t.img, 400, 300)],
  image: img(t.img),
  mapUrl: `https://maps.google.com/?q=${encodeURIComponent(t.name + ' ' + t.loc)}`,
  createdAt: daysAgo(30 - i),
}));

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

// ─── MARKETPLACE (exactly 5 — unique products) ──────────────────────────────
const productDefs = [
  { name: 'Handmade Wooden Clock', cat: 'Home Decor', price: 89, seller: 0, img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop&auto=format&q=70', desc: 'A beautifully crafted handmade wooden wall clock with a smooth, silent movement — a timeless centrepiece for any room.' },
  { name: 'Vintage Camera', cat: 'Electronics', price: 250, seller: 1, img: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400&h=400&fit=crop&auto=format&q=70', desc: 'A fully restored vintage film camera in excellent condition — perfect for collectors and analog photography enthusiasts.' },
  { name: 'Gaming Keyboard', cat: 'Electronics', price: 120, seller: 2, img: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Mechanical RGB gaming keyboard with hot-swappable switches, anti-ghosting keys and a durable aluminium frame.' },
  { name: 'Smart Fitness Watch', cat: 'Electronics', price: 199, seller: 3, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Track heart rate, sleep, steps and workouts with this water-resistant smart fitness watch and 7-day battery life.' },
  { name: 'Mountain Bicycle', cat: 'Sports', price: 650, seller: 4, img: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=400&fit=crop&auto=format&q=70', desc: 'Lightweight 21-speed mountain bicycle with front suspension and all-terrain tyres — built for trails and city rides alike.' },
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
export const allHospitals = [
  { id: 'hosp-001', name: 'City General Hospital', type: 'Multi-specialty', address: '123 Medical District', phone: '+91-80-12345678', rating: 4.5, beds: 500, emergency: true, distance: '1.2 km', specialities: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency'], image: img('1519494026892-80bbd122d4ac') },
  { id: 'hosp-002', name: 'Apollo Community Clinic', type: 'Primary Care', address: '45 Health Avenue', phone: '+91-80-87654321', rating: 4.3, beds: 50, emergency: false, distance: '2.8 km', specialities: ['General Medicine', 'Pediatrics', 'Dermatology'], image: img('1576091160399-112ba8d25d1f') },
  { id: 'hosp-003', name: 'Children\'s Specialty Hospital', type: 'Pediatric', address: '78 Care Lane', phone: '+91-80-11223344', rating: 4.7, beds: 200, emergency: true, distance: '3.5 km', specialities: ['Pediatrics', 'Neonatology', 'Child Surgery'], image: img('1586773860438-31348e07a288') },
  { id: 'hosp-004', name: 'Ayurveda Wellness Center', type: 'Alternative Medicine', address: '22 Green Valley Road', phone: '+91-80-55667788', rating: 4.4, beds: 30, emergency: false, distance: '4.1 km', specialities: ['Ayurveda', 'Yoga Therapy', 'Panchakarma'], image: img('1544161515-4ab6ce6db874') },
  { id: 'hosp-005', name: 'Metro Heart Institute', type: 'Multi-specialty', address: '90 Cardiac Boulevard', phone: '+91-80-99887766', rating: 4.8, beds: 350, emergency: true, distance: '5.0 km', specialities: ['Cardiology', 'Cardiac Surgery', 'ICU'], image: img('1576091160399-112ba8d25d1f') },
  { id: 'hosp-006', name: 'Sunrise Primary Health Center', type: 'Primary Care', address: '12 Community Road', phone: '+91-80-44556677', rating: 4.2, beds: 25, emergency: false, distance: '0.8 km', specialities: ['General Medicine', 'Vaccination', 'Family Health'], image: img('1519494026892-80bbd122d4ac') },
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
