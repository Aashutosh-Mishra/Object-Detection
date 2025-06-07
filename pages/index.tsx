// pages/index.tsx
import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import Link from 'next/link';
import { ArrowRight, Camera, Menu, Star, Cpu, Users, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { AuthButton } from '../components/AuthButton'; // Import AuthButton

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Close mobile menu on route change or click outside (optional enhancement)
  // useEffect(() => { ... logic to close menu ... }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed w-full bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left Side: Logo and Title */}
            <Link href="/" legacyBehavior>
              <a className="flex items-center space-x-2 cursor-pointer">
                <Camera className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ObjectDetect</span>
              </a>
            </Link>

            {/* Right Side: Nav Links (Desktop) + Auth Button */}
            <div className="flex items-center space-x-6">
              {/* Desktop Nav Links */}
              <div className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">Features</a>
                {/* <a href="#demo" className="text-gray-300 hover:text-blue-400 transition-colors">Demo</a> */}
                <Link href="/detect" className="text-gray-300 hover:text-blue-400 transition-colors">Detect</Link>
                <Link href="/price" className="text-gray-300 hover:text-blue-400 transition-colors">Pricing</Link>
                {/* <a href="#contact" className="text-gray-300 hover:text-blue-400 transition-colors">Contact</a> */}
              </div>

              {/* Auth Button (Visible Desktop & Mobile) */}
              <div className="flex items-center">
                  <AuthButton />
              </div>


              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-gray-300 ml-3" // Add margin for spacing
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Features</a>
                {/* <a href="#demo" className="text-gray-300 hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Demo</a> */}
                <Link href="/detect" className="text-gray-300 hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Detect</Link>
                <Link href="/price" className="text-gray-300 hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                {/* <a href="#contact" className="text-gray-300 hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a> */}
                {/* You could optionally include AuthButton actions here too if needed */}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative z-10 mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Real-Time Object Detection
              </h1>
              <div className="absolute -inset-x-10 sm:-inset-x-20 -top-10 sm:-top-16 -bottom-10 sm:-bottom-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-10 rounded-full"></div>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 mb-8">
              Detect objects in images and video streams with high accuracy using state-of-the-art YOLO models, right in your browser.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/detect" legacyBehavior>
                <a className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200">
                  Start Detecting
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Link>
              {/* <button className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3 text-base font-medium border border-blue-400/30 bg-blue-400/10 text-blue-400 rounded-lg hover:bg-blue-400/20 transform hover:scale-105 transition-all duration-200">
                Watch Demo
              </button> */}
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-800 max-w-3xl mx-auto">
              {/* Placeholder or actual demo image */}
              <img
                src="/homeimage.png" // Make sure this image exists in your public folder
                alt="Object detection example"
                className="w-full object-cover aspect-video" // Maintain aspect ratio
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 bg-gray-800/30 mt-16 sm:mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">Leverage cutting-edge technology for seamless object detection directly in your browser.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Star className="h-8 w-8" />,
                  title: "High Accuracy",
                  description: "Utilizes state-of-the-art YOLO models (v7/v10) for reliable detection.",
                  stats: "Proven Architectures"
                },
                {
                  icon: <Cpu className="h-8 w-8" />,
                  title: "Real-time Processing",
                  description: "Leverages ONNX Runtime Web with WebAssembly for fast, in-browser inference.",
                  stats: "Client-Side Speed"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "User History",
                  description: "Authenticated users can save and review their past detection results.",
                  stats: "Personalized Tracking"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/50 p-6 sm:p-8 group transition-all duration-300 hover:border-blue-500/50 ${
                    hoveredFeature === index ? 'transform scale-105 shadow-xl shadow-blue-500/10' : 'hover:shadow-lg hover:shadow-blue-500/5'
                  }`}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 transition-opacity duration-300 ${hoveredFeature === index ? 'opacity-50' : 'opacity-0'}`}></div>
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 mb-4 transition-transform duration-300 ${
                      hoveredFeature === index ? 'scale-110 rotate-[-5deg]' : ''
                    }`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">{feature.description}</p>
                    <div className="text-sm font-semibold text-blue-400">{feature.stats}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute -inset-x-40 inset-y-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl -z-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Detect?</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Sign up or log in to start detecting objects and saving your results.
              </p>
              <Link href="/detect" legacyBehavior>
                <a className="group inline-flex items-center justify-center px-8 py-3 text-base font-medium bg-white text-gray-900 rounded-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 mt-10">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Footer Col 1 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ObjectDetect</span>
              </div>
              <p className="text-gray-400 text-sm">
                In-browser object detection using ONNX Runtime.
              </p>
            </div>
             {/* Footer Col 2 */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><Link href="/detect" className="hover:text-blue-400 transition-colors">Live Demo</Link></li>
                <li><Link href="/price" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                 <li><Link href="/history" className="hover:text-blue-400 transition-colors">My History</Link></li> {/* Link to history */}
              </ul>
            </div>
             {/* Footer Col 3 */}
            <div>
               <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                 <li><a href="https://onnxruntime.ai/docs/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">ONNX Runtime</a></li>
                <li><a href="https://github.com/microsoft/onnxruntime" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">GitHub Repo</a></li>
                 <li><a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Next.js</a></li>
              </ul>
            </div>
             {/* Footer Col 4 */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://github.com/Aashutosh-mishra-001/Real-Time-Object-Detection-YOLO-WEB-APP" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="GitHub">
                  <Github className="h-5 w-5" />
                </a>
                {/* Add other social links if needed */}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 ObjectDetect | Developed by Aashutosh Mishra</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;