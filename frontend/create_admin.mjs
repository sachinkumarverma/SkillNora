import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xoyzeabdsopzkpsufwau.supabase.co'
const supabaseKey = 'sb_publishable_I419hdoHaTWfSnLpW9lK-g_PQCuZmNZ'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
  const email = 'admin@skillnora.com'
  const password = 'AdminPassword123!'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin',
        full_name: 'System Admin'
      }
    }
  })

  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('Admin created successfully! Credentials:')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
  }
}

createAdmin()
