import React from 'react';
import { Mail, AlertCircle } from 'lucide-react';

const VerificationNotice = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Mail className="text-blue-600" size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-lg mb-4">
              <AlertCircle size={24} />
              <p className="text-sm">
                We've sent you an email verification link. Please check your inbox and click the link to verify your account.
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-4">
                If you don't see the email, please check your spam folder. The verification link will expire in 24 hours.
              </p>
              <p>
                You can close this window after verifying your email. Once verified, you'll be able to sign in to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationNotice;