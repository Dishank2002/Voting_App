const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const { jwtAuthMiddleware } = require('../jwt');
const jwt = require('jsonwebtoken');

// Middleware to check if the user is an admin
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
};

// GET route to render home page with candidates for all users
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party age voteCount');
        res.render('home', { candidates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET route to render candidate page after login
router.get('/candidates', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party age voteCount');
        const isAdmin = await checkAdminRole(req.user.id);
        res.render('candidates', { candidates, isAdmin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Admin route to render add candidate page
router.get('/add', jwtAuthMiddleware, async (req, res) => {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) return res.status(403).json({ message: 'Access denied' });
    res.render('addCandidate', { isAdmin });
});

// POST route to add a candidate (Admin only)
router.post('/add', jwtAuthMiddleware, async (req, res) => {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) return res.status(403).json({ message: 'Access denied' });

    try {
        const data = req.body;
        const newCandidate = new Candidate(data);
        await newCandidate.save();
        req.io.emit('candidateAdded');
        res.redirect('/candidate/candidates');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE route to remove a candidate (Admin only)
router.post('/delete/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) return res.status(403).json({ message: 'Access denied' });

    try {
        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);
        if (!response) return res.status(404).json({ error: 'Candidate not found' });
        req.io.emit('candidateDeleted');
        res.redirect('/candidate/candidates');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST route for voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(403).json({ message: 'Admin is not allowed to vote' });
        if (user.isVoted) return res.status(400).json({ message: 'You have already voted' });

        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        req.io.emit('voteCountUpdate', { candidateId: candidateID, voteCount: candidate.voteCount });

        res.cookie('token', '', { expires: new Date(0), httpOnly: true });
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
