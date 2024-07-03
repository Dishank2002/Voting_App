const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware} = require('../jwt');

// Setup admin user if not exists
const setupAdminUser = async () => {
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
        const admin = new User({
            name: 'Admin',
            age: 30,
            email: 'admin@example.com',
            mobile: '1234567890',
            address: 'Admin Address',
            aadharCardNumber: '000000000000',
            password: 'admin123',
            role: 'admin',
        });
        await admin.save();
    }
};

// Ensure admin setup at server start
setupAdminUser();

// GET routes to render EJS templates
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/change-password', jwtAuthMiddleware, (req, res) => {
    res.render('changePassword');
});

// POST route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).render('signup', { error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).render('signup', { error: 'User with the same Aadhar Card Number already exists' });
        }

        const newUser = new User(data);
        const response = await newUser.save();

        const payload = { id: response.id };
        const token = newUser.generateToken();

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (err) {
        console.log(err);
        const errorMessages = Object.values(err.errors || {}).map(e => e.message);
        res.status(500).render('signup', { error: errorMessages.join(', ') });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password, role } = req.body;

        if (!aadharCardNumber || !password || !role) {
            return res.status(400).render('login', { error: 'Aadhar Card Number, password, and role are required' });
        }

        const user = await User.findOne({ aadharCardNumber: aadharCardNumber, role: role });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).render('login', { error: 'Invalid credentials' });
        }

        const token = user.generateToken();

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/candidate/candidates');
    } catch (err) {
        console.error(err);
        res.status(500).render('login', { error: 'Internal Server Error' });
    }
});

// POST route to change password
router.post('/change-password', jwtAuthMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).render('changePassword', { error: 'Both current and new passwords are required' });
        }

        const user = await User.findById(req.user.id);

        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).render('changePassword', { error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.cookie('token', '', { expires: new Date(0), httpOnly: true });
        res.redirect('/user/login');
    } catch (err) {
        console.error(err);
        res.status(500).render('changePassword', { error: 'Internal Server Error' });
    }
});

// Logout Route
router.get('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.redirect('/');
});

module.exports = router;
