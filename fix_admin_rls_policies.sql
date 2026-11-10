-- Corrección de Políticas RLS para lectura en el panel /admin de Enesencia
-- Permite que el cliente anon del frontend pueda consultar las respuestas de test inicial, avanzado y transacciones.

-- 1. Respuestas Test Inicial (Anónimo)
DROP POLICY IF EXISTS "Allow admins or service_role to read basic test responses" ON public.basic_test_responses;
DROP POLICY IF EXISTS "Allow public read basic_test_responses" ON public.basic_test_responses;
CREATE POLICY "Allow public read basic_test_responses" ON public.basic_test_responses FOR SELECT TO public USING (true);

-- 2. Respuestas Test Avanzado
DROP POLICY IF EXISTS "Allow users to read their own advanced test responses" ON public.advanced_test_responses;
DROP POLICY IF EXISTS "Allow public read advanced_test_responses" ON public.advanced_test_responses;
CREATE POLICY "Allow public read advanced_test_responses" ON public.advanced_test_responses FOR SELECT TO public USING (true);

-- 3. Transacciones
DROP POLICY IF EXISTS "Allow users to read their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public read transactions" ON public.transactions;
CREATE POLICY "Allow public read transactions" ON public.transactions FOR SELECT TO public USING (true);
