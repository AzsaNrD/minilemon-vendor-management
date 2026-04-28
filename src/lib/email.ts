import { Resend } from 'resend'
import { render } from '@react-email/render'
import { InviteVendorEmail } from '@/emails/invite-vendor'
import { PasswordResetEmail } from '@/emails/password-reset'

const TEMPLATES = {
  'invite-vendor': InviteVendorEmail,
  'password-reset': PasswordResetEmail,
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
