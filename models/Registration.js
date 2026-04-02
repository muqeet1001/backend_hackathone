const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Member email is required'],
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    required: [true, 'Member mobile is required'],
    trim: true,
  },
  college: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
  },
  isLeader: {
    type: Boolean,
    default: false,
  },
});

const registrationSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    memberCount: {
      type: Number,
      required: true,
      min: 2,
      max: 4,
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: (arr) => arr.length >= 2 && arr.length <= 4,
        message: 'Team must have between 2 and 4 members',
      },
    },
    paymentScreenshot: {
      url: { type: String, required: true },         // Cloudinary secure URL
      publicId: { type: String, required: true },    // Cloudinary public_id for deletion
      originalName: { type: String },
      mimetype: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Registration', registrationSchema);
