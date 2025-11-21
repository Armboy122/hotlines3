import { Elysia, t } from 'elysia'
import { createPresignedUploadUrl, generateUniqueFileName, isValidImageType, uploadToR2, fileToBuffer } from '@/lib/r2'

export const uploadRoutes = new Elysia({ prefix: '/upload' })
    .post('/presigned', async ({ body, set }) => {
        try {
            const { fileName, fileType } = body as { fileName: string; fileType: string }

            if (!fileName || !fileType) {
                set.status = 400
                return { success: false, error: 'fileName and fileType are required' }
            }

            if (!isValidImageType(fileType)) {
                set.status = 400
                return { success: false, error: 'Invalid file type. Only images are allowed (JPG, PNG, WebP, GIF)' }
            }

            const objectKey = generateUniqueFileName(fileName, 'images/')
            const { uploadUrl, fileUrl } = await createPresignedUploadUrl(objectKey, fileType)

            return {
                success: true,
                data: {
                    uploadUrl,
                    fileUrl,
                    fileKey: objectKey
                }
            }
        } catch (error) {
            console.error('Error generating signed URL:', error)
            set.status = 500
            return { success: false, error: 'Failed to generate signed URL' }
        }
    }, {
        body: t.Object({
            fileName: t.String(),
            fileType: t.String()
        })
    })
    .post('/', async ({ body, set }) => {
        try {
            const file = body.file as File

            if (!file) {
                set.status = 400
                return { success: false, error: 'File is required' }
            }

            if (!isValidImageType(file.type)) {
                set.status = 400
                return { success: false, error: 'Invalid file type. Only images are allowed (JPG, PNG, WebP, GIF)' }
            }

            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                set.status = 400
                return { success: false, error: 'File size too large. Max 5MB' }
            }

            const buffer = await fileToBuffer(file)
            const fileName = generateUniqueFileName(file.name, 'images/')
            const fileUrl = await uploadToR2(buffer, fileName, file.type)

            return {
                success: true,
                data: {
                    url: fileUrl,
                    fileName: fileName,
                    originalName: file.name,
                    size: file.size,
                    type: file.type
                }
            }
        } catch (error) {
            console.error('Upload error:', error)
            set.status = 500
            return { success: false, error: 'Failed to upload file' }
        }
    }, {
        body: t.Object({
            file: t.File()
        })
    })
    .delete('/:fileName', async ({ params, set }) => {
        try {
            const { deleteFromR2 } = await import('@/lib/r2')
            await deleteFromR2(params.fileName)
            return { success: true }
        } catch (error) {
            console.error('Delete error:', error)
            set.status = 500
            return { success: false, error: 'Failed to delete file' }
        }
    }, {
        params: t.Object({
            fileName: t.String()
        })
    })
