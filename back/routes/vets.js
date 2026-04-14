const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/auth');

// Get list of all veterinarians
router.get('/', async (req, res) => {
  const { search } = req.query;

  let query = supabase
    .from('veterinaires')
    .select('*');

  if (search) {
    query = query.or(`name.ilike.%${search}%,specialization.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

router.get('/:id/portfolio', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('veterinaires')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return res.status(400).json({ message: error.message });
  if (!data) return res.status(404).json({ message: 'Veterinarian not found' });

  res.json({
    ...data,
    portfolio: {
      title: `${data.name} Portfolio`,
      specialties: [data.specialization].filter(Boolean),
      stats: {
        years_experience: data.years_experience || 0,
        rating: data.rating || 0,
        total_reviews: data.total_reviews || 0
      },
      bio: data.bio || 'Professional veterinarian profile available on Veto-Care.',
      clinic_address: data.clinic_address || 'Address not provided yet.',
      image_url: data.image_url || null
    }
  });
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
