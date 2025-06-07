import app from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || "5000";
const ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`server.js is started in ${ENV} mode on ${PORT}`);
});
