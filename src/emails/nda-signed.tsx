import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  docNumber: string
  dashboardUrl: string
}

export function NDASignedEmail({ vendorName, docNumber, dashboardUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>NDA Anda telah ditandatangani — akun aktif</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>NDA aktif — Akun siap</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>Halo {vendorName},</Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            Selamat! NDA <code>{docNumber}</code> telah ditandatangani oleh kedua pihak. Akun Anda kini aktif dan
            siap menerima project.
          </Text>
          <Button
            href={dashboardUrl}
            style={{
              background: '#1A1814',
              color: '#FFD93D',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Buka Dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

NDASignedEmail.subject = 'NDA Anda telah ditandatangani — Minilemon'
