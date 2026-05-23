const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ message: 'Tous les champs sont requis' });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email déjà utilisé' });

    const user  = await User.create({ fullName, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;