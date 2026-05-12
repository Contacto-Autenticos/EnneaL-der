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
    const { name, email, phone, serviceRequired, guests, startTime, endTime, operatorEmail } = body;

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
      scope: 'https://www.googleapis.com/auth/calendar.events',
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

    // Prepare attendees
    const attendees = [{ email: email }];
    if (guests) {
      const guestList = guests.split(',').map((g: string) => g.trim()).filter((g: string) => g);
      guestList.forEach((g: string) => attendees.push({ email: g }));
    }

    // Calendar to use
    const calendarId = operatorEmail || Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary';

    // Create Calendar Event
    const eventBody = {
      summary: `Reserva: ${serviceRequired} - ${name}`,
      description: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nServicio: ${serviceRequired}`,
      start: {
        dateTime: startTime,
        timeZone: 'America/Bogota', // Zona horaria de Colombia
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/Bogota', // Zona horaria de Colombia
      },
      attendees: attendees,
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      }
    };

    const calendarResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    });

    const eventData = await calendarResponse.json();

    if (!calendarResponse.ok) {
      console.error('Calendar Error:', eventData);
      throw new Error(`Failed to create calendar event: ${eventData.error?.message || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ success: true, event: eventData, meetLink: eventData.hangoutLink }),
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
