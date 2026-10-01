import { db } from '../data/store.js';
import bcrypt from 'bcryptjs';

/**
 * Get all staff members (Admin)
 * GET /api/staff
 */
export const getStaffList = async (req, res, next) => {
  try {
    const { department, shift, status, search } = req.query;
    let list = [...db.data.staff];

    if (department) {
      list = list.filter(s => s.department.toLowerCase() === department.toLowerCase());
    }
    if (shift) {
      list = list.filter(s => s.shift.toLowerCase().includes(shift.toLowerCase()));
    }
    if (status) {
      list = list.filter(s => s.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.employeeCode.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.assignedArea.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      total: list.length,
      staff: list
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new staff member (Admin)
 * POST /api/staff
 */
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, department, assignedArea, shift, password = 'TempleStaff@123' } = req.body;

    if (!name || !email || !department || !assignedArea || !shift) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, department, assigned area, and shift are required.'
      });
    }

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = db.insert('users', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 98000 00000',
      passwordHash,
      role: 'STAFF',
      isVerified: true
    });

    const empCode = `EMP-${department.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newStaff = db.insert('staff', {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      employeeCode: empCode,
      department,
      assignedArea,
      shift,
      status: 'ON_DUTY'
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully.',
      staff: newStaff
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update staff member details
 * PUT /api/staff/:id
 */
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department, assignedArea, shift, status, name, phone } = req.body;

    const staff = db.findById('staff', id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff record not found.' });
    }

    const updates = {};
    if (department) updates.department = department;
    if (assignedArea) updates.assignedArea = assignedArea;
    if (shift) updates.shift = shift;
    if (status) updates.status = status;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const updated = db.update('staff', id, updates);

    // Also sync user name/phone if changed
    if (staff.userId && (name || phone)) {
      const userUpdates = {};
      if (name) userUpdates.name = name;
      if (phone) userUpdates.phone = phone;
      db.update('users', staff.userId, userUpdates);
    }

    res.json({
      success: true,
      message: 'Staff profile updated successfully.',
      staff: updated
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete / Remove staff member
 * DELETE /api/staff/:id
 */
export const deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = db.findById('staff', id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    db.delete('staff', id);
    if (staff.userId) {
      db.delete('users', staff.userId);
    }

    res.json({
      success: true,
      message: 'Staff member removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};
