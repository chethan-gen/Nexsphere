import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// Rate Limiting: Limit each IP to 5 requests per 15 minutes for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to authentication routes
router.use(authLimiter);

// Input Validation Middleware
const validate = (method) => {
  switch (method) {
    case 'register': {
      return [
        body('name', 'Name is required').notEmpty(),
        body('email', 'Invalid email').isEmail(),
        body('password')
          .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
          .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
          .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
          .matches(/[0-9]/).withMessage('Password must contain at least one number')
          .matches(/[\W]/).withMessage('Password must contain at least one special character'),
      ];
    }
    case 'login': {
      return [
        body('email', 'Invalid email').isEmail(),
        body('password', 'Password cannot be empty').notEmpty(),
      ];
    }
    case 'forgotPassword': {
      return [body('email', 'Invalid email').isEmail()];
    }
    case 'resetPassword': {
      return [
        body('password')
          .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
          .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
          .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
          .matches(/[0-9]/).withMessage('Password must contain at least one number')
          .matches(/[\W]/).withMessage('Password must contain at least one special character'),
        body('confirmPassword')
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Passwords do not match');
            }
            return true;
          }),
      ];
    }
    default:
      return [];
  }
};

// Validation Result Middleware
const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', validate('register'), validationHandler, register);

// @route   POST /api/auth/login
// @desc    Login user & return token
// @access  Public
router.post('/login', validate('login'), validationHandler, login);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', validate('forgotPassword'), validationHandler, forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset user password
// @access  Public
router.post('/reset-password/:token', validate('resetPassword'), validationHandler, resetPassword);

export default router;
