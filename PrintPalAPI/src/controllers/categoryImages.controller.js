import { supabase, CATEGORY_IMAGES_TABLE, CATEGORY_IMAGES_BUCKET } from '../supabaseClient.js'
import { slugify } from '../data/categories.js'

function handleSupabaseError(res, error, fallbackStatus = 500) {
  console.error('[supabase]', error.message)
  const status = error.code === '23505' ? 409 : fallbackStatus
  return res.status(status).json({ error: friendlyMessage(error.message) })
}

// PGRST204 ("Could not find the 'x' column ... in the schema cache") means
// PostgREST's cached view of the table is stale, not that anything is
// actually wrong with the request. It's a genuinely confusing message on
// its own, so turn it into something actionable.
function friendlyMessage(message) {
  if (/schema cache/i.test(message)) {
    return (
      `${message} — this means Supabase's API layer hasn't picked up a recent database ` +
      'change yet. Re-run sql/schema.sql in the Supabase SQL editor (it ends with a schema ' +
      "reload command), and if it still happens, restart the project from Supabase's " +
      'dashboard (Project Settings → General → Restart project). See visions-api/README.md ' +
      '→ Troubleshooting for the full checklist.'
    )
  }
  if (/bucket not found/i.test(message)) {
    return (
      `${message} — the "category-images" Storage bucket doesn't exist in your Supabase ` +
      'project yet. Run the full sql/schema.sql file in the Supabase SQL editor (it creates ' +
      "the bucket); check Storage in Supabase's dashboard afterwards to confirm " +
      '"category-images" is listed.'
    )
  }
  return message
}

async function uploadFileToStorage(slug, file, kind) {
  const extension = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'jpg'
  const storagePath = `${slug}/${kind}-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from(CATEGORY_IMAGES_BUCKET)
    .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(CATEGORY_IMAGES_BUCKET).getPublicUrl(storagePath)
  return { storagePath, publicUrl: data.publicUrl }
}

async function removeFileFromStorage(storagePath) {
  if (!storagePath) return
  const { error } = await supabase.storage.from(CATEGORY_IMAGES_BUCKET).remove([storagePath])
  // Don't fail the whole request over storage cleanup — the database row
  // is the source of truth the frontend reads from.
  if (error) console.error('[storage] cleanup failed:', error.message)
}

export async function listCategoryImages(_req, res) {
  const { data, error } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) return handleSupabaseError(res, error)
  res.json(data)
}

export async function getCategoryImage(req, res) {
  const { slug } = req.params
  const { data, error } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) return handleSupabaseError(res, error)
  if (!data) return res.status(404).json({ error: `No image found for category "${slug}"` })
  res.json(data)
}

export async function upsertCategoryImage(req, res) {
  const {
    name,
    image_url: imageUrl,
    hover_image_url: hoverImageUrl,
    alt_text: altText,
  } = req.body ?? {}

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: '"name" is required' })
  }

  const slug = req.params.slug ?? slugify(name)

  const { data, error } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .upsert(
      {
        slug,
        name,
        image_url: imageUrl ?? null,
        hover_image_url: hoverImageUrl ?? null,
        alt_text: altText ?? null,
      },
      { onConflict: 'slug' }
    )
    .select()
    .single()

  if (error) return handleSupabaseError(res, error)
  res.status(201).json(data)
}

export async function updateCategoryImage(req, res) {
  const { slug } = req.params
  const {
    name,
    image_url: imageUrl,
    hover_image_url: hoverImageUrl,
    alt_text: altText,
  } = req.body ?? {}

  const patch = {}
  if (name !== undefined) patch.name = name
  if (imageUrl !== undefined) patch.image_url = imageUrl
  if (hoverImageUrl !== undefined) patch.hover_image_url = hoverImageUrl
  if (altText !== undefined) patch.alt_text = altText

  if (Object.keys(patch).length === 0) {
    return res
      .status(400)
      .json({ error: 'Provide at least one of name, image_url, hover_image_url, alt_text' })
  }

  const { data, error } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .update(patch)
    .eq('slug', slug)
    .select()
    .maybeSingle()

  if (error) return handleSupabaseError(res, error)
  if (!data) return res.status(404).json({ error: `No image found for category "${slug}"` })
  res.json(data)
}

export async function deleteCategoryImage(req, res) {
  const { slug } = req.params

  // Look the row up first so we know whether there's Storage objects to
  // clean up alongside the database row.
  const { data: existing, error: fetchError } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .select('storage_path, hover_storage_path')
    .eq('slug', slug)
    .maybeSingle()

  if (fetchError) return handleSupabaseError(res, fetchError)
  if (!existing) return res.status(404).json({ error: `No image found for category "${slug}"` })

  await removeFileFromStorage(existing.storage_path)
  await removeFileFromStorage(existing.hover_storage_path)

  const { error } = await supabase.from(CATEGORY_IMAGES_TABLE).delete().eq('slug', slug)
  if (error) return handleSupabaseError(res, error)
  res.status(204).send()
}

// Handles uploading the default ("image") photo, the hover/click
// ("hover_image") photo, or both at once. Whichever field(s) are present
// in the multipart body get uploaded and replace the existing file for
// that slot; anything not included is left as-is.
export async function uploadCategoryImage(req, res) {
  const { slug } = req.params
  const { name, alt_text: altText } = req.body ?? {}
  const baseFile = req.files?.image?.[0]
  const hoverFile = req.files?.hover_image?.[0]

  if (!baseFile && !hoverFile) {
    return res
      .status(400)
      .json({ error: 'No file uploaded (expected field "image" and/or "hover_image")' })
  }
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: '"name" is required' })
  }

  const { data: existing } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  const patch = {
    slug,
    name,
    alt_text: altText !== undefined ? altText : existing?.alt_text ?? null,
    image_url: existing?.image_url ?? null,
    storage_path: existing?.storage_path ?? null,
    hover_image_url: existing?.hover_image_url ?? null,
    hover_storage_path: existing?.hover_storage_path ?? null,
  }

  try {
    if (baseFile) {
      const { storagePath, publicUrl } = await uploadFileToStorage(slug, baseFile, 'base')
      if (existing?.storage_path && existing.storage_path !== storagePath) {
        await removeFileFromStorage(existing.storage_path)
      }
      patch.image_url = publicUrl
      patch.storage_path = storagePath
    }

    if (hoverFile) {
      const { storagePath, publicUrl } = await uploadFileToStorage(slug, hoverFile, 'hover')
      if (existing?.hover_storage_path && existing.hover_storage_path !== storagePath) {
        await removeFileFromStorage(existing.hover_storage_path)
      }
      patch.hover_image_url = publicUrl
      patch.hover_storage_path = storagePath
    }
  } catch (err) {
    console.error('[storage]', err.message)
    return res.status(500).json({ error: friendlyMessage(err.message) })
  }

  const { data, error } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .upsert(patch, { onConflict: 'slug' })
    .select()
    .single()

  if (error) return handleSupabaseError(res, error)
  res.status(201).json(data)
}
