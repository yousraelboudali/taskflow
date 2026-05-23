const router  = require('express').Router();
const auth    = require('../middleware/auth');
const Project = require('../models/Project');
const Task    = require('../models/Task');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    const activeProjects = await Project.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
      status: 'actif',
    });

    const taskStats = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          totalDone: { $sum: { $cond: [{ $eq: ['$status', 'terminé'] }, 1, 0] } },
          totalLate: {
            $sum: {
              $cond: [{
                $and: [
                  { $ne: ['$status', 'terminé'] },
                  { $lt: ['$deadline', now] },
                  { $ne: ['$deadline', null] },
                ]
              }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = taskStats[0] || { totalAssigned: 0, totalDone: 0, totalLate: 0 };

    const inProgressTasks = await Task.find({ assignedTo: userId, status: 'en cours' })
      .populate('project', 'title')
      .sort({ deadline: 1 });

    res.json({
      activeProjects,
      totalAssigned: stats.totalAssigned,
      totalDone:     stats.totalDone,
      totalLate:     stats.totalLate,
      inProgressTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;