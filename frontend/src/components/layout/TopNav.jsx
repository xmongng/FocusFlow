import React from 'react';

export default function TopNav({ title = "Overview" }) {
  return (
    <header className="hidden md:flex justify-between items-center ml-sidebar-width h-16 px-container-gap w-[calc(100%-240px)] bg-surface docked full-width top-0 z-30 fixed border-b border-border-subtle">
      <div className="font-headline-section text-headline-section text-primary">{title}</div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="pl-10 pr-4 py-2 rounded-full border border-border-subtle bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-64 text-sm" placeholder="Search..." type="text"/>
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-all cursor-pointer relative p-2 rounded-full hover:bg-surface-container-low">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-priority-urgent rounded-full"></span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-all cursor-pointer p-2 rounded-full hover:bg-surface-container-low">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
