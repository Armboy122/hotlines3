'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Database, Edit, Loader2, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { feederService } from '@/lib/services/feeder.service'
import { jobDetailService } from '@/lib/services/job-detail.service'
import { jobTypeService } from '@/lib/services/job-type.service'
import { operationCenterService } from '@/lib/services/operation-center.service'
import { peaService } from '@/lib/services/pea.service'
import { stationService } from '@/lib/services/station.service'
import { queryKeys, useJobTypes, useOperationCenters, useStations } from '@/hooks/useQueries'

type MasterRecord = Record<string, unknown> & { id: number }
type FormValues = Record<string, string>
type FieldConfig = {
  name: string
  label: string
  placeholder?: string
  type?: 'text' | 'select'
  required?: boolean
  options?: Array<{ value: string; label: string }>
}
type MasterGroupConfig = {
  id: 'job-types' | 'job-details' | 'feeders' | 'stations' | 'peas' | 'operation-centers'
  title: string
  description: string
  queryKey: readonly unknown[]
  list: () => Promise<unknown[]>
  create: (values: FormValues) => Promise<unknown>
  update: (id: string, values: FormValues) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
  fields: (deps: DependencyOptions) => FieldConfig[]
  toInitialValues: (record: MasterRecord) => FormValues
  renderTitle: (record: MasterRecord) => string
  renderDetails: (record: MasterRecord) => string[]
}

type DependencyOptions = {
  jobTypes: Array<{ value: string; label: string }>
  stations: Array<{ value: string; label: string }>
  operationCenters: Array<{ value: string; label: string }>
}

const getCount = (record: MasterRecord) => {
  const count = record._count
  if (typeof count === 'object' && count !== null && 'tasks' in count && typeof count.tasks === 'number') {
    return count.tasks
  }
  return null
}

