-- Create AI responses table
CREATE TABLE public.ai_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own responses"
    ON public.ai_responses
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM public.assignments 
            WHERE id = ai_responses.assignment_id
        )
    );

CREATE POLICY "Users can create own responses"
    ON public.ai_responses
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM public.assignments 
            WHERE id = assignment_id
        )
    );

-- Grant permissions
GRANT ALL ON public.ai_responses TO authenticated; 