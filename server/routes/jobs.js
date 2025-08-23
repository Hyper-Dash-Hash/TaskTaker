const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, requireAdult, requireTeen } = require('../middleware/auth');

const router = express.Router();

// Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      location,
      minBudget,
      maxBudget,
      status = 'open',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { status, isActive: true };
    
    // Add category filter
    if (category) {
      filter.category = category;
    }
    
    // Add budget filter
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.min = { $gte: parseFloat(minBudget) };
      if (maxBudget) filter.budget.max = { $lte: parseFloat(maxBudget) };
    }
    
    // Add location filter (simple text search for now)
    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.zipCode': { $regex: location, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName rating profilePicture')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName rating profilePicture bio')
      .populate('assignedTo', 'firstName lastName rating profilePicture')
      .populate('applicants.user', 'firstName lastName rating profilePicture');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
});

// Post new job (adults only)
router.post('/', auth, requireAdult, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      budget,
      estimatedDuration,
      urgency,
      requiredSkills,
      startDate,
      endDate,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location || !budget || !estimatedDuration || !startDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate budget
    if (budget.min > budget.max) {
      return res.status(400).json({ message: 'Minimum budget cannot be greater than maximum budget' });
    }

    // Validate dates
    if (new Date(startDate) < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const job = new Job({
      title,
      description,
      category,
      location,
      budget,
      estimatedDuration,
      urgency,
      requiredSkills: requiredSkills || [],
      startDate,
      endDate,
      postedBy: req.user.userId,
      tags: tags || []
    });

    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'firstName lastName rating profilePicture');

    res.status(201).json({
      message: 'Job posted successfully',
      job: populatedJob
    });

  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ message: 'Server error posting job' });
  }
});

// Apply for a job (teens only)
router.post('/:id/apply', auth, requireTeen, async (req, res) => {
  try {
    const { proposal, proposedPrice } = req.body;
    
    if (!proposal || !proposedPrice) {
      return res.status(400).json({ message: 'Proposal and proposed price are required' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for applications' });
    }

    if (job.postedBy.toString() === req.user.userId.toString()) {
      return res.status(400).json({ message: 'You cannot apply for your own job' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.find(
      applicant => applicant.user.toString() === req.user.userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    await job.addApplicant(req.user.userId, proposal, proposedPrice);

    res.json({ message: 'Application submitted successfully' });

  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error applying for job' });
  }
});

// Accept applicant (job poster only)
router.post('/:id/accept-applicant', auth, async (req, res) => {
  try {
    const { applicantId } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only the job poster can accept applicants' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for applications' });
    }

    await job.acceptApplicant(applicantId);

    res.json({ message: 'Applicant accepted successfully' });

  } catch (error) {
    console.error('Accept applicant error:', error);
    res.status(500).json({ message: 'Server error accepting applicant' });
  }
});

// Update job status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, finalPrice } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only job poster or assigned teen can update status
    if (job.postedBy.toString() !== req.user.userId.toString() && 
        job.assignedTo?.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    if (status === 'completed' && finalPrice) {
      await job.completeJob(finalPrice);
    } else {
      job.status = status;
      await job.save();
    }

    res.json({ message: 'Job status updated successfully' });

  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ message: 'Server error updating job status' });
  }
});

// Get user's jobs (posted or assigned)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;
    
    let filter = {};
    
    if (type === 'posted') {
      filter.postedBy = req.params.userId;
    } else if (type === 'assigned') {
      filter.assignedTo = req.params.userId;
    } else {
      filter.$or = [
        { postedBy: req.params.userId },
        { assignedTo: req.params.userId }
      ];
    }
    
    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName rating profilePicture')
      .populate('assignedTo', 'firstName lastName rating profilePicture')
      .sort({ createdAt: -1 });

    res.json({ jobs });

  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ message: 'Server error fetching user jobs' });
  }
});

// Delete job (job poster only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Only the job poster can delete this job' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete job that is not open' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error deleting job' });
  }
});

module.exports = router;
