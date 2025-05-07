import nodemailer from "nodemailer";

const sendVerificationMail = async (email, otp) => {
  // Setup your SMTP transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your OTP code is: <b>${otp}</b>. It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationMail;
