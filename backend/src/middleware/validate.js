/**
 * Express Request Validator Helper
 */
export const validateRegistration = (req, res, next) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!phone || phone.trim().length < 8) {
    errors.push('Please provide a valid phone/mobile number.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }
  next();
};

export const validateBooking = (req, res, next) => {
  const { darshanType, bookingDate, slotTime, numberOfPeople, primaryPilgrimName, primaryPilgrimPhone } = req.body;
  const errors = [];

  if (!darshanType) errors.push('Darshan type is required.');
  if (!bookingDate) errors.push('Booking date is required.');
  if (!slotTime) errors.push('Slot time is required.');
  if (!primaryPilgrimName) errors.push('Primary pilgrim name is required.');
  if (!primaryPilgrimPhone) errors.push('Primary pilgrim phone is required.');
  if (!numberOfPeople || numberOfPeople < 1 || numberOfPeople > 10) {
    errors.push('Number of people must be between 1 and 10.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking data provided.',
      errors
    });
  }

  next();
};
