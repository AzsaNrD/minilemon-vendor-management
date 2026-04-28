'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { FileUpload } from '@/components/ui/FileUpload'
import { useToast } from '@/components/ui/Toast'
import { vendorProfileSchema, type VendorProfileInput } from '@/schemas/vendor'
import { updateVendorProfile } from '@/actions/profile'

interface Props {
  email: string
  initialData: VendorProfileInput
  ktpPreviewUrl?: string
  nikLocked: boolean
}

export function VendorProfileForm({ email, initialData, ktpPreviewUrl, nikLocked }: Props) {
  const router = useRouter()
  const { update } = useSession()
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [ktp, setKtp] = useState<{ fileKey: string; previewUrl?: string }>({
    fileKey: initialData.ktpFileKey,
    previewUrl: ktpPreviewUrl,
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
  } = useForm<VendorProfileInput>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: initialData,
  })

  const onSubmit = (data: VendorProfileInput) => {
    startTransition(async () => {
      const result = await updateVendorProfile({ ...data, ktpFileKey: ktp.fileKey })
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            setError(k as keyof VendorProfileInput, { message: (v as string[])[0] })
          }
        }
        showToast(result.error, 'error')
        return
      }
      showToast('Profil tersimpan', 'success')
      await update({ vendorStatus: result.data.vendorStatus })
      if (result.data.vendorStatus === 'PENDING_NDA_SIGN') {
        router.replace('/nda')
      } else {
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section title="Informasi Personal">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nama Lengkap" required {...register('fullName')} error={errors.fullName?.message} />
          <Input label="Email" value={email} disabled />
          <Input
            label="NIK"
            placeholder="16 digit"
            required
            disabled={nikLocked}
            hint={nikLocked ? 'NIK terkunci setelah submit pertama' : undefined}
            {...register('nik')}
            error={errors.nik?.message}
          />
          <Input
            label="No. HP / WA"
            placeholder="+62812..."
            required
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Textarea
            label="Alamat"
            required
            rows={3}
            className="sm:col-span-2"
            {...register('address')}
            error={errors.address?.message}
          />
          <Input label="Nama Perusahaan (opsional)" {...register('companyName')} error={errors.companyName?.message} />
          <Input label="NPWP (opsional)" placeholder="00.000.000.0-000.000" {...register('npwp')} error={errors.npwp?.message} />
        </div>
      </Section>

      <Section title="KTP">
        <FileUpload
          kind="KTP"
          required
          hint="JPG/PNG, maksimal 2MB"
          maxSizeLabel="JPG atau PNG, maksimal 2MB"
          value={ktp}
          onChange={(val) => {
            if (!val) {
              setKtp({ fileKey: '', previewUrl: undefined })
              setValue('ktpFileKey', '')
            } else {
              setKtp(val)
              setValue('ktpFileKey', val.fileKey, { shouldValidate: true })
            }
          }}
        />
        {errors.ktpFileKey && <p className="mt-1 text-xs text-coral-600">{errors.ktpFileKey.message}</p>}
      </Section>

      <Section title="Rekening Bank">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nama Bank" placeholder="cth. BCA" required {...register('bankName')} error={errors.bankName?.message} />
          <Input label="Nomor Rekening" required {...register('bankAccountNo')} error={errors.bankAccountNo?.message} />
          <Input
            label="Nama Pemilik Rekening"
            required
            className="sm:col-span-2"
            {...register('bankAccountHolder')}
            error={errors.bankAccountHolder?.message}
          />
        </div>
      </Section>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>
          Simpan & Lanjutkan
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-base font-semibold text-ink-900 border-b border-ink-100 pb-2">{title}</h2>
      {children}
    </section>
  )
}
