import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  projectName: string
  docNumber: string
  note: string
  projectUrl: string
}

export function QuotationRevisionRequestedEmail({
  vendorName,
  projectName,
  docNumber,
  note,
  projectUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Revisi diperlukan untuk quotation {docNumber}</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>Permintaan revisi quotation</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>Halo {vendorName},</Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            Tim Minilemon meminta revisi untuk quotation <code>{docNumber}</code> di project{' '}
            <strong>{projectName}</strong>.
          </Text>
          <Text style={{ color: '#5A5347', fontSize: 13, background: '#FBE5E0', padding: 12, borderRadius: 8 }}>
            <strong>Catatan:</strong> {note}
          </Text>
          <Button
            href={projectUrl}
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
            Submit Revisi
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

QuotationRevisionRequestedEmail.subject = 'Permintaan revisi quotation — Minilemon'
