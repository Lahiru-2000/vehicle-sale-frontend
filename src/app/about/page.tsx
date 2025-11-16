'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import { Car, Users, Shield, Award, Target, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-foreground">
              About DRIVEDEAL
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Your trusted partner in finding the perfect vehicle. We connect buyers and sellers 
              in a safe, transparent, and efficient marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  To revolutionize the vehicle buying and selling experience by providing a 
                  platform that prioritizes transparency, trust, and user satisfaction. We aim 
                  to make vehicle transactions seamless, secure, and accessible to everyone.
                </p>
                <div className="flex items-center space-x-2 text-primary">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">Empowering every journey</span>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">Our Vision</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  To become the leading vehicle marketplace in Sri Lanka, known for our 
                  innovative features, exceptional customer service, and commitment to 
                  building lasting relationships between buyers and sellers.
                </p>
                <div className="flex items-center space-x-2 text-primary">
                  <Heart className="h-5 w-5" />
                  <span className="font-medium">Building connections that matter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Core Values</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Trust & Safety</h3>
                <p className="text-muted-foreground">
                  We prioritize the safety and security of all transactions, ensuring every 
                  user can buy and sell with confidence.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">User-Centric</h3>
                <p className="text-muted-foreground">
                  Our platform is designed with users in mind, offering intuitive features 
                  and exceptional customer support.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in every aspect of our service, from platform 
                  functionality to customer interactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">By the Numbers</h2>
              <p className="text-lg text-muted-foreground">
                Our impact in the vehicle marketplace
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Vehicles Listed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">Active Users</div>
                <div className="text-muted-foreground">Real-time count from database</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">25+</div>
                <div className="text-muted-foreground">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">99%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground">
                The passionate people behind DRIVEDEAL
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">JD</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">John Doe</h3>
                <p className="text-primary mb-2">CEO & Founder</p>
                <p className="text-sm text-muted-foreground">
                  Passionate about revolutionizing the vehicle marketplace with 10+ years 
                  of experience in automotive technology.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">JS</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Jane Smith</h3>
                <p className="text-primary mb-2">CTO</p>
                <p className="text-sm text-muted-foreground">
                  Technology enthusiast leading our development team to create innovative 
                  solutions for better user experience.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">MJ</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Mike Johnson</h3>
                <p className="text-primary mb-2">Head of Operations</p>
                <p className="text-sm text-muted-foreground">
                  Ensuring smooth operations and customer satisfaction with expertise in 
                  business process optimization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Ready to Find Your Perfect Vehicle?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of satisfied customers who have found their dream vehicles 
              through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/search"
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Car className="h-5 w-5 mr-2" />
                Browse Vehicles
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
