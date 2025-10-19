// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const http = require('http');
// const { Server } = require("socket.io");

// // Import Route Handlers
// const userHandler = require("./routeHandler/userHandler");
// const bookingHandler = require("./routeHandler/bookingHandler");
// const reviewHandler = require("./routeHandler/reviewHandler");
// const signalHandler = require("./routeHandler/signalHandler"); // NEW: Import signal handler

// // Import Middlewares
// const applyMiddleware = require("./middlewares");

// // Initialize Stripe
// const stripe = require("stripe")('your_stripe_secret_key_here');

// const app = express();
// const port = process.env.PORT || 5000;

// // Apply middleware
// applyMiddleware(app);
// app.use(express.json());

// // --- Database Connection ---
// mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6g3butq.mongodb.net/Forex_realtime_DB`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log("✅ MongoDB connection is OK"))
//   .catch((err) => console.log("❌ MongoDB connection error:", err));

// // --- HTTP Server and Socket.IO Setup ---
// // MODIFIED: Setup server and io before defining routes that need it
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173", "https://your-live-frontend-url.com"], // Add your frontend URLs
//         methods: ["GET", "POST"]
//     }
// });

// // --- API Routes ---
// app.use('/users', userHandler);
// app.use('/booking', bookingHandler);
// app.use('/review', reviewHandler);
// app.use('/api/signals', signalHandler(io)); // NEW: Use the signal handler and pass the 'io' instance to it

// app.post('/jwt', async (req, res) => {
//     const user = req.body;
//     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
//     res.send({ token });
// });

// app.post("/create-intent", async (req, res) => {
//     const { price } = req.body;
//     const amount = parseInt(price * 100);

//     if (isNaN(amount) || amount < 1) {
//         return res.status(400).send({ error: "Invalid price amount." });
//     }

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount,
//             currency: "usd",
//             payment_method_types: ["card"],
//         });
//         res.send({ clientSecret: paymentIntent.client_secret });
//     } catch (error) {
//         console.error("Error creating payment intent:", error.message);
//         res.status(500).send({ error: "Failed to create payment intent" });
//     }
// });

// app.get('/', (req, res) => {
//     res.send('Server is running');
// });

// // --- Socket.IO Connection Handling ---
// io.on("connection", (socket) => {
//     console.log("✅ A user connected:", socket.id);

//     // REMOVED: The mock data emitter interval is no longer needed.
//     // Real signals will be broadcast from the signalHandler.

//     // --- You can keep other socket events if needed ---
//     socket.on("updateLocation", ({ userId, latitude, longitude }) => {
//         console.log(`User ${userId} updated location:`, latitude, longitude);
//         io.emit("locationUpdated", { userId, latitude, longitude });
//     });

//     socket.on("disconnect", () => {
//         console.log("🔌 User disconnected:", socket.id);
//     });
// });

// // --- Start Server ---
// server.listen(port, () => {
//     console.log(`🚀 Server is running on port ${port}`);
// });
// //ssss

//Ai Generated signal handle//
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config(); // Loads environment variables from a .env file
// const mongoose = require('mongoose');
// const http = require('http');
// const { Server } = require("socket.io");
// const fs = require('fs');
// const path = require('path');

// --- Import Route Handlers ---
// const userHandler = require("./routeHandler/userHandler");
// const bookingHandler = require("./routeHandler/bookingHandler");
// const reviewHandler = require("./routeHandler/reviewHandler");
// const signalHandler = require("./routeHandler/signalHandler");
// const predictionHandler = require("./routeHandler/predictionHandler"); // AI validation route

// const app = express();
// const port = process.env.PORT || 5000;

// // --- Apply Middleware ---
// // CORS allows your frontend to make requests to this server
// app.use(cors());
// // This allows the server to understand JSON in request bodies
// app.use(express.json());

