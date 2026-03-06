// Setup for Supabase Edge Function to handle Wompi Webhooks
// This should be deployed to Supabase Functions to update the user's status

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
    const { data } = await req.json()
    const transaction = data.transaction
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 0. Try to find the user's name from user_leads
    let customerName = null;
    try {
        const { data: userData } = await supabase
            .from('user_leads')
            .select('full_name')
            .eq('email', transaction.customer_email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (userData) {
            customerName = userData.full_name;
        }
    } catch (e) {
        console.log('User not found in leads or multiple leads found');
    }

    // Always log the transaction in our transactions table
    const { error: logError } = await supabase
        .from('transactions')
        .insert([{
            transaction_id: transaction.id,
            reference: transaction.reference,
            amount_in_cents: transaction.amount_in_cents,
            currency: transaction.currency,
            status: transaction.status,
            customer_email: transaction.customer_email,
            customer_name: customerName, // New field
            payment_method_type: transaction.payment_method_type,
            payment_method_brand: transaction.payment_method?.extra?.brand || transaction.payment_method?.type,
            raw_data: data
        }])

    if (logError) console.error('Error logging transaction:', logError)

    if (transaction.status === 'APPROVED') {
        // 1. Generate a new access code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const segment = () => {
            let str = '';
            for (let i = 0; i < 4; i++) {
                str += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return str;
        };
        const generatedCode = `AUTO-${segment()}-${segment()}`;

        // 2. Insert the code into access_codes table
        const { error: codeError } = await supabase
            .from('access_codes')
            .insert([{
                code: generatedCode,
                is_used: false,
                transaction_id: transaction.id,
                created_at: new Date().toISOString()
            }])

        if (codeError) console.error('Error creating access code:', codeError)

        // 3. Update the user_leads table
        const { error } = await supabase
            .from('user_leads')
            .update({
                payment_status: 'APPROVED',
                updated_at: new Date()
            })
            .eq('email', transaction.customer_email)

        if (error) console.error('Error updating payment status:', error)
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
})
