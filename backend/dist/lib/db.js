"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDemoMode = exports.isDemoMode = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const demoData_1 = require("./demoData");
let isDemo = false;
const connectDB = async () => {
    // Demo mode when PostgreSQL is not configured (uses in-memory data + mock APIs)
    if (!process.env.DATABASE_URL) {
        isDemo = true;
        await (0, demoData_1.initializeDemoUsers)();
        console.log('✓ Demo mode activated — use demo@hometownhub.com / Demo@12345');
    }
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hometown_hub';
        await mongoose_1.default.connect(mongoURI);
        console.log('✓ MongoDB connected');
    }
    catch (err) {
        console.warn('⚠ MongoDB unavailable (optional in demo mode):', err.message);
    }
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