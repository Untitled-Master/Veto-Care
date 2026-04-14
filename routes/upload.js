const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/auth');
const upload = require('../utils/upload');

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const path = `files/${Date.now()}-${req.file.originalname}`;
  const { data, error } = await supabase.storage
    .from('health-records')
    .upload(path, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false
    });

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

module.exports = router;
