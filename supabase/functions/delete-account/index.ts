import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const headers = { 'Content-Type': 'application/json' };

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers });
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers });

  const url = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !publishableKey || !serviceRoleKey) return new Response(JSON.stringify({ error: 'server_configuration' }), { status: 500, headers });

  const token = authorization.slice('Bearer '.length);
  const userClient = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: userError } = await userClient.auth.getUser(token);
  if (userError || !user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers });

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return new Response(JSON.stringify({ error: 'account_delete_failed' }), { status: 500, headers });
  return new Response(JSON.stringify({ deleted: true }), { status: 200, headers });
});
