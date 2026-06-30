export interface DemoPerson {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  role?: 'MEMBER' | 'MODERATOR' | 'ADMIN';
  bio?: string;
}

const names = [
  'Sarah Chen', 'Mike Johnson', 'Priya Sharma', 'James Wilson', 'Ananya Patel',
  'Carlos Mendez', 'Emily Zhang', 'Raj Kumar', 'Lisa Thompson', 'David Okonkwo',
  'Maria Santos', 'Ahmed Hassan', 'Jessica Lee', 'Tom Anderson', 'Neha Gupta',
  'Chris Taylor', 'Fatima Ali', 'Ryan O\'Brien', 'Sofia Rodriguez', 'Kevin Park',
  'Aisha Mohammed', 'Daniel Kim', 'Olivia Brown', 'Arjun Mehta', 'Emma Davis',
  'Marcus Johnson', 'Yuki Tanaka', 'Rachel Green', 'Vikram Singh', 'Hannah White',
  'Lucas Martin', 'Deepa Nair', 'Ben Carter', 'Zara Khan', 'Ethan Moore',
  'Meera Iyer', 'Alex Turner', 'Nina Petrova', 'Jordan Lee', 'Kavya Reddy',
];

export const demoPeople: DemoPerson[] = names.map((name, i) => ({
  id: `user-${String(i + 1).padStart(3, '0')}`,
  name,
  username: name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12) + i,
  profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
  role: i < 3 ? 'MODERATOR' : 'MEMBER',
  bio: `Active member of the Hometown Hub community since 2024.`,
}));

export function getPerson(id: string): DemoPerson {
  return demoPeople.find((p) => p.id === id) || demoPeople[0];
}

export function getRandomPeople(count: number, exclude?: string): DemoPerson[] {
  return demoPeople.filter((p) => p.id !== exclude).slice(0, count);
}
