import React from 'react'
import spotted from '../spotted.png'
import { Link } from '@inertiajs/react'
const CONTACTS = [
  { name: 'Dennis Abalos', img: 'https://th.bing.com/th/id/OIP.RhAMDPDRswX1AtOHxP7DLwAAAA?w=147&h=108&c=7&qlt=90&bgcl=a358c2&r=0&o=6&pid=13.1', online: true },
  { name: 'Eric Tiglao', img: 'https://th.bing.com/th/id/OIP.gxuEj53wE-p-LiwqIoI2gwAAAA?w=147&h=108&c=7&qlt=90&bgcl=bae0ac&r=0&o=6&pid=13.1', online: false },
  { name: 'Cynthia Lopez', img: 'https://i.pravatar.cc/36?img=5', online: true },
  { name: 'Rodmark Buctuan', img: 'https://th.bing.com/th/id/OIP.4C1aL0h1llcHnK9AC9TdCQAAAA?w=99&h=108&c=7&qlt=90&bgcl=8a1594&r=0&o=6&pid=13.1', online: true },
  { name: 'Daryl Sumabal', img: 'https://th.bing.com/th/id/OIP.t5EkLwrNiNaoJ5ah0WswOAAAAA?w=108&h=108&c=1&bgcl=0b685d&r=0&o=7&pid=ImgRC&rm=3', online: false },
  { name: 'Changu Lopez', img: 'https://th.bing.com/th/id/OIP.7NaU0fj9xkJxyNMDuIqrZgHaHa?w=134&h=108&c=7&qlt=90&bgcl=8de963&r=0&o=6&pid=13.1', online: true },
]

const FbSideBarRight = () => {
  return (
    <div className=" h-screen sticky top-0 overflow-y-auto pt-4 pb-6 px-2 bg-white hidden lg:flex flex-col gap-2">
      {/* Sponsored */}
      <p className="px-2 text-[17px] font-semibold text-gray-700 mb-1">Sponsored</p>

      <div className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
        <img
          src={spotted}
          alt="Spotted Pig"
          className="w-[120px] h-[90px] rounded-lg object-cover flex-shrink-0"
          />
        <div>
          <p className="text-[13px] font-semibold text-gray-900 leading-tight">Spotted Pig</p>
          <p className="text-[12px] text-gray-500 mt-1 leading-snug">
            Experience the trendy coffee spot in Esquire Financing being called the next big thing.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-300 my-2" />

      {/* Birthdays */}
      <p className="px-2 text-[17px] font-semibold text-gray-700 mb-1">Birthdays</p>
      <div className="flex items-center gap-3 px-2 py-1">
        <span className="text-2xl">🎂</span>
        <p className="text-[13px] text-gray-800">
          <span className="font-semibold">Jessica, Erica</span> and{' '}
          <span className="font-semibold">2 others</span> have birthdays today
        </p>
      </div>

      <div className="border-t border-gray-300 my-2" />

      {/* Contacts */}
      <div className="flex items-center justify-between px-2 mb-1">
        <p className="text-[17px] font-semibold text-gray-700">Contacts</p>
        <div className="flex gap-1">
          {/* Search icon */}
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          {/* More icon */}
          <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {CONTACTS.map((contact) => (
        <button
          key={contact.name}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
        >
          <div className="relative flex-shrink-0">
            <img
              src={contact.img}
              alt={contact.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            {contact.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <span className="text-[15px] font-medium text-gray-900">{contact.name}</span>
        </button>
      ))}
      
    </div>
  )
}

export default FbSideBarRight