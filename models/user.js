const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    aadharCardNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'voter'], required: true, default: 'voter' },
    isVoted: { type: Boolean, default: false }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error('Error comparing password');
    }
};

userSchema.methods.generateToken = function () {
    try {
        return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    } catch (error) {
        throw new Error('Error generating token');
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
