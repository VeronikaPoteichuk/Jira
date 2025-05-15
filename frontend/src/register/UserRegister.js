import React, { useState } from "react";

export default function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Tab headers */}
        <div className="relative flex">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-4 text-center font-semibold transition-colors ${
              isLogin ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-4 text-center font-semibold transition-colors ${
              !isLogin ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
          {/* Sliding indicator */}
          <div
            className={`absolute bottom-0 left-0 h-1 bg-indigo-600 transition-transform duration-300 w-1/2 ${
              !isLogin ? "translate-x-full" : ""
            }`}
          />
        </div>

        {/* Form content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <form className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {/* Switch link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
