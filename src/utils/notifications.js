import { supabase } from '../supabaseClient';

export const sendWebPushNotification = async (eventType, details) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-web-push', {
      body: { event_type: eventType, details }
    });
    
    if (error) {
      console.error('Error enviando notificación Web Push:', error);
    }
    return data;
  } catch (err) {
    console.error('Excepción al enviar notificación Web Push:', err);
  }
};
