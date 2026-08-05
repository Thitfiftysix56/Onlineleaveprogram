import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { pool } from '../config/database.js'

export const profileImagesDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../uploads/profile-images',
)

const profileSelect = `
  SELECT u.user_id, u.employee_id, u.username, u.role_id, u.status,
         u.last_login_at, u.password_changed_at,
         e.employee_code, e.first_name, e.last_name, e.email, e.phone,
         e.profile_image_url, e.department_id, d.department_name,
         e.position_id, p.position_name, r.role_name
  FROM users u
  JOIN employees e ON e.employee_id = u.employee_id
  JOIN roles r ON r.role_id = u.role_id
  JOIN departments d ON d.department_id = e.department_id
  JOIN positions p ON p.position_id = e.position_id`

function profileData(row) {
  return {
    userId: row.user_id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    username: row.username,
    fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    email: row.email,
    phone: row.phone || '',
    profileImageUrl: row.profile_image_url || null,
    roleId: row.role_id,
    roleName: row.role_name,
    departmentId: row.department_id,
    department: row.department_name,
    positionId: row.position_id,
    position: row.position_name,
    status: row.status,
    lastLoginAt: row.last_login_at,
    passwordChangedAt: row.password_changed_at,
  }
}

async function profileByUserId(userId) {
  const [rows] = await pool.execute(
    `${profileSelect} WHERE u.user_id = ? LIMIT 1`,
    [userId],
  )
  return rows[0] || null
}

function imageExtension(file) {
  const bytes = file?.buffer
  if (!bytes?.length) return null

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return file.mimetype === 'image/jpeg' ? 'jpg' : null
  }
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return file.mimetype === 'image/png' ? 'png' : null
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return file.mimetype === 'image/webp' ? 'webp' : null
  }

  return null
}

async function removeStoredImage(imageUrl) {
  if (!String(imageUrl || '').startsWith('/api/profile-images/')) return

  const filename = path.basename(imageUrl)
  try {
    await unlink(path.join(profileImagesDirectory, filename))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

export async function getProfile(request, response) {
  try {
    const row = await profileByUserId(request.user.userId)
    if (!row) {
      return response.status(404).json({ status: 'error', message: 'Profile was not found.' })
    }

    return response.json({ status: 'ok', profile: profileData(row) })
  } catch (error) {
    console.error('Get profile error:', error)
    return response.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export async function updateProfile(request, response) {
  let newImageUrl = null

  try {
    const current = await profileByUserId(request.user.userId)
    if (!current) {
      return response.status(404).json({ status: 'error', message: 'Profile was not found.' })
    }

    const fullName = String(request.body.fullName || '').trim().replace(/\s+/g, ' ')
    const nameParts = fullName.split(' ')
    const firstName = nameParts.shift() || ''
    const lastName = nameParts.join(' ')
    const email = String(request.body.email || '').trim().toLowerCase()
    const phone = String(request.body.phone || '').trim()

    if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
      return response.status(400).json({
        status: 'error',
        message: 'Full name must include first and last name, each not exceeding 100 characters.',
      })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) {
      return response.status(400).json({ status: 'error', message: 'A valid email is required.' })
    }
    if (phone.length > 20) {
      return response.status(400).json({ status: 'error', message: 'Phone number must not exceed 20 characters.' })
    }

    const [duplicates] = await pool.execute(
      'SELECT employee_id FROM employees WHERE email = ? AND employee_id <> ? LIMIT 1',
      [email, current.employee_id],
    )
    if (duplicates.length) {
      return response.status(409).json({ status: 'error', message: 'Email is already in use.' })
    }

    const removeProfileImage = ['true', '1'].includes(
      String(request.body.removeProfileImage || '').toLowerCase(),
    )
    let profileImageUrl = removeProfileImage ? null : current.profile_image_url

    if (request.file) {
      const extension = imageExtension(request.file)
      if (!extension) {
        return response.status(400).json({
          status: 'error',
          message: 'Profile image content does not match JPEG, PNG or WebP format.',
        })
      }

      await mkdir(profileImagesDirectory, { recursive: true })
      const filename = `${request.user.userId}-${randomUUID()}.${extension}`
      newImageUrl = `/api/profile-images/${filename}`
      await writeFile(path.join(profileImagesDirectory, filename), request.file.buffer, { flag: 'wx' })
      profileImageUrl = newImageUrl
    }

    await pool.execute(
      `UPDATE employees
       SET first_name = ?, last_name = ?, email = ?, phone = ?, profile_image_url = ?
       WHERE employee_id = ?`,
      [firstName, lastName, email, phone || null, profileImageUrl, current.employee_id],
    )

    if (
      current.profile_image_url &&
      current.profile_image_url !== profileImageUrl
    ) {
      await removeStoredImage(current.profile_image_url).catch((error) => {
        console.error('Remove previous profile image error:', error)
      })
    }

    const updated = await profileByUserId(request.user.userId)
    return response.json({
      status: 'ok',
      message: 'Profile updated successfully.',
      profile: profileData(updated),
    })
  } catch (error) {
    if (newImageUrl) await removeStoredImage(newImageUrl).catch(() => {})
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({ status: 'error', message: 'Email is already in use.' })
    }
    console.error('Update profile error:', error)
    return response.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}
