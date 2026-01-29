const express = require("express");
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.json({ status: "Backend is running" });
});


app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.use("/api/sign", require("./routes/sign.routes"));


module.exports = app;
