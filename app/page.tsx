import React from "react";

const WelcomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl md:text-6xl">
          Welcome to Our Platform
        </h1>
        <p className="mt-4 text-lg text-gray-600 sm:text-xl">
          We're glad you're here. Discover amazing features and get started on
          your journey with us.
        </p>
        <div className="mt-8">
          <a
            href="/signup"
            className="inline-block px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
