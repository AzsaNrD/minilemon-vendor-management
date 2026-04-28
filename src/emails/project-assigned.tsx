import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'

interface Props {
  vendorName: string
  projectName: string
  brief: string
  projectUrl: string
}

export function ProjectAssignedEmail({ vendorName, projectName, brief, projectUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Project baru: {projectName}</Preview>
      <Body style={{ background: '#FAFAF5', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Container
          style={{ maxWidth: 600, padding: '32px 24px', background: 'white', margin: '24px auto', borderRadius: 16 }}
        >
          <Heading style={{ fontFamily: 'serif', fontSize: 22, color: '#1A1814' }}>Project baru untuk Anda</Heading>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>Halo {vendorName},</Text>
          <Text style={{ color: '#3F3A30', fontSize: 14 }}>
            Anda mendapat project baru: <strong>{projectName}</strong>. Silakan baca brief dan submit quotation
            Anda.
          </Text>
          <Text style={{ color: '#5A5347', fontSize: 13, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{brief}</Text>
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
            Buka Project
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

ProjectAssignedEmail.subject = 'Project baru — Minilemon'
