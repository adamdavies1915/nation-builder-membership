import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MembershipResultProps {
  result: {
    found: boolean
    isMember: boolean
    membershipStatus?: string
    membershipExpires?: string
    name?: string
  }
  className?: string
}

export function MembershipResult({ result, className }: MembershipResultProps) {
  if (!result.found) {
    return (
      <div className={cn("mt-4 p-4 border rounded-md bg-amber-50 border-amber-200", className)}>
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          <h3 className="font-medium text-amber-800">No Record Found</h3>
        </div>
        <p className="mt-2 text-sm text-amber-700">
          We couldn't find your email in our system. If you believe this is an error, please contact support.
        </p>
      </div>
    )
  }

  if (!result.isMember) {
    return (
      <div className={cn("mt-4 p-4 border rounded-md bg-gray-50 border-gray-200", className)}>
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-800">Not Currently a Member</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {result.name ? `Hello ${result.name}! ` : ""}
          You are in our system, but you don't have an active membership at this time.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("mt-4 p-4 border rounded-md bg-green-50 border-green-200", className)}>
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <h3 className="font-medium text-green-800">Active Membership</h3>
      </div>
      <div className="mt-2 text-sm text-green-700 space-y-1">
        <p>{result.name ? `Hello ${result.name}! ` : ""}You have an active membership.</p>
        {result.membershipStatus && (
          <p>
            <span className="font-medium">Status:</span> {result.membershipStatus}
          </p>
        )}
        {result.membershipExpires && (
          <p>
            <span className="font-medium">Expires:</span> {result.membershipExpires}
          </p>
        )}
      </div>
    </div>
  )
}
