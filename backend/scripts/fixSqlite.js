const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Strip out @db.ObjectId
schema = schema.replace(/@db\.ObjectId/g, '');
schema = schema.replace(/@map\("_id"\)/g, '');

// Also remove compound IDs because SQLite Prisma doesn't like them? Wait, SQLite DOES support compound IDs. The error earlier was about something else or just Prisma complaining about compound IDs on MongoDB? Oh, the earlier error about compound IDs was because it was on MongoDB! Mongo doesn't support compound IDs in Prisma! SQLite DOES.

// Restore compound IDs if they were broken? No, I didn't break compound IDs.
// Let's also restore the provider to sqlite just in case.
schema = schema.replace(/provider\s*=\s*"mongodb"/, 'provider = "sqlite"');

fs.writeFileSync(schemaPath, schema);
console.log("Fixed ObjectId for SQLite");
