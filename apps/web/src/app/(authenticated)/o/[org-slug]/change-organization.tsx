'use client'
import { useRouter } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
interface ChangeOrganizationProps {
  organizations: {
    name: string
    slug: string
  }[]
}
export function ChangeOrganization({ organizations }: ChangeOrganizationProps) {
  const router = useRouter()
  return (
    <Select
      onValueChange={(value) => {
        router.push(`/o/${value}/dashboard`)
      }}
    >
      <SelectTrigger className="">
        <SelectValue placeholder="Escolha uma organização" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Minhas organizações</SelectLabel>
          {organizations.map((organization) => {
            return (
              <SelectItem key={organization.slug} value={organization.slug}>
                {organization.name}
              </SelectItem>
            )
          })}{' '}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
