const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'lawn-care',
      'housekeeping',
      'pet-care',
      'tutoring',
      'shopping',
      'organization',
      'tech-help',
      'other'
    ]
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  budget: {
    min: {
      type: Number,
      required: true,
      min: 5
    },
    max: {
      type: Number,
      required: true,
      min: 5
    },
    type: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed'
    }
  },
  estimatedDuration: {
    type: Number, // in hours
    required: true,
    min: 0.5,
    max: 24
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposal: {
      type: String,
      maxlength: 500
    },
    proposedPrice: {
      type: Number,
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  finalPrice: {
    type: Number
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'disputed'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ status: 1, category: 1, location: 1 });
jobSchema.index({ postedBy: 1, status: 1 });

// Virtual for job duration
jobSchema.virtual('duration').get(function() {
  if (this.actualStartDate && this.actualEndDate) {
    return (this.actualEndDate - this.actualStartDate) / (1000 * 60 * 60); // hours
  }
  return this.estimatedDuration;
});

// Method to add applicant
jobSchema.methods.addApplicant = function(userId, proposal, proposedPrice) {
  const existingApplicant = this.applicants.find(
    applicant => applicant.user.toString() === userId.toString()
  );
  
  if (existingApplicant) {
    throw new Error('User has already applied for this job');
  }
  
  this.applicants.push({
    user: userId,
    proposal,
    proposedPrice
  });
  
  return this.save();
};

// Method to accept applicant
jobSchema.methods.acceptApplicant = function(userId) {
  const applicant = this.applicants.find(
    applicant => applicant.user.toString() === userId.toString()
  );
  
  if (!applicant) {
    throw new Error('Applicant not found');
  }
  
  applicant.status = 'accepted';
  this.status = 'in-progress';
  this.assignedTo = userId;
  
  // Reject other applicants
  this.applicants.forEach(app => {
    if (app.user.toString() !== userId.toString()) {
      app.status = 'rejected';
    }
  });
  
  return this.save();
};

// Method to complete job
jobSchema.methods.completeJob = function(finalPrice) {
  this.status = 'completed';
  this.finalPrice = finalPrice;
  this.actualEndDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);
