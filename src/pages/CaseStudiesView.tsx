import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const logos = [
  'Acme Inc',
  'TechFlow',
  'ScaleUp Labs',
  'Nexus Finance',
  'Growth Partners',
  'Venture Foundry',
  'Capital Stack',
  'Revenue Labs',
  'DataDrive',
  'CloudScale',
  'FinOps Pro',
  'Launchpad Co',
];

const caseStudies = [
  {
    company: 'TechFlow',
    industry: 'SaaS',
    outcome: '42%',
    outcomeLabel: 'faster decision-making',
    quote: "We used to spend two days rebuilding our model every time we changed assumptions. Now it's real-time.",
    author: 'Sarah Chen',
    role: 'Head of Finance, TechFlow',
    metrics: ['Runway visibility', 'Scenario planning', 'AI insights'],
  },
  {
    company: 'ScaleUp Labs',
    industry: 'Fintech',
    outcome: '6.2 months',
    outcomeLabel: 'runway extended',
    quote: "FinModel.ai helped us optimize burn without cutting product. Our board loved the clarity.",
    author: 'Marcus Webb',
    role: 'CFO, ScaleUp Labs',
    metrics: ['Burn analysis', 'Unit economics', 'Decision log'],
  },
  {
    company: 'Growth Partners',
    industry: 'Consulting',
    outcome: '10+',
    outcomeLabel: 'users collaborating',
    quote: "From one person's spreadsheet to a shared source of truth. Game changer for our leadership team.",
    author: 'Elena Rodriguez',
    role: 'COO, Growth Partners',
    metrics: ['Shared models', 'AI agents', 'Audit trail'],
  },
  {
    company: 'Venture Foundry',
    industry: 'Venture',
    outcome: '3x',
    outcomeLabel: 'faster fundraising prep',
    quote: "Investors want real numbers and scenarios. We had it all in one dashboard.",
    author: 'James Park',
    role: 'Founder, Venture Foundry',
    metrics: ['Pro-forma model', 'Simulations', 'Export reports'],
  },
];

export default function CaseStudiesView() {
  return (
    <div className="py-20 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Logos strip */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-24"
        >
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-12">
            Trusted by forward-thinking teams
          </p>
          <div className="relative">
            <div className="flex overflow-hidden">
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 25,
                    ease: 'linear',
                  },
                }}
                className="flex gap-16 shrink-0 pr-16"
              >
                {[...logos, ...logos].map((name, i) => (
                  <div
                    key={`${name}-${i}`}
                    className="flex items-center justify-center shrink-0 w-40 h-12 text-gray-400 font-display font-bold text-lg border border-gray-200 rounded-xl bg-gray-50/50"
                  >
                    {name}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Case studies grid */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-[#111827] text-center mb-4"
        >
          Real results from real teams
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-20"
        >
          See how finance teams and founders use FinModel.ai to move faster.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {caseStudies.map((study, i) => (
            <motion.article
              key={study.company}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="glass-card p-8 lg:p-10 hover:shadow-xl hover:shadow-indigo-50/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-bold text-indigo-600">{study.industry}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm font-semibold text-gray-700">{study.company}</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-display font-bold signature-text">{study.outcome}</span>
                <span className="text-gray-600 text-lg ml-2">{study.outcomeLabel}</span>
              </div>
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 italic">
                &ldquo;{study.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full signature-gradient flex items-center justify-center text-white font-display font-bold">
                  {study.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-[#111827]">{study.author}</p>
                  <p className="text-sm text-gray-500">{study.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {study.metrics.map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <p className="text-gray-600 mb-6">Ready to join them?</p>
          <Link to="/app" className="btn-primary inline-block">
            Get started free
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
