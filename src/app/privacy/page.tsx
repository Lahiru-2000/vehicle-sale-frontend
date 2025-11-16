'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import { Shield, Eye, Lock, Database, User, Mail, Phone, Calendar } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last updated: December 2024</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
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
                  At DRIVEDEAL ("we," "our," or "us"), we are committed to protecting your privacy and 
                  personal information. This Privacy Policy explains how we collect, use, disclose, and 
                  safeguard your information when you use our website, mobile application, and services.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  By using our Platform, you consent to the data practices described in this Privacy Policy. 
                  If you do not agree with the terms of this Privacy Policy, please do not use our Platform.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center">
                  <Database className="h-6 w-6 mr-3 text-primary" />
                  2. Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">2.1 Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may collect the following types of personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                  <li><strong>Profile Information:</strong> Profile picture, location, preferences</li>
                  <li><strong>Vehicle Information:</strong> Details about vehicles you list or search for</li>
                  <li><strong>Communication Data:</strong> Messages, inquiries, and support requests</li>
                  <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 text-foreground">2.2 Automatically Collected Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We automatically collect certain information when you use our Platform:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                  <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                  <li><strong>Location Data:</strong> General location based on IP address</li>
                  <li><strong>Cookies and Tracking:</strong> Information stored in cookies and similar technologies</li>
                </ul>
              </div>

              {/* How We Use Information */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center">
                  <Eye className="h-6 w-6 mr-3 text-primary" />
                  3. How We Use Your Information
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li>Provide and maintain our Platform services</li>
                  <li>Process transactions and manage your account</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Improve our Platform and develop new features</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Comply with legal obligations and enforce our terms</li>
                  <li>Protect against fraud and ensure Platform security</li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">4. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share 
                  your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                  <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our Platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                  <li><strong>Safety and Security:</strong> To protect users and prevent fraud</li>
                </ul>
              </div>

              {/* Data Security */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center">
                  <Lock className="h-6 w-6 mr-3 text-primary" />
                  5. Data Security
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <div className="bg-muted/30 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-foreground mb-2">Security Measures Include:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure data storage with access controls</li>
                    <li>Regular security audits and updates</li>
                    <li>Employee training on data protection</li>
                    <li>Incident response procedures</li>
                  </ul>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  While we strive to protect your information, no method of transmission over the internet 
                  or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>

              {/* Cookies and Tracking */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">6. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience on our Platform:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for basic Platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our Platform</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  You can control cookie settings through your browser preferences, but disabling certain 
                  cookies may affect Platform functionality.
                </p>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">7. Your Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Restriction:</strong> Limit how we process your information</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  To exercise these rights, please contact us using the information provided in the Contact section.
                </p>
              </div>

              {/* Data Retention */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">8. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We retain your personal information only as long as necessary to fulfill the purposes 
                  outlined in this Privacy Policy, unless a longer retention period is required by law.
                </p>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                  <li><strong>Account Data:</strong> Retained while your account is active</li>
                  <li><strong>Transaction Data:</strong> Retained for 7 years for legal compliance</li>
                  <li><strong>Marketing Data:</strong> Retained until you opt out</li>
                  <li><strong>Analytics Data:</strong> Retained for 2 years in anonymized form</li>
                </ul>
              </div>

              {/* International Transfers */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">9. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your information in accordance 
                  with applicable data protection laws.
                </p>
              </div>

              {/* Children's Privacy */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">10. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Platform is not intended for children under 16 years of age. We do not knowingly 
                  collect personal information from children under 16. If we become aware that we have 
                  collected such information, we will take steps to delete it promptly.
                </p>
              </div>

              {/* Changes to Privacy Policy */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">11. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </h4>
                      <p className="text-muted-foreground">privacy@drivedeal.lk</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone
                      </h4>
                      <p className="text-muted-foreground">+94 11 234 5678</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Data Protection Officer
                      </h4>
                      <p className="text-muted-foreground">dpo@drivedeal.lk</p>
                    </div>
                  </div>
                </div>
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
              Questions about your privacy?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our privacy team is here to help with any questions or concerns about your data.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Privacy Team
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
