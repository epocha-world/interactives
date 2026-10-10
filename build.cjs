const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(root, 'config.template.json'), 'utf8'));
let url = process.env.SUPABASE_URL || '';
let key = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const localPath = path.join(root, 'config.js');
if (!process.env.VERCEL && !url && !key && fs.existsSync(localPath)) {
  const local = fs.readFileSync(localPath, 'utf8').replace(/^\uFEFF/, '');
  const match = local.match(/window\.EPOCHA_CONFIG\s*=\s*(\{[\s\S]*\})\s*;/);
  if (!match) throw new Error('Invalid local config.js format.');
  const settings = JSON.parse(match[1]);
  url = settings.supabaseUrl || ''; key = settings.publishableKey || '';
}
if (Boolean(url) !== Boolean(key) || (process.env.VERCEL && !url)) {
  throw new Error('Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
}
if (url && (new URL(url).protocol !== 'https:' || !key.startsWith('sb_publishable_'))) {
  throw new Error('Use an HTTPS Supabase URL and a publishable key. Secret keys are forbidden.');
}
config.supabaseUrl = url; config.publishableKey = key;
const output = path.join(root, 'dist');
fs.mkdirSync(output, {recursive:true});
const runtimeFiles = ['index.html', 'activity.js', 'board.js', 'config.js'];
if (fs.readdirSync(output).some(file => !runtimeFiles.includes(file))) {
  throw new Error('Unexpected files in dist/. Remove them before publishing.');
}
for (const file of runtimeFiles.filter(file => file !== 'config.js')) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
fs.writeFileSync(path.join(output, 'config.js'), 'window.EPOCHA_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n');
console.log('Built the static activity in dist/.');
