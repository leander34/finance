import {
  ChartNoAxesCombined,
  Ellipsis,
  HandCoins,
  Landmark,
  TrendingDown,
} from 'lucide-react'

export const accountTypes = {
  CC: {
    value: 'CC',
    name: 'Conta Corrente',
    icon: Landmark,
  },
  DINHEIRO: {
    value: 'DINHEIRO',
    name: 'Dinheiro',
    icon: HandCoins,
  },
  CP: {
    value: 'CP',
    name: 'Conta poupança',
    icon: TrendingDown,
  },
  CI: {
    value: 'CI',
    name: 'Conta Investimento',
    icon: ChartNoAxesCombined,
  },
  OUTROS: {
    value: 'OUTROS',
    name: 'Outros',
    icon: Ellipsis,
  },
}
