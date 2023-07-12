const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const logger = require("morgan");
const opn = require("opn");
const router = require("./routes/router");

const app = express();
const port = 3200;
const corOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 200
};

app.use(cors(corOptions));
app.use(helmet());
app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);

app.get("*.*", express.static("dist"));
app.all("*", (req, res) => {
  res.status(200).sendFile("/", { root: "dist" });
});

const server = app.listen(port, () => {
  console.log(`CORS-enabled web server listening on port ${port}`);
  opn("http://localhost:3200/");
});

const sigs = ["SIGINT", "SIGTERM", "SIGQUIT"];
sigs.forEach(sig => {
  process.on(sig, () => {
    server.close();
    process.exit();
  });
});
