import nodemailer from "nodemailer";

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.from = `Admin Love-of-Anime ${process.env.EMAIL}`;
    this.name = user.name.split(" ")[0];
  }
  transport() {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "dindokarprajwal1@gmail.com",
        pass: "ztjntkiftiucntbj",
      },
    });
  }
  sendMail(subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: `${this.url}`,
    };
    this.transport().sendMail(mailOptions);
  }
}

export default Email;
