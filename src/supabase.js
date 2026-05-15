import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eehdwgxfxylmjldsfdge.supabase.co'
const supabaseKey = 'sb_publishable_GCXWeJ_R4seS0sz-BE-Jiw_h6G0NBaT'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)