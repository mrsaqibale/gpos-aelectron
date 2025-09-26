// Quick Postcoder API test to verify latitude/longitude presence in responses
// Usage: node test/postcoder_eircode_test.js [query]

const https = require('https');

// NOTE: This API key is taken from the app's renderer usage. Replace if needed.
const POSTCODER_API_KEY = 'PCWK5-XD39R-HSZW6-SK54F';
const POSTCODER_BASE_URL = 'https://ws.postcoder.com/pcw';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, json });
          } catch (err) {
            reject(new Error(`Failed to parse JSON (status ${res.statusCode}): ${data}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function run() {
  const query = process.argv[2] || 'D01F5P2'; // default sample Eircode
  const encoded = encodeURIComponent(query);
  const url = `${POSTCODER_BASE_URL}/${POSTCODER_API_KEY}/address/IE/${encoded}`;

  console.log('Requesting:', url);

  try {
    const { status, json } = await fetchJson(url);
    console.log('HTTP status:', status);

    if (!Array.isArray(json)) {
      console.log('Response is not an array. Raw:', json);
      return;
    }

    console.log(`Items returned: ${json.length}`);
    const preview = json.slice(0, 3);

    const keys = new Set();
    for (const item of preview) {
      Object.keys(item).forEach((k) => keys.add(k));
    }
    console.log('Sample keys in first items:', Array.from(keys).sort());

    const withGeo = json.filter((i) =>
      (i.hasOwnProperty('latitude') || i.hasOwnProperty('longitude')) &&
      (i.latitude != null || i.longitude != null)
    );
    console.log('Entries with latitude/longitude present:', withGeo.length);
    if (withGeo.length > 0) {
      console.log('Example with geo:', withGeo[0]);
    } else {
      console.log('No latitude/longitude fields found in returned items.');
    }
  } catch (err) {
    console.error('Error calling Postcoder:', err.message);
  }
}

run();


