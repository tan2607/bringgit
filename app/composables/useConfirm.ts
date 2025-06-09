import { ref } from 'vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'

export function useConfirm() {
  const resolveFn = useState<((value: boolean) => void) | null>('resolveFn', () => null)
  const message = useState<string>('message', () => '')
  
  const overlay = useOverlay()

  const modal = overlay.create(ConfirmDialog)

  const confirm = (prompt: string): Promise<boolean> => {
    message.value = prompt
    modal.open()

    return new Promise((resolve) => {
      resolveFn.value = resolve
    })
  }

  const close = (result: boolean) => {
    if (resolveFn.value) {
      resolveFn.value(result)
      resolveFn.value = null
    }
    modal.close()
  }

  return { confirm, close, message }
}
