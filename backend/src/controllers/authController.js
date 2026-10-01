import bcrypt from 'bcryptjs';
import { db } from '../data/store.js';
import { generateToken } from '../utils/tokenHelper.js';
import { sendEmail } from '../config/email.js';
import { emailTemplates } from '../utils/emailTemplates.js';

/**
 * Register a new pilgrim user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'PILGRIM' } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = db.insert('users', {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
      role: role.toUpperCase() === 'ADMIN' ? 'PILGRIM' : role.toUpperCase(), // Security safeguard
      isVerified: true
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    // Send Welcome Email
    sendEmail({
      to: newUser.email,
      subject: `Welcome to Sri Siddhivinayak Temple Portal`,
      html: emailTemplates.welcome(newUser.name)
    });

    // Create a welcome notification
    db.insert('notifications', {
      userId: newUser.id,
      title: 'Welcome to Temple Portal',
      message: 'Your account is ready. You can now book darshan slots and check live crowd status.',
      type: 'INFO',
      readStatus: false
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Temple Portal.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * User Login (Pilgrim / Staff / Admin)
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, requiredRole } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.findOne('users', u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Role verification for dedicated portal entry points
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This login portal is restricted to ${requiredRole} accounts only. Your account role is ${user.role}.`
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Find staff profile if staff role
    let staffDetails = null;
    if (user.role === 'STAFF') {
      staffDetails = db.findOne('staff', s => s.userId === user.id);
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        staffProfile: staffDetails
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get currently authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    let staffDetails = null;
    if (user.role === 'STAFF') {
      staffDetails = db.findOne('staff', s => s.userId === user.id);
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        staffProfile: staffDetails
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = db.findById('users', req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const updated = db.update('users', user.id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot password request
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = db.findOne('users', u => u.email.toLowerCase() === (email || '').trim().toLowerCase());

    if (!user) {
      // Return 200 for security even if email not found
      return res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.'
      });
    }

    const resetToken = generateToken({ id: user.id, email: user.email, type: 'pwd_reset' });
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Temple Portal',
      html: emailTemplates.passwordReset(resetUrl)
    });

    res.json({
      success: true,
      message: 'Password reset link sent to your email address.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid token and new password (min 6 characters) are required.'
      });
    }

    const decoded = verifyToken(token);
    const user = db.findById('users', decoded.id);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    db.update('users', user.id, { passwordHash });

    res.json({
      success: true,
      message: 'Password has been successfully reset. You can now log in with your new password.'
    });
  } catch (err) {
    next(err);
  }
};
