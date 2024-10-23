import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Users, FileText, SendHorizontal, BarChart2, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/email-accounts', icon: <Mail size={20} />, label: 'Email Accounts' },
    { to: '/leads', icon: <Users size={20} />, label: 'Lead Lists' },
    { to: '/templates', icon: <FileText size={20} />, label: 'Templates' },
    { to: '/campaigns', icon: <SendHorizontal size={20} />, label: 'Campaigns' },
    { to: '/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Mail className="text-blue-600" />
          Campaign Manager
        </h1>
      </div>
      <nav className="mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;