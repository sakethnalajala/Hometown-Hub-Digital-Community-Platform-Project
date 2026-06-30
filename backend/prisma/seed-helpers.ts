import { faker } from '@faker-js/faker';

export const DEMO_USER_ID = 'demo-user-001';

let imgIndex = 1;
export function nextImage(w = 800, h = 400): string {
  imgIndex++;
  return `https://picsum.photos/seed/${imgIndex}/${w}/${h}`;
}

export function avatar(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function companyLogo(name: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1,8b5cf6,06b6d4,ec4899,10b981,f59e0b`;
}

export const COMMUNITY_NAMES = [
  'Technology Community', 'Gaming Community', 'Photography Club', 'Travel Community',
  'Movie Lovers', 'Music Community', 'Fitness Community', 'Sports Enthusiasts',
  'Developers Community', 'Farmers Network', 'Local Business Owners', 'Education Hub',
  'Medical Professionals', 'Fashion & Style', 'Food Lovers', 'Environmental Volunteers',
  'Women Entrepreneurs', 'Startup Community', 'Local Volunteers', 'Art & Design',
  'Culture & Heritage', 'Automobile Club', 'Artificial Intelligence', 'Cyber Security',
  'UI/UX Designers', 'Programming Club', 'Finance & Investment', 'Pet Lovers',
  'Book Readers Club', 'Nature & Outdoors',
];

export const JOB_TITLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer',
  'Node.js Developer', 'Python Developer', 'Java Developer', 'Data Analyst', 'Data Scientist',
  'UI/UX Designer', 'Graphic Designer', 'Product Manager', 'Marketing Executive',
  'HR Executive', 'Sales Executive', 'Civil Engineer', 'Mechanical Engineer',
  'Electrical Engineer', 'Teacher', 'Accountant', 'Staff Nurse', 'Pharmacist',
  'DevOps Engineer', 'Cloud Architect', 'Mobile Developer', 'QA Engineer',
  'Content Writer', 'SEO Specialist', 'Business Analyst', 'Project Manager',
  'Network Engineer', 'Security Analyst', 'Machine Learning Engineer', 'Blockchain Developer',
  'Video Editor', 'Social Media Manager', 'Customer Support', 'Operations Manager',
  'Legal Associate', 'Architect', 'Chef', 'Fitness Trainer', 'Real Estate Agent',
  'Insurance Advisor', 'Bank Officer', 'Research Scientist', 'Lab Technician',
  'Dental Assistant', 'Veterinarian', 'Fashion Designer',
];

export const NEWS_CATEGORIES = [
  'Politics', 'Education', 'Technology', 'Healthcare', 'Environment',
  'Transportation', 'Business', 'Sports', 'Culture',
];

export const EVENT_TYPES = [
  'Tech Meetup', 'Startup Expo', 'Cultural Festival', 'Music Concert', 'Sports Event',
  'Educational Seminar', 'Job Fair', 'Government Program', 'Tourism Event', 'College Event',
];

export const TOURISM_TYPES = [
  'PLACE', 'HOTEL', 'RESTAURANT', 'MONUMENT', 'TEMPLE', 'MUSEUM', 'PARK',
  'WATERFALL', 'HILL_STATION', 'ACTIVITY', 'RESORT', 'GUIDE',
];

export const GOV_SERVICES = [
  { name: 'Aadhaar Services', category: 'Identity' },
  { name: 'PAN Services', category: 'Identity' },
  { name: 'Passport Services', category: 'Identity' },
  { name: 'Voter ID Services', category: 'Identity' },
  { name: 'Birth Certificate', category: 'Certificates' },
  { name: 'Income Certificate', category: 'Certificates' },
  { name: 'Ration Card Services', category: 'Welfare' },
  { name: 'Driving License', category: 'Transport' },
  { name: 'Property Registration', category: 'Property' },
  { name: 'Electricity Connection', category: 'Utilities' },
  { name: 'Water Supply', category: 'Utilities' },
  { name: 'Gas Connection', category: 'Utilities' },
];

export function randomPastDate(daysBack: number): Date {
  return faker.date.recent({ days: daysBack });
}

export function randomFutureDate(daysAhead: number): Date {
  return faker.date.soon({ days: daysAhead });
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
