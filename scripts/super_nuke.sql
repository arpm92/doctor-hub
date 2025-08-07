-- 0) Make sure RLS is off so we can truncate everything
ALTER TABLE IF EXISTS public.doctors    DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admins     DISABLE ROW LEVEL SECURITY;
-- (add any others you’ve been using)

-- 1) Drop all policies in public + storage
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname
    FROM   pg_policies
    WHERE  schemaname IN ('public','storage')
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      rec.policyname, rec.schemaname, rec.tablename
    );
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 2) Drop all triggers in public
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT event_object_schema AS schemaname,
           event_object_table  AS tablename,
           trigger_name
    FROM   information_schema.triggers
    WHERE  trigger_schema = 'public'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON %I.%I',
      rec.trigger_name, rec.schemaname, rec.tablename
    );
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 3) Truncate every table in public
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tablename
    FROM   pg_tables
    WHERE  schemaname = 'public'
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', rec.tablename);
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 4) Drop every function in public
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT p.proname    AS func_name,
           pg_get_function_identity_arguments(p.oid) AS func_args
    FROM   pg_proc p
    JOIN   pg_namespace n ON p.pronamespace = n.oid
    WHERE  n.nspname = 'public'
  LOOP
    EXECUTE format(
      'DROP FUNCTION public.%I(%s) CASCADE',
      rec.func_name,
      rec.func_args
    );
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- 5) Wipe out all users
TRUNCATE auth.users CASCADE;

-- 6) Truncate storage metadata & objects
TRUNCATE storage.objects, storage.buckets CASCADE;
