import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { ExpensesByTags } from './expenses-by-tags'

export function TagsCard() {
  return (
    <Card>
      <CardHeader className="border-b pb-2">
        <CardTitle>Tags</CardTitle>
        <CardDescription>Ingsiths sobre as categorias</CardDescription>
      </CardHeader>
      <CardContent className="bg-muted pt-6">
        <div className="grid grid-cols-2 gap-4">
          <ExpensesByTags />
          <ExpensesByTags />
        </div>
      </CardContent>
    </Card>
  )
}
