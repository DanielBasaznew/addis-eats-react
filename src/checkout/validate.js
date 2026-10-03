export function validateCheckout(formData, { isTableOrder = false } = {}) {
  const errors = {}

  if (!formData.fullName || !formData.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.'
  }

  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else {
    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '')
    const phoneRegex = /^(?:\+?251|0)?[79]\d{8}$|^\+?\d{9,14}$/
    if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid phone number (e.g. 0911 234 567).'
    }
  }

  // Address validation is only required for delivery orders
  if (!isTableOrder) {
    if (!formData.address || !formData.address.trim()) {
      errors.address = 'Delivery address/area is required.'
    } else if (formData.address.trim().length < 3) {
      errors.address = 'Please provide a more specific delivery address.'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export default validateCheckout
