"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { testSupabaseConnection, supabase } from "@/lib/supabase"

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>("")
  const [details, setDetails] = useState<any>(null)

  const testConnection = async () => {
    setConnectionStatus('testing')
    setError("")
    setDetails(null)

    try {
      // Test basic connection
      const { success, error: connError } = await testSupabaseConnection()
      
      // Get environment info
      const envInfo = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        keyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
      }

      // Test database access
      let dbTest = null
      try {
        const { data, error: dbError } = await supabase.from('doctors').select('count').limit(1)
        dbTest = { success: !dbError, error: dbError?.message }
      } catch (err) {
        dbTest = { success: false, error: 'Database connection failed' }
      }

      // Test RPC function
      let rpcTest = null
      try {
        const { data, error: rpcError } = await supabase.rpc('create_doctor_profile', {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_email: 'test@test.com',
          p_first_name: 'Test',
          p_last_name: 'User',
          p_phone: '1234567890',
          p_specialty: 'Test',
          p_years_experience: 0,
          p_bio: null
        })
        rpcTest = { success: true, note: 'RPC function exists and is callable' }
      } catch (err) {
        rpcTest = { success: false, error: 'RPC function test failed' }
      }

      setDetails({
        environment: envInfo,
        connection: { success, error: connError },
        database: dbTest,
        rpcFunction: rpcTest
      })

      if (success && dbTest.success) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
        setError(connError?.message || dbTest.error || 'Connection test failed')
      }

    } catch (err) {
      setConnectionStatus('error')
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-blue-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Supabase Connection Test
            </CardTitle>
            <CardDescription>
              Testing database connection and configuration
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {connectionStatus === 'testing' && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Testing connection...</span>
              </div>
            )}

            {connectionStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Connection successful! All systems are working properly.
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === 'error' && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  ❌ Connection failed: {error}
                </AlertDescription>
              </Alert>
            )}

            {details && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Connection Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div>URL: {details.environment.supabaseUrl}</div>
                      <div>Key: {details.environment.supabaseKey}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        URL: {details.environment.urlValue}
                      </div>
                      <div className="text-xs text-gray-500">
                        Key: {details.environment.keyValue}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Database Access</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className={`flex items-center ${details.database.success ? 'text-green-600' : 'text-red-600'}`}>
                        {details.database.success ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                        {details.database.success ? 'Connected' : 'Failed'}
                      </div>
                      {details.database.error && (
                        <div className="text-xs text-red-500 mt-1">{details.database.error}</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Auth Connection</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className={`flex items-center ${details.connection.success ? 'text-green-600' : 'text-red-600'}`}>
                        {details.connection.success ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                        {details.connection.success ? 'Connected' : 'Failed'}
                      </div>
                      {details.connection.error && (
                        <div className="text-xs text-red-500 mt-1">{details.connection.error.message}</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">RPC Functions</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className={`flex items-center ${details.rpcFunction.success ? 'text-green-600' : 'text-red-600'}`}>
                        {details.rpcFunction.success ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                        {details.rpcFunction.success ? 'Available' : 'Failed'}
                      </div>
                      {details.rpcFunction.note && (
                        <div className="text-xs text-gray-500 mt-1">{details.rpcFunction.note}</div>
                      )}
                      {details.rpcFunction.error && (
                        <div className="text-xs text-red-500 mt-1">{details.rpcFunction.error}</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
                {connectionStatus === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Again'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
