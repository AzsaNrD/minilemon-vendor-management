import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  projectName: string
  docNumber: string
  adminUrl: string
}

export function QuotationSignedEmail({ vendorName, projectName, docNumber, adminUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Quotation {docNumber} ditandatangani vendor</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>Quotation final ditandatangani</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            <strong>{vendorName}</strong> telah TTD final quotation <code>{docNumber}</code> untuk project{' '}
            <strong>{projectName}</strong>. SPK draft sudah otomatis dibuat &mdash; lengkapi detail lalu TTD untuk
            memulai pengerjaan.
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
            Buka SPK Draft
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

QuotationSignedEmail.subject = 'Quotation final ditandatangani — Minilemon'
