import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Calendar, BookOpen, MapPin, Phone, Mail } from 'lucide-react'
import Link from "next/link"
import { GoBackButton } from "@/components/go-back-button"

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started on our platform",
      features: [
        "Basic profile listing",
        "Contact information display",
        "Professional credentials",
        "Basic search visibility",
        "Email support"
      ],
      limitations: [
        "No online booking",
        "No article publishing",
        "Limited profile customization"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Enhanced features for growing practices",
      features: [
        "Everything in Basic",
        "Online appointment booking",
        "Multiple practice locations",
        "Enhanced profile customization",
        "Priority search placement",
        "Phone & email support",
        "Basic analytics"
      ],
      limitations: [
        "Limited to 3 locations",
        "No article publishing"
      ],
      buttonText: "Start Professional",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Premium",
      price: "$59",
      period: "/month",
      description: "Complete solution for established practices",
      features: [
        "Everything in Professional",
        "Unlimited practice locations",
        "Article publishing platform",
        "Advanced analytics & insights",
        "Custom branding options",
        "Priority customer support",
        "Featured listing placement",
        "Patient review management"
      ],
      limitations: [],
      buttonText: "Go Premium",
      buttonVariant: "default" as const,
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <GoBackButton fallbackUrl="/" className="mb-4" />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Network</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the perfect plan to showcase your practice and connect with patients. All plans include our core features to help you grow your practice.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`relative border-2 shadow-xl ${plan.popular ? 'border-emerald-500 scale-105' : 'border-emerald-200'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-emerald-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-gray-300 rounded mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  asChild 
                  variant={plan.buttonVariant}
                  className={`w-full ${plan.buttonVariant === 'default' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                >
                  <Link href="/auth/doctor/register">
                    {plan.buttonText}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-emerald-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-emerald-900">Why Choose MedConnect?</CardTitle>
              <CardDescription>
                Join thousands of healthcare professionals who trust our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Growing Network</h3>
                  <p className="text-gray-600 text-sm">Connect with patients actively seeking healthcare providers in your area</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Booking</h3>
                  <p className="text-gray-600 text-sm">Streamlined appointment scheduling system for you and your patients</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Content Platform</h3>
                  <p className="text-gray-600 text-sm">Share your expertise through our article publishing platform</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Local Visibility</h3>
                  <p className="text-gray-600 text-sm">Appear in local searches and help patients find you easily</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-emerald-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-emerald-900">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I get started?</h3>
                <p className="text-gray-600">Simply click "Get Started Free" to create your account. You can upgrade to a paid plan at any time to unlock additional features.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
                <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h3>
                <p className="text-gray-600">No setup fees! You only pay the monthly or annual subscription fee for your chosen plan.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer customer support?</h3>
                <p className="text-gray-600">Yes! All plans include customer support. Professional and Premium plans receive priority support with faster response times.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-emerald-200 shadow-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Join Our Network?</h2>
              <p className="text-xl mb-8 text-emerald-100">
                Start connecting with patients today and grow your practice with MedConnect
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                  <Link href="/auth/doctor/register">
                    Get Started Free
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                  <Link href="/contact">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Sales
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-emerald-100 mt-4">
                Questions? Email us at <a href="mailto:sales@medconnect.com" className="underline">sales@medconnect.com</a> or call <a href="tel:+1-555-0123" className="underline">+1 (555) 012-3456</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
