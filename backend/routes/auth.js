const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ─── Helper: sign JWT ─────────────────────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone')
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Valid 10-digit Indian mobile number required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role')
      .isIn(['citizen', 'officer'])
      .withMessage('Role must be citizen or officer'),
  ],
  async (req, res) => {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { fullName, email, phone, password, role, village, district, state, pincode, aadhaar, badgeNumber, department, designation, officerDistrict } = req.body;

      // Check if email already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }

      // Build user data
      const userData = { fullName, email, phone, password, role };

      if (role === 'citizen') {
        Object.assign(userData, { village, district, state, pincode, aadhaar });
      } else if (role === 'officer') {
        Object.assign(userData, { badgeNumber, department, designation, officerDistrict });
      }

      const user = await User.create(userData);

      // Officers need approval — don't issue token yet
      if (role === 'officer') {
        return res.status(201).json({
          success: true,
          message: 'Officer account created. Awaiting admin approval before you can log in.',
          data: { role: user.role, status: user.status, email: user.email },
        });
      }

      // Citizens get a token immediately
      const token = signToken(user._id);
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        data: user.toSafeObject(),
      });
    } catch (err) {
      console.error('Register error:', err);
      // Handle MongoDB duplicate key
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Email or badge number already in use.' });
      }
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Block pending officers
      if (user.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your officer account is pending admin approval. You will be notified via email.',
          status: 'pending',
        });
      }

      // Block suspended users
      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
      }

      // Update last login
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      const token = signToken(user._id);

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        data: user.toSafeObject(),
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user.toSafeObject() });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Stateless JWT: client just drops the token. This endpoint is a hook for future
// token blacklisting if needed.
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
