-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.

-- 1) Profile rows are created by the database itself (client never inserts them)
CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users (id, name, email, email_verified, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.email,
      NEW.email_confirmed_at IS NOT NULL,
      now(), now()
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    UPDATE public.users
    SET email = NEW.email,
        email_verified = (NEW.email_confirmed_at IS NOT NULL),
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user();

-- Backfill: create missing profiles for accounts that already exist
INSERT INTO public.users (id, name, email, email_verified, created_at, updated_at)
SELECT id,
       COALESCE(raw_user_meta_data->>'username', raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
       email,
       email_confirmed_at IS NOT NULL,
       created_at, now()
FROM auth.users
ON CONFLICT DO NOTHING;

UPDATE public.users u
SET email_verified = (a.email_confirmed_at IS NOT NULL)
FROM auth.users a
WHERE a.id = u.id;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'free' FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 2) The view must obey Row Level Security (it was readable by anyone before)
ALTER VIEW public.user_login_detail SET (security_invoker = true);
REVOKE ALL ON public.user_login_detail FROM anon;
REVOKE ALL ON public.users, public.user_roles, public.sessions,
              public.email_verifications, public.password_resets FROM anon;

-- 3) Nobody can promote themselves to admin
DROP POLICY IF EXISTS "Users can update own role" ON public.user_roles;

-- 4) Through the view, the app may only change safe columns
CREATE OR REPLACE FUNCTION public.sync_user_login_detail()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.users
    SET name = NEW.username,
        total_logins = COALESCE(NEW.total_logins, 0),
        failed_attempts = COALESCE(NEW.failed_attempts, 0),
        login_history = COALESCE(NEW.login_history, '[]'::jsonb),
        last_login = NEW.last_login,
        updated_at = now()
    WHERE id = OLD.id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 5) Device sessions can be recorded by their owner
DROP POLICY IF EXISTS "Users can create own sessions" ON public.sessions;
CREATE POLICY "Users can create own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6) Real account deletion (removes the login itself, cascades to profile and roles)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  DELETE FROM public.notesvault WHERE user_id = auth.uid();
  DELETE FROM public.tool_usage_history WHERE user_id = auth.uid();
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;