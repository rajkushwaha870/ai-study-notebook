import postgres from 'postgres';

let initPromise: Promise<void> | null = null;

export function checkAndInitDb() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const dbUrl = import.meta.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn('DATABASE_URL is not set. Skipping automatic table creation.');
      return;
    }

    console.log('Initializing Supabase database tables...');
    const hasSslDisabled = dbUrl.includes('sslmode=disable');
    const sql = postgres(dbUrl, {
      ssl: hasSslDisabled ? false : { rejectUnauthorized: false }
    });

    try {
      // 1. Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // Create function & trigger to replicate auth users to public users
      await sql`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO public.users (id, email, name)
            VALUES (
                new.id,
                new.email,
                COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
            )
            ON CONFLICT (id) DO UPDATE
            SET email = excluded.email,
                name = excluded.name;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;

      await sql`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
                CREATE TRIGGER on_auth_user_created
                    AFTER INSERT OR UPDATE ON auth.users
                    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
            END IF;
        END
        $$;
      `;

      // Backfill existing auth users
      await sql`
        INSERT INTO public.users (id, email, name)
        SELECT 
            id, 
            email, 
            COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', split_part(email, '@', 1))
        FROM auth.users
        ON CONFLICT (id) DO NOTHING;
      `;

      // 2. Create subjects table
      await sql`
        CREATE TABLE IF NOT EXISTS subjects (
          id TEXT PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          color TEXT NOT NULL,
          icon TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // 3. Create notes table
      await sql`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
          title TEXT NOT NULL DEFAULT 'Untitled Note',
          content TEXT NOT NULL,
          pinned BOOLEAN NOT NULL DEFAULT FALSE,
          favorite BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // 4. Create files table
      await sql`
        CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          size BIGINT NOT NULL,
          favorite BOOLEAN NOT NULL DEFAULT FALSE,
          in_trash BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );
      `;

      // 5. Create ai_chats table
      await sql`
        CREATE TABLE IF NOT EXISTS ai_chats (
          id TEXT PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL DEFAULT 'New Chat',
          messages JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      // Enable RLS and setup policies using standard PG blocks
      await sql`
        DO $$
        BEGIN
          -- Enable RLS
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
          ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
          ALTER TABLE files ENABLE ROW LEVEL SECURITY;
          ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

          -- Users Policy
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_owner_policy'
          ) THEN
            CREATE POLICY users_owner_policy ON users FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
          END IF;

          -- Subjects Policy
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'subjects_owner_policy'
          ) THEN
            CREATE POLICY subjects_owner_policy ON subjects USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
          END IF;

          -- Notes Policy
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'notes_owner_policy'
          ) THEN
            CREATE POLICY notes_owner_policy ON notes USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
          END IF;

          -- Files Policy
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'files' AND policyname = 'files_owner_policy'
          ) THEN
            CREATE POLICY files_owner_policy ON files USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
          END IF;

          -- AI Chats Policy
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'ai_chats' AND policyname = 'ai_chats_owner_policy'
          ) THEN
            CREATE POLICY ai_chats_owner_policy ON ai_chats USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
          END IF;
        END
        $$;
      `;

      // 6. Create storage bucket and storage RLS policies if storage schema is accessible
      try {
        await sql`
          INSERT INTO storage.buckets (id, name, public)
          VALUES ('uploads', 'uploads', false)
          ON CONFLICT (id) DO NOTHING;
        `;
        
        // RLS policies for storage objects inside uploads bucket
        await sql`
          DO $$
          BEGIN
            -- Insert policy
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'uploads_insert_policy'
            ) THEN
              CREATE POLICY uploads_insert_policy ON storage.objects FOR INSERT TO authenticated 
              WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
            END IF;

            -- Select policy
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'uploads_select_policy'
            ) THEN
              CREATE POLICY uploads_select_policy ON storage.objects FOR SELECT TO authenticated 
              USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
            END IF;

            -- Update policy
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'uploads_update_policy'
            ) THEN
              CREATE POLICY uploads_update_policy ON storage.objects FOR UPDATE TO authenticated 
              USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
              WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
            END IF;

            -- Delete policy
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'uploads_delete_policy'
            ) THEN
              CREATE POLICY uploads_delete_policy ON storage.objects FOR DELETE TO authenticated 
              USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
            END IF;
          END
          $$;
        `;
      } catch (err) {
        console.warn('Failed to setup uploads storage bucket/policies. Storage privileges might be limited:', err);
      }

      console.log('Database tables & security policies initialized/verified successfully.');
    } catch (err) {
      console.error('Error during database initialization:', err);
      throw err;
    } finally {
      await sql.end();
    }
  })();

  return initPromise;
}
