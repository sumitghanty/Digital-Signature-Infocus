require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./utils/db_pg");

const PORT = process.env.PORT || 3001;

// Connect to DB before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
});
