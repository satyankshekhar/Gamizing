const app = require('./app');
const connectDB = require('./database/connection');
const env = require('./config/env');

connectDB().then(() => {
  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
});\n