// // --- Database Connection ---
// // It's crucial that MONGODB_URI is set in your .env file
// if (!process.env.MONGODB_URI) {
//     console.error("FATAL ERROR: MONGODB_URI is not defined in .env file.");
//     process.exit(1); // Exit the application if the database connection string is missing
// }
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log("✅ MongoDB connection successful"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // --- HTTP Server and Socket.IO for Real-time Communication ---
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: [
//             "http://localhost:5173", // Your local frontend development URL
//             "https://your-live-frontend-url.com" // Your production frontend URL
//         ],
//         methods: ["GET", "POST"]
//     }
// });

// // --- API Routes ---
// app.use('/users', userHandler);
// app.use('/booking', bookingHandler);
// app.use('/review', reviewHandler);
// app.use('/api/signals', signalHandler(io)); // Pass the 'io' instance for real-time updates
// app.use('/predict', predictionHandler); // The route for your MQL4 indicator

// // --- Health Check Route ---
// // A simple route to check if the server is running
// app.get('/', (req, res) => {
//     res.json({ message: `Server is running on port ${port}. Current time in Dhaka is ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}` });
// });

// // --- File Serving Route ---
// // Securely serves files from a 'public_data' directory
// app.get('/open-file', (req, res) => {
//     const { filename } = req.query;
//     if (!filename) {
//         return res.status(400).json({ error: "Filename query parameter is required." });
//     }

//     // Security: Prevents accessing files outside the 'public_data' directory
//     const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
//     const allowedDirectory = path.join(__dirname, 'public_data');
//     const filePath = path.join(allowedDirectory, safeFilename);

//     if (!filePath.startsWith(allowedDirectory)) {
//         return res.status(403).json({ error: "Access to this file is forbidden." });
//     }

//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             if (err.code === 'ENOENT') {
//                 return res.status(404).json({ error: "File not found." });
//             }
//             console.error(`Error reading file: ${err.message}`);
//             return res.status(500).json({ error: "An internal error occurred while reading the file." });
//         }
//         res.setHeader('Content-Type', 'text/plain');
//         res.send(data);
//     });
// });

// // --- Socket.IO Connection Logic ---
// io.on("connection", (socket) => {
//     console.log("✅ Real-time client connected:", socket.id);
//     socket.on("disconnect", () => {
//         console.log("🔌 Real-time client disconnected:", socket.id);
//     });
// });

// // --- Start Server ---
// server.listen(port, () => {
//     console.log(`🚀 Server is listening on http://localhost:${port}`);
// });




// ///Direct signal
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
// const http = require('http');
// const { Server } = require("socket.io");
// const fetch = require('node-fetch');
// const fs = require('fs');
// const path = require('path');

// // Import Route Handlers
// const userHandler = require("./routeHandler/userHandler");
// const bookingHandler = require("./routeHandler/bookingHandler");
// const reviewHandler = require("./routeHandler/reviewHandler");
// const predictionHandler = require("./routeHandler/predictionHandler"); // For AI validated signals
// const directSignalHandler = require("./routeHandler/directSignalHandler"); // NEW: For direct MQL4 signals
// const signalHandler = require("./routeHandler/signalHandler");

// // Import Middlewares
// const applyMiddleware = require("./middlewares");

// const app = express();
// const port = process.env.PORT || 5000;

// // Apply middleware
// applyMiddleware(app);
// app.use(express.json());

// // --- Database Connection ---
// mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6g3butq.mongodb.net/Forex_realtime_DB`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log("✅ MongoDB connection is OK"))
//   .catch((err) => console.log("❌ MongoDB connection error:", err));

// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:5173", "https://your-live-frontend-url.com"],
//         methods: ["GET", "POST"]
//     }
// });

// // --- API Routes ---
// app.use('/users', userHandler);
// app.use('/booking', bookingHandler);
// app.use('/review', reviewHandler);
// app.use('/api/signals', signalHandler(io));
// app.use('/api/predict', predictionHandler); // Endpoint for AI validation
// app.use('/api/direct-signal', directSignalHandler); // NEW: Endpoint for direct logging

// app.get('/', (req, res) => {
//     res.send('Server is running');
// });

// // --- File Open Route ---
// app.get('/open-file', (req, res) => {
//     const { filename } = req.query;
//     if (!filename) return res.status(400).send({ error: "Filename is required." });
//     const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
//     const allowedDirectory = path.join(__dirname, 'public_data');
//     const filePath = path.join(allowedDirectory, safeFilename);
//     if (!filePath.startsWith(allowedDirectory)) return res.status(403).send({ error: "Access denied." });
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             if (err.code === 'ENOENT') return res.status(404).send({ error: "File not found." });
//             return res.status(500).send({ error: "Could not read the file." });
//         }
//         res.setHeader('Content-Type', 'text/plain');
//         res.send(data);
//     });
// });

// // ... (JWT and Stripe routes remain the same) ...
// app.post('/jwt', async (req, res) => {
//     const user = req.body;
//     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
//     res.send({ token });
// });

// // --- Socket.IO Connection Handling ---
// io.on("connection", (socket) => {
//     console.log("✅ A user connected:", socket.id);
//     socket.on("disconnect", () => {
//         console.log("🔌 User disconnected:", socket.id);
//     });
// });

// // --- Start Server ---
// server.listen(port, () => {
//     console.log(`🚀 Server is running on port ${port}`);
// });



////direct signal update

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Loads .env file variables
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');
const path = require('path');

// --- Initialize Stripe ---
// IMPORTANT: Add STRIPE_SECRET_KEY to your .env file
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// --- Import Models ---
// This ensures Mongoose is aware of the schema before routes use it
require('./models/DirectSignal'); 

// --- Import Route Handlers ---
const userHandler = require("./routeHandler/userHandler");
const bookingHandler = require("./routeHandler/bookingHandler");
const reviewHandler = require("./routeHandler/reviewHandler");
const signalHandler = require("./routeHandler/signalHandler"); // For manual/admin signals
const predictionHandler = require("./routeHandler/predictionHandler"); // For AI validation
const directSignalHandler = require("./routeHandler/directSignalHandler"); // For MQL4 direct signals

// --- Import Middlewares ---
const applyMiddleware = require("./middlewares");

const app = express();
const port = process.env.PORT || 5000;

// Apply middleware
applyMiddleware(app);
app.use(express.json());

// --- Database Connection ---
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6g3butq.mongodb.net/Forex_realtime_DB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connection is OK"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// --- HTTP Server and Socket.IO Setup ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://your-live-frontend-url.com"], // Add your frontend URLs
        methods: ["GET", "POST"]
    }
});

