import { createClient } from '@supabase/supabase-js';

for (const envFile of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(envFile);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.BLOG_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BLOG_ADMIN_PASSWORD;

const missing = [
  ['SUPABASE_URL (atau PUBLIC_SUPABASE_URL)', supabaseUrl],
  ['SUPABASE_SECRET_KEY', secretKey],
  ['BLOG_ADMIN_EMAIL', email],
  ['BLOG_ADMIN_PASSWORD', password],
].filter(([, value]) => !value).map(([name]) => name);

if (missing.length > 0) {
  console.error(`Variabel .env belum lengkap: ${missing.join(', ')}`);
  process.exit(1);
}

let isServiceRoleKey = secretKey.startsWith('sb_secret_');
if (secretKey.startsWith('eyJ')) {
  try {
    const payload = JSON.parse(Buffer.from(secretKey.split('.')[1], 'base64url').toString('utf8'));
    isServiceRoleKey = payload.role === 'service_role';
  } catch {
    isServiceRoleKey = false;
  }
}
if (!isServiceRoleKey) {
  console.error('SUPABASE_SECRET_KEY harus secret key (atau legacy service_role key), bukan publishable/anon key.');
  process.exit(1);
}

if (password.length < 12) {
  console.error('BLOG_ADMIN_PASSWORD minimal 12 karakter.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) return match;
    if (data.users.length < 1000) return null;
  }
}

let user = await findUserByEmail(email);

if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'blog_admin' },
  });
  if (error) throw error;
  user = data.user;
  console.log(`Auth user dibuat: ${email}`);
} else {
  console.log(`Auth user sudah ada: ${email}`);
}

const { error: membershipError } = await supabase
  .from('admin_users')
  .upsert({ user_id: user.id }, { onConflict: 'user_id' });

if (membershipError) throw membershipError;
console.log(`Akses Blog diberikan untuk: ${email}`);
