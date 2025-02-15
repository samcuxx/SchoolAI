-- Create assignments table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    instructions TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'draft',
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own assignments"
    ON public.assignments
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assignments"
    ON public.assignments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
    ON public.assignments
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
    ON public.assignments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.assignments TO authenticated; 