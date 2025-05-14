"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Check Your Membership</CardTitle>
        <CardDescription>Enter your email address to check your membership status</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Membership"
              )}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && <MembershipResult result={result} className="mt-4" />}
      </CardContent>
      <CardFooter className="text-xs text-gray-500 justify-center">Powered by Bike Easy Nation Builder</CardFooter>
    </Card>
  )
}
