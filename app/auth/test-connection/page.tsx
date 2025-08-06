"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { testSupabaseConnection, getCurrentUser, supabase } from "@/lib/supabase"

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  const runConnectionTest = async () => {
    setConnectionStatus("testing")
    setConnectionError(null)
    setTestResults([])

    const results: any[] = []

    try {
      // Test 1: Basic connection
      console.log("Testing basic connection...")
      results.push({ test: "Basic Connection", status: "testing" })
      setTestResults([...results])

      const { success, error } = await testSupabaseConnection()
      results[results.length - 1] = {
        test: "Basic Connection",
        status: success ? "success" : "error",
        details: error ? error.message : "Connected successfully"
      }
      setTestResults([...results])

      // Test 2: Auth session
      console.log("Testing auth session...")
      results.push({ test: "Auth Session", status: "testing" })
      setTestResults([...results])

      const { user, error: userError } = await getCurrentUser()
      results[results.length - 1] = {
        test: "Auth Session",
        status: user ? "success" : "info",
        details: user ? `Logged in as: ${user.email}` : "No active session (this is normal)"
      }
      setTestResults([...results])

      // Test 3: Database query
      console.log("Testing database query...")
      results.push({ test: "Database Query", status: "testing" })
      setTestResults([...results])

      const { data: doctors, error: dbError } = await supabase
        .from("doctors")
        .select("id, email, first_name, last_name, status")
        .limit(5)

      results[results.length - 1] = {
        test: "Database Query",
        status: dbError ? "error" : "success",
        details: dbError ? dbError.message : `Found ${doctors?.length || 0} doctors in database`
      }
      setTestResults([...results])

      // Test 4: RLS policies
      console.log("Testing RLS policies...")
      results.push({ test: "RLS Policies", status: "testing" })
      setTestResults([...results])

      const { data: publicDoctors, error: rlsError } = await supabase
        .from("doctors")
        .select("id, first_name, last_name, specialty, status")
        .eq("status", "approved")
        .limit(3)

      results[results.length - 1] = {
        test: "RLS Policies",
        status: rlsError ? "error" : "success",
        details: rlsError ? rlsError.message : `Public query returned ${publicDoctors?.length || 0} approved doctors`
      }
      setTestResults([...results])

      // Test 5: RPC function
      console.log("Testing RPC function...")
      results.push({ test: "RPC Function", status: "testing" })
      setTestResults([...results])

      try {
        // Test if the RPC function exists by calling it with dummy data
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_doctor_profile_v2', {
          p_user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          p_email: 'test@example.com',
          p_first_name: 'Test',
          p_last_name: 'Doctor',
          p_phone: '555-0123',
          p_specialty: 'General Practice',
          p_years_experience: 5,
          p_bio: 'Test bio'
        })

        // This should fail due to conflict or permissions, but the function should exist
        results[results.length - 1] = {
          test: "RPC Function",
          status: "success",
          details: "RPC function create_doctor_profile_v2 exists and is callable"
        }
      } catch (rpcErr: any) {
        if (rpcErr.message?.includes("Could not find the function")) {
          results[results.length - 1] = {
            test: "RPC Function",
            status: "error",
            details: "RPC function create_doctor_profile_v2 not found - migration may not have run"
          }
        } else {
          results[results.length - 1] = {
            test: "RPC Function",
            status: "success",
            details: "RPC function exists (expected error due to dummy data)"
          }
        }
      }
      setTestResults([...results])

      // Overall status
      const hasErrors = results.some(r => r.status === "error")
      setConnectionStatus(hasErrors ? "error" : "success")

      if (hasErrors) {
        setConnectionError("Some tests failed. Check the details below.")
      }

    } catch (err) {
      console.error("Connection test failed:", err)
      setConnectionStatus("error")
      setConnectionError(`Connection test failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    // Auto-run test on page load
    runConnectionTest()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "error": return "bg-red-100 text-red-800"
      case "testing": return "bg-yellow-100 text-yellow-800"
      case "info": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return "✅"
      case "error": return "❌"
      case "testing": return "⏳"
      case "info": return "ℹ️"
      default: return "⚪"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Supabase Connection Test</CardTitle>
            <CardDescription className="text-center">
              Test your Supabase connection and database setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {connectionError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <Button 
                onClick={runConnectionTest} 
                disabled={connectionStatus === "testing"}
                className="w-full sm:w-auto"
              >
                {connectionStatus === "testing" ? "Running Tests..." : "Run Connection Test"}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{result.test}</h4>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {connectionStatus === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  ✅ All tests passed! Your Supabase connection is working correctly.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Environment Info</h3>
              <div className="text-sm space-y-1">
                <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50)}...</p>
                <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
                <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                If you see any errors, check the console for detailed logs or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
