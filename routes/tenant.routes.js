import express from 'express';
import Tenant from '../models/Tenant.js';
const router = express.Router();





// GET ALL
router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener empresas' });
  }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const nueva = new Tenant(req.body);
    const saved = await nueva.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear empresa' });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const actualizada = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizada);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar empresa' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Tenant.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Empresa eliminada' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar empresa' });
  }
});

module.exports = router;
