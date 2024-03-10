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

// password updated notification
export const profileUpdatedNotificationEmail = ({ email, fname }) => {
  const body = {
    from: `"Tech Gear 👻" <${process.env.SMPT_USER}>`, // sender address
    to: email, // list of receivers
    subject: "your profile has been updated!", // Subject line
    text: `Hello ${fname}, your profile has been updated. You may now see your updated profile in the screen.\n\n Regards,\nTech Gear`, // plain text body
    html: `<p>Hello ${fname}</p>

    <br/>
    <br/>
    
    <p>Your profile has been updated.</p>
    <p>You may now see your updated profile in the screen.</p>
    
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

export const sendOrderDispatchVerificationEmailNotification = ({
  toEmail,
  name,
  shippingStreet,
  shippingState,
  shippingZip,
  carts,
}) => {
  const body = {
    from: `Tech Gear 👻 <${process.env.SMPT_USER}>`, // sender address
    to: toEmail, // list of receivers
    subject: "Your order has been shipped!", // Subject line
    text: `Hello ${name},\n\nYour order has been shipped. While you eagerly await the arrival of your order, please feel free to explore our wide range of products by visiting our page.\n\nFollowing items has been shipped:\n
   
    ${carts
      .map((item) =>
        item.dispatchedQty > 0 || item.dispatchedQty > "0"
          ? `${item.productName} / ${item.orderedSize} X ${item.dispatchedQty}`
          : ``
      )
      .join("\n\n")}

      ${
        carts.reduce(
          (accumulator, { cartRefund }) => accumulator + cartRefund,
          0
        ) > 0
          ? `\n\nFollowing items has been missing and we will be shipping them soon or refund you the remaining balance.\n`
          : ``
      }
   
      ${carts
        .map((item) =>
          item.cartRefund > 0 || item.cartRefund > "0"
            ? `${item.productName} / ${item.orderedSize} X ${
                (Number(item.cartRefund) * Number(item.orderedQty)) /
                Number(item.totalPrice)
              }`
            : `All items has been shipped for ${item.productName} / ${item.orderedSize}`
        )
        .join("\n\n")}
    
    Your order will be shipped to following address:\n${shippingStreet}, ${shippingState}, ${shippingZip}\n\n.Happy shopping! 🛍️\n\n---------\nRegards,\nTech Gear`, // plain text body
    html: `<p>Hello ${name},</p>
    
    <p>Your order has been shipped. While you eagerly await the arrival of your order, please feel free to explore our wide range of products by visiting our page.</p>

    <p>Following items has been shipped:</p>

    <ul>
    ${carts
      .map(
        (item) => `
        ${
          item.dispatchedQty > 0 || item.dispatchedQty > "0"
            ? `<li>
              <img
                src=${item.thumbnail}
                alt=${item.productName}
                width="60"
                height="60"
              />
              <p>
                ${item.productName} / ${item.orderedSize} X ${item.dispatchedQty}
              </p>
            </li>`
            : `<li></li>`
        }
        
      `
      )
      .join("")}
    </ul>

    ${
      carts.reduce(
        (accumulator, { cartRefund }) => accumulator + cartRefund,
        0
      ) > 0
        ? `<p>Following items has been missing and we will be shipping them soon or refund you the remaining balance.</p>`
        : ``
    }

    <ul>
    ${carts
      .map(
        (item) => `
        ${
          item.cartRefund > 0 || item.cartRefund > "0"
            ? `<li>
              <img
                src=${item.thumbnail}
                alt=${item.productName}
                width="60"
                height="60"
              />
              <p>
                ${item.productName} / ${item.orderedSize} X
                ${
                  (Number(item.cartRefund) * Number(item.orderedQty)) /
                  Number(item.totalPrice)
                }
              </p>
            </li>`
            : `<li>
              All items has been shipped for ${item.productName} / ${item.orderedSize}
            </li>`
        }
        
      `
      )
      .join("")}
    </ul>

    <p>Your order will be shipped to following address:\n ${shippingStreet}, ${shippingState}, ${shippingZip}</p>
    
    <br/>

    <p>Happy shopping! 🛍️</p>

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
