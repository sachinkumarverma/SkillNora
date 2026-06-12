"use client"
import { useEffect, useState } from 'react'
import supabase from './supabaseClient'

export default function useUser(){
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      const { data } = await supabase.auth.getSession()
      if(!mounted) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    }
    load()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session)=>{
      if(!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return ()=>{
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  },[])

  return { user, loading }
}
