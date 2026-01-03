
import React from 'react';
import { Mail, Shield, UserPlus, MoreHorizontal } from 'lucide-react';
import { MOCK_USERS } from '../constants';

const TeamView: React.FC = () => {
  // Extending mock users with more info for the view
  const teamMembers = MOCK_USERS.map(user => ({
    ...user,
    role: user.id === '1' ? 'Admin' : 'Member',
    email: `${user.name.toLowerCase().replace(' ', '.')}@synctree.com`,
    status: 'Online'
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-white lg:rounded-3xl border border-gray-100 shadow-inner p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Workspace Members</h2>
            <p className="text-sm text-gray-500">Manage your collaborative team environment.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
            <UserPlus size={18} />
            Invite Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Shield size={14} className="text-blue-500" />
                  <span className="text-xs font-semibold text-gray-500">{member.role}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={14} />
                  {member.email}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{member.status}</span>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamView;
