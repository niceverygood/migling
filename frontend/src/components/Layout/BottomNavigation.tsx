import React from 'react';
import { NavLink } from 'react-router-dom';

const navigation = [
  {
    name: '채팅',
    href: '/chat',
    emoji: '💬',
  },
  {
    name: 'For You',
    href: '/foryou',
    emoji: '💖',
  },
  {
    name: 'MY',
    href: '/my',
    emoji: '👤',
  },
];

const BottomNavigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-[430px] mx-auto safe-bottom">
      <div className="grid grid-cols-3 h-16">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 transition-colors touch-target ${
                isActive 
                  ? 'text-mingle-rose' 
                  : 'text-gray-500 hover:text-twilight-blue active:text-night-ink'
              }`
            }
          >
            <>
              <span className="text-xl">{item.emoji}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation; 