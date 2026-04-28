const axios = require('axios');

async function checkObra() {
    try {
        const res = await axios.get('http://localhost:5001/core/obras/24/sobre');
        console.log('Response for Obra 24:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Error fetching obra:', e.message);
    }
}

checkObra();
