import hero from "@/public/assets/art.jpg"
import auth from "@/public/assets/auth.jpg"
import icon from "@/public/assets/icon.png"

//Used for nav menu 
export const loggedInNavLinks =
[
{
  title: "Home",
  path: "/", 
  image: "/assets/layout.png"
},
{
title: "Search",
path: "/search", 
image: "/assets/searchblack.png"
},
{
  title: "Shop",
  path: "/products", 
  image: "/assets/price.png"
},
{
  title: "Account",
  path: "/account",
  image: "/assets/profile.png"
},
{
  title: "Logout",
  path: "/logout",
  image: "/assets/logout.png"
}
]

export const loggedOutNavLinks = [
  {
      title: "Home",
      path: "/", 
      image: "/assets/layout.png"
  },
  {
    title: "Search",
    path: "/search", 
    image: "/assets/searchblack.png"
  },
  {
      title: "Shop",
      path: "/products", 
      image: "/assets/price.png"
  },
  {
      title: "Login",
      path: "/login",
      image: "/assets/login.png"
  },
]

//Later on it would be best practice to create a dedicated email that can be used to send all updates instead of the admin email emailing itself.

//Email that is used to send email alerts and receive contact support messages, 
//usually that of the admin, will also be used to recieve new order alerts and send newsletter messages
export const adminEmail = "tomyfletcher99@hotmail.com"

//used in navs folder, admin dashboard mobile admin dashboard
export const navItems = [
    { title: 'Recent Activity', url: '/adminactivity', img: '/assets/bell.png' },
    { title: 'Users', url: '/adminusers', img: '/assets/users.png' },
    { title: 'Categories', url: '/admincategories', img: '/assets/categories.png' },
    { title: 'Products', url: '/adminproducts', img: '/assets/products.png' },
    { title: 'Orders', url: '/adminorders', img: '/assets/orders.png' },
    { title: 'Newsletter', url: '/adminnewsletter', img: '/assets/speaker.png' },
  ];

  //Used in hero, sign up and login in page, nav, route.ts for nodemailer and also in contact us and order success
  export const storeDetails = {
    title: "Palettehub.",
    heroImg: hero,
    heroSubTitle: "Browse and Discover an Array of Tools For Your Creative Needs",
    heroTitle: "Enjoy an Explosion of Creative Freedom",
    authImg: auth,
    icon: icon,
    contact: "123-456-7890",
    location: `US Virgin Islands, St.Thomas 00802`,
    hours: {
      mondayToFriday: "9:00 AM to 6:00 PM ",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed"
    },

  }

  //Used in footer
  export const footerNavLinks = [
        {
          title: "Home",
          link: "/"
        },
        {
          title: "Shop",
          link: "/products"
        },
        {
          title: "About Us",
          link: "/about"
        },
        {
          title: "Contact Us",
          link: "/contact"
        }
      ]

//Used in footer
export const footerSocials = [
        {
          icon: "/assets/facebook.png",
          title: "facebook icon",
          link: "https://facebook.com"
        },
        {
          icon: "/assets/instagram.png",
          title: "instagram icon",
          link: "https://instagram.com"
        },
        {
          icon: "/assets/twitter.png",
          title: "twitter icon",
          link: "https://twitter.com"
        }
      ]

//Used in promotions
export const promotionInclusions = [
        {   
            title: "Free Shipping",
            icon: "/assets/box.png",
            description: "Free shipping for order above $150"
        },
        {
            title: "Money Guarantee",
            icon: "/assets/dollar.png",
            description: "Within 30 days for an exchange"
        },
        {
            title: "Online Support",
            icon: "/assets/support.png",
            description: "24 hours a day, 7 days a week"
        },
        {
            title: "Flexible Payment",
            icon: "/assets/card.png",
            description: "Pay with multiple credit cards"
        }
];

//Used in about page
export const accordionItems = [
  {
    icon: '/assets/info.png',
    title: "Information Collection",
    content: "We collect information to provide better services to all our users. This includes addresses, email addresses, usernames, and order details."
  },
  {
    icon:  '/assets/profilehome.png',
    title: "Use of Information",
    content: "We take security seriously. Passwords are encrypted to ensure that nobody can see them except the user. Addresses are kept safe and order details are only shared with the admin of the store in order to fulfill them. Payment details are never exposed and are secured with Stripe, a trusted payment processor."
  },
  {
    icon: '/assets/storage.png',
    title: "Local Storage",
    content: "We have a local storage for the cart, which is synced with the database when a user makes an account."
  },
  {
    icon: '/assets/rights.png',
    title: "Your Rights",
    content: "As a user, you have the right to access your personal data. We are committed to protecting your privacy and ensuring that your rights are respected."
  },
  {
    icon: '/assets/orders.png',
    title: "Return Policy",
    content: "Our return policy is as follows: We do not accept returns. We believe in providing quality products and ensuring customer satisfaction, but unfortunately, we cannot accommodate returns at this time."
  },
  {
    icon: '/assets/dollar.png',
    title: "Currency",
    content: "All transactions are conducted in US dollars."
  },
  {
    icon: '/assets/safe.png',
    title: "Security Measures",
    content: "We have implemented robust security measures to protect against injection attacks and other threats. Your security is our top priority, and we continually monitor and update our systems to ensure your information remains safe."
  }
];

