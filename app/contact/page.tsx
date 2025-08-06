import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, Send, Heart } from 'lucide-react'
import { GoBackButton } from "@/components/go-back-button"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GoBackButton fallbackUrl="/" className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 mt-2">Get in touch with our team or join our network of healthcare professionals</p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="border-emerald-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-900">Get in Touch</CardTitle>
                <CardDescription>
                  We're here to help you with any questions or to assist you in joining our network.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">+1 (555) 012-3456</p>
                      <p className="text-sm text-gray-500">Mon-Fri 8AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">info@medconnect.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Address</h3>
                      <p className="text-gray-600">123 Medical Center Drive</p>
                      <p className="text-gray-600">Healthcare City, HC 12345</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 9:00 AM - 2:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-emerald-200 pt-6">
                  <h3 className="font-semibold text-emerald-900 mb-3">For Healthcare Professionals</h3>
                  <p className="text-gray-600 mb-4">
                    Interested in joining our network? We'd love to hear from you!
                  </p>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <a href="/auth/doctor/register" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Join Our Network
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="border-emerald-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-900">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700 font-medium">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700 font-medium">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700 font-medium">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      required
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      required
                      className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[120px]"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="text-sm text-emerald-800">
                      <strong>Note:</strong> This is a demo contact form. In a production environment, this would be connected to a backend service to handle form submissions.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
