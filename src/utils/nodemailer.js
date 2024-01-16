import nodemailer from "nodemailer";

// smpt configuration
// email body
// send email

const transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST,
  port: process.env.SMPT_PORT,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASS,
  },
});

const emailSender = async (obj) => {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail(obj);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
};

export const sendEmailVerificationLinkTemplate = ({ email, fname, url }) => {
  const body = {
    from: `"Tech Gear 👻" <${process.env.SMPT_USER}>`, // sender address
    to: email, // list of receivers
    subject: "Follow the instruction to verify your account!", // Subject line
    text: `Hello ${fname}, please follow the link to verify your account ${url}\n\n Regards,\nTech Gear`, // plain text body
    html: `<p>Hello ${fname}</p>

    <br/>
    <br/>
    
    <p>Thank you for creating account with us. Click the button to verify your account!</p>
    
    <p>
      <a href="${url}">
      <button style=background: green; padding:9px;color:"white"; fontWeight:bold;>Verify</button>
      </a>
    </p>
    
    <br/>
    <br/>
    <br/>

    <p>If the button doesn't work, please copy the link and paste it to your browser "${url}"</p>

    <br/>
    <br/>
    <br/>
    
    ---------
    
    <p>
      Regards,
      <br/>
      Tech Gear
      <br/>
    </p>`, // html body
  };

  emailSender(body);
};

export const sendEmailVerifiedNotification = ({ email, fname }) => {
  const body = {
    from: `"Tech Gear 👻" <${process.env.SMPT_USER}>`, // sender address
    to: email, // list of receivers
    subject: "your email has been verified!", // Subject line
    text: `Hello ${fname}, your email has been verified. you may login now\n\n Regards,\nTech Gear`, // plain text body
    html: `<p>Hello ${fname}</p>

    <br/>
    <br/>
    
    <p>Thank you for creating account with us. Your account has been verified!</p>
    
    <br/>
    <br/>
    <br/>

    <p>You may login now!"</p>

    <br/>
    <br/>
    <br/>
    
    ---------
    
    <p>
      Regards,
      <br/>
      Tech Gear
      <br/>
    </p>`, // html body
  };

  emailSender(body);
};

// otp
export const sendOTPEmail = ({ email, fname, otp }) => {
  const body = {
    from: `"Tech Gear 👻" <${process.env.SMPT_USER}>`, // sender address
    to: email, // list of receivers
    subject: "your OTP for password reset!", // Subject line
    text: `Hello ${fname}, here is your OTP ${otp}. You may reset your password now.\n\n Regards,\nTech Gear`, // plain text body
    html: `<p>Hello ${fname}</p>

    <br/>
    <br/>
    
    <p>Here is your OTP</p><p>${otp}</p>.<p>You may reset your password now!</p>
    
    <br/>
    <br/>
    <br/>
    
    ---------
    
    <p>
      Regards,
      <br/>
      Tech Gear
      <br/>
    </p>`, // html body
  };

  emailSender(body);
};

// password updated notification
export const passwordUpdatedNotificationEmail = ({ email, fname }) => {
  const body = {
    from: `"Tech Gear 👻" <${process.env.SMPT_USER}>`, // sender address
    to: email, // list of receivers
    subject: "your password has been updated!", // Subject line
    text: `Hello ${fname}, your password has been updated. You may login now.\n\n Regards,\nTech Gear`, // plain text body
    html: `<p>Hello ${fname}</p>

    <br/>
    <br/>
    
    <p>Your password has been updated!</p>
    
    <br/>
    <br/>
    <br/>
    
    ---------
    
    <p>
      Regards,
      <br/>
      Tech Gear
      <br/>
    </p>`, // html body
  };

  emailSender(body);
};
