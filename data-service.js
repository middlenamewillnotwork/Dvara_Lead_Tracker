// Data Service - Handles data fetching and processing
class DataService {


    static parseCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] || '';
            });
            return obj;
        });
        return data;
    }

    static async fetchData() {
        console.log('Fetching data from:', CONFIG.DATA_URL);
        const response = await fetch(CONFIG.DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        console.log('CSV text length:', text.length);
        AppState.allData = this.parseCSV(text);
        console.log('Parsed data:', AppState.allData.length, 'rows');
    }


}