import { CheckCircle, XCircle, AlertCircle, UserCheck } from "lucide-react"
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
      <div className={cn("p-6 border-2 rounded-lg bg-amber-50 border-amber-200", className)}>
        <div className="flex items-start">
          <div className="bg-amber-100 rounded-full p-2 mr-4 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-subheading font-semibold text-amber-800 mb-2">
              No Record Found
            </h3>
            <div className="space-y-3">
              <p className="font-body text-sm text-amber-700 leading-relaxed">
                We couldn't find your email in our system. If you believe this is an error, 
                please email us at <span className="font-medium">info@bikeeasy.org</span>.
              </p>
              <div className="bg-bike-blue/10 rounded-md p-3 border border-bike-blue/20">
                <p className="font-body text-xs text-bike-blue-dark leading-relaxed">
                  <strong>Ready to join us?</strong>{" "}
                  <a 
                    href="https://bikeeasy.nationbuilder.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-bike-blue hover:text-bike-blue-dark underline transition-colors"
                  >
                    Click here
                  </a>{" "}
                  to become a member and help make bicycling easy, safe, and fun for everyone in Greater New Orleans!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!result.isMember) {
    return (
      <div className={cn("p-6 border-2 rounded-lg bg-slate-50 border-slate-200", className)}>
        <div className="flex items-start">
          <div className="bg-slate-100 rounded-full p-2 mr-4 flex-shrink-0">
            <UserCheck className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-subheading font-semibold text-slate-800 mb-2">
              Not Currently a Member
            </h3>
            <p className="font-body text-sm text-slate-700 leading-relaxed mb-3">
              {result.name ? `Hello ${result.name}! ` : ""}
              You are in our system, but you don't have an active membership at this time.
            </p>
            <div className="bg-bike-blue/10 rounded-md p-3 border border-bike-blue/20">
              <p className="font-body text-xs text-bike-blue-dark leading-relaxed">
                <strong>Join us today!</strong>{" "}
                <a 
                  href="https://bikeeasy.nationbuilder.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-bike-blue hover:text-bike-blue-dark underline transition-colors"
                >
                  Click here
                </a>{" "}
                to become a member and support our mission of making bicycling easy, safe, and fun for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-6 border-2 rounded-lg bg-bike-green/10 border-bike-green/30", className)}>
      <div className="flex items-start">
        <div className="bg-bike-green rounded-full p-2 mr-4 flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-subheading font-semibold text-bike-green-dark mb-2">
            Active Membership
          </h3>
          <div className="font-body text-sm text-bike-green-dark space-y-2">
            <p className="leading-relaxed">
              {result.name ? `Hello ${result.name}! ` : ""}
              Thank you for being a Bike Easy member and supporting our mission!
            </p>
            
            <div className="grid grid-cols-1 gap-2 mt-3">
              {result.membershipStatus && (
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="font-medium text-bike-green-dark">{result.membershipStatus}</span>
                </div>
              )}
              {result.membershipExpires && (
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-600">Expires:</span>
                  <span className="font-medium text-bike-green-dark">{result.membershipExpires}</span>
                </div>
              )}
            </div>
            
            <div className="bg-white/70 rounded-md p-3 border border-bike-green/20 mt-4">
              <p className="font-body text-xs text-bike-green-dark leading-relaxed">
                <strong>Stay connected!</strong> Follow us on social media and check your email 
                for updates on rides, events, and advocacy efforts in Greater New Orleans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}