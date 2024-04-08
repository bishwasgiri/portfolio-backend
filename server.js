const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");
const validator = require("validator");
const { google } = require("googleapis");

dotenv.config();

const app = express();

// const PORT = 4000;

// const CLIENT_ID =
//   "842709003134-ddjjek40su5fuphrss0lbke3eavgumh7.apps.googleusercontent.com";
// const CLIENT_SECRET = "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";
// const REFRESH_TOKEN =
//   "1//0401vKKp_G-rwCgYIARAAGAQSNwF-L9Ir2DwqHgaXfW6Bu-sC3qpAsRNtFO_VULsXBWkWKc-S0B0aAGDz4F6ePAbKvX6otavsK6g";
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const MY_EMAIL = "giribishwas4@gmail.com";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const accessToken = oauth2Client.getAccessToken();

// body parsing middleware

app.use(cors());
app.use(express.json());

// nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MY_EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.accessToken,
  },
});

// end point to send mail
app.post("/send-email", (req, res) => {
  const { email, subject, message } = req.body;

  if (!email) {
    res.status(401).send({ error: "please enter your email" });
  }
  if (!subject) {
    res.status(401).send({ error: "please enter subject" });
  }
  if (!message) {
    res.status(401).send({ error: "please enter message" });
  }

  // validate email
  if (!validator.isEmail(email)) {
    res.status(401).send({ error: "please enter the correct email address" });
  }

  // email options
  const mailOptions = {
    from: email,
    to: process.env.MY_EMAIL,
    subject: subject,
    text: `From:${email}\n\n${message}`,
  };

  // send email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(401).send({ error: "error sending message" });
    } else {
      res.status(200).send({ message: "sent successfully" });
    }
  });
});

// start the server
app.listen(process.env.PORT, () => {
  console.log("Server is running at port", process.env.PORT);
});
