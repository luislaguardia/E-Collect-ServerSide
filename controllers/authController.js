const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  const { fullName, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashCount = parseInt(process.env.HASH_COUNT, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, hashCount);

    const newUser = new User({ fullName, username, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        transactionStats: newUser.transactionStats || {}
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        transactionStats: user.transactionStats || {}
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// user profile with transac stats and recent history
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = typeof user.getTransactionStats === 'function'
      ? user.getTransactionStats()
      : {};

    const recentTransactions = user.getTransactionHistory?.(1, 5)?.transactions || [];

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        transactionStats: stats,
        recentTransactions
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, getProfile };