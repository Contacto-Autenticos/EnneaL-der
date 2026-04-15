import XLSX from 'xlsx';
import path from 'path';

const filePath = 'public/Plan de acción Autodiagnostico Fascinantes.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log('Sheet Names:', sheetNames);
    
    sheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n--- Sheet: ${name} ---`);
        console.log(`Row count: ${data.length}`);
        data.slice(0, 58).forEach((row, index) => {
            console.log(`Row ${index}:`, JSON.stringify(row));
        });
    });
} catch (error) {
    console.error('Error reading excel:', error);
}
