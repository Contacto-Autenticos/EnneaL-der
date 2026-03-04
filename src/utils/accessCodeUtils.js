/**
 * Generates a random alphanumeric access code.
 * Format: AUTO-XXXX-XXXX
 * @returns {string} The generated code
 */
export const generateAutomatedCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like O, 0, I, 1
    const segment = () => {
        let str = '';
        for (let i = 0; i < 4; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return str;
    };
    return `AUTO-${segment()}-${segment()}`;
};
