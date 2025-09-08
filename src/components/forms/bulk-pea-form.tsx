'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createMultiplePeas } from '@/lib/actions/pea'
import { Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'

interface PeaFormData {
  id: string
  shortname: string
  fullname: string
}

interface BulkPeaFormProps {
  operationCenter: {
    id: bigint
    name: string
  }
  onSuccess: () => void
  existingPeas?: Array<{ shortname: string }>
}

export function BulkPeaForm({ operationCenter, onSuccess, existingPeas = [] }: BulkPeaFormProps) {
  const [formData, setFormData] = useState<PeaFormData[]>([
    { id: '1', shortname: '', fullname: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addRow = () => {
    const newId = (Math.max(...formData.map(item => parseInt(item.id))) + 1).toString()
    setFormData([...formData, { id: newId, shortname: '', fullname: '' }])
  }

  const removeRow = (id: string) => {
    if (formData.length > 1) {
      setFormData(formData.filter(item => item.id !== id))
    }
  }

  const updateRow = (id: string, field: 'shortname' | 'fullname', value: string) => {
    setFormData(formData.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // ตรวจสอบชื่อซ้ำ
  const getDuplicateErrors = () => {
    const errors: string[] = []
    const existingShortnameSet = new Set(existingPeas.map(p => p.shortname.toLowerCase()))
    const currentShortnameSet = new Set<string>()

    formData.forEach((item, index) => {
      if (item.shortname.trim()) {
        const shortnameLower = item.shortname.toLowerCase()
        
        // เช็คซ้ำกับที่มีอยู่แล้ว
        if (existingShortnameSet.has(shortnameLower)) {
          errors.push(`แถวที่ ${index + 1}: ชื่อย่อ "${item.shortname}" มีอยู่แล้วในระบบ`)
        }
        
        // เช็คซ้ำในฟอร์มเดียวกัน
        if (currentShortnameSet.has(shortnameLower)) {
          errors.push(`แถวที่ ${index + 1}: ชื่อย่อ "${item.shortname}" ซ้ำในฟอร์มนี้`)
        }
        
        currentShortnameSet.add(shortnameLower)
      }
    })

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // ตรวจสอบข้อมูลว่างและซ้ำ
    const emptyRows = formData.filter(item => !item.shortname.trim() || !item.fullname.trim())
    if (emptyRows.length > 0) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const duplicateErrors = getDuplicateErrors()
    if (duplicateErrors.length > 0) {
      setError(duplicateErrors.join('\n'))
      return
    }

    setIsSubmitting(true)

    try {
      const peasData = formData.map(item => ({
        shortname: item.shortname.trim(),
        fullname: item.fullname.trim(),
        operationId: operationCenter.id.toString()
      }))

      const result = await createMultiplePeas(peasData)
      
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const duplicateErrors = getDuplicateErrors()
  const hasErrors = duplicateErrors.length > 0

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          เพิ่มการไฟฟ้าหลายตัว - {operationCenter.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {formData.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-start p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    การไฟฟ้าที่ {index + 1}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`shortname-${item.id}`}>ชื่อย่อ *</Label>
                      <Input
                        id={`shortname-${item.id}`}
                        type="text"
                        value={item.shortname}
                        onChange={(e) => updateRow(item.id, 'shortname', e.target.value)}
                        placeholder="เช่น กฟน."
                        className={duplicateErrors.some(err => err.includes(`แถวที่ ${index + 1}`)) ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fullname-${item.id}`}>ชื่อเต็ม *</Label>
                      <Input
                        id={`fullname-${item.id}`}
                        type="text"
                        value={item.fullname}
                        onChange={(e) => updateRow(item.id, 'fullname', e.target.value)}
                        placeholder="เช่น การไฟฟ้าส่วนภูมิภาคภาคเหนือ"
                      />
                    </div>
                  </div>
                </div>
                {formData.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRow(item.id)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addRow}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              เพิ่มแถว
            </Button>
          </div>

          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <div className="font-medium mb-1">พบข้อผิดพลาด:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {duplicateErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {error && !hasErrors && (
            <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onSuccess}>
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || hasErrors || formData.some(item => !item.shortname.trim() || !item.fullname.trim())}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  กำลังบันทึก...
                </>
              ) : (
                `บันทึก (${formData.length} รายการ)`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
