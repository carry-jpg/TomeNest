import React, { useEffect, useMemo, useState } from "react";
import {
  Library, Plus, FolderPlus, Upload, CreditCard,
  Users, Barcode, LayoutDashboard, FileText, Settings,
  HelpCircle, LogOut, Search, SlidersHorizontal,
  ArrowDown, LayoutGrid, Bookmark, BookOpen,
} from "lucide-react";
import { getBooks } from "./api/books";

function NavItem({ icon, label, active = false }) {
  return (
    <div
      className={[
        "relative flex items-center gap-4 px-4 py-2 cursor-pointer transition-colors group",
        active ? "text-libib-cyan" : "text-text-secondary hover:text-text-primary",
      ].join(" ")}
    >
      <span className={active ? "text-libib-cyan" : "text-gray-400 group-hover:text-gray-600"}>
        {icon}
      </span>
      <span className="text-[15px] font-medium tracking-wide">{label}</span>
      {active && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-libib-cyan rounded-r-md" />}
    </div>
  );
}

function BookCard({ book }) {
  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[1/1.5] w-full mb-3 shadow-card group-hover:shadow-card-hover transition-all duration-300 rounded-[2px] overflow-hidden bg-gray-100">
        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-2">
          <div className="relative">
            <Bookmark size={28} className="text-gray-400/80 fill-gray-400/80" strokeWidth={0} />
            <Bookmark size={28} className="text-white absolute top-0.5 left-0" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="pr-2">
        <h3 className="font-bold text-gray-800 text-[15px] leading-tight mb-1 line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-1">{book.author}</p>
        {book.quantity === 0 && <p className="text-xs text-red-500 font-bold mt-1">Out of Stock</p>}
      </div>
    </div>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [books, searchTerm]);

  return (
    <div className="flex min-h-screen bg-white font-sans text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-bg border-r border-gray-100 flex flex-col fixed h-full z-20">
        <div className="h-20 flex items-center px-8 gap-3">
          <BookOpen className="w-8 h-8 text-text-primary" strokeWidth={2} />
          <span className="text-3xl font-light tracking-tight text-text-primary">libib</span>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-4">
          <div className="space-y-1">
            <NavItem icon={<Library size={20} />} label="Library" active />
            <NavItem icon={<Plus size={20} />} label="Add Items" />
            <NavItem icon={<FolderPlus size={20} />} label="Add Collection" />
            <NavItem icon={<Upload size={20} />} label="Publish" />
          </div>

          <div className="space-y-1">
            <NavItem icon={<CreditCard size={20} />} label="Lending" />
            <NavItem icon={<Users size={20} />} label="Managers" />
            <NavItem icon={<Barcode size={20} />} label="Barcodes" />
          </div>

          <div className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboards" />
            <NavItem icon={<FileText size={20} />} label="Reports" />
          </div>
        </nav>

        <div className="p-4 space-y-1 bg-sidebar-bg">
          <NavItem icon={<Settings size={20} />} label="Settings" />
          <NavItem icon={<HelpCircle size={20} />} label="Support" />
          <NavItem icon={<LogOut size={20} />} label="Logout" />
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 px-12 py-8 max-w-[1600px]">
        {/* Top search */}
        <div className="flex justify-between items-start mb-16">
          <div className="flex items-center gap-4 w-full max-w-xl">
            <Search className="text-text-primary w-6 h-6" />
            <input
              type="text"
              placeholder="Start Searching..."
              className="w-full bg-transparent border-none focus:ring-0 text-xl placeholder-gray-400 font-light outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-gray-100 rounded-full pl-5 pr-1 py-1 gap-3">
            <span className="text-sm font-semibold text-gray-700">Count's Library</span>
            <div className="w-9 h-9 bg-gray-800 rounded-full overflow-hidden border-2 border-white">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </div>

        {/* My Books bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center bg-gray-100/80 rounded-lg p-1.5 pr-4">
            <div className="px-3 text-2xl font-bold text-gray-800">My Books</div>
            <span className="bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              {filtered.length}
            </span>
            <div className="ml-2">
              <ArrowDown size={16} className="text-gray-400 rotate-[-90deg]" />
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-600 text-sm font-medium shadow-sm hover:bg-gray-50">
              <LayoutGrid size={16} />
              <span>Cover</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-600 text-sm font-medium shadow-sm hover:bg-gray-50">
              <span>Title</span>
              <ArrowDown size={14} className="text-gray-400" />
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-libib-cyan text-white rounded-md text-sm font-bold shadow-sm hover:bg-libib-hover transition-colors">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* A-Z row */}
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-8 px-1 select-none tracking-widest">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ#ALL".split("").map((ch, idx) => (
            <span
              key={ch}
              className={`cursor-pointer hover:text-libib-cyan transition-colors ${idx === 0 ? "text-libib-cyan" : ""}`}
            >
              {ch}
            </span>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-libib-cyan mb-8">A</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-10 gap-y-14">
          {filtered.map((b) => (
            <BookCard key={b.stock_id} book={b} />
          ))}
        </div>
      </main>
    </div>
  );
}
