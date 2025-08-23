const express = require('express');
const User = require('../models/User');
const { auth, requireTeen, requireAdult } = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// Search users (for finding teens or adults)
router.get('/search', async (req, res) => {
  try {
    const {
      userType,
      location,
      skills,
      minRating,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { isActive: true };
    
    if (userType) {
      filter.userType = userType;
    }
    
    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }
    
    if (skills && skills.length > 0) {
      filter.skills = { $in: skills.split(',') };
    }
    
    if (minRating) {
      filter['rating.average'] = { $gte: parseFloat(minRating) };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

// Rate a user (after job completion)
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const userToRate = await User.findById(req.params.id);
    if (!userToRate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot rate yourself
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }

    // Update user's rating
    await userToRate.updateRating(rating);

    res.json({ message: 'Rating submitted successfully' });

  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
});

// Get user's job history
router.get('/:id/jobs', auth, async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;
    
    // This would typically query the jobs collection
    // For now, we'll return a placeholder
    res.json({ message: 'Job history endpoint - implement with job queries' });

  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ message: 'Server error fetching user jobs' });
  }
});

// Update user verification status (admin only)
router.put('/:id/verify', auth, async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    // In a real app, you'd check if the current user is an admin
    // For now, we'll allow any authenticated user to verify others
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Verification status updated', user });

  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ message: 'Server error updating verification' });
  }
});

module.exports = router;
