const http = require('http');
const app = require('../src/app');

const server = app.listen(5005, async () => {
  console.log('Test server started on port 5005');

  try {
    const fetch = (url) => new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      }).on('error', reject);
    });

    const stats = await fetch('http://localhost:5005/api/stats');
    console.log('✅ /api/stats SUCCESS:', stats.data.data.resorInfo.uptName);
    console.log('   Total Stations:', stats.data.data.totalStations);
    console.log('   Total Switches:', stats.data.data.totalSwitches);
    console.log('   Average Voltage:', stats.data.data.avgVoltage, 'V DC');

    const switches = await fetch('http://localhost:5005/api/switches');
    console.log('✅ /api/switches SUCCESS: loaded', switches.data.count, 'switches');

    const stations = await fetch('http://localhost:5005/api/stations');
    console.log('✅ /api/stations SUCCESS: loaded', stations.data.data.length, 'stations');

    const telemetry = await fetch('http://localhost:5005/api/telemetry');
    console.log('✅ /api/telemetry SUCCESS: loaded', telemetry.data.data.length, 'substations');

  } catch (err) {
    console.error('❌ Smoke test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      console.log('Test server closed cleanly.');
      process.exit();
    });
  }
});
