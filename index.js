const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");

// Import Route Handlers
const userHandler = require("./routeHandler/userHandler");
const bookingHandler = require("./routeHandler/bookingHandler");
const reviewHandler = require("./routeHandler/reviewHandler");
const signalHandler = require("./routeHandler/signalHandler"); // NEW: Import signal handler

// Import Middlewares
const applyMiddleware = require("./middlewares");

// Initialize Stripe
const stripe = require("stripe")('your_stripe_secret_key_here');

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
// MODIFIED: Setup server and io before defining routes that need it
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://your-live-frontend-url.com"], // Add your frontend URLs
        methods: ["GET", "POST"]
    }
});

// --- API Routes ---
app.use('/users', userHandler);
app.use('/booking', bookingHandler);
app.use('/review', reviewHandler);
app.use('/api/signals', signalHandler(io)); // NEW: Use the signal handler and pass the 'io' instance to it

app.post('/jwt', async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
});

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

app.get('/', (req, res) => {
    res.send('Server is running');
});

// --- Socket.IO Connection Handling ---
io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // REMOVED: The mock data emitter interval is no longer needed.
    // Real signals will be broadcast from the signalHandler.

    // --- You can keep other socket events if needed ---
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
//ssss