const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for base64 images

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/tokoryven', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema
const testimonialSchema = new mongoose.Schema({
    userName: String,
    userEmail: String, // Real email (hidden/masked in UI)
    userEmailMasked: String, // For display if needed, but we can generate it on frontend
    photo: String, // Base64 string
    rating: Number,
    review: String,
    createdAt: { type: Date, default: Date.now }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// Admin Email
const ADMIN_EMAIL = 'fikrinrirham@gmail.com';

// Routes

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a testimonial
app.post('/api/testimonials', async (req, res) => {
    const { userName, userEmail, photo, rating, review } = req.body;
    
    // Simple validation
    if (!rating || !review || !userName) {
        return res.status(400).json({ message: 'Mohon lengkapi data.' });
    }

    const newTestimonial = new Testimonial({
        userName,
        userEmail,
        photo,
        rating,
        review
    });

    try {
        const savedTestimonial = await newTestimonial.save();
        res.status(201).json(savedTestimonial);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a testimonial (Admin only)
app.delete('/api/testimonials/:id', async (req, res) => {
    const { adminEmail } = req.body; // Expecting admin email in body for verification

    if (adminEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat menghapus.' });
    }

    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Testimoni berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a testimonial (Admin only)
app.put('/api/testimonials/:id', async (req, res) => {
    const { adminEmail, review, rating } = req.body;

    if (adminEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengubah.' });
    }

    try {
        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { review, rating },
            { new: true }
        );
        res.json(updatedTestimonial);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
