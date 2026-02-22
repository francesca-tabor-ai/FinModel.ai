import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Individual',
    tagline: 'For founders and solo operators',
    price: 29,
    period: '/month',
    description: 'Get real-time visibility into your finances without hiring a finance team.',
    features: [
      'Live financial dashboard',
      'Cash, burn, and runway tracking',
      'Pro-forma income statement',
      'AI financial insights',
      'Basic outcome simulations',
      '1 user',
      'Email support',
    ],
    cta: 'Start free trial',
    highlighted: false,
    scale: 'Up to $500K ARR',
  },
  {
    name: 'Team',
    tagline: 'For finance teams and operators',
    price: 99,
    period: '/month',
    description: 'Collaborate across finance, ops, and leadership with shared models and insights.',
    features: [
      'Everything in Individual',
      'Up to 10 users',
      'Shared models and workspaces',
      'AI agents (CFO, Forecasting)',
      'Advanced scenario planning',
      'Decision log & audit trail',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
    scale: 'Up to $5M ARR',
  },
  {
    name: 'Enterprise',
    tagline: 'For scaling companies',
    price: null,
    period: 'Custom',
    description: 'Custom deployments, dedicated support, and integrations tailored to your stack.',
    features: [
      'Everything in Team',
      'Unlimited users',
      'SSO & advanced security',
      'Custom integrations (QuickBooks, Stripe)',
      'Dedicated success manager',
      'API access',
      'SLA & compliance support',
    ],
    cta: 'Contact sales',
    highlighted: false,
    scale: '$5M+ ARR',
  },
];

export default function PricingView() {
  return (
    <div className="py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-[#111827] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scale as you grow. From solo founders to enterprise teams.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`relative rounded-3xl p-8 lg:p-10 flex flex-col ${
                plan.highlighted
                  ? 'glass-card border-2 border-indigo-200 shadow-xl shadow-indigo-50/50 scale-[1.02] lg:scale-105'
                  : 'glass-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                  Most popular
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-[#111827]">{plan.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{plan.tagline}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold text-[#111827]">
                  {plan.price !== null ? `$${plan.price}` : 'Custom'}
                </span>
                <span className="text-gray-500">{plan.period}</span>
                <p className="text-sm text-indigo-600 font-medium mt-2">{plan.scale}</p>
              </div>
              <p className="text-gray-600 text-sm mb-8">{plan.description}</p>
              <ul className="space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.name === 'Enterprise' ? (
                <a
                  href="mailto:sales@finmodel.ai"
                  className={`mt-8 block text-center py-3.5 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? 'btn-primary bg-[#111827] text-white hover:bg-black'
                      : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </a>
              ) : (
                <Link
                  to="/app"
                  className={`mt-8 block text-center py-3.5 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? 'btn-primary bg-[#111827] text-white hover:bg-black'
                      : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
