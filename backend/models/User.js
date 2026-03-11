const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ─── Common Fields ───────────────────────────────────────────────────────
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      required: true,
    },
    // 'active' = can log in; 'pending' = awaiting admin approval (officers); 'suspended' = banned
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: function () {
        // Officers start pending, citizens/admins start active
        return this.role === 'officer' ? 'pending' : 'active';
      },
    },

    // ─── Citizen-specific Fields ──────────────────────────────────────────────
    village: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    aadhaar: { type: String, trim: true, select: false },

    // ─── Officer-specific Fields ──────────────────────────────────────────────
    badgeNumber: { type: String, trim: true, unique: true, sparse: true },
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    officerDistrict: { type: String, trim: true },

    // ─── Timestamps & Meta ────────────────────────────────────────────────────
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return safe user object (no password)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.aadhaar;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
