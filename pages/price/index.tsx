import React from 'react';
import { Check, Zap } from 'lucide-react';


const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  highlighted = false 
}: { 
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) => (
  <div className={`rounded-2xl p-8 ${
    highlighted 
      ? 'bg-indigo-600 text-white' 
      : 'bg-gray-800 text-gray-100'
  }`}>
    <h3 className="text-2xl font-bold">{name}</h3>
    <p className="mt-4 text-sm text-gray-300">{description}</p>
    <p className="mt-6">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-gray-300">/month</span>
    </p>
    <ul className="mt-8 space-y-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Check className="h-5 w-5 text-indigo-400 mr-3" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`mt-8 w-full rounded-lg py-3 px-6 font-semibold ${
      highlighted 
        ? 'bg-white text-indigo-600 hover:bg-gray-100' 
        : 'bg-indigo-600 text-white hover:bg-indigo-500'
    } transition-colors duration-200`}>
      Get Started
    </button>
  </div>
);

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Includes a 14-day free trial.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
          <PricingTier
            name="Starter"
            price="29"
            description="Perfect for small teams just getting started"
            features={[
              "Up to 5 team members",
              "Basic analytics",
              "24/7 email support",
              "1GB storage",
              "API access"
            ]}
          />

          <PricingTier
            name="Professional"
            price="99"
            description="Everything you need for a growing business"
            features={[
              "Up to 20 team members",
              "Advanced analytics",
              "Priority support",
              "10GB storage",
              "API access",
              "Custom integrations"
            ]}
            highlighted={true}
          />

          <PricingTier
            name="Enterprise"
            price="299"
            description="Advanced features for large organizations"
            features={[
              "Unlimited team members",
              "Enterprise analytics",
              "24/7 phone support",
              "Unlimited storage",
              "API access",
              "Custom integrations",
              "Dedicated account manager"
            ]}
          />
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 px-6 py-3 rounded-full">
            <Zap className="h-5 w-5 text-indigo-400" />
            <span className="text-indigo-200">Special offer: Get 20% off annual plans</span>
          </div>
        </div>
      </div>
    </div>
  );
}