import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Layout ({ children }: { children: React.ReactNode }) {
    // Hardcoded user data
    const user = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
  
    // Navigation items
    const navItems = [
      { title: 'Account', url: '/account' , img: "/assets/profilehome.png"},
      { title: 'Orders', url: '/account/orders', img: "/assets/orders.png"},
      { title: "Addresses" , url: "/account/myaddresses", img: "/assets/address.png"},
    ];
  
    // Gutter component
    const Gutter = ({ children }: { children: React.ReactNode }) => (
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">{children}</div>
    );


    const session = await getServerSession(authOptions);

    if(!session)
    {
      redirect("/")
    }
  
  
    return (
      <div className="container mx-auto pt-40 max-sm:pt-36  max-md:pt-32">
        <Gutter>
          <h3 className="text-heading3-bold">My Profile</h3>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center mb-4">
                <div className="rounded-full overflow-hidden">
                  <Image src="/assets/profile.png" alt="profile" width={50} height={50} />
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-300 my-4"></div>
              <ul className="lg:pt-4 max-lg:pt-2 flex flex-wrap md:justify-evenly space-x-4 lg:flex-col lg:space-x-0 lg:space-y-6">
                {navItems.map((item) => (
                  <li key={item.title}>
                    <Link href={item.url} passHref className="flex items-center space-x-4 border border-gray-100 p-2 px-3 rounded-xl hover:bg-gray-200">
                      <Image src={item.img} alt={item.title} width={24} height={24} />
                      <span className="text-body-semibold">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3 overflow-y-auto">{children}</div>
          </div>
        </Gutter>
      </div>
    );
  }
