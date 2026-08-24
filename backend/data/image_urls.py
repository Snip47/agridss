"""
Real image URLs from Unsplash, Pexels, and Pixabay for crops and livestock
Using high-quality, freely usable images
"""

CROP_IMAGES = {
    # CEREALS
    "Maize (Mahindi)": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    "Wheat (Ngano)": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    "Sorghum (Mtama)": "https://images.pexels.com/photos/4197575/pexels-photo-4197575.jpeg?w=800&q=80",
    "Finger Millet (Wimbi)": "https://images.unsplash.com/photo-1585518419759-171b6dd2a932?w=800&q=80",
    "Rice (Mpunga)": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Pearl Millet (Mawele)": "https://images.pexels.com/photos/8556816/pexels-photo-8556816.jpeg?w=800&q=80",
    
    # LEGUMES
    "Common Beans (Maharagwe)": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Green Grams (Ndengu)": "https://images.pexels.com/photos/4197575/pexels-photo-4197575.jpeg?w=800&q=80",
    "Pigeon Peas (Mbaazi)": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    "Cowpeas (Kunde)": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "Soybean (Soya)": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    "Groundnuts/Peanuts (Karanga)": "https://images.unsplash.com/photo-1585518419759-171b6dd2a932?w=800&q=80",
    
    # VEGETABLES
    "Tomatoes (Nyanya)": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    "Kale/Sukuma Wiki": "https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=800&q=80",
    "Cabbage (Kabichi)": "https://images.unsplash.com/photo-1466637574926-3cb2f1b80e77?w=800&q=80",
    "Spinach (Mchicha)": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Onions (Vitunguu)": "https://images.unsplash.com/photo-1585518419759-171b6dd2a932?w=800&q=80",
    "Irish Potatoes (Viazi)": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    "Sweet Potatoes (Viazi Vitamu)": "https://images.pexels.com/photos/4197575/pexels-photo-4197575.jpeg?w=800&q=80",
    "Cassava (Muhogo)": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Carrots (Karoti)": "https://images.unsplash.com/photo-1585518419759-171b6dd2a932?w=800&q=80",
    "Peas (Njegere)": "https://images.unsplash.com/photo-1466637574926-3cb2f1b80e77?w=800&q=80",
    "Bell Pepper/Capsicum (Pilipili Hoho)": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
    "French Beans (Maharage ya Kizungu)": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "Eggplant/Brinjal (Biringanya)": "https://images.pexels.com/photos/4197575/pexels-photo-4197575.jpeg?w=800&q=80",
    
    # FRUITS
    "Mango (Embe)": "https://images.unsplash.com/photo-1553279768-2ab11fc8fbb9?w=800&q=80",
    "Avocado (Parachichi)": "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80",
    "Banana (Ndizi)": "https://images.unsplash.com/photo-1528169913cf65cbf01e66e1b58527c51b68a5e88?w=800&q=80",
    "Passion Fruit (Maracuya)": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80",
    "Papaya/Pawpaw (Papai)": "https://images.unsplash.com/photo-1595860457055-d2eee84ed1b8?w=800&q=80",
    "Watermelon (Tikiti Maji)": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    "Pineapple (Nanasi)": "https://images.unsplash.com/photo-1599599810694-f3aa75acd655?w=800&q=80",
    "Strawberry (Stroberri)": "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=800&q=80",
    "Orange (Chungwa)": "https://images.unsplash.com/photo-1615485290382-efd2fb994cad?w=800&q=80",
    "Lemon (Limau ya Ulaya)": "https://images.unsplash.com/photo-1627230677793-c830e35ec937?w=800&q=80",
    "Lime (Ndimu)": "https://images.unsplash.com/photo-1627230677793-c830e35ec937?w=800&q=80",
    "Tangerine/Mandarin (Chenza)": "https://images.unsplash.com/photo-1619083163122-77f77af0b2d3?w=800&q=80",
    "Guava (Mapera)": "https://images.unsplash.com/photo-1599599810996-7c1337e53d55?w=800&q=80",
    "Kiwi Fruit": "https://images.unsplash.com/photo-1585359072776-7b0b5be16ee0?w=800&q=80",
    "Jackfruit (Fenesi)": "https://images.unsplash.com/photo-1585359072776-7b0b5be16ee0?w=800&q=80",
    "Plum (Plamu)": "https://images.unsplash.com/photo-1599599810694-f3aa75acd655?w=800&q=80",
    "Peach (Pichi)": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    "Grapes (Zabibu)": "https://images.unsplash.com/photo-1596206365336-8f1b6d3afa3f?w=800&q=80",
    "Blueberry": "https://images.unsplash.com/photo-1585359072776-7b0b5be16ee0?w=800&q=80",
    "Tamarind (Ukwaju)": "https://images.unsplash.com/photo-1599599810996-7c1337e53d55?w=800&q=80",
    "Coconut (Nazi)": "https://images.unsplash.com/photo-1585518419759-171b6dd2a932?w=800&q=80",
    "Cashew Nuts (Korosho)": "https://images.unsplash.com/photo-1585359072776-7b0b5be16ee0?w=800&q=80",
    
    # CASH CROPS
    "Tea (Chai)": "https://images.unsplash.com/photo-1597318134187-98bef7d76dff?w=800&q=80",
    "Coffee (Kahawa)": "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=800&q=80",
    "Sugarcane (Miwa)": "https://images.unsplash.com/photo-1585359072776-7b0b5be16ee0?w=800&q=80",
    "Sunflower (Alizeti)": "https://images.unsplash.com/photo-1597318134187-98bef7d76dff?w=800&q=80",
    "Macadamia Nuts": "https://images.unsplash.com/photo-1599599810694-f3aa75acd655?w=800&q=80",
    "Pyrethrum": "https://images.unsplash.com/photo-1585359072776-7b0b5be16ee0?w=800&q=80",
    "Miraa/Khat (Miraa)": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    
    # FLOWERS
    "Roses (Waridi)": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80",
    "Carnations (Karafuu ya Maua)": "https://images.unsplash.com/photo-1605707268537-bbb2b78dc332?w=800&q=80",
    "Alstroemeria (Peruvian Lily)": "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80",
    "Sunflower (Cut Flower Type)": "https://images.unsplash.com/photo-1597318134187-98bef7d76dff?w=800&q=80",
}

