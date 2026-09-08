import { supabase, ITEMS_TABLE, ITEMS_BUCKET } from '../supabaseClient.js'

function handleSupabaseError(res, error, fallbackStatus = 500) {
  console.error('[supabase]', error.message)
  const status = error.code === '23505' ? 409 : fallbackStatus
  return res.status(status).json({ error: friendlyMessage(error.message) })
}

function friendlyMessage(message) {
  if (/schema cache/i.test(message)) {
    return (
      `${message} — this means Supabase's API layer hasn't picked up a recent database ` +
      'change yet. Re-run sql/items.sql in the Supabase SQL editor, and if it still ' +
      "happens, restart the project from Supabase's dashboard (Project Settings → General " +
      '→ Restart project). See visions-api/README.md → Troubleshooting for the full checklist.'
    )
  }
  if (/bucket not found/i.test(message)) {
    return (
      `${message} — the "item-images" Storage bucket doesn't exist in your Supabase project ` +
      'yet. Run the full sql/items.sql file in the Supabase SQL editor (it creates the bucket ' +
      "near the bottom); check Storage in Supabase's dashboard afterwards to confirm " +
      '"item-images" is listed.'
    )
  }
  return message
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parsePrice(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

async function uploadFileToStorage(slug, file, kind) {
  const extension = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'jpg'
  const storagePath = `${slug}/${kind}-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from(ITEMS_BUCKET)
    .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from(ITEMS_BUCKET).getPublicUrl(storagePath)
  return { storagePath, publicUrl: data.publicUrl }
}

async function removeFileFromStorage(storagePath) {
  if (!storagePath) return
  const { error } = await supabase.storage.from(ITEMS_BUCKET).remove([storagePath])
  if (error) console.error('[storage] cleanup failed:', error.message)
}

export async function listItems(req, res) {
  let query = supabase.from(ITEMS_TABLE).select('*').order('name', { ascending: true })
  if (req.query.category) {
    query = query.eq('category', req.query.category)
  }
  const { data, error } = await query
  if (error) return handleSupabaseError(res, error)
  res.json(data)
}

export async function getItem(req, res) {
  const { slug } = req.params
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) return handleSupabaseError(res, error)
  if (!data) return res.status(404).json({ error: `No item found with slug "${slug}"` })
  res.json(data)
}

export async function updateItem(req, res) {
  const { slug } = req.params
  const {
    name,
    category,
    price,
    price_max: priceMax,
    alt_text: altText,
    description,
  } = req.body ?? {}

  const patch = {}
  if (name !== undefined) patch.name = name
  if (category !== undefined) patch.category = category
  if (price !== undefined) patch.price = parsePrice(price)
  if (priceMax !== undefined) patch.price_max = priceMax === '' || priceMax === null ? null : parsePrice(priceMax)
  if (altText !== undefined) patch.alt_text = altText
  if (description !== undefined) patch.description = description

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'Provide at least one field to update' })
  }

  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .update(patch)
    .eq('slug', slug)
    .select()
    .maybeSingle()

  if (error) return handleSupabaseError(res, error)
  if (!data) return res.status(404).json({ error: `No item found with slug "${slug}"` })
  res.json(data)
}

export async function deleteItem(req, res) {
  const { slug } = req.params

  const { data: existing, error: fetchError } = await supabase
    .from(ITEMS_TABLE)
    .select('storage_path, hover_storage_path')
    .eq('slug', slug)
    .maybeSingle()

  if (fetchError) return handleSupabaseError(res, fetchError)
  if (!existing) return res.status(404).json({ error: `No item found with slug "${slug}"` })

  await removeFileFromStorage(existing.storage_path)
  await removeFileFromStorage(existing.hover_storage_path)

  const { error } = await supabase.from(ITEMS_TABLE).delete().eq('slug', slug)
  if (error) return handleSupabaseError(res, error)
  res.status(204).send()
}

// Creates a new item (Add) or replaces an existing one's photos/details
// (Update, when a file is included) — same "upload whichever field(s)
// are present" pattern as category_images.
export async function uploadItem(req, res) {
  const providedSlug = req.params.slug
  const {
    name,
    category,
    price,
    price_max: priceMax,
    alt_text: altText,
    description,
  } = req.body ?? {}
  const baseFile = req.files?.image?.[0]
  const hoverFile = req.files?.hover_image?.[0]

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: '"name" is required' })
  }
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: '"category" is required' })
  }
  const slug = providedSlug || slugify(name)

  const { data: existing } = await supabase
    .from(ITEMS_TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!existing && (!baseFile || !hoverFile)) {
    return res
      .status(400)
      .json({ error: 'New items need both a default photo ("image") and a hover photo ("hover_image")' })
  }

  const patch = {
    slug,
    name,
    category,
    price: price !== undefined ? parsePrice(price) : existing?.price ?? null,
    price_max:
      priceMax !== undefined
        ? priceMax === '' || priceMax === null
          ? null
          : parsePrice(priceMax)
        : existing?.price_max ?? null,
    alt_text: altText !== undefined ? altText : existing?.alt_text ?? null,
    description: description !== undefined ? description : existing?.description ?? null,
    image_url: existing?.image_url ?? null,
    storage_path: existing?.storage_path ?? null,
    hover_image_url: existing?.hover_image_url ?? null,
    hover_storage_path: existing?.hover_storage_path ?? null,
  }

  if (patch.price === null) {
    return res.status(400).json({ error: '"price" must be a number' })
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
    .from(ITEMS_TABLE)
    .upsert(patch, { onConflict: 'slug' })
    .select()
    .single()

  if (error) return handleSupabaseError(res, error)
  res.status(existing ? 200 : 201).json(data)
}
