"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Bike } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { checkMembership } from "@/app/actions/membership"
import { MembershipResult } from "@/components/membership-result"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type FormValues = z.infer<typeof formSchema>

export function MembershipChecker() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await checkMembership(data.email)

      if (response.error) {
        setError(response.error)
      } else {
        setResult(response)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-bike-blue rounded-full p-2">
            <Bike className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="font-subheading text-xl text-gray-800">
          Check Your Membership
        </CardTitle>
        <CardDescription className="font-body text-gray-600">
          Enter your email address to check your current membership status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body font-medium text-gray-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      {...field}
                      className="font-body h-11 border-gray-300 focus:border-bike-blue focus:ring-bike-blue/20"
                    />
                  </FormControl>
                  <FormMessage className="font-body text-sm" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-11 bg-bike-blue hover:bg-bike-blue-dark text-white font-subheading font-medium tracking-wide transition-colors duration-200" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Membership...
                </>
              ) : (
                "Check My Membership"
              )}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-6 border-red-200 bg-red-50">
            <AlertTitle className="font-subheading font-medium">Error</AlertTitle>
            <AlertDescription className="font-body">{error}</AlertDescription>
          </Alert>
        )}

        {result && <MembershipResult result={result} className="mt-6" />}
      </CardContent>
    </Card>
  )
}