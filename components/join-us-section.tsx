import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope, Users, Globe, TrendingUp } from "lucide-react"
import Link from "next/link"

export function JoinUsSection() {
  const benefits = [
    {
      icon: Users,
      title: "Expand Your Reach",
      description: "Connect with thousands of patients actively seeking quality healthcare",
    },
    {
      icon: Globe,
      title: "Professional Platform",
      description: "Showcase your expertise with a dedicated profile and blog space",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Practice",
      description: "Increase your patient base with our integrated booking system",
    },
    {
      icon: Stethoscope,
      title: "Join Elite Network",
      description: "Be part of a curated network of top healthcare professionals",
    },
  ]

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Are You a Healthcare Professional?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our growing network of expert doctors and expand your practice. Get your own dedicated space to share
            your expertise and connect with patients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <benefit.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3" asChild>
            <Link href="/contact">Apply to Join Our Network</Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">Application review typically takes 2-3 business days</p>
        </div>
      </div>
    </section>
  )
}
