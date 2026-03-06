const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

//  SIGNUP ROUTE 
router.post('/signup', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        // Mandatory Unique Email Validation
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already in use" });

        //  Hash Password (Security requirement)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //  Save User
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        //  Find User
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        //  Generate Mandatory Dual Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        res.json({ 
            accessToken, 
            refreshToken, 
            user: { id: user._id, email: user.email, username: user.username } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  REFRESH TOKEN ROUTE 
router.post('/refresh', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Refresh Token Required" });

    try {
        
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
        
        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        res.json({ accessToken });
    } catch (err) {
        res.status(403).json({ message: "Invalid or Expired Refresh Token" });
    }
});

module.exports = router;