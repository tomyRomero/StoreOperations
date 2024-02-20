import hero from "@/public/assets/art.jpg"
import auth from "@/public/assets/auth.jpg"
import icon from "@/public/assets/icon.png"

export const navItems = [
    { title: 'Recent Activity', url: '/adminactivity', img: '/assets/bell.png' },
    { title: 'Users', url: '/adminusers', img: '/assets/users.png' },
    { title: 'Categories', url: '/admincategories', img: '/assets/categories.png' },
    { title: 'Products', url: '/adminproducts', img: '/assets/products.png' },
    { title: 'Orders', url: '/adminorders', img: '/assets/orders.png' },
    { title: 'Newsletter', url: '/adminnewsletter', img: '/assets/speaker.png' },
  ];

  export const storeDetails = {
    title: "Palettehub.",
    heroImg: hero,
    heroSubTitle: "Browse and Discover an Array of Tools For Your Creative Needs",
    heroTitle: "Enjoy an Explosion of Creative Freedom",
    authImg: auth,
    icon: icon
  }

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