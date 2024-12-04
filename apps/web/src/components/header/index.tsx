import { UserButton } from '../auth/user-button'
import { ToggleTheme } from '../global/toggle-theme'
import { NewTransactionButton } from '../new-transaction/button'
import { Separator } from '../ui/separator'
import { SearchButton } from './search-button'
// import { OrganizationSwitcher } from './organization-switcher'
export function Header() {
  return (
    <header className="flex h-header-height items-center justify-between border-b border-input px-4">
      {/* <OrganizationSwitcher /> */}
      <SearchButton />

      {/* <BreadcrumpHeader /> */}
      {/* <OrganizationSwitcher /> */}
      <div className="flex items-center gap-2">
        {/* <SearchButton /> */}
        {/* <Separator orientation="vertical" className="h-8" /> */}
        <NewTransactionButton />

        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <UserButton />
          <Separator orientation="vertical" className="h-6" />
          <ToggleTheme />
        </div>
        {/* <UserButton /> */}
        {/* <ToggleTheme /> */}
      </div>
    </header>
  )
}
