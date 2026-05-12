import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SignJWT, importPKCS8 } from 'https://deno.land/x/jose@v4.14.4/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { date, operatorEmail } = body;

    if (!date) {
        throw new Error('Date is required');
    }

    // Get env variables
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
    let privateKeyEnv = Deno.env.get('GOOGLE_PRIVATE_KEY');
    
    if (!clientEmail || !privateKeyEnv) {
      throw new Error('Missing Google Credentials in Supabase Secrets');
    }

    // Fix multiline string issue if needed
    const privateKey = privateKeyEnv.replace(/\\n/g, '\n');

    // Generate JWT for Google OAuth2
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const pkcs8 = await importPKCS8(privateKey, 'RS256');

    const jwt = await new SignJWT({
      iss: clientEmail,
      sub: clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      scope: 'https://www.googleapis.com/auth/calendar.readonly', // scope to read events/freebusy
    })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .sign(pkcs8);

    // Get Access Token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error('Token Error:', tokenData);
      throw new Error('Failed to obtain Google Access Token');
    }

    const accessToken = tokenData.access_token;

    // Calendar to use
    const calendarId = operatorEmail || Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary';

    // Parse date and create start/end of day boundaries
    const targetDate = new Date(date);
    
    // Create an ISO string for start of day and end of day in the specified timezone
    // Since Google Calendar API handles timeMin/timeMax correctly if provided as RFC3339 strings,
    // we'll construct them.
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    
    // ISO format for America/Bogota (UTC-5)
    const timeMin = `${year}-${month}-${day}T00:00:00-05:00`;
    const timeMax = `${year}-${month}-${day}T23:59:59-05:00`;

    // Query Google Free/Busy API
    const freeBusyBody = {
      timeMin: timeMin,
      timeMax: timeMax,
      timeZone: 'America/Bogota',
      items: [{ id: calendarId }]
    };

    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(freeBusyBody)
    });

    const freeBusyData = await calendarResponse.json();

    if (!calendarResponse.ok) {
      console.error('Calendar FreeBusy Error:', freeBusyData);
      throw new Error(`Failed to query calendar availability: ${freeBusyData.error?.message || 'Unknown error'}`);
    }

    const busySlots = freeBusyData.calendars[calendarId]?.busy || [];

    return new Response(
      JSON.stringify({ success: true, busy: busySlots }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
