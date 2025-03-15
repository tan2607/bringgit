export const domainUtils = {
    getFirstSubdomain(hostname: string): string | null {
      try {
        const cleanHost = hostname.replace(/^https?:\/\//, '')
        const parts = cleanHost.split('.')
        
        if (parts.length < 3) return null
        
        return parts[0]
      } catch (error) {
        console.error('Domain parsing error:', error)
        return null
      }
    },
  
    canAccessDomain(hostname: string, permissions: string[] = [], accountId?: any): boolean {
      if (!hostname) return false
      
      // Check for superadmin permission or exact localhost match
      if (permissions.includes('superadmin') || /^(?:http:\/\/)?localhost:3000(?:\/|$)/.test(hostname)) return true
      
      // Check for account ID permission if configured
      if (accountId && permissions.includes(accountId)) {
        return true
      }
      
      // Fallback to subdomain check
      const subdomain = this.getFirstSubdomain(hostname)
      if (!subdomain) return false
      
      return permissions.some(permission => 
        subdomain.toLowerCase() === permission.toLowerCase()
      )
    }
  }