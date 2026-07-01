"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDemoMode = exports.isDemoMode = exports.connectDB = void 0;
const demoData_1 = require("./demoData");
let isDemo = true;
const connectDB = async () => {
    // Initialize in-memory demo users for auth
    await (0, demoData_1.initializeDemoUsers)();
    // Always run in demo mode for local development
    isDemo = true;
    console.log('✓ Demo mode activated — use demo@hometownhub.com / Demo@12345');
};
exports.connectDB = connectDB;
const isDemoMode = () => {
    return isDemo;
};
exports.isDemoMode = isDemoMode;
const setDemoMode = (value) => {
    isDemo = value;
};
exports.setDemoMode = setDemoMode;
//# sourceMappingURL=db.js.map