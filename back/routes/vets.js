const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/auth');

// Get list of all veterinarians
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('veterinaires') // Table B
    .select('*');
  
  if (error) return res.status(400).json(error);
  res.json(data);
});

router.post('/', authenticate, async (req, res) => {
  const { name, specialization, email } = req.body;

  if (!name || !specialization || !email) {
    return res.status(400).json({ message: 'name, specialization and email are required' });
  }

  const { data, error } = await supabase
    .from('veterinaires')
    .insert([{ name, specialization, email }])
    .select();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

module.exports = router;
