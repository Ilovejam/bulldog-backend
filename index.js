const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');

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
const transporter = nodemailer.createTransport(mailjetTransport({
  auth: {
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET
  }
}));

// Mail gönderme fonksiyonu
function sendEmail(post) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: "omelihtolunay@gmail.com", // Statik alıcı e-posta adresi
    subject: "Check tearadio.co!",
    text: "You've got a new notification at tearadio.co: " + post.title,
    html: `<h3>You've got a new notification at tearadio.co</h3><p>${post.content}</p>`
  };

  return transporter.sendMail(mailOptions);
}

app.post('/posts', (req, res) => {
  const post = req.body;
  posts.push(post);
  
  sendEmail(post)
    .then(result => {
      console.log('Email sent:', result);
      res.status(201).send(post);
    })
    .catch(err => {
      console.log('Error sending email:', err);
      res.status(500).send({error: 'Failed to send email'});
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
