import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { TrendingUp, Zap, Bot, ArrowRight } from 'lucide-react';

export default function LandingView() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative pt-20 pb-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-[linear-gradient(135deg, rgba(99,102,241,0.03)_0%, rgba(168,85,247,0.02)_50%, rgba(249,115,22,0.02)_100%)] pointer-events-none" />
        <div className="relative">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-6"
          >
            For founders, finance teams & operators
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight text-[#111827] leading-[1.1] max-w-4xl"
          >
            Stop drowning in spreadsheets.{' '}
            <span className="signature-text">Start building.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-xl text-gray-600 max-w-2xl leading-relaxed"
          >
            FinModel.ai turns your numbers into clear insights and actionable decisions—so you can focus on running the business, not modeling it.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            <Link
              to="/app"
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3"
            >
              Start free trial
              <ArrowRight size={18} />
            </Link>
            <Link to="/case-studies" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3">
              See case studies
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pain Point */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-gray-50/80 border-y border-gray-100">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-display font-bold tracking-tight text-center mb-4"
        >
          Sound familiar?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-gray-600 text-lg max-w-2xl mx-auto mb-16"
        >
          You're not alone. Growth-stage teams hit the same walls.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Models that break',
              desc: 'One formula change and your whole P&L falls apart. Version control? None. Collaboration? Chaos.',
            },
            {
              title: 'Blind spots everywhere',
              desc: 'Cash, burn, and runway live in different sheets—or someone\'s head. No single source of truth.',
            },
            {
              title: 'Decisions without data',
              desc: '"What if we hire 3 more engineers?" Takes hours to answer. By then, the moment\'s gone.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card p-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
                <span className="text-rose-600 font-display font-bold text-xl">{i + 1}</span>
              </div>
              <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl lg:text-4xl font-display font-bold tracking-tight text-center mb-4"
        >
          We fix that.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-gray-600 text-lg max-w-2xl mx-auto mb-20"
        >
          CFO-level financial intelligence, in your browser. Real-time dashboards, AI agents, and scenario planning.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: TrendingUp,
              title: 'Live dashboard',
              desc: 'Cash on hand, burn, runway, and MRR at a glance. One source of truth, always up to date.',
            },
            {
              icon: Zap,
              title: 'Outcome prediction',
              desc: 'Simulate hires, pricing changes, or funding rounds. See runway and profitability before you commit.',
            },
            {
              icon: Bot,
              title: 'AI agents',
              desc: 'Autonomous analysts surface insights and recommendations. No more digging through spreadsheets.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="glass-card p-8 group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl signature-gradient flex items-center justify-center mb-6">
                <item.icon className="text-white" size={24} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl signature-gradient p-12 md:p-16 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to run the business with confidence?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
            Join founders and finance teams who've replaced spreadsheet chaos with real-time intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/app"
              className="px-8 py-3.5 bg-white text-[#111827] rounded-xl font-semibold hover:bg-gray-100 transition-all"
            >
              Get started free
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-3.5 bg-white/10 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              View pricing
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
