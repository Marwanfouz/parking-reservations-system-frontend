'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Car, Shield, ArrowRight, Users, Zap, Star, CheckCircle } from 'lucide-react';
import Head from 'next/head';
import { useGates } from '../hooks/useApi';

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { data: gates, isLoading, error } = useGates();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const hours24 = now.getHours();
      const mod = hours24 % 12;
      const hours12 = mod === 0 ? 12 : mod;
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours12}:${minutes} ${ampm}`);
    };
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-800">Loading gates...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600">Error loading gates: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-gray-800 min-h-screen">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <title>Parking Reservation System</title>
      </Head>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
        <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
              Parking System
            </Link>
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-xs sm:text-sm">{currentTime}</span>
              </div>
              <div className="hidden sm:block h-8 border-l border-gray-200" />
              <Link 
                href="/checkpoint" 
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-full hover:shadow-lg transition-shadow duration-200 flex items-center gap-2 text-sm sm:text-base"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Employee Access</span>
                <span className="xs:hidden">Access</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Animation with Bubbles */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-cyan-600/5"></div>
          
          {/* Floating Bubbles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-200/20 rounded-full animate-float-slow"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/20 rounded-full animate-float-medium"></div>
            <div className="absolute top-60 left-1/4 w-12 h-12 bg-cyan-200/20 rounded-full animate-float-fast"></div>
            <div className="absolute top-80 right-1/3 w-24 h-24 bg-indigo-200/15 rounded-full animate-float-slow"></div>
            <div className="absolute top-32 left-1/2 w-14 h-14 bg-purple-200/15 rounded-full animate-float-medium"></div>
            <div className="absolute top-72 right-10 w-18 h-18 bg-cyan-200/15 rounded-full animate-float-fast"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative z-10">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Smart Parking
              </span>
              <br />
              <span className="text-gray-700">{' '}Reservation System</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 animate-fade-in-up delay-200 px-4">
              Reserve your parking spot in advance, manage your subscriptions, and enjoy seamless parking experiences with our intelligent system.
            </p>
            
            {/* Employee Access */}
            <div className="flex justify-center mb-12 animate-fade-in-up delay-400 px-4">
              <Link
                href="/checkpoint"
                className="group inline-flex items-center bg-gradient-to-r from-gray-700 to-gray-800 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:shadow-lg transition-shadow duration-200 text-base sm:text-lg font-medium"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Employee Checkpoint</span>
                <span className="sm:hidden">Employee Access</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our System?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Experience the future of parking management with our innovative features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg hover-transition border border-white/50">
                <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Reservations</h3>
                <p className="text-gray-600">Reserve your parking spot in advance and never worry about finding a space again.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-cyan-50 hover:shadow-lg hover-transition border border-white/50">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Updates</h3>
                <p className="text-gray-600">Get instant notifications and updates about your parking status.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-cyan-50 to-indigo-50 hover:shadow-lg hover-transition border border-white/50">
                <div className="w-16 h-16 bg-cyan-600 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">User Management</h3>
                <p className="text-gray-600">Comprehensive user management with role-based access control.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gate Selection */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Select a Parking Gate</h2>
              <p className="text-lg sm:text-xl text-gray-600 px-4">Choose your entry point to the parking facility.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gates?.map((gate, index) => (
                <Link
                  key={gate.id}
                  href={`/gate/${gate.id}`}
                  className="group block bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 sm:p-8 hover:border-indigo-400 hover:shadow-lg hover-transition backdrop-blur-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Car className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                      {gate.name}
                    </div>
                    <div className="text-sm sm:text-md text-gray-700 mb-5">
                      Gate {gate.id} • {gate.location}
                    </div>
                    <div className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-full hover:shadow-lg transition-shadow duration-200 font-semibold text-sm sm:text-base">
                      <Car className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Enter Gate
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto px-4">
                Join the growing community of satisfied users
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-5xl font-bold text-white mb-2">10K+</div>
                <div className="text-sm sm:text-base text-indigo-100">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-sm sm:text-base text-indigo-100">Parking Zones</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-5xl font-bold text-white mb-2">99.9%</div>
                <div className="text-sm sm:text-base text-indigo-100">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-5xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm sm:text-base text-indigo-100">Support</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/90 backdrop-blur-md text-white border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Parking System
              </h3>
              <p className="text-sm sm:text-base text-gray-400">Efficient parking management and reservation system.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Quick Access</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link className="hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base" href="/checkpoint">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    Employee Checkpoint
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">System Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  Real-time Updates
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  Secure Access Control
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  Automated Management
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 border-t border-gray-700 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">© 2024 Parking Reservation System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}