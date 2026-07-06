import { Button } from './Button'
import { screenHeading } from '../styles'

interface Props {
  title: string
  description: string
  onBack: () => void
}

export function ComingSoonScreen({ title, description, onBack }: Props) {
  return (
    <div className="flex flex-col gap-3.5">
      <Button variant="link" onClick={onBack}>
        ‹ All patients
      </Button>
      <h2 className={screenHeading}>{title}</h2>
      <p className="py-8 text-center text-sm text-text">{description}</p>
    </div>
  )
}
