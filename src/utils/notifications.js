import { supabase } from '../supabaseClient';

export const sendTelegramNotification = async (eventType, details) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
      body: { event_type: eventType, details }
    });
    
    if (error) {
      console.error('Error enviando notificación a Telegram:', error);
    }
    return data;
  } catch (err) {
    console.error('Excepción al enviar notificación a Telegram:', err);
  }
};
