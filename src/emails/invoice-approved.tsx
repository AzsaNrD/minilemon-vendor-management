import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  docNumber: string
  amount: string
  projectUrl: string
}

export function InvoiceApprovedEmail({ vendorName, docNumber, amount, projectUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Invoice {docNumber} disetujui</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>
            Invoice disetujui &mdash; project selesai
          </Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>Halo {vendorName},</Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            Invoice <code>{docNumber}</code> sebesar <strong>{amount}</strong> telah disetujui. Pembayaran akan
            diproses sesuai prosedur Minilemon.
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
            Lihat Project
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

InvoiceApprovedEmail.subject = 'Invoice disetujui — Minilemon'
