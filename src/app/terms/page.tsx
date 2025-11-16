'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import { FileText, Calendar, Shield, AlertTriangle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Terms and Conditions
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Please read these terms carefully before using our platform
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last updated: December 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Version 2.1</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-primary" />
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Welcome to DRIVEDEAL ("we," "our," or "us"). These Terms and Conditions ("Terms") 
                  govern your use of our website, mobile application, and services (collectively, the "Platform"). 
                  By accessing or using our Platform, you agree to be bound by these Terms.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  If you do not agree to these Terms, please do not use our Platform. We reserve the right 
                  to modify these Terms at any time, and your continued use of the Platform constitutes 
                  acceptance of any changes.
                </p>
              </div>

              {/* Acceptance of Terms */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">2. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By creating an account, browsing our Platform, or using our services, you acknowledge 
                  that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Important:</strong> These Terms constitute a legally binding agreement. 
                      Please read them carefully before using our services.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Accounts */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">3. User Accounts</h2>
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.1 Account Creation</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To use certain features of our Platform, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">3.2 Account Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for violation 
                  of these Terms or for any other reason at our sole discretion.
                </p>
              </div>

              {/* Platform Services */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">4. Platform Services</h2>
                <h3 className="text-xl font-semibold mb-3 text-foreground">4.1 Vehicle Listings</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our Platform allows users to list vehicles for sale. By listing a vehicle, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                  <li>You have the legal right to sell the vehicle</li>
                  <li>All information provided is accurate and complete</li>
                  <li>You own the vehicle or have authorization to sell it</li>
                  <li>The vehicle is not stolen or subject to any liens</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">4.2 User Interactions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We facilitate connections between buyers and sellers but are not party to any transactions. 
                  All negotiations, agreements, and transactions are between users directly.
                </p>
              </div>

              {/* Prohibited Uses */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">5. Prohibited Uses</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to use our Platform for any unlawful or prohibited activities, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
                  <li>Posting false, misleading, or fraudulent information</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing on intellectual property rights</li>
                  <li>Harassing, threatening, or abusing other users</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using automated systems to access the Platform</li>
                  <li>Spamming or sending unsolicited communications</li>
                </ul>
              </div>

              {/* Payment Terms */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">6. Payment Terms</h2>
                <h3 className="text-xl font-semibold mb-3 text-foreground">6.1 Subscription Fees</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Premium features may require payment. All fees are non-refundable unless otherwise stated. 
                  We reserve the right to change our pricing with 30 days' notice.
                </p>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">6.2 Transaction Fees</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may charge transaction fees for certain services. These fees will be clearly disclosed 
                  before you complete any transaction.
                </p>
              </div>

              {/* Privacy and Data */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">7. Privacy and Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we 
                  collect, use, and protect your information.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using our Platform, you consent to the collection and use of your information as 
                  described in our Privacy Policy.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To the maximum extent permitted by law, DRIVEDEAL shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including but not limited to 
                  loss of profits, data, or use, arising from your use of the Platform.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our total liability to you for any claims arising from these Terms or your use of the 
                  Platform shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>

              {/* Indemnification */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">9. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify and hold harmless DRIVEDEAL, its officers, directors, employees, 
                  and agents from any claims, damages, losses, or expenses (including attorney's fees) 
                  arising from your use of the Platform or violation of these Terms.
                </p>
              </div>

              {/* Governing Law */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">10. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of Sri Lanka. 
                  Any disputes arising from these Terms or your use of the Platform shall be subject to 
                  the exclusive jurisdiction of the courts of Sri Lanka.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">11. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <p className="text-muted-foreground mb-2">
                    <strong>Email:</strong> legal@drivedeal.lk
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Phone:</strong> +94 11 234 5678
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Address:</strong> 123 Business District, Colombo 03, Sri Lanka
                  </p>
                </div>
              </div>

              {/* Effective Date */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">12. Effective Date</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are effective as of December 1, 2024, and will remain in effect until 
                  modified or terminated in accordance with these Terms.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Questions about these Terms?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our legal team is here to help clarify any questions you may have.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Legal Team
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
