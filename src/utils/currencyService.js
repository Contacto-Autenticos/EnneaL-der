/**
 * Service to handle IP-based country detection and currency conversion.
 * Uses public APIs to provide estimated local prices.
 */

const IP_GEOLOCATION_API = 'https://ipapi.co/json/';
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/COP';

export const getVisitorData = async () => {
    try {
        const response = await fetch(IP_GEOLOCATION_API);
        const data = await response.json();
        return {
            country: data.country_name,
            currency: data.currency,
            countryCode: data.country_code
        };
    } catch (error) {
        console.error('Error fetching visitor data:', error);
        return { country: 'Colombia', currency: 'COP', countryCode: 'CO' };
    }
};

export const getExchangeRate = async (targetCurrency) => {
    if (targetCurrency === 'COP') return 1;
    try {
        const response = await fetch(EXCHANGE_RATE_API);
        const data = await response.json();
        return data.rates[targetCurrency] || null;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
};

export const formatCurrency = (amount, currencyCode) => {
    try {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch (e) {
        return `${currencyCode} ${amount}`;
    }
};
