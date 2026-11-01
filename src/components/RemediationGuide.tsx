import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Database, 
  CreditCard, 
  Server,
  Layers
} from 'lucide-react';

export const RemediationGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function: Get user role from custom claims or user doc
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }

    // 1. PUBLIC JOBS: Anyone can read; Only verified employers can create/edit
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if hasRole('employer') 
                    && request.resource.data.salary != null
                    && request.resource.data.title.size() > 3;
      allow update, delete: if hasRole('employer') 
                            && resource.data.employerId == request.auth.uid;
    }

    // 2. APPLICATIONS: Only applicant and the hiring employer can read
    match /applications/{appId} {
      allow create: if isAuthenticated() 
                    && request.resource.data.applicantId == request.auth.uid;
      allow read: if isAuthenticated() 
                  && (resource.data.applicantId == request.auth.uid 
                      || resource.data.employerId == request.auth.uid);
      allow update: if isAuthenticated() 
                    && resource.data.employerId == request.auth.uid; // for status changes
    }

    // 3. RESIDENT VERIFICATION (RA 10173 PRIVACY ENFORCEMENT)
    // Critical: Guests and employers CANNOT read citizenship docs!
    match /resident_verifications/{verificationId} {
      allow create: if isAuthenticated() 
                    && request.resource.data.userId == request.auth.uid;
      allow read: if isAuthenticated() 
                  && (resource.data.userId == request.auth.uid 
                      || hasRole('lgu_verifier') 
                      || hasRole('admin'));
      allow update: if hasRole('lgu_verifier') || hasRole('admin');
    }
  }
}`;

  const expressBackendSnippet = `// server.ts - Production Express Backend for Cauayan City Career Connect
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { z } from 'zod';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// Anti-Spam / Concurrency Burst Protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Masyadong maraming requests. Subukan muli pagkatapos ng 15 minuto.' }
});
app.use('/api/', limiter);

// Strict Philippine Job Application Schema (Zod Validation)
const ApplicationSchema = z.object({
  jobId: z.number().int().positive(),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(09|\\+639)\\d{9}$/, 'Invalid PH phone number format'),
  coverNote: z.string().max(2000).optional(),
});

app.post('/api/applications', async (req, res) => {
  try {
    const validatedData = ApplicationSchema.parse(req.body);
    // Securely write to database with transaction / connection pooler...
    res.status(201).json({ success: true, trackingId: 'APP-CAU-' + Date.now() });
  } catch (error) {
    res.status(400).json({ error: 'Validation failed', details: error.errors });
  }
});

app.listen(3000, () => console.log('Secure server running on port 3000'));`;

  const paymongoPaymentSnippet = `// payment-service.ts - PayMongo / GCash / Maya Integration Guide
import axios from 'axios';

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY; // Keep server-side only!

export async function createEmployerJobCheckout(jobId: string, companyName: string, amountPesos: number) {
  // Amount in Philippine Centavos (e.g., 500 PHP = 50000)
  const amountCentavos = amountPesos * 100;

  const response = await axios.post(
    'https://api.paymongo.com/v1/checkout_sessions',
    {
      data: {
        attributes: {
          billing: { name: companyName },
          payment_method_types: ['gcash', 'paymaya', 'card'],
          line_items: [
            {
              currency: 'PHP',
              amount: amountCentavos,
              name: 'Featured 30-Day Job Post - Cauayan City Career Connect',
              quantity: 1,
            }
          ],
          success_url: \`\${process.env.APP_URL}/employer/success?id=\${jobId}\`,
          cancel_url: \`\${process.env.APP_URL}/employer/cancel\`,
        }
      }
    },
    {
      headers: {
        Authorization: \`Basic \${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}\`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data.attributes.checkout_url;
}`;

  return (
    <div className="space-y-6">
      {/* Remediation Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Code2 className="w-3.5 h-3.5" /> PRODUCTION ARCHITECTURE BLUEPRINT
        </div>
        <h2 className="text-2xl font-black mt-2 tracking-tight">Kaukulang Code Fixes at Deployment Checklist</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Gamitin ang mga snippet na ito para sa deployment bago i-launch ang serbisyo sa LGU ng Cauayan City o sa publiko.
        </p>
      </div>

      {/* Snippet 1: Firestore Security Rules */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">1. Firestore Security Rules (RA 10173 RBAC Protection)</h3>
              <p className="text-xs text-slate-500">I-save bilang: <code>firestore.rules</code></p>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(firestoreRulesSnippet, 'rules')}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'rules' ? 'Na-kopya na!' : 'Kopyahin ang Code'}
          </button>
        </div>
        <div className="bg-slate-950 p-4 overflow-x-auto text-xs font-mono text-emerald-400">
          <pre>{firestoreRulesSnippet}</pre>
        </div>
      </div>

      {/* Snippet 2: Express Server Validation */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">2. Server-side Rate Limiting at Zod Validation (Phone & DoS Protection)</h3>
              <p className="text-xs text-slate-500">I-save sa: <code>server.ts</code></p>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(expressBackendSnippet, 'express')}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            {copiedKey === 'express' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'express' ? 'Na-kopya na!' : 'Kopyahin ang Code'}
          </button>
        </div>
        <div className="bg-slate-950 p-4 overflow-x-auto text-xs font-mono text-cyan-400">
          <pre>{expressBackendSnippet}</pre>
        </div>
      </div>

      {/* Snippet 3: PayMongo / GCash Payments */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">3. PayMongo / GCash / Maya Checkout Integration</h3>
              <p className="text-xs text-slate-500">Para sa may bayad na Employer Job Listings o Featured Posts</p>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(paymongoPaymentSnippet, 'paymongo')}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            {copiedKey === 'paymongo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'paymongo' ? 'Na-kopya na!' : 'Kopyahin ang Code'}
          </button>
        </div>
        <div className="bg-slate-950 p-4 overflow-x-auto text-xs font-mono text-amber-300">
          <pre>{paymongoPaymentSnippet}</pre>
        </div>
      </div>

      {/* Final Go-Live Checklist */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" /> Pre-Launch Go-Live Checklist (Siguraduhing Tsek Lahat Bago Ilabas):
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
          <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
            <span>Naka-configure ang real Authentication (Firebase Auth o JWT) na may password hashing.</span>
          </label>

          <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
            <span>Nai-deploy ang <code>firestore.rules</code> upang maprotektahan ang residency documents (RA 10173).</span>
          </label>

          <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
            <span>Gumagana ang tunay na 3-step application modal na may resume file upload.</span>
          </label>

          <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
            <span>May dedikadong Employer portal para sa pag-post ng bakanteng trabaho.</span>
          </label>

          <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
            <span>Lahat ng legal links (Privacy Policy, Terms of Service) ay may tunay na nababasang teksto.</span>
          </label>

          <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200">
            <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600" />
            <span>Na-verify sa mobile screens (&lt;440px) na hindi nawawala ang login button at touch targets ay &ge;44px.</span>
          </label>
        </div>
      </div>
    </div>
  );
};
