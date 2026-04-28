import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  projectName: string
  docNumber: string
  grandTotal: string
  adminUrl: string
}

export function QuotationSubmittedEmail({ vendorName, projectName, docNumber, grandTotal, adminUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Quotation baru dari {vendorName}</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>Quotation baru</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            <strong>{vendorName}</strong> telah mengirim quotation untuk project <strong>{projectName}</strong>.
          </Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            No: <code>{docNumber}</code>
            <br />
            Total: <strong>{grandTotal}</strong>
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
            Tinjau Quotation
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

QuotationSubmittedEmail.subject = 'Quotation baru — Minilemon Dashboard'
