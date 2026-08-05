import multer from 'multer'

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(_request, file, callback) {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error('Profile image must be a JPEG, PNG or WebP file.')
      error.code = 'INVALID_PROFILE_IMAGE_TYPE'
      return callback(error)
    }

    return callback(null, true)
  },
})

export function uploadProfileImage(request, response, next) {
  profileImageUpload.single('profileImage')(request, response, (error) => {
    if (!error) return next()

    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Profile image must not exceed 2 MB.'
      : error.message || 'Unable to upload profile image.'

    return response.status(400).json({
      status: 'error',
      message,
    })
  })
}
