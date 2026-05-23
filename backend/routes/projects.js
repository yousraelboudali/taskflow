const router   = require('express').Router();
const auth     = require('../middleware/auth');
const Project  = require('../models/Project');
const User     = require('../models/User');
const Activity = require('../models/Activity');

router.get('/', auth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip  = (page - 1) * limit;
    const filter = { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    const total  = await Project.countDocuments(filter);
    const data   = await Project.find(filter)
      .populate('owner', 'fullName email')
      .populate('members', 'fullName email')
      .skip(skip).limit(limit).sort({ createdAt: -1 });
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    if (!title) return res.status(400).json({ message: 'Le titre est requis' });
    const project = await Project.create({ title, description, deadline, owner: req.user._id });
    await Activity.create({ type: 'project_created', project: project._id, user: req.user._id, meta: { title } });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'fullName email')
      .populate('members', 'fullName email');
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });
    Object.assign(project, req.body);
    await project.save();
    await Activity.create({ type: 'project_updated', project: project._id, user: req.user._id, meta: { title: project.title } });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });
    await project.deleteOne();
    res.json({ message: 'Projet supprimé' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });
    const invitee = await User.findOne({ email: req.body.email });
    if (!invitee) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (project.members.includes(invitee._id))
      return res.status(409).json({ message: 'Déjà membre' });
    project.members.push(invitee._id);
await project.save();
await Activity.create({ type: 'member_added', project: project._id, user: req.user._id, meta: { memberEmail: invitee.email } });
const Notification = require('../models/Notification');
await Notification.create({
  user: invitee._id,
  project: project._id,
  message: `Vous avez été ajouté au projet "${project.title}"`,
});
res.json({ message: 'Membre ajouté' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet introuvable' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Accès refusé' });
    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    await Activity.create({ type: 'member_removed', project: project._id, user: req.user._id });
    res.json({ message: 'Membre retiré' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/activities', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;