"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser, getCurrentSession, supabase, testSupabaseConnection } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "success" | "error">("testing")

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const runTests = async () => {
      addLog("Starting comprehensive auth test...")

      // Test Supabase connection first
      addLog("Testing Supabase connection...")
      const connectionTest = await testSupabaseConnection()
      if (connectionTest.success) {
        addLog("✅ Supabase connection successful")
        setConnectionStatus("success")
      } else {
        addLog(`❌ Supabase connection failed: ${connectionTest.error?.message}`)
        setConnectionStatus("error")
      }

      // Check current session
      const { session, error: sessionError } = await getCurrentSession()
      addLog(`Session check - Session: ${session ? "Found" : "None"}, Error: ${sessionError?.message || "None"}`)
      setSession(session)

      // Check current user
      const { user, error: userError } = await getCurrentUser()
      addLog(`User check - User: ${user ? user.email : "None"}, Error: ${userError?.message || "None"}`)
      setUser(user)

      setLoading(false)
      addLog("Auth test complete")
    }

    runTests()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`🔄 Auth event: ${event}, User: ${session?.user?.email || "None"}`)
      setUser(session?.user || null)
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const testSignOut = async () => {
    addLog("Testing sign out...")
    const { error } = await supabase.auth.signOut()
    addLog(`Sign out result - Error: ${error?.message || "None"}`)
  }

  const testSignUp = async () => {
    addLog("Testing sign up with test user...")
    const testEmail = `test-${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: "TestPassword123!",
      options: {
        data: {
          first_name: "Test",
          last_name: "User",
        },
      },
    })
    addLog(`Sign up test - Email: ${testEmail}, Success: ${!!data.user}, Error: ${error?.message || "None"}`)
  }

  const clearLogs = () => {
    setLogs([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running authentication tests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <Alert
              className={
                connectionStatus === "success"
                  ? "border-green-200 bg-green-50"
                  : connectionStatus === "error"
                    ? "border-red-200 bg-red-50"
                    : ""
              }
            >
              {connectionStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
              {connectionStatus === "error" && <XCircle className="h-4 w-4 text-red-600" />}
              {connectionStatus === "testing" && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                <strong>Supabase Connection:</strong> {connectionStatus === "success" && "Connected successfully"}
                {connectionStatus === "error" && "Connection failed - check configuration"}
                {connectionStatus === "testing" && "Testing connection..."}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">User Status:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto h-32">
                  {user
                    ? JSON.stringify(
                        {
                          id: user.id,
                          email: user.email,
                          metadata: user.user_metadata,
                          created_at: user.created_at,
                          email_confirmed_at: user.email_confirmed_at,
                        },
                        null,
                        2,
                      )
                    : "No user"}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Session Status:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto h-32">
                  {session
                    ? JSON.stringify(
                        {
                          access_token: session.access_token ? "Present" : "Missing",
                          refresh_token: session.refresh_token ? "Present" : "Missing",
                          expires_at: session.expires_at,
                          user_id: session.user?.id,
                        },
                        null,
                        2,
                      )
                    : "No session"}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Supabase Configuration:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                Project: doctors-booking
                {"\n"}ID: sjrkguyqndbuuivuuqnf
                {"\n"}URL: https://sjrkguyqndbuuivuuqnf.supabase.co
                {"\n"}Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Present)
              </pre>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={testSignOut} variant="outline">
                Test Sign Out
              </Button>
              <Button onClick={testSignUp} variant="outline">
                Test Sign Up
              </Button>
              <Button onClick={() => (window.location.href = "/auth/login")}>Go to Login</Button>
              <Button onClick={() => (window.location.href = "/auth/register")}>Go to Register</Button>
              <Button onClick={clearLogs} variant="outline">
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {logs.length === 0 && <div>No logs yet...</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
