-- Already applied to the connected project after security advisor review.
-- The internal event trigger still runs; browsers cannot invoke it directly.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
