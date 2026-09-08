import { Router } from 'express'
import multer from 'multer'
import { requireAdmin } from '../middleware/requireAdmin.js'
import {
  listCategoryImages,
  getCategoryImage,
  upsertCategoryImage,
  updateCategoryImage,
  deleteCategoryImage,
  uploadCategoryImage,
} from '../controllers/categoryImages.controller.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are accepted'))
    }
    cb(null, true)
  },
})

export const categoryImagesRouter = Router()

// Reads — public, no sign-in required.
categoryImagesRouter.get('/', listCategoryImages)
categoryImagesRouter.get('/:slug', getCategoryImage)

// Writes — require a signed-in Supabase user whose profile role is 'admin'
// (see middleware/requireAdmin.js).
categoryImagesRouter.post('/', requireAdmin, upsertCategoryImage)
categoryImagesRouter.post(
  '/:slug/upload',
  requireAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'hover_image', maxCount: 1 },
  ]),
  uploadCategoryImage
)
categoryImagesRouter.put('/:slug', requireAdmin, updateCategoryImage)
categoryImagesRouter.delete('/:slug', requireAdmin, deleteCategoryImage)
