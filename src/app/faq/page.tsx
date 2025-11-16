'use client'

import React, { useState } from 'react'
import Navigation from '@/components/Navigation'
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react'

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "How do I create an account?",
    answer: "Creating an account is simple! Click on the 'Sign Up' button in the top right corner, fill in your details including name, email, and password, and verify your email address. Once verified, you can start browsing and listing vehicles.",
    category: "Account"
  },
  {
    id: 2,
    question: "How can I list my vehicle for sale?",
    answer: "After logging in, click on 'Add Vehicle' in your dashboard. Fill in all the required details including vehicle information, photos, and contact details. Your listing will be reviewed and approved within 24 hours before going live.",
    category: "Selling"
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and bank transfers. For premium subscriptions, you can pay securely through our integrated payment gateway. All transactions are encrypted and secure.",
    category: "Payment"
  },
  {
    id: 4,
    question: "How do I contact a seller?",
    answer: "Once you find a vehicle you're interested in, click on the 'Contact Seller' button on the vehicle listing. You can call or email the seller directly using the contact information provided in the listing.",
    category: "Buying"
  },
  {
    id: 5,
    question: "Is it safe to buy vehicles through your platform?",
    answer: "Yes! We verify all sellers and their listings. We also provide vehicle history reports and encourage buyers to inspect vehicles before purchase. However, we always recommend meeting in a safe, public location for transactions.",
    category: "Safety"
  },
  {
    id: 6,
    question: "What is the premium subscription?",
    answer: "Our premium subscription gives your vehicle listings priority placement, making them appear at the top of search results. It also includes advanced analytics, unlimited photos, and featured listing badges.",
    category: "Subscription"
  },
  {
    id: 7,
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription anytime from your dashboard. Go to 'My Subscriptions' and click 'Cancel Subscription'. Your premium features will remain active until the end of your current billing period.",
    category: "Subscription"
  },
  {
    id: 8,
    question: "Can I edit my vehicle listing after posting?",
    answer: "Yes, you can edit your vehicle listing anytime. Go to your dashboard, find the vehicle you want to edit, and click the 'Edit' button. Changes will be reviewed and updated within a few hours.",
    category: "Selling"
  },
  {
    id: 9,
    question: "What if I find a fraudulent listing?",
    answer: "If you encounter a suspicious or fraudulent listing, please report it immediately using the 'Report' button on the listing page. Our team will investigate and take appropriate action within 24 hours.",
    category: "Safety"
  },
  {
    id: 10,
    question: "How do I delete my account?",
    answer: "To delete your account, go to your profile settings and click 'Delete Account'. Please note that this action is irreversible and will remove all your listings and data from our platform.",
    category: "Account"
  },
  {
    id: 11,
    question: "Do you offer vehicle inspection services?",
    answer: "While we don't provide inspection services directly, we partner with certified inspection centers. You can find recommended inspection services in your area through our platform, and many offer discounts to our users.",
    category: "Services"
  },
  {
    id: 12,
    question: "What are the fees for using the platform?",
    answer: "Basic listing and browsing is completely free! We only charge for premium features like priority placement and advanced analytics. There are no hidden fees for basic transactions between buyers and sellers.",
    category: "Payment"
  }
]

const categories = ["All", "Account", "Selling", "Buying", "Payment", "Safety", "Subscription", "Services"]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Find answers to common questions about using DRIVEDEAL
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground">
                Found {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">No FAQs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('All')
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-card border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            {faq.category}
                          </span>
                          <h3 className="text-lg font-semibold text-foreground">
                            {faq.question}
                          </h3>
                        </div>
                      </div>
                      {openItems.includes(faq.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    
                    {openItems.includes(faq.id) && (
                      <div className="px-6 pb-4 border-t bg-muted/20">
                        <p className="text-muted-foreground leading-relaxed pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Still have questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="mailto:support@drivedeal.lk"
                className="inline-flex items-center justify-center px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
