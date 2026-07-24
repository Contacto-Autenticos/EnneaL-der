CREATE TABLE public.presentations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slides JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Solo el dueño de la presentación puede verla
CREATE POLICY "Users can view their own presentations" 
ON public.presentations FOR SELECT 
USING (auth.uid() = user_id);

-- Solo el dueño puede insertar
CREATE POLICY "Users can insert their own presentations" 
ON public.presentations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede actualizar
CREATE POLICY "Users can update their own presentations" 
ON public.presentations FOR UPDATE 
USING (auth.uid() = user_id);

-- Solo el dueño puede eliminar
CREATE POLICY "Users can delete their own presentations" 
ON public.presentations FOR DELETE 
USING (auth.uid() = user_id);
