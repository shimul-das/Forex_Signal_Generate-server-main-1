const axios = require('axios');
const ForexData = require('../models/forexDataModel'); // We will create this model next

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// A map of symbols to their descriptions for broadcasting
const currencyPairs = {
    'EURUSD': 'Euro to US Dollar',
    'GBPUSD': 'British Pound to US Dollar',
    'USDJPY': 'US Dollar to Japanese Yen'
};

/**
 * Fetches the latest exchange rate for a given currency pair.
 * @param {string} fromCurrency - The currency to convert from (e.g., 'EUR').
 * @param {string} toCurrency - The currency to convert to (e.g., 'USD').
 * @returns {object|null} The fetched data or null on error.
 */
const fetchForexRate = async (fromCurrency, toCurrency) => {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${API_KEY}`;
    try {
        const response = await axios.get(url);
        const data = response.data['Realtime Currency Exchange Rate'];

        if (!data) {
            // Alpha Vantage free tier is limited to 5 requests per minute.
            // This handles the case where the API limit is reached.
            console.warn(`Could not fetch data for ${fromCurrency}/${toCurrency}. API limit likely reached.`);
            return null;
        }

        return {
            symbol: data['1. From_Currency Code'] + data['3. To_Currency Code'],
            price: parseFloat(data['5. Exchange Rate']),
            lastRefreshed: new Date(data['6. Last Refreshed']),
        };
    } catch (error) {
        console.error(`Error fetching data for ${fromCurrency}/${toCurrency}:`, error.message);
        return null;
    }
};

/**
 * Fetches data for all defined currency pairs and broadcasts it via Socket.IO.
 * @param {object} io - The Socket.IO server instance.
 */
const fetchAndBroadcastForexData = async (io) => {
    console.log("Fetching new Forex data...");
    const updates = [];

    for (const symbol in currencyPairs) {
        const fromCurrency = symbol.substring(0, 3);
        const toCurrency = symbol.substring(3, 6);

        const forexInfo = await fetchForexRate(fromCurrency, toCurrency);

        if (forexInfo) {
            updates.push(forexInfo);

            // Save the new data point to the database
            try {
                const newDataPoint = new ForexData(forexInfo);
                await newDataPoint.save();
            } catch (dbError) {
                console.error(`Error saving ${symbol} to database:`, dbError.message);
            }
        }
    }

    if (updates.length > 0) {
        // Broadcast all successful updates to every connected client
        io.emit('forexUpdate', updates);
        console.log('✅ Forex data broadcasted to clients.');
    }
};

module.exports = { fetchAndBroadcastForexData };