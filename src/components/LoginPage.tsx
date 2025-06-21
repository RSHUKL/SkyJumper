import React from 'react';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyan-400">Welcome Back!</h1>
          <p className="text-gray-400 mt-2">Log in to continue your adventure with SkyJumper.</p>
        </div>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>
          <div className="flex items-center justify-between">
            <a href="#" className="text-sm text-cyan-400 hover:underline">
              Forgot Password?
            </a>
          </div>
          <div>
            <button
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
              type="submit"
            >
              Log In
            </button>
          </div>
        </form>
        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-cyan-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 