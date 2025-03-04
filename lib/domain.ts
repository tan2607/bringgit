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
  
    canAccessDomain(hostname: string, permissions: string[] = []): boolean {
      if (!hostname) return false
      if (permissions.includes('superadmin')) return true
      
      const subdomain = this.getFirstSubdomain(hostname)
      if (!subdomain) return false
      
      return permissions.some(permission => 
        subdomain.toLowerCase() === permission.toLowerCase()
      )
    }
  }