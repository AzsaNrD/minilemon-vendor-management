import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  docNumber: string
  adminUrl: string
}

export function NDAVendorSignedEmail({ vendorName, docNumber, adminUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{vendorName} telah menandatangani NDA — perlu approval Anda</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>NDA menunggu approval</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            <strong>{vendorName}</strong> telah menandatangani NDA <code>{docNumber}</code>. Mohon review dan
            tandatangani untuk mengaktifkan vendor.
          </Text>
          <Button
            href={adminUrl}
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
            Tinjau NDA
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

NDAVendorSignedEmail.subject = 'NDA menunggu approval admin — Minilemon Dashboard'
