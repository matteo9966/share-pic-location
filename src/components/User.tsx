import React from 'react';
import { User as OidcUser } from 'oidc-client-ts';

interface UserProps {
  user: OidcUser | undefined | null;
}

const User: React.FC<UserProps> = ({ user }) => {
  if (!user) {
    return null;
  }

  const { profile } = user;

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* User Avatar */}
      {profile?.picture && (
        <img
          src={profile.picture}
          alt={profile.name || 'User Avatar'}
          className="h-20 w-20 rounded-full object-cover"
        />
      )}

      {/* User Name */}
      {profile?.name && (
        <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
      )}

      {/* User Email */}
      {profile?.email && (
        <p className="text-sm text-gray-600">{profile.email}</p>
      )}

      {/* User Details */}
      <div className="w-full space-y-2 border-t border-gray-200 pt-4">
        {profile?.email_verified !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Email Verified:</span>
            <span
              className={`font-medium ${
                profile.email_verified ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {profile.email_verified ? 'Yes' : 'No'}
            </span>
          </div>
        )}

        {profile?.phone_number && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">{profile.phone_number}</span>
          </div>
        )}

        {profile?.given_name && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">First Name:</span>
            <span className="font-medium text-gray-900">{profile.given_name}</span>
          </div>
        )}

        {profile?.family_name && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Name:</span>
            <span className="font-medium text-gray-900">{profile.family_name}</span>
          </div>
        )}

        {profile?.sub && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">User ID:</span>
            <span className="font-mono text-xs text-gray-600">{profile.sub.slice(0, 8)}...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
