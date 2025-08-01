import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Star, Crown, Shield } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      icon: Shield,
      price: "$99",
      period: "/month",
      description: "Perfect for getting started with our platform",
      features: [
        "Professional profile listing",
        "Contact information display",
        "Basic practice information",
        "Patient reviews display",
        "Mobile-responsive profile",
        "Basic analytics dashboard",
      ],
      limitations: ["No online booking system", "No article publishing", "Limited customization options"],
      buttonText: "Get Started",
      popular: false,
    },
    {
      name: "Medium",
      icon: Star,
      price: "$199",
      period: "/month",
      description: "Ideal for growing practices",
      features: [
        "Everything in Basic",
        "Online appointment booking",
        "Calendar integration",
        "Patient management tools",
        "Email notifications",
        "Advanced analytics",
        "Priority customer support",
      ],
      limitations: ["No article publishing", "Limited blog features"],
      buttonText: "Choose Medium",
      popular: true,
    },
    {
      name: "Premium",
      icon: Crown,
      price: "$299",
      period: "/month",
      description: "Complete solution for established practices",
      features: [
        "Everything in Medium",
        "Article publishing platform",
        "Blog management system",
        "SEO optimization tools",
        "Social media integration",
        "Custom branding options",
        "Dedicated account manager",
        "Priority listing placement",
      ],
      limitations: [],
      buttonText: "Go Premium",
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your practice. All plans include our core features with different levels of
            functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${
                plan.popular ? "ring-2 ring-blue-500 shadow-xl scale-105" : "hover:shadow-lg"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}>
                <div className="flex justify-center mb-4">
                  <plan.icon className={`h-12 w-12 ${plan.popular ? "text-blue-500" : "text-gray-600"}`} />
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Not included:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start gap-3">
                          <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          </div>
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  asChild
                  className={`w-full ${
                    plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  size="lg"
                >
                  <Link href="/contact">{plan.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Need a custom solution for your organization?</p>
          <Button variant="outline" asChild size="lg">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
