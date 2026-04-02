const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Registration = require('../models/Registration');

// POST /api/register
router.post('/', upload.single('paymentScreenshot'), async (req, res) => {
  try {
    // The file was uploaded to Cloudinary by Multer
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
    }

    // Parse members from JSON string sent in FormData
    let members;
    try {
      members = JSON.parse(req.body.members);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid members data' });
    }

    const { teamName, memberCount } = req.body;

    // Basic server-side validation
    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }

    const count = parseInt(memberCount);
    if (isNaN(count) || count < 2 || count > 4) {
      return res.status(400).json({ success: false, message: 'Member count must be between 2 and 4' });
    }

    if (!Array.isArray(members) || members.length < 2 || members.length > 4) {
      return res.status(400).json({ success: false, message: 'Team must have between 2 and 4 members' });
    }

    // Validate each member
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name?.trim()) return res.status(400).json({ success: false, message: `Member ${i + 1}: name is required` });
      if (!m.email?.trim()) return res.status(400).json({ success: false, message: `Member ${i + 1}: email is required` });
      if (!m.mobile?.trim()) return res.status(400).json({ success: false, message: `Member ${i + 1}: mobile is required` });
      if (!m.college?.trim()) return res.status(400).json({ success: false, message: `Member ${i + 1}: college is required` });
    }

    // Build and save the registration document
    const registration = new Registration({
      teamName: teamName.trim(),
      memberCount: count,
      members,
      paymentScreenshot: {
        url: req.file.path,              // Cloudinary secure URL
        publicId: req.file.filename,     // Cloudinary public_id
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
      },
      status: 'pending',
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registrationId: registration._id,
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/register — get all registrations (admin use)
router.get('/', async (_req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
