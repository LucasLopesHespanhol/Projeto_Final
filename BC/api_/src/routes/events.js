const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Conectar ao MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bc', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado');
});

// Schema e modelo para "events"
const eventsSchema = new mongoose.Schema({
  description: { type: String, required: true },
  comments: { type: String, required: false },
  date: { type: Date, required: true },
  created_at: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventsSchema);

// ** Rotas para os eventos **

// Retornar todos os eventos
// GET "/events"
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Retornar um evento específico pelo ID
// GET "/events/:id"
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  // Verifica se o ID é válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido!' });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado!' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Inserir um novo evento
// POST "/events"
router.post('/', async (req, res) => {
  const { description, date, comments } = req.body;

  // Verifica se os campos obrigatórios estão presentes
  if (!description || !date) {
    return res.status(400).json({ message: 'Descrição e data são obrigatórios!' });
  }

  try {
    const newEvent = new Event({ description, date, comments });
    await newEvent.save();
    res.status(201).json({ message: 'Evento adicionado com sucesso!', newEvent });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Atualizar dados de um evento
// PUT "/events/:id"
router.put('/:id', async (req, res) => {
  const id = req.params.id;

  // Verifica se o ID é válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido!' });
  }

  const { description, date, comments } = req.body;

  // Verifica se os campos obrigatórios estão presentes
  if (!description || !date) {
    return res.status(400).json({ message: 'Descrição e data são obrigatórios!' });
  }

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { description, date, comments },
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Evento não encontrado!' });
    }
    res.status(200).json({ message: 'Evento atualizado com sucesso!', updatedEvent });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deletar um evento
// DELETE "/events/:id"
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  // Verifica se o ID é válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido!' });
  }

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Evento não encontrado!' });
    }
    res.status(200).json({ message: 'Evento deletado com sucesso!', deletedEvent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
