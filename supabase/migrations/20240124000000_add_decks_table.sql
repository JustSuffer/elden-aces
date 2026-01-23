-- Create the 'decks' table if it doesn't exist
create table if not exists public.decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  main_class text not null,
  secondary_classes text[] not null,
  cards jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.decks enable row level security;

-- Policies
create policy "Users can view their own decks"
on public.decks for select
using ( auth.uid() = user_id );

create policy "Users can insert their own decks"
on public.decks for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own decks"
on public.decks for update
using ( auth.uid() = user_id );

create policy "Users can delete their own decks"
on public.decks for delete
using ( auth.uid() = user_id );
