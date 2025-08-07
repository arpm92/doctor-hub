-- WARNING: This script will permanently delete all data, tables, functions,
-- and storage buckets in your Supabase project.
-- USE WITH EXTREME CAUTION.

-- Disable Row Level Security for the duration of the script
alter table "storage".objects drop constraint if exists "objects_bucketid_fkey";
alter table "storage".buckets drop constraint if exists "buckets_owner_fkey";

-- Drop all tables in the public schema
do $$
declare
    r record;
begin
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists ' || quote_ident(r.tablename) || ' cascade';
    end loop;
end $$;

-- Drop all functions in the public schema
do $$
declare
    r record;
begin
    for r in (select p.proname, pg_get_function_identity_arguments(p.oid) as args
              from pg_proc p
              join pg_namespace n on p.pronamespace = n.oid
              where n.nspname = 'public') loop
        execute 'drop function if exists ' || quote_ident(r.proname) || '(' || r.args || ') cascade';
    end loop;
end $$;

-- Drop all custom types in the public schema
do $$
declare
    r record;
begin
    for r in (select typname from pg_type where typnamespace = 'public'::regnamespace and typtype = 'e') loop
        execute 'drop type if exists ' || quote_ident(r.typname) || ' cascade';
    end loop;
end $$;

-- Empty and delete storage buckets
delete from storage.objects;
delete from storage.buckets;

-- Re-enable Row Level Security
alter table "storage".objects add constraint "objects_bucketid_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) on delete cascade;
alter table "storage".buckets add constraint "buckets_owner_fkey" FOREIGN KEY (owner) REFERENCES auth.users(id);


-- Final check
select 'Database has been reset. All tables, functions, types, and storage content have been deleted.' as status;
