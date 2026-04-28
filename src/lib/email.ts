import { Resend } from 'resend'
import { render } from '@react-email/render'
import { InviteVendorEmail } from '@/emails/invite-vendor'
import { PasswordResetEmail } from '@/emails/password-reset'
import { VendorProfileCompletedEmail } from '@/emails/vendor-profile-completed'
import { NDAVendorSignedEmail } from '@/emails/nda-vendor-signed'
import { NDASignedEmail } from '@/emails/nda-signed'
import { ProjectAssignedEmail } from '@/emails/project-assigned'
import { QuotationSubmittedEmail } from '@/emails/quotation-submitted'
import { QuotationRevisionRequestedEmail } from '@/emails/quotation-revision-requested'
import { QuotationAdminSignedEmail } from '@/emails/quotation-admin-signed'
import { QuotationSignedEmail } from '@/emails/quotation-signed'

const TEMPLATES = {
  'invite-vendor': InviteVendorEmail,
  'password-reset': PasswordResetEmail,
  'vendor-profile-completed': VendorProfileCompletedEmail,
  'nda-vendor-signed': NDAVendorSignedEmail,
  'nda-signed': NDASignedEmail,
  'project-assigned': ProjectAssignedEmail,
  'quotation-submitted': QuotationSubmittedEmail,
  'quotation-revision-requested': QuotationRevisionRequestedEmail,
  'quotation-admin-signed': QuotationAdminSignedEmail,
  'quotation-signed': QuotationSignedEmail,
} as const

type TemplateKey = keyof typeof TEMPLATES

type TemplateProps<K extends TemplateKey> = React.ComponentProps<(typeof TEMPLATES)[K]>

let resendClient: Resend | null = null

function getClient(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    resendClient = new Resend(key)
  }
  return resendClient
}

export async function sendEmail<K extends TemplateKey>(opts: {
  to: string | string[]
  template: K
  data: TemplateProps<K>
  subject?: string
}) {
  const Template = TEMPLATES[opts.template] as (props: TemplateProps<K>) => React.ReactElement
  const subject = opts.subject || (TEMPLATES[opts.template] as any).subject || 'Notifikasi Minilemon'
  const html = await render(Template(opts.data))

  if (!process.env.RESEND_API_KEY) {
    console.log('[email:dev] would send', { to: opts.to, subject, template: opts.template })
    return { id: 'dev-mode' }
  }

  return getClient().emails.send({
    from: process.env.EMAIL_FROM || 'Minilemon <noreply@minilemon.id>',
    to: opts.to,
    subject,
    html,
    replyTo: process.env.EMAIL_REPLY_TO,
  })
}