// --- Make io accessible to route handlers ---
// This allows you to use `req.app.get('socketio')` inside handlers like directSignalHandler
app.set('socketio', io);

// --- API Routes ---
app.use('/users', userHandler);
app.use('/booking', bookingHandler);
app.use('/review', reviewHandler);
app.use('/api/signals', signalHandler(io)); // Passes io via factory pattern
app.use('/api/predict', predictionHandler);
app.use('/api/direct-signal', directSignalHandler); // Uses app.set('socketio')

// --- JWT Route ---
app.post('/jwt', async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
});

// --- Stripe Payment Intent Route ---
app.post("/create-intent", async (req, res) => {
    const { price } = req.body;
    const amount = parseInt(price * 100);

    if (isNaN(amount) || amount < 1) {
        return res.status(400).send({ error: "Invalid price amount." });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_types: ["card"],
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Error creating payment intent:", error.message);
        res.status(500).send({ error: "Failed to create payment intent" });
    }
});

// --- File Open Route (for MQL4) ---
app.get('/open-file', (req, res) => {
    const { filename } = req.query;
    if (!filename) return res.status(400).send({ error: "Filename is required." });
    
    // Security: Prevent directory traversal
    const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
    const allowedDirectory = path.join(__dirname, 'public_data'); // Example: store files in a 'public_data' folder
    const filePath = path.join(allowedDirectory, safeFilename);

    if (!filePath.startsWith(allowedDirectory)) {
        return res.status(403).send({ error: "Access denied." });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') return res.status(404).send({ error: "File not found." });
            return res.status(500).send({ error: "Could not read the file." });
        }
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
    });
});

// --- Root Route ---
app.get('/', (req, res) => {
    res.send('Server is running');
});

// --- Socket.IO Connection Handling ---
io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // Real-time signals (new and updates) will be broadcast from:
    // 1. signalHandler (for manual signals)
    // 2. directSignalHandler (for MQL4 signals)
    // This main connection block is for other real-time features.

    socket.on("updateLocation", ({ userId, latitude, longitude }) => {
        console.log(`User ${userId} updated location:`, latitude, longitude);
        io.emit("locationUpdated", { userId, latitude, longitude });
    });

    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
    });
});

// --- Start Server ---
server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
});

