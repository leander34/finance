import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { ExpensesByCategory } from './expenses-by-category'

export function CategoriesCard() {
  return (
    <Card>
      <CardHeader className="border-b pb-2">
        <CardTitle>Categorias</CardTitle>
        <CardDescription>Ingsiths sobre as categorias</CardDescription>
      </CardHeader>
      <CardContent className="bg-muted pt-6">
        <div className="grid grid-cols-2 gap-4">
          <ExpensesByCategory />
          <ExpensesByCategory />
        </div>
      </CardContent>
    </Card>
  )
}
