const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change provider
schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
schema = schema.replace(/provider\s*=\s*"mongodb"/, 'provider = "sqlite"');

// 2. Change String[] to String
schema = schema.replace(/String\[\]/g, 'String   @default("[]")');

// 3. SQLite doesn't support enums. We must change enums to Strings or Ints.
// Actually Prisma SQLite DOES NOT support enums.
// This means we have to replace all enum usage with String.

const enumsToReplace = [
  'Role', 'CommunityStatus', 'MemberRole', 'MemberStatus',
  'PostType', 'EventStatus', 'RSVPStatus', 'NotificationType',
  'ReportStatus', 'ReportContentType'
];

enumsToReplace.forEach(enumName => {
  // Replace the type in models with String
  const regex = new RegExp(`(\\w+)\\s+${enumName}\\s+@default\\((\\w+)\\)`, 'g');
  schema = schema.replace(regex, `$1 String @default("$2")`);
  
  const regexNoDefault = new RegExp(`(\\w+)\\s+${enumName}(\\s+)`, 'g');
  schema = schema.replace(regexNoDefault, `$1 String$2`);
});

// Remove enum definitions
schema = schema.replace(/enum\s+\w+\s+\{[\s\S]*?\}/g, '');

// 4. Also fix IDs if I previously changed to auto/ObjectId
schema = schema.replace(/@id\s+@default\(auto\(\)\)\s+@map\("_id"\)\s+@db\.ObjectId/g, '@id @default(cuid())');

// 5. Fix Json to String (SQLite doesn't support Json type)
schema = schema.replace(/Json\?/g, 'String?');

fs.writeFileSync(schemaPath, schema);
console.log("Converted to SQLite schema");
