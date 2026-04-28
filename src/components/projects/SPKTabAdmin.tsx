'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Download, Pen, Plus, Save, Trash2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { DocStatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { adminSignSPK, updateSPK } from '@/actions/spk'
import { formatDate } from '@/lib/utils'
import type { SPK } from '@prisma/client'

interface Props {
  spk: SPK | null
}

interface SerializedSPK extends Omit<SPK, never> {}

export function SPKTabAdmin({ spk }: Props) {
  const router = useRouter()
  const { showToast } = useToast()

  if (!spk) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-sm text-ink-500 italic">
            SPK akan otomatis dibuat setelah quotation final ditandatangani vendor.
          </p>
        </CardBody>
      </Card>
    )
  }

  const spkId = spk.id
  const editable = spk.status === 'DRAFT' || spk.status === 'PENDING_ADMIN_SIGN'

  const initialScope = ((spk.scopeItems as unknown as string[]) || []).filter((s) => s.trim().length > 0)
  const [workTitle, setWorkTitle] = useState(spk.workTitle ?? '')
  const [scope, setScope] = useState<string[]>(initialScope.length === 0 ? [''] : initialScope)
  const [periodStart, setPeriodStart] = useState(spk.periodStart.toISOString().slice(0, 10))
  const [periodEnd, setPeriodEnd] = useState(spk.periodEnd.toISOString().slice(0, 10))
  const [warranty, setWarranty] = useState(spk.warranty ?? '')
  const [signing, setSigning] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  function addScope() {
    setScope((s) => [...s, ''])
  }

  function removeScope(idx: number) {
    setScope((s) => (s.length === 1 ? s : s.filter((_, i) => i !== idx)))
  }

  function updateScope(idx: number, value: string) {
    setScope((s) => s.map((v, i) => (i === idx ? value : v)))
  }

  function handleSave() {
    const cleanScope = scope.map((s) => s.trim()).filter(Boolean)
    setErrors({})
    startTransition(async () => {
      const result = await updateSPK(spkId, {
        workTitle: workTitle.trim(),
        scopeItems: cleanScope,
        periodStart,
        periodEnd,
        warranty: warranty.trim() || undefined,
      })
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        showToast(result.error, 'error')
        return
      }
      showToast('Detail SPK tersimpan', 'success')
      router.refresh()
    })
  }

  function handleSign() {
    startTransition(async () => {
      const result = await adminSignSPK(spkId, {})
      if (!result.ok) {
        showToast(result.error, 'error')
        setSigning(false)
        return
      }
      showToast('SPK ditandatangani', 'success', 'Vendor diminta TTD final.')
      setSigning(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">SPK</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm">{spk.docNumber}</span>
              <DocStatusBadge status={spk.status} />
            </div>
            {spk.adminSignedAt && (
              <p className="text-xs text-ink-500 mt-2">
                Admin TTD: {formatDate(spk.adminSignedAt, { withTime: true })}
              </p>
            )}
            {spk.vendorSignedAt && (
              <p className="text-xs text-ink-500">
                Vendor TTD: {formatDate(spk.vendorSignedAt, { withTime: true })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(spk.status === 'DRAFT' || spk.status === 'PENDING_ADMIN_SIGN') && (
              <Button onClick={() => setSigning(true)}>
                <Pen className="h-4 w-4" /> Generate &amp; TTD SPK
              </Button>
            )}
            {spk.status === 'PENDING_VENDOR_SIGN' && (
              <p className="text-sm text-ink-500 italic">Menunggu TTD final dari vendor</p>
            )}
            {spk.status === 'SIGNED' && (
              <>
                <span className="inline-flex items-center gap-1.5 text-sm text-leaf-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Aktif
                </span>
                <a href={`/api/documents/spk/${spk.id}/pdf`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </a>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {editable ? (
        <Card>
          <CardBody className="space-y-4">
            <h3 className="font-display text-base font-semibold">Detail SPK</h3>
            <Input
              label="Judul Pekerjaan"
              required
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              placeholder="cth. Voice Over Karakter Utama Episode 1-5"
              error={errors.workTitle?.[0]}
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-ink-800">
                  Lingkup Pekerjaan <span className="text-coral-500">*</span>
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addScope}>
                  <Plus className="h-3.5 w-3.5" /> Tambah
                </Button>
              </div>
              <div className="space-y-2">
                {scope.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-ink-400 w-6 shrink-0">{i + 1}.</span>
                    <input
                      value={s}
                      onChange={(e) => updateScope(i, e.target.value)}
                      placeholder="cth. Penyediaan voice over 60 detik dengan revisi maksimum 2x"
                      className="flex-1 h-9 rounded-lg border border-ink-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-lemon-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeScope(i)}
                      disabled={scope.length === 1}
                      className="rounded p-1.5 text-ink-400 hover:bg-coral-50 hover:text-coral-600 disabled:opacity-30"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.scopeItems?.[0] && <p className="text-xs text-coral-600 mt-1">{errors.scopeItems[0]}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Periode Mulai"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                error={errors.periodStart?.[0]}
              />
              <Input
                type="date"
                label="Periode Selesai"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                error={errors.periodEnd?.[0]}
              />
            </div>
            <Textarea
              label="Garansi (opsional)"
              rows={2}
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="cth. Revisi minor dalam 7 hari setelah delivery"
            />
            <div className="flex justify-end">
              <Button onClick={handleSave} variant="outline" loading={isPending}>
                <Save className="h-4 w-4" /> Simpan Draft
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Modal
        open={signing}
        onClose={() => !isPending && setSigning(false)}
        title="Generate & TTD SPK"
        description="SPK akan ditandatangani admin dengan master signature dan dikirim ke vendor untuk TTD final."
      >
        <div className="space-y-3">
          <div className="rounded-lg bg-ink-50/40 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-ink-600">Doc Number</span>
              <span className="font-mono">{spk.docNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Judul</span>
              <span className="font-medium truncate ml-2">{workTitle || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-600">Lingkup</span>
              <span>{scope.filter((s) => s.trim()).length} item</span>
            </div>
          </div>
          <p className="text-xs text-ink-500">
            Pastikan detail sudah benar. Jika belum disimpan, klik &ldquo;Simpan Draft&rdquo; dulu.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSigning(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSign} loading={isPending}>
              TTD &amp; Kirim ke Vendor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
