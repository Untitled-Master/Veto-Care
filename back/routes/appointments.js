const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authenticate = require('../middleware/auth');

// Create a new Appointment (Table C)
router.post('/', authenticate, async (req, res) => {
  const { vet_id, date_rdv, file_path } = req.body;

  const { data, error } = await supabase
    .from('rendez_vous')
    .insert([{ 
      maitre_id: req.user.id, // ID from the token (Table A)
      veterinaire_id: vet_id,  // Table B
      date_rdv: date_rdv,
      health_record_path: file_path // Link to Storage
    }])
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});

// Get user's own appointments (Testing RLS)
router.get('/my-appointments', authenticate, async (req, res) => {
    const { data, error } = await supabase
        .from('rendez_vous')
        .select('*, veterinaires(name)')
        .eq('maitre_id', req.user.id);
    
    if (error) return res.status(400).json(error);
    res.json(data);
});

router.get('/', authenticate, async (req, res) => {
  const { role } = req.query;

  let query = supabase
    .from('rendez_vous')
    .select('*, veterinaires(name, specialization, email)');

  if (role === 'vet') {
    const { data: vet, error: vetError } = await supabase
      .from('veterinaires')
      .select('id')
      .eq('email', req.user.email)
      .maybeSingle();

    if (vetError) return res.status(400).json({ message: vetError.message });
    if (!vet) return res.status(403).json({ message: 'Vet profile not found for this account' });

    query = query.eq('veterinaire_id', vet.id);
  } else {
    query = query.eq('maitre_id', req.user.id);
  }

  const result = await query;

  if (result.error) return res.status(400).json({ message: result.error.message });
  res.json(result.data);
});

router.put('/:id/cancel', authenticate, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('rendez_vous')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('maitre_id', req.user.id)
    .select();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

module.exports = router;
