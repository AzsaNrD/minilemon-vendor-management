import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'VENDOR'
      mustChangePassword: boolean
      vendorId?: string
      vendorStatus?: 'PENDING_PROFILE' | 'PENDING_NDA_SIGN' | 'PENDING_ADMIN_SIGN' | 'ACTIVE' | 'INACTIVE'
    }
  }

  interface User {
    id: string
    role: 'ADMIN' | 'VENDOR'
    mustChangePassword: boolean
    vendorId?: string
    vendorStatus?: 'PENDING_PROFILE' | 'PENDING_NDA_SIGN' | 'PENDING_ADMIN_SIGN' | 'ACTIVE' | 'INACTIVE'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'VENDOR'
    mustChangePassword: boolean
    vendorId?: string
    vendorStatus?: 'PENDING_PROFILE' | 'PENDING_NDA_SIGN' | 'PENDING_ADMIN_SIGN' | 'ACTIVE' | 'INACTIVE'
  }
}
