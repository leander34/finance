import { useSearchParams } from 'next/navigation'
import qs from 'query-string'
import { useEffect, useMemo } from 'react'

export function useNewTransaction() {
  const searchParams = useSearchParams()
  const isNewTranscationSheetOpen =
    searchParams.get('novo-lancamento') === 'open'
  // const transactionTab = searchParams.get('tab')

  const transactionTab: 'despesa' | 'receita' | 'transferencia' | null =
    useMemo(() => {
      const tab = searchParams.get('tab')
      if (tab !== 'despesa' && tab !== 'receita' && tab !== 'transferencia') {
        return null
      }
      return tab
    }, [searchParams])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleToggleNewTransactionSheet()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [handleToggleNewTransactionSheet])

  function handleToggleNewTransactionSheet() {
    const currentUrl = window.location.href.split('?')[0]
    const currentQuery = qs.parse(window.location.search)
    const updatedQuery = {
      ...currentQuery,
    }
    if (isNewTranscationSheetOpen) {
      delete updatedQuery['novo-lancamento']
      // setShowAlert(false)
    } else {
      updatedQuery['novo-lancamento'] = 'open'
    }
    const newUrl = qs.stringifyUrl(
      {
        url: currentUrl,
        query: updatedQuery,
      },
      { skipNull: true, sort: false },
    )

    window.history.pushState({}, '', newUrl)
  }

  function handleChangeTransactionTab(
    tab: 'despesa' | 'receita' | 'transferencia' | null,
  ) {
    const currentUrl = window.location.href.split('?')[0]
    const currentQuery = qs.parse(window.location.search)
    const updatedQuery = {
      ...currentQuery,
    }

    if (tab) {
      updatedQuery.tab = tab
    } else {
      delete updatedQuery.tab
    }

    const newUrl = qs.stringifyUrl(
      {
        url: currentUrl,
        query: updatedQuery,
      },
      { skipNull: true, sort: false },
    )

    window.history.pushState({}, '', newUrl)
  }

  function handleChangeNewTransactionSheet(
    value: boolean,
    tab?: 'despesa' | 'receita' | 'transferencia' | null,
  ) {
    const currentUrl = window.location.href.split('?')[0]
    const currentQuery = qs.parse(window.location.search)
    const updatedQuery = {
      ...currentQuery,
    }
    if (value === false) {
      delete updatedQuery['novo-lancamento']
      // setShowAlert(false)
    } else {
      updatedQuery['novo-lancamento'] = 'open'
    }

    if (tab) {
      updatedQuery.tab = tab
    } else {
      delete updatedQuery.tab
    }
    const newUrl = qs.stringifyUrl(
      {
        url: currentUrl,
        query: updatedQuery,
      },
      { skipNull: true, sort: false },
    )

    window.history.pushState({}, '', newUrl)
  }
  return {
    isNewTranscationSheetOpen,
    handleToggleNewTransactionSheet,
    handleChangeNewTransactionSheet,
    transactionTab,
    handleChangeTransactionTab,
  }
}
