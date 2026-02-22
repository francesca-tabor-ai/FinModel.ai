/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { MarketingLayout } from './components/MarketingLayout';

const LandingView = lazy(() => import('./pages/LandingView'));
const PricingView = lazy(() => import('./pages/PricingView'));
const CaseStudiesView = lazy(() => import('./pages/CaseStudiesView'));
const AppDashboard = lazy(() => import('./AppDashboard'));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="animate-spin text-[#111827]" size={32} />
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingLayout><Suspense fallback={<PageFallback />}><LandingView /></Suspense></MarketingLayout>} />
      <Route path="/pricing" element={<MarketingLayout><Suspense fallback={<PageFallback />}><PricingView /></Suspense></MarketingLayout>} />
      <Route path="/case-studies" element={<MarketingLayout><Suspense fallback={<PageFallback />}><CaseStudiesView /></Suspense></MarketingLayout>} />
      <Route path="/app" element={<Suspense fallback={<PageFallback />}><AppDashboard /></Suspense>} />
    </Routes>
  );
}
