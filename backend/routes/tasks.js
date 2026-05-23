const router  = require('express').Router();
const auth    = require('../middleware/auth');
const Task    = require('../models/Task');
const Project = require('../models/Project');

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 8 } = req.query;
    const filter = { project: req.params.projectId };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (search)   filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    const skip  = (parseInt(page)-1) * parseInt(limit);
    const total = await Task.countDocuments(filter);
    const data  = await Task.find(filter)
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ data, total, page: parseInt(page), totalPages: Math.ceil(total/parseInt(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, priority, project } = req.body;
    if (!title || !priority || !project)
      return res.status(400).json({ message: 'Titre, priorité et projet sont requis' });
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'fullName email');
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'fullName email');
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['à faire', 'en cours', 'terminé'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Statut invalide' });
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });
    res.json({ message: 'Tâche supprimée' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;