const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");
const validator = require("validator");
const { google } = require("googleapis");

dotenv.config();

const app = express();

// body parsing middleware
app.use(cors());
app.use(express.json());

// nodemailer transporter setup function
const createTransporter = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  // Get an access token dynamically
  const accessToken = await oauth2Client.getAccessToken();

  // Create nodemailer transporter with OAuth2
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MY_EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  return transporter;
};

// endpoint to send mail
app.post("/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(401).send({ error: "Please enter all required fields." });
  }

  // validate email
  if (!validator.isEmail(email)) {
    return res
      .status(401)
      .send({ error: "Please enter a valid email address." });
  }

  try {
    // Create nodemailer transporter
    const transporter = await createTransporter();

    // email options
    const mailOptions = {
      from: email,
      to: process.env.MY_EMAIL,
      subject: subject,
      replyTo: email,
      text: message,
    };

    // send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(401).send({ error: "Error sending message." });
      } else {
        res.status(200).send({ message: "Sent successfully." });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// start the server
app.listen(process.env.PORT, () => {
  console.log("Server is running at port", process.env.PORT);
});
