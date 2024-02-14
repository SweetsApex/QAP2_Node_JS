const http = require("http");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const myEmitter = new EventEmitter();

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Function to create a new log file with current date
function createLogFile() {
  const currentDate = getCurrentDate();
  const logFileName = `log-${currentDate}.txt`;
  const logFilePath = path.join(__dirname, "logs", logFileName);
  fs.writeFileSync(logFilePath, ""); // Create an empty log file
  return logFilePath;
}

// Function to append logs to the log file
function appendToLogFile(logFilePath, logMessage) {
  fs.appendFileSync(logFilePath, logMessage + "\n");
}

// Create logs directory if not exists
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log file for the current day
let currentLogFile = createLogFile();

// Log to console and write to file
function logEvent(message) {
  console.log(message);
  appendToLogFile(currentLogFile, message);
}

const server = http.createServer((req, res) => {
  const url = req.url;

  myEmitter.emit("routeAccessed", url);

  let filePath = path.join(
    __dirname,
    "views",
    url === "/" ? "index.html" : `${url}.html`
  );

  switch (url) {
    case "/about":
      logEvent("About page requested");
      break;
    case "/contact":
      logEvent("Contact page requested");
      break;
    case "/products":
      logEvent("Products page requested");
      break;
    case "/subscribe":
      logEvent("Subscribe page requested");
      break;
    default:
      logEvent("Home page requested");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      myEmitter.emit("fileReadError", err);
      logEvent(err);
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 Not Found</h1>");
    } else {
      myEmitter.emit("fileReadSuccess", filePath);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
});

myEmitter.on("routeAccessed", (url) => {
  logEvent(`Route accessed: ${url}`);
});

myEmitter.on("fileReadError", (err) => {
  logEvent(`Error reading file: ${err}`);
});

myEmitter.on("fileReadSuccess", (filePath) => {
  logEvent(`File read successfully: ${filePath}`);
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
