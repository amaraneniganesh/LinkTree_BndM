const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all links for a user
router.get('/', auth, async (req, res) => {
  try {
    const links = await Link.find({ user: req.user.id });
    res.json(links);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a new link
router.post('/', auth, async (req, res) => {
  const { title, url } = req.body;

  try {
    const newLink = new Link({ title, url, user: req.user.id });
    const link = await newLink.save();
    res.json(link);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a link
router.put('/:id', auth, async (req, res) => {
  const { title, url } = req.body;

  try {
    let link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ msg: 'Link not found' });

    // Ensure user owns the link
    if (link.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    link.title = title;
    link.url = url;
    await link.save();

    res.json(link);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a link
router.delete('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ msg: 'Link not found' });
    }

    // Ensure user owns the link
    if (link.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Link.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Link removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Public route to view shared links
router.get('/shared/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const links = await Link.find({ user: user._id });
    res.json(links);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;