const groupConfigs: MasterGroupConfig[] = [
  {
    id: 'job-types',
    title: 'ประเภทงาน',
    description: 'หมวดงานหลักสำหรับการบันทึก Daily Report และรายงานสรุป',
    queryKey: queryKeys.jobTypes,
    list: jobTypeService.getAll,
    create: (values) => jobTypeService.create({ name: values.name }),
    update: (id, values) => jobTypeService.update({ id, name: values.name }),
    remove: jobTypeService.delete,
    fields: () => [{ name: 'name', label: 'ชื่อประเภทงาน', placeholder: 'เช่น งานแก้กระแสไฟฟ้าขัดข้อง', required: true }],
    toInitialValues: (record) => ({ name: String(record.name ?? '') }),
    renderTitle: (record) => String(record.name ?? '-'),
    renderDetails: () => [],
  },
  {
    id: 'job-details',
    title: 'รายละเอียดงาน',
    description: 'รายการงานย่อยที่เชื่อมโยงกับประเภทงาน',
    queryKey: queryKeys.jobDetails,
    list: jobDetailService.getAll,
    create: (values) => jobDetailService.create({ name: values.name, jobTypeId: values.jobTypeId || null }),
    update: (id, values) => jobDetailService.update({ id, name: values.name, jobTypeId: values.jobTypeId || null }),
    remove: jobDetailService.delete,
    fields: (deps) => [
      { name: 'name', label: 'ชื่อรายละเอียดงาน', placeholder: 'เช่น เปลี่ยนฟิวส์แรงสูง', required: true },
      { name: 'jobTypeId', label: 'ประเภทงาน', type: 'select', options: deps.jobTypes },
    ],
    toInitialValues: (record) => ({ name: String(record.name ?? ''), jobTypeId: record.jobTypeId ? String(record.jobTypeId) : '' }),
    renderTitle: (record) => String(record.name ?? '-'),
    renderDetails: (record) => [`ประเภทงาน ID ${record.jobTypeId ?? 'ไม่ระบุ'}`],
  },
  {
    id: 'feeders',
    title: 'ฟีดเดอร์',
    description: 'รหัส feeder ที่ผูกกับสถานีและใช้ในงานภาคสนาม',
    queryKey: queryKeys.feeders,
    list: feederService.getAll,
    create: (values) => feederService.create({ code: values.code, stationId: values.stationId }),
    update: (id, values) => feederService.update({ id, code: values.code, stationId: values.stationId }),
    remove: feederService.delete,
    fields: (deps) => [
      { name: 'code', label: 'รหัสฟีดเดอร์', placeholder: 'เช่น F01', required: true },
      { name: 'stationId', label: 'สถานี', type: 'select', options: deps.stations, required: true },
    ],
    toInitialValues: (record) => ({ code: String(record.code ?? ''), stationId: record.stationId ? String(record.stationId) : '' }),
    renderTitle: (record) => String(record.code ?? '-'),
    renderDetails: (record) => {
      const station = record.station as { name?: string; codeName?: string } | undefined
      return [`สถานี ${station?.name ?? record.stationId ?? '-'}`, `งานที่เกี่ยวข้อง ${getCount(record) ?? 0} งาน`]
    },
  },
  {
    id: 'stations',
    title: 'สถานี',
    description: 'สถานีไฟฟ้าที่ผูกกับศูนย์ปฏิบัติการและ feeder',
    queryKey: queryKeys.stations,
    list: stationService.getAll,
    create: (values) => stationService.create({ name: values.name, codeName: values.codeName, operationId: values.operationId }),
    update: (id, values) => stationService.update({ id, name: values.name, codeName: values.codeName, operationId: values.operationId }),
    remove: stationService.delete,
    fields: (deps) => [
      { name: 'name', label: 'ชื่อสถานี', placeholder: 'เช่น สถานีไฟฟ้า...', required: true },
      { name: 'codeName', label: 'รหัสสถานี', placeholder: 'เช่น STA01', required: true },
      { name: 'operationId', label: 'ศูนย์ปฏิบัติการ', type: 'select', options: deps.operationCenters, required: true },
    ],
    toInitialValues: (record) => ({ name: String(record.name ?? ''), codeName: String(record.codeName ?? ''), operationId: record.operationId ? String(record.operationId) : '' }),
    renderTitle: (record) => `${String(record.name ?? '-')} (${String(record.codeName ?? '-')})`,
    renderDetails: (record) => {
      const operationCenter = record.operationCenter as { name?: string } | undefined
      return [`ศูนย์ปฏิบัติการ ${operationCenter?.name ?? record.operationId ?? '-'}`]
    },
  },
  {
    id: 'peas',
    title: 'การไฟฟ้า',
    description: 'หน่วยงาน PEA ตามพื้นที่รับผิดชอบ',
    queryKey: queryKeys.peas,
    list: peaService.getAll,
    create: (values) => peaService.create({ shortname: values.shortname, fullname: values.fullname, operationId: values.operationId }),
    update: (id, values) => peaService.update({ id, shortname: values.shortname, fullname: values.fullname, operationId: values.operationId }),
    remove: peaService.delete,
    fields: (deps) => [
      { name: 'shortname', label: 'ชื่อย่อ', placeholder: 'เช่น กฟอ.xxx', required: true },
      { name: 'fullname', label: 'ชื่อเต็ม', placeholder: 'ชื่อการไฟฟ้าเต็ม', required: true },
      { name: 'operationId', label: 'ศูนย์ปฏิบัติการ', type: 'select', options: deps.operationCenters, required: true },
    ],
    toInitialValues: (record) => ({ shortname: String(record.shortname ?? ''), fullname: String(record.fullname ?? ''), operationId: record.operationId ? String(record.operationId) : '' }),
    renderTitle: (record) => String(record.shortname ?? '-'),
    renderDetails: (record) => {
      const operationCenter = record.operationCenter as { name?: string } | undefined
      return [String(record.fullname ?? '-'), `ศูนย์ปฏิบัติการ ${operationCenter?.name ?? record.operationId ?? '-'}`]
    },
  },
  {
    id: 'operation-centers',
    title: 'ศูนย์ปฏิบัติการ',
    description: 'โครงสร้างพื้นที่หลักสำหรับผูกสถานีและการไฟฟ้า',
    queryKey: queryKeys.operationCenters,
    list: operationCenterService.getAll,
    create: (values) => operationCenterService.create({ name: values.name }),
    update: (id, values) => operationCenterService.update({ id, name: values.name }),
    remove: operationCenterService.delete,
    fields: () => [{ name: 'name', label: 'ชื่อศูนย์ปฏิบัติการ', placeholder: 'เช่น ศูนย์ปฏิบัติการ...', required: true }],
    toInitialValues: (record) => ({ name: String(record.name ?? '') }),
    renderTitle: (record) => String(record.name ?? '-'),
    renderDetails: () => ['ใช้เป็นข้อมูลอ้างอิงให้สถานีและการไฟฟ้า'],
  },
]

const emptyValuesFor = (fields: FieldConfig[]) => Object.fromEntries(fields.map((field) => [field.name, '']))

