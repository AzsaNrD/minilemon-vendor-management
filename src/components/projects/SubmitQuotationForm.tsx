'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { submitQuotation } from '@/actions/quotations'
import { calculateQuotationTotals, type QuotationItemInput } from '@/schemas/quotation'
import { formatIDR } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  projectId: string
  parentQuotationId?: string
  defaultItems?: QuotationItemInput[]
  defaultPpnEnabled?: boolean
  defaultDiscount?: number
  defaultNotes?: string
  defaultValidityUntil?: string
}

const blankItem: QuotationItemInput = { description: '', price: 0, qty: 1 }

function addDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function SubmitQuotationForm({
  projectId,
  parentQuotationId,
  defaultItems,
  defaultPpnEnabled,
  defaultDiscount,
  defaultNotes,
  defaultValidityUntil,
}: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [items, setItems] = useState<QuotationItemInput[]>(
    defaultItems && defaultItems.length > 0 ? defaultItems : [{ ...blankItem }],
  )
  const [ppnEnabled, setPpnEnabled] = useState(defaultPpnEnabled ?? false)
  const [ppnPercent, setPpnPercent] = useState(11)
  const [discount, setDiscount] = useState(defaultDiscount ?? 0)
  const [notes, setNotes] = useState(defaultNotes ?? '')
  const [validityUntil, setValidityUntil] = useState(defaultValidityUntil ?? addDays(14))
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  const totals = useMemo(
    () => calculateQuotationTotals({ items, ppnEnabled, ppnPercent, discount }),
    [items, ppnEnabled, ppnPercent, discount],
  )

  function updateItem(idx: number, patch: Partial<QuotationItemInput>) {
    setItems((curr) => curr.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function addItem() {
    setItems((curr) => [...curr, { ...blankItem }])
  }

  function removeItem(idx: number) {
    setItems((curr) => (curr.length === 1 ? curr : curr.filter((_, i) => i !== idx)))
  }

  function handleSubmit() {
    setError(undefined)

    const cleanItems = items
      .map((it) => ({
        description: it.description.trim(),
        price: Number(it.price) || 0,
        qty: Math.max(1, Number(it.qty) || 1),
      }))
      .filter((it) => it.description.length > 0)

    if (cleanItems.length === 0) {
      setError('Minimal 1 item dengan deskripsi diperlukan')
      return
    }

    startTransition(async () => {
      const result = await submitQuotation(projectId, {
        items: cleanItems,
        ppnEnabled,
        ppnPercent: ppnEnabled ? ppnPercent : undefined,
        discount: discount || 0,
        notes: notes.trim() || undefined,
        validityUntil,
        parentQuotationId,
      })
      if (!result.ok) {
        setError(result.error)
        showToast(result.error, 'error')
        return
      }
      showToast('Quotation terkirim', 'success', 'Menunggu review admin.')
      router.push(`/projects/${projectId}?tab=quotation`)
      router.refresh()
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Items</h2>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4" />
                Tambah Item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-12 sm:col-span-6">
                    <Input
                      label={i === 0 ? 'Deskripsi' : undefined}
                      placeholder="cth. Voice over 60 detik"
                      value={it.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      label={i === 0 ? 'Qty' : undefined}
                      min={1}
                      value={it.qty}
                      onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-7 sm:col-span-3">
                    <Input
                      type="number"
                      label={i === 0 ? 'Harga Satuan' : undefined}
                      min={0}
                      step={1000}
                      value={it.price}
                      onChange={(e) => updateItem(i, { price: Number(e.target.value) })}
                    />
                  </div>
                  <div className={cn('col-span-1 flex', i === 0 ? 'items-end pb-1' : 'items-center pt-1')}>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      disabled={items.length === 1}
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-coral-50 hover:text-coral-600 disabled:opacity-30"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Tambahan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Berlaku sampai"
                value={validityUntil}
                onChange={(e) => setValidityUntil(e.target.value)}
                required
              />
              <Input
                type="number"
                label="Diskon"
                min={0}
                step={1000}
                hint="Diskon flat dalam Rupiah (opsional)"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ppnEnabled}
                onChange={(e) => setPpnEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-lemon-400"
              />
              <span>Sertakan PPN</span>
              {ppnEnabled && (
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={ppnPercent}
                  onChange={(e) => setPpnPercent(Number(e.target.value))}
                  className="h-7 w-20 rounded border border-ink-200 px-2 text-sm text-right"
                />
              )}
              {ppnEnabled && <span className="text-ink-500">%</span>}
            </label>
            <Textarea
              label="Catatan (opsional)"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth. Pembayaran 50% di awal, 50% setelah final delivery..."
            />
          </CardBody>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <Card>
          <CardBody className="space-y-2">
            <h3 className="font-display text-base font-semibold mb-2">Ringkasan</h3>
            <Row label="Subtotal" value={formatIDR(totals.subtotal)} />
            {totals.discount > 0 && <Row label="Diskon" value={`-${formatIDR(totals.discount)}`} accent="coral" />}
            {ppnEnabled && <Row label={`PPN (${ppnPercent}%)`} value={formatIDR(totals.ppn)} />}
            <div className="border-t-2 border-ink-900 pt-2 mt-2 flex justify-between font-display text-lg font-bold">
              <span>Grand Total</span>
              <span>{formatIDR(totals.grandTotal)}</span>
            </div>
            {error && <div className="rounded-lg bg-coral-50 px-3 py-2 text-xs text-coral-600">{error}</div>}
            <Button onClick={handleSubmit} loading={isPending} className="w-full mt-3">
              {parentQuotationId ? 'Submit Revisi' : 'Submit Quotation'}
            </Button>
          </CardBody>
        </Card>
      </aside>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: 'coral' }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-ink-600">{label}</span>
      <span className={accent === 'coral' ? 'text-coral-600' : 'text-ink-900'}>{value}</span>
    </div>
  )
}
