import multer from 'multer'

const allowed = new Set(['application/pdf', 'image/jpeg', 'image/png'])

export const uploadLeaveAttachments = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: 10 * 1024 * 1024 },
  fileFilter(_request, file, callback) {
    callback(allowed.has(file.mimetype) ? null : new Error('Only PDF, JPEG and PNG attachments are allowed.'), allowed.has(file.mimetype))
  },
}).array('attachments', 5)
