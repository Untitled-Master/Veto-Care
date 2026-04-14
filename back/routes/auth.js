const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/auth');

const registerHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('Signup Error:', error.message);
    return res.status(400).json({ message: error.message });
  }

  res.json(data);
};

router.post('/register', registerHandler);
router.post('/signup', registerHandler);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login Error:', error.message);
    return res.status(400).json({ message: error.message });
  }

  res.json(data);
});

router.post('/login-vet', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Vet Login Error:', error.message);
    return res.status(400).json({ message: error.message });
  }

  const { data: vet, error: vetError } = await supabase
    .from('veterinaires')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (vetError) {
    console.error('Vet Lookup Error:', vetError.message);
    return res.status(400).json({ message: vetError.message });
  }

  if (!vet) {
    return res.status(403).json({ message: 'This account is not registered as a veterinarian' });
  }

  res.json({
    ...data,
    role: 'vet',
    vet_profile: vet
  });
});

router.get('/profile', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) {
    console.error('Profile Fetch Error:', error.message);
    return res.status(400).json({ message: error.message });
  }

  res.json({
    user: req.user,
    profile: data || null
  });
});

router.put('/profile', authenticate, async (req, res) => {
  const allowedFields = [
    'full_name',
    'phone',
    'avatar_url',
    'bio',
    'pet_name',
    'pet_type',
    'pet_breed',
    'city'
  ];

  const payload = { id: req.user.id };

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      payload[field] = req.body[field];
    }
  }

  if (Object.keys(payload).length === 1) {
    return res.status(400).json({ message: 'No profile fields provided' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Profile Update Error:', error.message);
    return res.status(400).json({ message: error.message });
  }

  res.json(data);
});

module.exports = router;
