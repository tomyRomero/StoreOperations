import nodemailer from 'nodemailer';

const myEmail = "tomyfletcher99@hotmail.com";

export const POST = async (req: any) => {
  const { email, name, message, items } = await req.json();

  // Generate the products section dynamically based on the items array
  const productsContent = items.map((item: any) => `
    <div style="display: flex; justify-content: space-between;">
      <div style="flex: 1;">${item.name}</div>
      <div style="flex: 1;">${item.quantity}</div>
    </div>
  `).join('');

  // Construct the email content with dynamic product details
  const emailContent = `
    <div style="font-family: Arial, sans-serif; width: 100%; font-size: 16px; color: #333;">
      <!-- Header section -->
      <div style="padding: 20px;">
        <div style="margin: 0 auto; max-width: 600px;">
          <div style="font-size: 24px; font-weight: bold; color: #333; text-align: center;">Acme Inc</div>
          <div style="font-size: 16px; color: #555; text-align: center;">1234 Elm St, Anytown, CA 12345</div>
          <div style="font-size: 16px; color: #555; text-align: center;">Phone: 123-456-7890 | Email: info@acme.com</div>
        </div>
      </div>
      
      <!-- Order details section -->
      <div style="margin: 0 auto; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Order Confirmation</div>
        
        <!-- Greeting message -->
        <div style="margin-bottom: 20px; text-align: center;">
          <div style="font-size: 16px;">Hello, ${name}!</div>
          <div style="font-size: 16px; margin-top: 10px;">Thanks for shopping with us. Here are your order details:</div>
        </div>

        <!-- Products section -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px;">Products</div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <div style="flex: 1; font-weight: bold;">Product Name</div>
              <div style="flex: 1; font-weight: bold;">Quantity</div>
            </div>
            ${productsContent}
          </div>
        </div>

        <!-- Shipping Address, Order Status, Tax Included, Shipping Rate sections -->

        <!-- See Details button -->
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="#" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">See Details</a>
        </div>
        
        <!-- Total section -->
        <div style="text-align: center;">
          <div style="font-weight: bold;">Total</div>
          <div>$150.00</div>
        </div>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    pool: true,
    service: 'hotmail',
    port: 2525,
    auth: {
      user: 'tomyfletcher99@hotmail.com',
      pass: process.env.EMAIL_PASSWORD,
    },
    maxConnections: 1,
  });

  const sendEmail = async (emailContent: any, userEmail: string) => {
    const mailOptions = {
      from: myEmail,
      to: myEmail,
      html: emailContent,
      subject: `Greetings from ${name}`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info);
    } catch (error) {
      console.error('Error sending mail: ', error);
      throw new Error("Mail Failed to Send");
    }
  };

  try {
    await sendEmail(emailContent, myEmail);
    return new Response(JSON.stringify({ message: "Successfully sent email. Thanks for contacting me! I will get back to you ASAP :)" }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error sending email. Please try again and ensure your email is correct" }), { status: 501 });
  }
};
