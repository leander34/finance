'use client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { useModalPlans } from '@/components/modal-plans'
import { Button } from '@/components/ui/button'
import { useCookies } from '@/hooks/use-cookies'
import { getOrganizationsHttp } from '@/http/auth/organization/get-organizations-http'

export default function TransactionsPage() {
  const { token } = useCookies()
  const { showAlert } = useModalPlans()
  console.log('env.NEXT_PUBLIC_API_URL')
  // console.log(env.NEXT_PUBLIC_API_URL)
  const { data, isLoading } = useQuery({
    queryKey: ['organizations1'],
    queryFn: () => {
      return getOrganizationsHttp()
    },
    // enabled: open,
  })
  // console.log(data)
  // const [count, setCount] = useState(0)
  // const ref = useRef()

  // function getCurrentValue() {
  //   console.log(ref.current)
  // }

  // useEffect(() => {
  //   ref.current = count
  //   console.log('hello')
  // }, [count])
  return (
    <div>
      {JSON.stringify(data, null, 2)} {showAlert ? 'sim' : 'nao'}
      {/* <div>Count: {count}</div>
      <div>Ref: {ref.current}</div>
      <Button onClick={() => setCount(count + 1)}>Increse</Button>
      <Button onClick={() => getCurrentValue()}>get value</Button> */}
    </div>
  )
}
