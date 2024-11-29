import { defineAbility, ForcedSubject, MongoAbility } from '@casl/ability'
const actions = ['manage', 'invite', 'delete'] as const
const subjects = ['User', 'all'] as const

type AppAbilities = [
  (typeof actions)[number],
  (
    | (typeof subjects)[number]
    | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>
  ),
]

export type AppAbility = MongoAbility<AppAbilities>

export const ability = defineAbility<AppAbility>((can) => {
  can('invite', 'User')
})

const user = { id: 1, isLoggedIn: true }
type User = typeof user
export const abilityWithUser = (user: User) =>
  defineAbility<AppAbility>((can) => {
    if (user.isLoggedIn) {
      can('invite', 'User')
    }
  })

abilityWithUser(user).can('delete', 'User')