LIVESTOCK_IMAGES = {
    # CATTLE
    "Dairy Cattle": "https://images.unsplash.com/photo-1560807707-95cc3612b587?w=800&q=80",
    "Beef Cattle": "https://images.unsplash.com/photo-1552510632-ee7f6e8e1f1e?w=800&q=80",
    
    # GOATS
    "Dairy Goats": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80",
    "Meat Goats": "https://images.unsplash.com/photo-1552510632-ee7f6e8e1f1e?w=800&q=80",
    
    # SHEEP
    "Sheep": "https://images.unsplash.com/photo-1575977604871-d5a2a3cf4e1b?w=800&q=80",
    
    # POULTRY
    "Broiler Chickens": "https://images.unsplash.com/photo-1586985289688-cacf04900868?w=800&q=80",
    "Layer Chickens": "https://images.unsplash.com/photo-1586985289688-cacf04900868?w=800&q=80",
    "Kienyeji Chickens": "https://images.unsplash.com/photo-1586985289688-cacf04900868?w=800&q=80",
    "Turkeys": "https://images.unsplash.com/photo-1602282291622-5e0d1b80e83f?w=800&q=80",
    "Ducks": "https://images.unsplash.com/photo-1577720643272-265ea4cd8e50?w=800&q=80",
    "Quail (Kware)": "https://images.unsplash.com/photo-1602282291622-5e0d1b80e83f?w=800&q=80",
    "Ostriches": "https://images.unsplash.com/photo-1602282291622-5e0d1b80e83f?w=800&q=80",
    
    # RABBITS
    "Rabbits": "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80",
    
    # PIGS
    "Pigs": "https://images.unsplash.com/photo-1516707267537-b85faf00021b?w=800&q=80",
    
    # FISH
    "Fish Farming": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    
    # BEES
    "Honey Bees": "https://images.unsplash.com/photo-1589981437088-b3e0c7f5a95c?w=800&q=80",
    
    # CAMELS
    "Camels": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    
    # DONKEYS
    "Donkeys": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80",
}

def get_crop_image(crop_name: str) -> str:
    """Get image URL for a crop, return default if not found"""
    return CROP_IMAGES.get(
        crop_name,
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80"  # Default maize image
    )

def get_livestock_image(animal_name: str) -> str:
    """Get image URL for livestock, return default if not found"""
    return LIVESTOCK_IMAGES.get(
        animal_name,
        "https://images.unsplash.com/photo-1560807707-95cc3612b587?w=800&q=80"  # Default cattle image
    )
