// Mock Data Service - Replace with real API calls in production
export interface Location {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  facilities: string[];
  capacity: number;
  images: string[];
  videos: string[];
}

export interface Package {
  id: string;
  name: string;
  type: 'birthday' | 'kitty' | 'corporate' | 'family' | 'team-building';
  price: number;
  duration: number; // in minutes
  includes: string[];
  themes?: string[];
  images: string[];
  videos: string[];
  ageGroup?: string;
  maxGuests: number;
  description: string;
}

export interface Theme {
  id: string;
  name: string;
  category: 'birthday' | 'kitty' | 'corporate';
  images: string[];
  videos: string[];
  decorationItems: string[];
  price: number;
}

export interface Pricing {
  id: string;
  category: string;
  timeSlots: {
    slot: string;
    price: number;
    duration: number;
  }[];
  ageGroups: {
    group: string;
    price: number;
  }[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  category: 'birthday' | 'kitty' | 'corporate' | 'facility' | 'general';
  title: string;
  description?: string;
}

class DataService {  private locations: Location[] = [
    {
      id: 'amb1',
      name: 'SkyJumper Ambernath',
      city: 'Ambernath',
      address: 'Mall Road, Ambernath East, Maharashtra 421501',
      phone: '+91 8882288001',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'Party Rooms', 'Cafe'],
      capacity: 150,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample1',
        'https://www.youtube.com/watch?v=sample2'
      ]
    },
    {
      id: 'amr1',
      name: 'SkyJumper Amritsar',
      city: 'Amritsar',
      address: 'Mall Road, Near Golden Temple, Amritsar, Punjab 143001',
      phone: '+91 8882288003',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'Party Rooms', 'Cafe', 'Air Bag'],
      capacity: 120,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample4'
      ]
    },
    {
      id: 'blr1',
      name: 'SkyJumper Bangalore',
      city: 'Bangalore',
      address: 'Brigade Road, Bangalore, Karnataka 560025',
      phone: '+91 8882288004',
      facilities: ['Mega Trampoline Arena', 'Professional Foam Pit', 'Basketball Zone', 'Battle Beam', 'VIP Party Rooms', 'Gourmet Cafe', 'Ninja Course'],
      capacity: 180,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample5'
      ]
    },
    {
      id: 'bat1',
      name: 'SkyJumper Bathinda',
      city: 'Bathinda',
      address: 'Ghanta Ghar Chowk, Bathinda, Punjab 151001',
      phone: '+91 8882288005',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Party Rooms', 'Cafe'],
      capacity: 100,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample6'
      ]
    },
    {
      id: 'che1',
      name: 'SkyJumper Chennai',
      city: 'Chennai',
      address: 'Express Avenue Mall, Chennai, Tamil Nadu 600002',
      phone: '+91 8882288006',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'VIP Party Rooms', 'Cafe', 'Air Bag'],
      capacity: 160,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample7'
      ]
    },
    {
      id: 'chd1',
      name: 'SkyJumper Chandigarh',
      city: 'Chandigarh',
      address: 'Sector 17, Chandigarh 160017',
      phone: '+91 8882288007',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Battle Beam', 'Party Rooms', 'Cafe'],
      capacity: 140,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample8'
      ]
    },
    {
      id: 'del1',
      name: 'SkyJumper Delhi',
      city: 'Delhi',
      address: 'Connaught Place, New Delhi, Delhi 110001',
      phone: '+91 8882288002',
      facilities: ['Mega Trampoline Arena', 'Professional Foam Pit', 'Basketball Zone', 'Battle Beam', 'VIP Party Rooms', 'Gourmet Cafe'],
      capacity: 200,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample3'
      ]
    },
    {
      id: 'far1',
      name: 'SkyJumper Faridabad',
      city: 'Faridabad',
      address: 'Crown Plaza Mall, Faridabad, Haryana 121001',
      phone: '+91 8882288008',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'Party Rooms', 'Cafe'],
      capacity: 130,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample9'
      ]
    },
    {
      id: 'ghz1',
      name: 'SkyJumper Ghaziabad',
      city: 'Ghaziabad',
      address: 'Pacific Mall, Ghaziabad, Uttar Pradesh 201001',
      phone: '+91 8882288009',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Battle Beam', 'Party Rooms', 'Cafe'],
      capacity: 135,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample10'
      ]
    },
    {
      id: 'gur1',
      name: 'SkyJumper Gurugram ILD',
      city: 'Gurugram',
      address: 'ILD Trade Centre, Sector 47, Gurugram, Haryana 122018',
      phone: '+91 8882288010',
      facilities: ['Mega Trampoline Arena', 'Professional Foam Pit', 'Basketball Zone', 'Ninja Course', 'VIP Party Rooms', 'Gourmet Cafe'],
      capacity: 175,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample11'
      ]
    },
    {
      id: 'gur2',
      name: 'SkyJumper Gurugram M3M Broadway',
      city: 'Gurugram',
      address: 'M3M Broadway, Sector 71, Gurugram, Haryana 122001',
      phone: '+91 8882288011',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'Battle Beam', 'Party Rooms', 'Cafe'],
      capacity: 155,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample12'
      ]
    },
    {
      id: 'gur3',
      name: 'SkyJumper Gurugram Ocus Medley',
      city: 'Gurugram',
      address: 'Ocus Medley, Sector 52, Gurugram, Haryana 122003',
      phone: '+91 8882288012',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Air Bag', 'Party Rooms', 'Cafe'],
      capacity: 145,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample13'
      ]
    },
    {
      id: 'jal1',
      name: 'SkyJumper Jalandhar',
      city: 'Jalandhar',
      address: 'MBD Neopolis Mall, Jalandhar, Punjab 144001',
      phone: '+91 8882288013',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'Party Rooms', 'Cafe'],
      capacity: 125,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample14'
      ]
    },
    {
      id: 'kar1',
      name: 'SkyJumper Karnal',
      city: 'Karnal',
      address: 'Fun City Mall, Karnal, Haryana 132001',
      phone: '+91 8882288014',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Party Rooms', 'Cafe'],
      capacity: 110,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample15'
      ]
    },
    {
      id: 'lko1',
      name: 'SkyJumper Lucknow',
      city: 'Lucknow',
      address: 'Phoenix United Mall, Lucknow, Uttar Pradesh 226010',
      phone: '+91 8882288015',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Battle Beam', 'VIP Party Rooms', 'Cafe'],
      capacity: 165,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample16'
      ]
    },
    {
      id: 'noi1',
      name: 'SkyJumper Noida Go Bananas',
      city: 'Noida',
      address: 'Gardens Galleria Mall, Sector 38A, Noida, Uttar Pradesh 201301',
      phone: '+91 8882288016',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'Air Bag', 'Party Rooms', 'Cafe'],
      capacity: 150,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample17'
      ]
    },
    {
      id: 'noi2',
      name: 'SkyJumper Noida Spectrum',
      city: 'Noida',
      address: 'Spectrum Mall, Sector 75, Noida, Uttar Pradesh 201307',
      phone: '+91 8882288017',
      facilities: ['Mega Trampoline Arena', 'Professional Foam Pit', 'Basketball Zone', 'Ninja Course', 'VIP Party Rooms', 'Gourmet Cafe'],
      capacity: 190,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample18'
      ]
    },
    {
      id: 'noi3',
      name: 'SkyJumper Noida Wave',
      city: 'Noida',
      address: 'Wave Mall, Sector 18, Noida, Uttar Pradesh 201301',
      phone: '+91 8882288018',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Battle Beam', 'Party Rooms', 'Cafe'],
      capacity: 140,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample19'
      ]
    },
    {
      id: 'pun1',
      name: 'SkyJumper Pune Amanora',
      city: 'Pune',
      address: 'Amanora Town Centre, Hadapsar, Pune, Maharashtra 411028',
      phone: '+91 8882288019',
      facilities: ['Trampoline Arena', 'Foam Pit', 'Basketball Zone', 'Dodgeball Court', 'Air Bag', 'VIP Party Rooms', 'Cafe'],
      capacity: 170,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample20'
      ]
    },
    {
      id: 'pun2',
      name: 'SkyJumper Pune Creaticity',
      city: 'Pune',
      address: 'Creaticity Mall, Yerawada, Pune, Maharashtra 411006',
      phone: '+91 8882288020',
      facilities: ['Mega Trampoline Arena', 'Professional Foam Pit', 'Basketball Zone', 'Ninja Course', 'Battle Beam', 'VIP Party Rooms', 'Gourmet Cafe'],
      capacity: 185,
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'
      ],
      videos: [
        'https://www.youtube.com/watch?v=sample21'
      ]
    }
  ];

  private packages: Package[] = [
    {
      id: 'bday_basic',
      name: 'Birthday Blast Basic',
      type: 'birthday',
      price: 2999,
      duration: 90,
      includes: [
        '90 minutes trampoline access',
        'Birthday throne decoration',
        'Basic birthday setup',
        'Party host',
        'Birthday certificate',
        'Complimentary juice for birthday child'
      ],
      themes: ['Superhero', 'Princess', 'Unicorn', 'Sports', 'Space Adventure'],
      images: [
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
        'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800'
      ],
      videos: ['https://www.youtube.com/watch?v=birthday1'],
      ageGroup: '3-12 years',
      maxGuests: 15,
      description: 'Perfect starter package for memorable birthday celebrations with basic decorations and fun activities.'
    },
    {
      id: 'bday_premium',
      name: 'Birthday Blast Premium',
      type: 'birthday',
      price: 4999,
      duration: 120,
      includes: [
        '2 hours trampoline access',
        'Premium theme decoration',
        'Professional photography',
        'Dedicated party host',
        'Birthday cake (1kg)',
        'Return gifts for all kids',
        'Birthday certificate',
        'Complimentary meal for birthday child'
      ],
      themes: ['Superhero', 'Princess', 'Unicorn', 'Sports', 'Space Adventure', 'Frozen', 'Cars', 'Avengers'],
      images: [
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
        'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800'
      ],
      videos: ['https://www.youtube.com/watch?v=birthday2'],
      ageGroup: '3-15 years',
      maxGuests: 25,
      description: 'Complete birthday celebration with professional photography, premium decorations, and memorable experiences.'
    },
    {
      id: 'kitty_classic',
      name: 'Kitty Party Classic',
      type: 'kitty',
      price: 3499,
      duration: 150,
      includes: [
        '2.5 hours venue access',
        'Elegant theme setup',
        'Welcome drink',
        'Snacks and refreshments',
        'Music system',
        'Games and activities',
        'Group photography'
      ],
      themes: ['Bollywood Glam', 'Retro Vintage', 'Floral Paradise', 'Ethnic Elegance', 'Modern Chic'],
      images: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
      ],
      videos: ['https://www.youtube.com/watch?v=kitty1'],
      maxGuests: 20,
      description: 'Perfect for ladies gatherings with elegant themes and fun activities.'
    },
    {
      id: 'corporate_team',
      name: 'Corporate Team Building',
      type: 'corporate',
      price: 1299,
      duration: 180,
      includes: [
        '3 hours venue access',
        'Team building activities',
        'Professional facilitator',
        'Lunch/snacks included',
        'Certificate of participation',
        'Group photos',
        'Audio-visual equipment'
      ],
      images: [
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'
      ],
      videos: ['https://www.youtube.com/watch?v=corporate1'],
      maxGuests: 50,
      description: 'Boost team morale with exciting team building activities and challenges.'
    }
  ];

  private themes: Theme[] = [
    {
      id: 'superhero',
      name: 'Superhero Adventure',
      category: 'birthday',
      images: [
        'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800'
      ],
      videos: ['https://www.youtube.com/watch?v=superhero1'],
      decorationItems: ['Superhero banners', 'Action figure cutouts', 'Cape for birthday child', 'Power symbol balloons'],
      price: 999
    },
    {
      id: 'princess',
      name: 'Princess Castle',
      category: 'birthday',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      videos: ['https://www.youtube.com/watch?v=princess1'],
      decorationItems: ['Castle backdrop', 'Crown for birthday child', 'Princess dress option', 'Pink and gold balloons'],
      price: 1299
    },
    {
      id: 'bollywood',
      name: 'Bollywood Glam',
      category: 'kitty',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      videos: ['https://www.youtube.com/watch?v=bollywood1'],
      decorationItems: ['Bollywood posters', 'Golden drapes', 'Photo booth props', 'Marigold decorations'],
      price: 1599
    }
  ];

  private pricing: Pricing[] = [
    {
      id: 'weekday',
      category: 'Weekday Pricing',
      timeSlots: [
        { slot: '10:00 AM - 12:00 PM', price: 299, duration: 120 },
        { slot: '12:00 PM - 2:00 PM', price: 399, duration: 120 },
        { slot: '2:00 PM - 4:00 PM', price: 499, duration: 120 },
        { slot: '4:00 PM - 6:00 PM', price: 599, duration: 120 },
        { slot: '6:00 PM - 8:00 PM', price: 699, duration: 120 }
      ],
      ageGroups: [
        { group: 'Kids (3-12 years)', price: 299 },
        { group: 'Teens (13-17 years)', price: 399 },
        { group: 'Adults (18+ years)', price: 499 }
      ]
    },
    {
      id: 'weekend',
      category: 'Weekend Pricing',
      timeSlots: [
        { slot: '10:00 AM - 12:00 PM', price: 399, duration: 120 },
        { slot: '12:00 PM - 2:00 PM', price: 499, duration: 120 },
        { slot: '2:00 PM - 4:00 PM', price: 599, duration: 120 },
        { slot: '4:00 PM - 6:00 PM', price: 699, duration: 120 },
        { slot: '6:00 PM - 8:00 PM', price: 799, duration: 120 }
      ],
      ageGroups: [
        { group: 'Kids (3-12 years)', price: 399 },
        { group: 'Teens (13-17 years)', price: 499 },
        { group: 'Adults (18+ years)', price: 599 }
      ]
    }
  ];

  private mediaLibrary: MediaItem[] = [
    {
      id: 'img1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      category: 'birthday',
      title: 'Birthday Party Setup',
      description: 'Colorful birthday decoration with balloons and cake'
    },
    {
      id: 'vid1',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=sample_birthday',
      category: 'birthday',
      title: 'Birthday Party Highlights',
      description: 'Fun moments from a birthday celebration'
    },
    {
      id: 'img2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      category: 'kitty',
      title: 'Kitty Party Elegance',
      description: 'Elegant setup for ladies kitty party'
    }
  ];

  // Simulate API calls with async functions
  async getLocations(): Promise<Location[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.locations;
  }

  async getLocationById(id: string): Promise<Location | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.locations.find(loc => loc.id === id) || null;
  }

  async getPackages(eventType?: Package['type']): Promise<Package[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (eventType) {
      return this.packages.filter(pkg => pkg.type === eventType);
    }
    return this.packages;
  }

  async getPackageById(id: string): Promise<Package | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.packages.find(pkg => pkg.id === id) || null;
  }

  async getThemes(category?: Theme['category']): Promise<Theme[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (category) {
      return this.themes.filter(theme => theme.category === category);
    }
    return this.themes;
  }

  async getPricing(): Promise<Pricing[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.pricing;
  }

  async getMediaLibrary(category?: MediaItem['category']): Promise<MediaItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (category) {
      return this.mediaLibrary.filter(media => media.category === category);
    }
    return this.mediaLibrary;
  }

  // Method to get current offers/promotions
  async getCurrentOffers(): Promise<{
    id: string;
    title: string;
    description: string;
    discount: number;
    validUntil: string;
    applicable: string[];
  }[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      {
        id: 'offer1',
        title: 'Early Bird Special',
        description: 'Book 7 days in advance and get 20% off on birthday packages',
        discount: 20,
        validUntil: '2025-12-31',
        applicable: ['birthday']
      },
      {
        id: 'offer2',
        title: 'Group Discount',
        description: 'Book for 20+ guests and get 15% off',
        discount: 15,
        validUntil: '2025-12-31',
        applicable: ['birthday', 'corporate', 'kitty']
      }
    ];
  }

  // Method to format all data for AI context
  async getFormattedDataForAI(): Promise<string> {
    const [locations, packages, themes, pricing, offers, media] = await Promise.all([
      this.getLocations(),
      this.getPackages(),
      this.getThemes(),
      this.getPricing(),
      this.getCurrentOffers(),
      this.getMediaLibrary()
    ]);

    return `
SKYJUMPER LOCATIONS:
${locations.map(loc => `
• ${loc.name} (${loc.city})
  Address: ${loc.address}
  Phone: ${loc.phone}
  Capacity: ${loc.capacity} guests
  Facilities: ${loc.facilities.join(', ')}
  Images: ${loc.images.length} available
  Videos: ${loc.videos.length} available
`).join('')}

PARTY PACKAGES:
${packages.map(pkg => `
• ${pkg.name} (${pkg.type.toUpperCase()})
  Price: ₹${pkg.price} | Duration: ${pkg.duration} minutes
  Max Guests: ${pkg.maxGuests}
  Includes: ${pkg.includes.join(', ')}
  ${pkg.themes ? `Available Themes: ${pkg.themes.join(', ')}` : ''}
  ${pkg.ageGroup ? `Age Group: ${pkg.ageGroup}` : ''}
  Description: ${pkg.description}
`).join('')}

THEMES AVAILABLE:
${themes.map(theme => `
• ${theme.name} (${theme.category})
  Price: ₹${theme.price}
  Includes: ${theme.decorationItems.join(', ')}
`).join('')}

PRICING STRUCTURE:
${pricing.map(p => `
${p.category}:
${p.timeSlots.map(slot => `  ${slot.slot}: ₹${slot.price}`).join('\n')}
Age Groups: ${p.ageGroups.map(age => `${age.group} - ₹${age.price}`).join(', ')}
`).join('')}

CURRENT OFFERS:
${offers.map(offer => `
• ${offer.title} - ${offer.discount}% OFF
  ${offer.description}
  Valid until: ${offer.validUntil}
  Applicable to: ${offer.applicable.join(', ')} events
`).join('')}

MEDIA LIBRARY:
${media.map(item => `
• ${item.title} (${item.type}) - ${item.category}
  URL: ${item.url}
  ${item.description || ''}
`).join('')}
`;
  }
}

export const dataService = new DataService();
