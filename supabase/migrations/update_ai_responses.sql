-- Add provider column to ai_responses table
ALTER TABLE public.ai_responses
ADD COLUMN provider VARCHAR(20) DEFAULT 'openai'; 