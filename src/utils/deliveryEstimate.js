export const DELIVERY_AREAS = [
  { name: 'Bole', fee: 50, time: '25 - 35 mins', keywords: ['bole'] },
  { name: 'Kazanchis', fee: 60, time: '30 - 40 mins', keywords: ['kazanchis', 'kasanchis'] },
  { name: 'Piassa', fee: 70, time: '35 - 45 mins', keywords: ['piassa', 'piyassa', 'arada'] },
  { name: 'Megenagna', fee: 70, time: '35 - 45 mins', keywords: ['megenagna', 'megenaga'] },
  { name: 'Saris', fee: 90, time: '45 - 55 mins', keywords: ['saris'] },
  { name: 'CMC', fee: 90, time: '45 - 60 mins', keywords: ['cmc', 'ayat'] },
  { name: 'Summit', fee: 50, time: '25 - 35 mins', keywords: ['summit'] },
  { name: 'Fiyel Bet', fee: 50, time: '25 - 35 mins', keywords: ['fiyel bet'] },  
]

export const DEFAULT_DELIVERY = {
  name: 'Standard Addis Area',
  fee: 80,
  time: '40 - 55 mins',
}

export function calculateDeliveryEstimate(address) {
  if (!address || typeof address !== 'string' || !address.trim()) {
    return {
      fee: 0,
      time: null,
      isRecognized: false,
      matchedArea: null,
      isEmpty: true,
    }
  }

  const normalized = address.toLowerCase()

  const matched = DELIVERY_AREAS.find((area) =>
    area.keywords.some((keyword) => normalized.includes(keyword))
  )

  if (matched) {
    return {
      fee: matched.fee,
      time: matched.time,
      isRecognized: true,
      matchedArea: matched.name,
      isEmpty: false,
    }
  }

  return {
    fee: DEFAULT_DELIVERY.fee,
    time: DEFAULT_DELIVERY.time,
    isRecognized: false,
    matchedArea: DEFAULT_DELIVERY.name,
    isEmpty: false,
  }
}

export default calculateDeliveryEstimate
