const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 UPT RESOR LAA 1.9 JATINEGARA - BACKEND SERVER`);
  console.log(`📡 Berjalan pada port: http://localhost:${PORT}`);
  console.log(`⚡ API Endpoint: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
