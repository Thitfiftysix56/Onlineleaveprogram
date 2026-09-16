import multer from 'multer'
import path from 'node:path'

const allowed = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png'])

export function isAllowedLeaveAttachment(file) {
  const extension = path.extname(String(file?.originalname || '')).toLowerCase()
  return allowed.has(file?.mimetype) && allowedExtensions.has(extension)
}

export const uploadLeaveAttachments = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: 10 * 1024 * 1024 },
  fileFilter(_request, file, callback) {
    const accepted = isAllowedLeaveAttachment(file)
    callback(accepted ? null : new Error('Only PDF, JPEG and PNG attachments are allowed.'), accepted)
  },
}).array('attachments', 5)
