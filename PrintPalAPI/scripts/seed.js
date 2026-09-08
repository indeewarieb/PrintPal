import 'dotenv/config'
import { supabase, CATEGORY_IMAGES_TABLE } from '../src/supabaseClient.js'
import { CATEGORY_NAMES, slugify } from '../src/data/categories.js'

async function seed() {
  const rows = CATEGORY_NAMES.map((name) => ({
    slug: slugify(name),
    name,
    image_url: null,
    hover_image_url: null,
    alt_text: null,
  }))

  console.log(`Seeding ${rows.length} categories into "${CATEGORY_IMAGES_TABLE}"...`)

  // onConflict: 'slug' means re-running this script is safe — it won't
  // duplicate rows or clobber an image_url you've already set, because
  // ignoreDuplicates leaves existing rows untouched.
  const { error, count } = await supabase
    .from(CATEGORY_IMAGES_TABLE)
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true, count: 'exact' })

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`Done. ${count ?? rows.length} rows affected.`)
  console.log('Now add an image_url for whichever categories you want images for, e.g.:')
  console.log(
    `  curl -X PUT http://localhost:${process.env.PORT ?? 4000}/api/categories/mugs-and-cups \\\n` +
      `    -H "Content-Type: application/json" \\\n` +
      `    -d '{"image_url":"https://example.com/mugs.jpg","alt_text":"Branded mugs"}'`
  )
}

seed()
