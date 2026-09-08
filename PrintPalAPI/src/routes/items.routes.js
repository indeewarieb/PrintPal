import { Router } from 'express'
import multer from 'multer'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { listItems, getItem, updateItem, deleteItem, uploadItem } from '../controllers/items.controller.js'

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

export const itemsRouter = Router()

// Reads — public. GET /api/items?category=Mugs%20and%20Cups filters to one category.
itemsRouter.get('/', listItems)
itemsRouter.get('/:slug', getItem)

// Writes — require a signed-in Supabase user whose profile role is 'admin'.
itemsRouter.post(
  '/:slug/upload',
  requireAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'hover_image', maxCount: 1 },
  ]),
  uploadItem
)
itemsRouter.put('/:slug', requireAdmin, updateItem)
itemsRouter.delete('/:slug', requireAdmin, deleteItem)
