// Creates backend/.env and frontend/.env.local from the examples if they don't exist yet.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const pairs = [
  ['backend/.env.example', 'backend/.env'],
  ['frontend/.env.example', 'frontend/.env.local'],
];
for (const [from, to] of pairs) {
  const dest = path.join(root, to);
  if (fs.existsSync(dest)) {
    console.log(`kept existing ${to}`);
    continue;
  }
  let text = fs.readFileSync(path.join(root, from), 'utf8');
  if (to === 'backend/.env') text = text.replace('change-me-to-a-long-random-string', crypto.randomBytes(32).toString('hex'));
  fs.writeFileSync(dest, text);
  console.log(`created ${to}`);
}
