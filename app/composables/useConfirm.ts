export function useConfirm() {
  const resolveFn = useState<((value: boolean) => void) | null>('resolveFn', () => null)
  const message = useState<string>('message', () => '')
  const visible = useState<boolean>('visible', () => false)

  const confirm = (prompt: string): Promise<boolean> => {
    message.value = prompt
    visible.value = true

    return new Promise((resolve) => {
      resolveFn.value = resolve
    })
  }

  const close = (result: boolean) => {
    if (resolveFn.value) {
      resolveFn.value(result)
      resolveFn.value = null
    }
    visible.value = false
  }

  return { confirm, close, message, visible }
}
