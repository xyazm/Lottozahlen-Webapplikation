import React from 'react';
import { ReactComponent as RubLogo } from '../../assets/rub-logo.svg';
import { ReactComponent as LogOut} from '../../assets/log-out.svg'; 

export default function Header() {
    return (
      <header className="sticky top-0 left-0 right-0 z-10 w-full  bg-rubBlue">
          <nav className="h-[80px] px-6 py-[20px] flex justify-between items-end">
            <a href="/#" className="flex-shrink-0">
              <RubLogo className="w-[209px]"/>
            </a>
            <ul className="flex space-x-6 font-medium font-heading text-l ml-40">
              <li>
                <a href="/#" className="text-white hover:text-gray-300" aria-current="page">Home</a>
              </li>
              <li>
                <a href="/#" className="text-gray-300 hover:text-white">About</a>
              </li>
              <li>
                <a href="/#" className="text-gray-300 hover:text-white">Contact</a>
              </li>
            </ul>
            <div className="ml-auto">
              <LogOut className="my-1 w-[30px] fill-white"/>
            </div>
          </nav>
      </header>
    );
  }
       