export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Re-enable auth guard once NextAuth + Prisma adapter is configured
  // const session = await auth()
  // if (!session?.user) redirect('/auth/signin')
  return <>{children}</>
}
