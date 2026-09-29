const https = require('https');

const url = "https://7107.api.greenapi.com/waInstance710722686416/getChats/cb50c015e963443e9e6f527057fe0e79a055394a7ef14680b5";

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const chats = JSON.parse(data);
            const matches = chats.filter(c => c.name && c.name.toLowerCase().includes('maestr'));
            console.log("Found matches:", matches);
            
            if (matches.length > 0) {
                const chatId = matches[0].id;
                console.log("\n\n=== Maestría ID ===");
                console.log(chatId);
                console.log("===================\n\n");
            } else {
                console.log("No Maestria group found.");
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
