
import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="w-full flex flex-col justify-center items-center">
      <Image
        alt="Hero"
        className="absolute w-full object-cover z-0"
        height="800"
        src="/assets/art.jpg"
        style={{
          aspectRatio: "1200/800",
          objectFit: "cover",
        }}
        width="1200"
      />
      <div className="text-center z-50">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">Enjoy An Explosion Of Creative Freedom</h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-lg mx-auto">
          Browse and Discover an Array of Creative Pieces made
        </p>
        <Link
          className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-lg font-medium text-gray-900 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          href="#"
        >
          Shop Now
        </Link>
      </div>
    </section>
  )
}
