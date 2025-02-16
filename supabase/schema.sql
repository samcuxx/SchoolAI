-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  school_details JSONB,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Assignments policies
CREATE POLICY "Users can view their own assignments"
  ON assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assignments"
  ON assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments"
  ON assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments"
  ON assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, onboarding_completed)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    FALSE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 