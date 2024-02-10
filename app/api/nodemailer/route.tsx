import { getAdminUser } from '@/lib/actions/admin.actions';
import { findProduct } from '@/lib/actions/store.actions';
import nodemailer from 'nodemailer';

export const POST = async (req: any) => {
  const { email, name, items, event , pricing, address , orderId} = await req.json();
  const storeName = "PaletteHub"
  const contact = "123-456-7890"
  const location = "US Virgin Islands, St.Thomas 00802"

  const admin = await getAdminUser();



  const getProduct = async (productId: string) => {
    const data = await findProduct(productId);
    console.log("data:", data);
    return data ? data.name : null;
  };
  
  const generateProductsContent = async () => {
    try {
      // Map through the items array and generate content for each item
      const productsContent = await Promise.all(items.map(async (item: any) => {
        // Fetch product name asynchronously
        const productName = await getProduct(item.product);
        // Generate HTML content for the current item
        return `
          <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1;">${productName}</div>
            <div style="flex: 1;">${item.quantity}</div>
          </div>
        `;
      }));
      // Join the generated content into a single string
      return productsContent.join('');
    } catch (error) {
      console.error('Error generating products content:', error);
      return 'error'; // Return string in case of error
    }
  }
  

  // Construct the email content with dynamic product details
  let emailContent = "";
  let subject = "";
  if (event === "order") {
    emailContent = `
    <div style="font-family: Arial, sans-serif; width: 100%; font-size: 16px; color: #333;">
      <!-- Header section -->
      <div style="padding: 20px;">
        <div style="margin: 0 auto; max-width: 600px;">
          <div style="font-size: 24px; font-weight: bold; color: #333; text-align: center;">${storeName}</div>
          <div style="font-size: 16px; color: #555; text-align: center;">${location}</div>
          <div style="font-size: 16px; color: #555; text-align: center;">Phone: ${contact} | Email: ${admin.email}</div>
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
            ${await generateProductsContent()}
          </div>
        </div>
  
        <!-- Shipping Address section -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px;">Shipping Address</div>
          <div style="margin-left: 20px;">
            <div>${address.name}</div>
            <div>${address.address.line1}</div>
            <div>${address.address.city}, ${address.address.state} ${address.address.postal_code}</div>
            <div>${address.address.country}</div>
          </div>
        </div>
  
        <!-- Order ID section -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px;">Order ID</div>
          <div style="margin-left: 20px;">${orderId}</div>
        </div>
  
        <!-- Subtotal section -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold;">Subtotal</div>
          <div>$${pricing.subtotal}</div>
        </div>
  
        <!-- Shipping section -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold;">Shipping</div>
          <div>$${pricing.shipping}</div>
        </div>
  
        <!-- Tax section -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold;">Tax</div>
          <div>$${pricing.taxAmount}</div>
        </div>
  
        <!-- Total section -->
        <div style="text-align: center;">
          <div style="font-weight: bold;">Total</div>
          <div>$${pricing.total}</div>
        </div>
  
        <!-- See Details button -->
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://palettehub.vercel.app/account/orders" style="padding: 10px 20px; background-color: black; color: #fff; text-decoration: none; border-radius: 4px;">View Orders</a>
        </div>
      </div>
    </div>
  `;
  

  subject=`Order Confirmation From ${storeName}`

  } else if (event === "newuser") {
    // Add content and subject for new user event
    subject=`Welcome to ${storeName}!`

    emailContent = `
    <div style="font-family: Arial, sans-serif; width: 100%; font-size: 16px; color: #333;">
    <!-- Header section -->
    <div style="padding: 20px;">
      <div style="margin: 0 auto; max-width: 600px;">
        <div style="font-size: 24px; font-weight: bold; color: #333; text-align: center;">Welcome to ${storeName}!</div>
        <div style="font-size: 16px; color: #555; text-align: center;">We're located in ${location}</div>
        <div style="font-size: 16px; color: #555; text-align: center;">Contact us at ${contact} or via email at ${admin.email}</div>
      </div>
    </div>
  
  <!-- Welcome message section -->
  <div style="margin: 0 auto; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Dear ${name},</div>
    
    <!-- Welcome message -->
    <div style="margin-bottom: 20px;">
      <div>Welcome to ${storeName}! We're thrilled to have you as part of our community.</div>
      <div>At ${storeName}, we are committed to providing you with an exceptional shopping experience and top-notch customer service.</div>
      <div>Explore our wide range of products, carefully curated to cater to your needs and preferences.</div>
    </div>

    <!-- About the store -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold;">About Us:</div>
      <div>${storeName} is a leading online retailer specializing in all things cretaive. With a passion for quality and innovation, we strive to offer the best products at competitive prices.</div>
    </div>

    <!-- Call-to-action button -->
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://example.com/shop" style="padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Start Shopping</a>
    </div>
  </div>
</div>
`
  }

  // Function to extract domain from email address
  const getDomainFromEmail = (email: string) => {
    return email.split('@')[1];
  };

  // Define type for SMTP service configuration
  type SmtpServiceConfig = {
    service: string;
    // port: number;
  };

  // Function to determine SMTP service based on domain
  const getSmtpServiceFromDomain = (domain: string): SmtpServiceConfig | undefined => {
    // Map email domains to SMTP services
    const smtpServices: Record<string, SmtpServiceConfig> = {
      'gmail.com': {
        service: 'gmail',
      },
      'hotmail.com': {
        service: 'hotmail',
      },
      // Add more mappings as needed
      'yahoo.com': {
        service: 'yahoo',
      },
      'outlook.com': {
        service: 'outlook',
      },
    };

    // Return the SMTP service configuration for the given domain
    return smtpServices[domain];
  };


  // Get the domain from the admin's email
  const domain = getDomainFromEmail(admin.email);
  console.log("Domain: ", domain);

  // Get the SMTP service configuration based on the domain
  const smtpServiceConfig = getSmtpServiceFromDomain(domain);
  console.log("smtpServiceConfig: ", smtpServiceConfig);

  // Create the nodemailer transporter using the SMTP service configuration
  if (smtpServiceConfig) {
    const transporter = nodemailer.createTransport({
      pool: true,
      service: smtpServiceConfig.service,
      // Port will be automatically determined by nodemailer based on the service
      auth: {
        user: admin.email,
        pass: process.env.ADMIN_EMAIL_PASSWORD || '', // Don't forget to handle environment variable
      },
      maxConnections: 5,
    });

    // Function to send the email
    const sendEmail = async (emailContent: any, userEmail: string, subject: string) => {
      const mailOptions = {
        from: admin.email,
        to: userEmail,
        html: emailContent,
        subject: subject,
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
      // Send the email
      await sendEmail(emailContent, email, subject);
      return new Response(JSON.stringify({ message: "Successfully sent email. Thanks for contacting me! I will get back to you ASAP :)" }), { status: 201 });
    } catch (error) {
      return new Response(JSON.stringify({ message: "Error sending email. Please try again and ensure your email is correct" }), { status: 501 });
    }
  } else {
    console.error('SMTP service configuration not found for domain:', domain);
    return new Response(JSON.stringify({ message: "Error sending email. SMTP service configuration not found for domain" }), { status: 501 });
  }
};
