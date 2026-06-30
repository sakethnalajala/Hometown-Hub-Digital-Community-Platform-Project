import { initializeDemoUsers } from './demoData';

let isDemo = true;

export const connectDB = async () => {
  // Initialize in-memory demo users for auth
  await initializeDemoUsers();

  // Always run in demo mode for local development
  isDemo = true;
  console.log('✓ Demo mode activated — use demo@hometownhub.com / Demo@12345');
};

export const isDemoMode = (): boolean => {
  return isDemo;
};

export const setDemoMode = (value: boolean) => {
  isDemo = value;
};
