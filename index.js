const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');
const { v4: uuidv4 } = require('uuid');  // UUID modülünü dahil edin

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200
}));
app.use(express.json());

let posts = [];

// Nodemailer transporter'ını yapılandırma
const transporter = nodemailer.createTransport({
    service: 'Mailjet',
    auth: {
      user: process.env.MAILJET_API_KEY,
      pass: process.env.MAILJET_API_SECRET
    }
  });
  

// Mail gönderme fonksiyonu
function sendEmail(post) {
    // Post'ta title olup olmadığını kontrol et
    const subjectLine = post.title ? `New post: ${post.title}` : "Check tearadio.co!";
    const mailOptions = {
      from: "gunnerwinniaird@gmail.com",
      to: "omelihtolunay@gmail.com", // Statik alıcı e-posta adresi
      subject: subjectLine,
      text: `You've got a new notification at tearadio.co: ${post.content}`, // Post içeriği
      html: `<h3>You've got a new notification at tearadio.co</h3><p>${post.content}</p>` // HTML içerik
    };
  
    return transporter.sendMail(mailOptions);
  }
  

  app.post('/posts', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
  
    const post = {
      id: uuidv4(), // Her post için benzersiz bir ID oluştur
      title,
      content
    };
  
    posts.push(post);
  
    sendEmail(post)
      .then(result => {
        console.log('Email sent:', result);
        res.status(201).json(post);
      })
      .catch(err => {
        console.error('Error sending email:', err);
        res.status(500).json({ error: 'Failed to send email', details: err });
      });
  });
  
  

app.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  posts = posts.filter(post => post.id !== id);
  res.status(200).send('Post deleted');
});

app.get('/posts', (req, res) => {
  res.status(200).send(posts);
});

app.get('/test', (req, res) => {
  res.send('Yeah');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
