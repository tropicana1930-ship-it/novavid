import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Sparkles, CreditCard } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const paymentLinks = {
    stripe: {
      premium: {
        monthly: 'https://buy.stripe.com/8x2fZg5eMapWgkw3BT2Fa04',
        yearly: 'https://buy.stripe.com/9B68wOdLi41ygkw1tL2Fa06'
      },
      pro: {
        monthly: 'https://buy.stripe.com/28E4gybDadC8fgsfkB2Fa05',
        yearly: 'https://buy.stripe.com/5kQcN4dLibu0d8kfkB2Fa07'
      }
    },
    paypal: {
      premium: {
        monthly: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-1H195645S6441341HNEPV6EQ',
        yearly: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-42N83750VS894501HNEPHWYI'
      },
      pro: {
        monthly: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-55H0605348722794BNEQY46A',
        yearly: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-1VR716857T572330SNEPHS4Q'
      }
    }
  };

  const handleUpgrade = (planName, provider) => {
    if (!user) {
      navigate('/register');
      return;
    }

    const planKey = planName.toLowerCase();
    if (planKey === 'free') {
      navigate('/dashboard');
      return;
    }

    const url = paymentLinks[provider][planKey][billingCycle];
    
    if (url) {
      window.location.href = url;
    } else {
      toast({
        title: "Link Not Found",
        description: "The payment link for this plan is currently unavailable.",
        variant: "destructive"
      });
    }
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      billing: 'Forever',
      features: [
        '8-second videos',
        '1GB cloud storage',
        '10 royalty-free music tracks',
        'Basic filters & effects',
        'Watermark on exports',
        '100 trial credits'
      ],
      color: 'gray',
      popular: false
    },
    {
      name: 'Premium',
      price: billingCycle === 'monthly' ? 19 : 15,
      billing: 'per month',
      yearlySavings: billingCycle === 'yearly' ? 'Saved $48!' : null,
      features: [
        '13-second videos',
        '10GB cloud storage',
        '100 royalty-free music tracks',
        'Upload personal music',
        'Advanced AI features',
        'HD export (1080p)',
        'No watermark',
        'Priority support'
      ],
      color: 'blue',
      popular: true
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 49 : 39,
      billing: 'per month',
      yearlySavings: billingCycle === 'yearly' ? 'Saved $120!' : null,
      features: [
        '18-second videos',
        'Unlimited cloud storage',
        'Unlimited music library',
        'Upload unlimited music',
        'AI assistant automation',
        '4K export',
        'No watermark',
        'Multi-track editing',
        '24/7 priority support',
        'Custom branding'
      ],
      color: 'purple',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <Helmet>
        <title>Pricing - NovaVid</title>
        <meta name="description" content="Choose the perfect plan for your creative needs. Start with a 5-day free trial." />
      </Helmet>

      <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">NovaVid</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Start with a 5-day free trial. Upgrade anytime to unlock more features.
          </p>

          <div className="flex justify-center">
            <div className="bg-gray-900/50 p-1 rounded-lg border border-gray-800 inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly <span className="text-xs bg-green-500 text-black px-1.5 rounded font-bold">-20%</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-gray-900/50 border ${
                plan.popular ? 'border-blue-500' : 'border-gray-800'
              } rounded-2xl p-8 flex flex-col h-full ${plan.popular ? 'scale-105 z-10 bg-gray-900/80' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400">/{plan.billing}</span>
                </div>
                {plan.yearlySavings && (
                  <div className="text-sm text-green-400 mt-2 font-medium">
                    {plan.yearlySavings}
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-400' : 'text-gray-400'} flex-shrink-0 mt-0.5`} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 mt-auto">
                {plan.name === 'Free' ? (
                  <Button
                    onClick={() => handleUpgrade(plan.name, 'stripe')}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    Get Started
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleUpgrade(plan.name, 'stripe')}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-800 hover:bg-gray-700'
                      } text-white flex items-center justify-center gap-2`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay with Stripe
                    </Button>
                    <Button
                      onClick={() => handleUpgrade(plan.name, 'paypal')}
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-white/10 flex items-center justify-center gap-2"
                    >
                      <span className="font-bold italic text-blue-400">Pay</span>
                      <span className="font-bold italic text-cyan-400">Pal</span>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-400" />
              <span>Cloud storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-400" />
              <span>AI-powered tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-400" />
              <span>Edit history</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-400" />
              <span>Regular updates</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;