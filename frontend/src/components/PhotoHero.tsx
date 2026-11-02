import { ReactNode } from 'react'

interface Props {
  image: string
  title: string
  subtitle?: string
  compact?: boolean
  children?: ReactNode
}

export default function PhotoHero({ image, title, subtitle, compact, children }: Props) {
  return (
    <section
      className={'photo-hero' + (compact ? ' compact' : '')}
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.40), rgba(0,0,0,.58)), url(${image})` }}
    >
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </section>
  )
}
