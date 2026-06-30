const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change provider
schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "mongodb"');

// 2. Change IDs
schema = schema.replace(/@id\s+@default\(cuid\(\)\)/g, '@id @default(auto()) @map("_id") @db.ObjectId');

// 3. Change all String relation fields to String @db.ObjectId
// We need to look for fields that are used in relations. 
// A simpler way is to change all fields that end with 'Id' and are String to String @db.ObjectId.
// Let's do a regex for `\w+Id\s+String` and replace with `$& @db.ObjectId`
schema = schema.replace(/(\w+Id\s+String\??)(?![\w])/g, '$1 @db.ObjectId');

// Also need to handle specific array of references if any, but let's stick to the simple one first.
// Let's also fix the array types that might be problematic, wait, Mongo supports String[] natively!

fs.writeFileSync(schemaPath, schema);
console.log("Converted to MongoDB schema");
