import Swal from 'sweetalert2'

// Custom SweetAlert configuration that matches the website theme
export const showConfirmDialog = (
  title: string,
  text: string,
  confirmButtonText: string = 'Yes, proceed',
  cancelButtonText: string = 'Cancel'
) => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6', // Primary blue color
    cancelButtonColor: '#6b7280', // Gray color
    confirmButtonText,
    cancelButtonText,
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    customClass: {
      popup: 'border border-border rounded-lg shadow-lg',
      title: 'text-foreground',
      content: 'text-muted-foreground',
      confirmButton: 'bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors',
      cancelButton: 'bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-md font-medium transition-colors border border-border'
    }
  })
}

export const showSuccessDialog = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#10b981', // Green color
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    customClass: {
      popup: 'border border-border rounded-lg shadow-lg',
      title: 'text-foreground',
      content: 'text-muted-foreground',
      confirmButton: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors'
    }
  })
}

export const showErrorDialog = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#ef4444', // Red color
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    customClass: {
      popup: 'border border-border rounded-lg shadow-lg',
      title: 'text-foreground',
      content: 'text-muted-foreground',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors'
    }
  })
}

export const showInfoDialog = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonColor: '#3b82f6', // Primary blue color
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    customClass: {
      popup: 'border border-border rounded-lg shadow-lg',
      title: 'text-foreground',
      content: 'text-muted-foreground',
      confirmButton: 'bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors'
    }
  })
}

export const showLoadingDialog = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    customClass: {
      popup: 'border border-border rounded-lg shadow-lg',
      title: 'text-foreground',
      content: 'text-muted-foreground'
    },
    didOpen: () => {
      Swal.showLoading()
    }
  })
}
