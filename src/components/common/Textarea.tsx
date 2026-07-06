import type { TextareaHTMLAttributes } from 'react'
import { fieldBase } from './fieldBase'
import { cx } from '../../styles'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** The one place every multi-line text field in the app renders through. */
export function Textarea({ className, ...rest }: Props) {
  return <textarea className={cx(fieldBase, 'resize-y', className)} {...rest} />
}
