-- 002_setup_storage.sql
-- Creates storage buckets and policies.

-- Create 'avatars' bucket for profile pictures
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Create 'article_images' bucket for blog post images
insert into storage.buckets (id, name, public)
values ('article_images', 'article_images', true)
on conflict (id) do nothing;

-- Policies for 'avatars' bucket
create policy "Allow public read access to avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Allow authenticated users to upload avatars"
on storage.objects for insert
with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Allow user to update their own avatar"
on storage.objects for update
using ( auth.uid() = owner )
with check ( bucket_id = 'avatars' );

-- Policies for 'article_images' bucket
create policy "Allow public read access to article images"
on storage.objects for select
using ( bucket_id = 'article_images' );

create policy "Allow doctors to upload article images"
on storage.objects for insert
with check (
  bucket_id = 'article_images' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1] = auth.uid()::text -- User can only upload to their own folder
);

create policy "Allow doctors to manage their own article images"
on storage.objects for update
using (
  auth.uid() = owner and
  (storage.foldername(name))[1] = auth.uid()::text
)
with check ( bucket_id = 'article_images' );
