const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const PORT = config.port;

mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => console.log("=> Connected to DB"))
  .catch(error => console.error(error));

app.listen(PORT, () =>
  console.log(`=> Listening to port ${PORT}`)
);