export default function AdminMasterDataClient() {
  const queryClient = useQueryClient()
  const [activeGroupId, setActiveGroupId] = useState<MasterGroupConfig['id']>('job-types')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null)
  const [formValues, setFormValues] = useState<FormValues>({})

  useEffect(() => {
    const group = new URLSearchParams(window.location.search).get('group')
    if (groupConfigs.some((config) => config.id === group)) {
      setActiveGroupId(group as MasterGroupConfig['id'])
    }
  }, [])

  const jobTypesQuery = useJobTypes()
  const stationsQuery = useStations()
  const operationCentersQuery = useOperationCenters()

  const deps = useMemo<DependencyOptions>(() => ({
    jobTypes: (jobTypesQuery.data ?? []).map((item) => ({ value: String(item.id), label: item.name })),
    stations: (stationsQuery.data ?? []).map((item) => ({ value: String(item.id), label: `${item.name} (${item.codeName})` })),
    operationCenters: (operationCentersQuery.data ?? []).map((item) => ({ value: String(item.id), label: item.name })),
  }), [jobTypesQuery.data, operationCentersQuery.data, stationsQuery.data])

  const activeConfig = groupConfigs.find((group) => group.id === activeGroupId) ?? groupConfigs[0]
  const fields = activeConfig.fields(deps)

  const recordsQuery = useQuery({
    queryKey: activeConfig.queryKey,
    queryFn: activeConfig.list,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (dialogMode === 'edit' && editingRecord) {
        return activeConfig.update(String(editingRecord.id), formValues)
      }
      return activeConfig.create(formValues)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activeConfig.queryKey })
      toast.success('บันทึกสำเร็จ')
      closeDialog()
    },
    onError: (error: Error) => toast.error(`เกิดข้อผิดพลาด: ${error.message}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (record: MasterRecord) => activeConfig.remove(String(record.id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activeConfig.queryKey })
      toast.success('ลบข้อมูลสำเร็จ')
    },
    onError: (error: Error) => toast.error(`เกิดข้อผิดพลาด: ${error.message}`),
  })

  const records = (recordsQuery.data ?? []) as MasterRecord[]

  const openCreateDialog = () => {
    setEditingRecord(null)
    setFormValues(emptyValuesFor(fields))
    setDialogMode('create')
  }

  const openEditDialog = (record: MasterRecord) => {
    setEditingRecord(record)
    setFormValues(activeConfig.toInitialValues(record))
    setDialogMode('edit')
  }

  const closeDialog = () => {
    setDialogMode(null)
    setEditingRecord(null)
    setFormValues({})
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveMutation.mutate()
  }

  const handleDelete = (record: MasterRecord) => {
    const ok = window.confirm(`ยืนยันลบ ${activeConfig.renderTitle(record)} หรือไม่? รายการที่ยังมีข้อมูลใช้งานอยู่จะไม่สามารถลบได้`)
    if (ok) deleteMutation.mutate(record)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-4 pb-28 sm:px-6 sm:py-6 md:pb-10 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Database className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-[28px]">ข้อมูลหลัก</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              จัดการประเภทงาน สถานี ฟีดเดอร์ การไฟฟ้า และศูนย์ปฏิบัติการ
            </p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="min-h-11 shrink-0 rounded-lg bg-blue-700 px-4 text-white hover:bg-blue-800">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          เพิ่ม{activeConfig.title}
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1" aria-label="กลุ่มข้อมูลหลัก">
          {groupConfigs.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroupId(group.id)}
              className={`min-h-11 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${group.id === activeGroupId ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}
            >
              <span className="block font-bold">{group.title}</span>
              <span className={`mt-1 block text-xs leading-5 ${group.id === activeGroupId ? 'text-white/85' : 'text-slate-500'}`}>{group.description}</span>
            </button>
          ))}
        </nav>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{activeConfig.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{activeConfig.description}</p>
            </div>
            <Button variant="outline" onClick={() => recordsQuery.refetch()} className="min-h-11 rounded-lg border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              <RotateCcw className="mr-2 h-4 w-4" />
              โหลดใหม่
            </Button>
          </div>

          {recordsQuery.isLoading && (
            <div className="mt-6 flex min-h-40 items-center justify-center rounded-lg bg-slate-50 text-sm font-medium text-slate-600">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังโหลดข้อมูลหลัก
            </div>
          )}

          {recordsQuery.error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert">
              เกิดข้อผิดพลาด: {recordsQuery.error.message}
            </div>
          )}

          {!recordsQuery.isLoading && !recordsQuery.error && records.length === 0 && (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm leading-6 text-slate-600">
              ยังไม่มีข้อมูล {activeConfig.title} กดปุ่มเพิ่มเพื่อเริ่มต้น
            </div>
          )}

          {!recordsQuery.isLoading && !recordsQuery.error && records.length > 0 && (
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {records.map((record) => (
                <article key={record.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-slate-950">{activeConfig.renderTitle(record)}</h3>
                      <div className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                        {activeConfig.renderDetails(record).map((detail) => <p key={detail}>{detail}</p>)}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button aria-label={`แก้ไข ${activeConfig.renderTitle(record)}`} variant="outline" size="sm" className="h-11 w-11 rounded-lg border-slate-300 p-0 text-slate-700 hover:bg-slate-50" onClick={() => openEditDialog(record)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button aria-label={`ลบ ${activeConfig.renderTitle(record)}`} variant="destructive" size="sm" className="h-11 w-11 rounded-lg p-0" disabled={deleteMutation.isPending} onClick={() => handleDelete(record)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] rounded-xl border-slate-200 bg-white sm:w-full sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'แก้ไข' : 'เพิ่ม'}{activeConfig.title}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <label key={field.name} className="block space-y-2 text-sm font-medium text-slate-700">
                <span>{field.label}{field.required ? ' *' : ''}</span>
                {field.type === 'select' ? (
                  <select
                    className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    value={formValues[field.name] ?? ''}
                    required={field.required}
                    onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  >
                    <option value="">เลือก{field.label}</option>
                    {(field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input
                    className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    value={formValues[field.name] ?? ''}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(event) => setFormValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  />
                )}
              </label>
            ))}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="min-h-11 rounded-lg border-slate-300" onClick={closeDialog}>
                <X className="mr-2 h-4 w-4" />
                ยกเลิก
              </Button>
              <Button type="submit" className="min-h-11 rounded-lg bg-blue-700 hover:bg-blue-800" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                บันทึก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
