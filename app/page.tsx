import React from "react";
import Link from "next/link";

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <svg
              className="h-8 w-8 text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span className="text-xl font-bold text-white">Hourly Journal</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/sign-in"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 text-sm text-blue-300 bg-blue-900/30 border border-blue-400/20 rounded-full">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Track every hour, transform your life
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Your Life,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Hour by Hour
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-xl text-gray-300 sm:text-2xl max-w-3xl mx-auto leading-relaxed">
            Capture every moment, reflect on your day, and discover patterns in
            your life. The simple way to build mindfulness and track your
            personal growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Your Journal
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
              See How It Works
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-sm text-gray-400">
            <p>
              Join thousands building better habits • Free to start • No ads
            </p>
          </div>
        </div>
      </main>

      {/* Features Preview */}
      <section className="px-6 py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Simple, Powerful, Personal
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Everything you need to build a sustainable journaling practice
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-600/20 border border-blue-400/20 rounded-xl">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Hourly Tracking
              </h3>
              <p className="text-gray-400">
                Capture what matters most in each hour of your day. Build
                awareness of how you spend your time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-purple-600/20 border border-purple-400/20 rounded-xl">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3v5h5M21 21v-5h-5M21 3l-7 7M3 21l7-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Insights & Patterns
              </h3>
              <p className="text-gray-400">
                Discover trends in your daily life with beautiful calendar views
                and monthly summaries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-600/20 border border-green-400/20 rounded-xl">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Private & Secure
              </h3>
              <p className="text-gray-400">
                Your thoughts are yours alone. End-to-end encryption keeps your
                journal completely private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="px-6 py-12 text-center border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to start your journey?
          </h3>
          <p className="text-gray-400 mb-8">
            Join others who are transforming their lives one hour at a time.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
