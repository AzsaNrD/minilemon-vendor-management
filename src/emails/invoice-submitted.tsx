import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  projectName: string
  docNumber: string
  amount: string
  driveLink: string
  adminUrl: string
}

export function InvoiceSubmittedEmail({ vendorName, projectName, docNumber, amount, driveLink, adminUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Invoice baru dari {vendorName}</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>Invoice baru</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            <strong>{vendorName}</strong> telah submit invoice untuk project <strong>{projectName}</strong>.
          </Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            No: <code>{docNumber}</code>
            <br />
            Total: <strong>{amount}</strong>
            <br />
            Deliverable:{' '}
            <a href={driveLink} style={{ color: '#3F8E4F' }}>
              {driveLink}
            </a>
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
            Tinjau Invoice
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

InvoiceSubmittedEmail.subject = 'Invoice baru — Minilemon Dashboard'
