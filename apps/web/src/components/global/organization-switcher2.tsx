// import { ChevronsUpDown, PlusCircle } from 'lucide-react'
// import Link from 'next/link'

// import { getCurrentOrganizationSlug } from '@/auth/session-server-only'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { getOrganizationsHttp } from '@/http/auth/organization/get-organizations-http'
// import { cn } from '@/lib/utils'
// import { getInitials } from '@/utlis/get-initials'

// import { buttonVariants } from '../ui/button'
// async function OrganizationSwitcher() {
//   const currentOrg = getCurrentOrganizationSlug()
//   const { organizations } = await getOrganizationsHttp()

//   const currentOrganization = organizations.find(
//     (org) => org.slug === currentOrg,
//   )

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger
//         className={cn(
//           buttonVariants({ variant: 'outline' }),
//           'flex w-[260px] items-center gap-2 text-xs',
//         )}
//       >
//         {currentOrganization ? (
//           <>
//             <Avatar className="size-7 shrink-0">
//               {currentOrganization.avatarUrl && (
//                 <AvatarImage src={currentOrganization.avatarUrl} />
//               )}
//               <AvatarFallback className="text-xs">
//                 {getInitials(currentOrganization.name)}
//               </AvatarFallback>
//             </Avatar>
//             <span className="truncate text-left">
//               {currentOrganization.name}
//             </span>
//           </>
//         ) : (
//           <span className="text-muted-foreground">Select organization</span>
//         )}
//         <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         align="center"
//         sideOffset={8}
//         className="max-w-[260px]"
//       >
//         <DropdownMenuGroup>
//           <DropdownMenuLabel>Pessoal</DropdownMenuLabel>
//           <DropdownMenuSeparator />
//           {organizations.map((organization) => {
//             return (
//               <DropdownMenuItem
//                 key={organization.id}
//                 asChild
//                 className="h-8 text-xs"
//               >
//                 <Link href={`/org/${organization.slug}`}>
//                   <Avatar className="mr-2 size-7 shrink-0">
//                     {organization.avatarUrl && (
//                       <AvatarImage src={organization.avatarUrl} />
//                     )}
//                     <AvatarFallback className="text-xs">
//                       {getInitials(organization.name)}
//                     </AvatarFallback>
//                   </Avatar>
//                   <span className="line-clamp-1">{organization.name}</span>
//                 </Link>
//               </DropdownMenuItem>
//             )
//           })}
//         </DropdownMenuGroup>
//         <DropdownMenuSeparator />
//         <DropdownMenuGroup>
//           <DropdownMenuLabel>Família</DropdownMenuLabel>
//           <DropdownMenuSeparator />
//           {organizations.map((organization) => {
//             return (
//               <DropdownMenuItem
//                 key={organization.id}
//                 asChild
//                 className="h-8 text-xs"
//               >
//                 <Link href={`/org/${organization.slug}`}>
//                   <Avatar className="mr-2 size-7 shrink-0">
//                     {organization.avatarUrl && (
//                       <AvatarImage src={organization.avatarUrl} />
//                     )}
//                     <AvatarFallback className="text-xs">
//                       {getInitials(organization.name)}
//                     </AvatarFallback>
//                   </Avatar>
//                   <span className="line-clamp-1">{organization.name}</span>
//                 </Link>
//               </DropdownMenuItem>
//             )
//           })}
//         </DropdownMenuGroup>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem asChild>
//           <Link href="/create-organization">
//             <PlusCircle className="mr-2 size-4" />
//             Create new
//           </Link>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }
