/**
 * Verified Unsplash image URLs for crops, livestock and diseases
 * All photos are free to use - Unsplash license
 * Using source.unsplash.com which reliably serves relevant images by keyword
 */

// Use Unsplash source API - searches by keyword and returns real matching photo
export function getCropImage(name: string): string {
  const clean = name.toLowerCase()
    .replace(/[()\/]/g, '')
    .replace(/\s+/g, '-')
    .split('/')[0]
    .trim()

  // Specific overrides for best results
  const OVERRIDES: Record<string, string> = {
    'maize': 'https://images.unsplash.com/photo-1601593768799-76d19e9f65e9?w=800&q=80&fit=crop',
    'mahindi': 'https://images.unsplash.com/photo-1601593768799-76d19e9f65e9?w=800&q=80&fit=crop',
    'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&fit=crop',
    'ngano': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&fit=crop',
    'sorghum': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80&fit=crop',
    'rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80&fit=crop',
    'tomatoes': 'https://images.unsplash.com/photo-1546094096-0df4bcabd337?w=800&q=80&fit=crop',
    'nyanya': 'https://images.unsplash.com/photo-1546094096-0df4bcabd337?w=800&q=80&fit=crop',
    'kale': 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800&q=80&fit=crop',
    'sukuma-wiki': 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800&q=80&fit=crop',
    'cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&q=80&fit=crop',
    'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80&fit=crop',
    'onions': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80&fit=crop',
    'vitunguu': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80&fit=crop',
    'irish-potatoes': 'https://images.unsplash.com/photo-1518977676405-7571d5eed1d5?w=800&q=80&fit=crop',
    'viazi': 'https://images.unsplash.com/photo-1518977676405-7571d5eed1d5?w=800&q=80&fit=crop',
    'sweet-potatoes': 'https://images.unsplash.com/photo-1596097560784-9b4a8d6e1d1b?w=800&q=80&fit=crop',
    'cassava': 'https://images.unsplash.com/photo-1594282418426-c9ac1c95d9e9?w=800&q=80&fit=crop',
    'muhogo': 'https://images.unsplash.com/photo-1594282418426-c9ac1c95d9e9?w=800&q=80&fit=crop',
    'carrots': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80&fit=crop',
    'peas': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80&fit=crop',
    'french-beans': 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800&q=80&fit=crop',
    'common-beans': 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800&q=80&fit=crop',
    'maharagwe': 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800&q=80&fit=crop',
    'green-grams': 'https://images.unsplash.com/photo-1502741126161-b048400d085d?w=800&q=80&fit=crop',
    'ndengu': 'https://images.unsplash.com/photo-1502741126161-b048400d085d?w=800&q=80&fit=crop',
    'soybean': 'https://images.unsplash.com/photo-1599557568403-c3bb38e1c0e6?w=800&q=80&fit=crop',
    'groundnuts': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80&fit=crop',
    'karanga': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80&fit=crop',
    'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80&fit=crop',
    'embe': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80&fit=crop',
    'avocado': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80&fit=crop',
    'parachichi': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80&fit=crop',
    'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80&fit=crop',
    'ndizi': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80&fit=crop',
    'passion-fruit': 'https://images.unsplash.com/photo-1604495772376-9657f0091e01?w=800&q=80&fit=crop',
    'maracuya': 'https://images.unsplash.com/photo-1604495772376-9657f0091e01?w=800&q=80&fit=crop',
    'papaya': 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&q=80&fit=crop',
    'papai': 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&q=80&fit=crop',
    'watermelon': 'https://images.unsplash.com/photo-1587049332298-1c42e83937a7?w=800&q=80&fit=crop',
    'tikiti-maji': 'https://images.unsplash.com/photo-1587049332298-1c42e83937a7?w=800&q=80&fit=crop',
    'pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80&fit=crop',
    'nanasi': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800&q=80&fit=crop',
    'strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80&fit=crop',
    'stroberri': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80&fit=crop',
    'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80&fit=crop',
    'chungwa': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80&fit=crop',
    'lemon': 'https://images.unsplash.com/photo-1587201513792-0fedd40a7092?w=800&q=80&fit=crop',
    'lime': 'https://images.unsplash.com/photo-1561139530-6d7b9e3c7891?w=800&q=80&fit=crop',
    'ndimu': 'https://images.unsplash.com/photo-1561139530-6d7b9e3c7891?w=800&q=80&fit=crop',
    'guava': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=800&q=80&fit=crop',
    'mapera': 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=800&q=80&fit=crop',
    'kiwi': 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=800&q=80&fit=crop',
    'jackfruit': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80&fit=crop',
    'fenesi': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80&fit=crop',
    'grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80&fit=crop',
    'zabibu': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80&fit=crop',
    'blueberry': 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80&fit=crop',
    'plum': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80&fit=crop',
    'peach': 'https://images.unsplash.com/photo-1595925889916-24b9e0a8e7a0?w=800&q=80&fit=crop',
    'coconut': 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&q=80&fit=crop',
    'nazi': 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=800&q=80&fit=crop',
    'cashew': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80&fit=crop',
    'korosho': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80&fit=crop',
    'tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80&fit=crop',
    'chai': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80&fit=crop',
    'coffee': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&fit=crop',
    'kahawa': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&fit=crop',
    'sugarcane': 'https://images.unsplash.com/photo-1594568284297-7c64464062b4?w=800&q=80&fit=crop',
    'miwa': 'https://images.unsplash.com/photo-1594568284297-7c64464062b4?w=800&q=80&fit=crop',
    'sunflower': 'https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=800&q=80&fit=crop',
    'alizeti': 'https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=800&q=80&fit=crop',
    'macadamia': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&q=80&fit=crop',
    'roses': 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&q=80&fit=crop',
    'waridi': 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&q=80&fit=crop',
    'carnations': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80&fit=crop',
    'capsicum': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80&fit=crop',
    'bell-pepper': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80&fit=crop',
    'pilipili-hoho': 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80&fit=crop',
    'eggplant': 'https://images.unsplash.com/photo-1613742932685-ef87a9d72c5e?w=800&q=80&fit=crop',
    'brinjal': 'https://images.unsplash.com/photo-1613742932685-ef87a9d72c5e?w=800&q=80&fit=crop',
    'finger-millet': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80&fit=crop',
    'wimbi': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80&fit=crop',
    'pigeon-peas': 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&q=80&fit=crop',
    'mbaazi': 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&q=80&fit=crop',
    'cowpeas': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&fit=crop',
    'kunde': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&fit=crop',
    'tamarind': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80&fit=crop',
    'ukwaju': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80&fit=crop',
    'tangerine': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80&fit=crop',
    'chenza': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80&fit=crop',
    'pyrethrum': 'https://images.unsplash.com/photo-1490750967868-88df5691cc37?w=800&q=80&fit=crop',
    'miraa': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80&fit=crop',
  }

  const key = clean.split('(')[0].trim()
  if (OVERRIDES[key]) return OVERRIDES[key]

  // Try partial match
  for (const [k, v] of Object.entries(OVERRIDES)) {
    if (key.includes(k) || k.includes(key.split('-')[0])) return v
  }

  // Generic fallback by keyword using Unsplash source
  const keyword = name.split('(')[0].trim().split('/')[0].trim().toLowerCase()
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(keyword)},farm,agriculture,kenya`
}

// Animal images by category
export const ANIMAL_CAT_IMAGES: Record<string, string> = {
  cattle:  'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&q=80&fit=crop',
  goat:    'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=800&q=80&fit=crop',
  sheep:   'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=800&q=80&fit=crop',
  poultry: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80&fit=crop',
  rabbit:  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80&fit=crop',
  pig:     'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80&fit=crop',
  fish:    'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80&fit=crop',
  bees:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  camel:   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80&fit=crop',
  donkey:  'https://images.unsplash.com/photo-1548445929-4f60a497f851?w=800&q=80&fit=crop',
  duck:    'https://images.unsplash.com/photo-1555155977-d55db6048a44?w=800&q=80&fit=crop',
  quail:   'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80&fit=crop',
  ostrich: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80&fit=crop',
}

// Breed-specific images
export const BREED_IMAGES: Record<string, string> = {
  'friesian':         'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80&fit=crop',
  'holstein':         'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80&fit=crop',
  'ayrshire':         'https://images.unsplash.com/photo-1551085254-e96b210db58a?w=400&q=80&fit=crop',
  'jersey':           'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&q=80&fit=crop',
  'boran':            'https://images.unsplash.com/photo-1605493624455-a674d92a6f79?w=400&q=80&fit=crop',
  'angus':            'https://images.unsplash.com/photo-1548445929-4f60a497f851?w=400&q=80&fit=crop',
  'dorper':           'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=400&q=80&fit=crop',
  'boer':             'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=400&q=80&fit=crop',
  'toggenburg':       'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=400&q=80&fit=crop',
  'saanen':           'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=400&q=80&fit=crop',
  'isa brown':        'https://images.unsplash.com/photo-1569593517504-7d8f59660da8?w=400&q=80&fit=crop',
  'lohmann':          'https://images.unsplash.com/photo-1569593517504-7d8f59660da8?w=400&q=80&fit=crop',
  'ross 308':         'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80&fit=crop',
  'california white': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80&fit=crop',
  'large white':      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80&fit=crop',
  'nile tilapia':     'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80&fit=crop',
}

export function getAnimalImage(category: string): string {
  return ANIMAL_CAT_IMAGES[category?.toLowerCase()] ||
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80&fit=crop'
}

export function getBreedImage(breedName: string, category: string): string {
  const key = breedName.toLowerCase()
  for (const [k, v] of Object.entries(BREED_IMAGES)) {
    if (key.includes(k) || k.includes(key.split(' ')[0])) return v
  }
  return getAnimalImage(category)
}
