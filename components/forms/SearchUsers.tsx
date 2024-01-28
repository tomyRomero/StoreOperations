import React from 'react'
import { Input } from '../ui/input'

const SearchUsers = () => {
  return (
    <header className="grid grid-cols-1 w-full  items-center border-b py-4">
    <div>
      <form>
        <div className="relative mx-auto  w-[80%]">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          
          <Input
            className="bg-white shadow-none pl-8"
            placeholder="Search users..."
            type="search"
          />
        </div>
      </form>
    </div>
  </header>
  )
}

export default SearchUsers

function SearchIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    )
  }
  