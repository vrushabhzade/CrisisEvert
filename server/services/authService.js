// Authentication Service
// Handles user registration, login, and JWT generation

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const SECRET_KEY = process.env.JWT_SECRET || 'crisis-avert-secret-key-change-in-prod';

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    const dataDir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Helper: Read users
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Helper: Save users
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register new user
async function registerUser(userData) {
    const users = getUsers();
    const { name, email, password, location, phone } = userData;

    // Check if user exists
    if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        location: location || { name: 'Unknown', lat: 0, lon: 0 },
        phone: phone || '',
        status: 'SAFE', // SAFE, DANGER, UNKNOWN
        lastCheckIn: null
    };

    users.push(newUser);
    saveUsers(users);

    return generateToken(newUser);
}

// Login user
async function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    return generateToken(user);
}

// Generate JWT
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        location: user.location
    };

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            location: user.location,
            status: user.status
        },
        token: jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' })
    };
}

// Verify Token Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = {
    registerUser,
    loginUser,
    authenticateToken,
    getUsers,
    saveUsers
};
