interface Location {
  name: string;
  address: string;
  facilities: string[];
}

interface Pricing {
  duration: string;
  price: number;
  description: string;
}

class SkyJumperService {
  private locations: Location[] = [
    {
      name: "Ambernath !",
      address: "4th Floor, Master Business Center, Next to Big Cinema, K.B. Road, Ambernath West. Maharashtra",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Amritsar !",
      address: "4th Floor, Mukut House, Mall Road, Amritsar, Punjab",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Bangalore !",
      address: "6th Floor, Garuda Mall, Magrath Rd, Ashok Nagar, Bangaluru, Karnataka",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Bathinda !",
      address: "6th Floor, Garuda Mall, Magrath Rd, Ashok Nagar, Bangaluru, Karnataka",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Chennai !",
      address: "4th Floor, Grand Square Mall, Velachery, Chennai",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Chandigarh !",
      address: "Ground Floor, Block 3, Oxford Street, Ambala Chandigarh Expressway, Zirakpur, Punjab",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Delhi !",
      address: "Inside Adventure Island, Metro Walk Mall, Sector 10, Rohini, New Delhi",
      facilities: ["Trampoline Arena", "Soft Play", "Cafe", "Party Hall"]
    },
    {
      name: "Faridabad !",
      address: "Auric Universal Tower, Sector 79, Faridabad, Haryana",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Ghaziabad !",
      address: "4th Floor, Shop No. 1, The Opulent Mall, Grand Trunk Road, Nehru Nagar 3, Ghaziabad, Uttar Pradesh",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Gurugram ILD !",
      address: "ILD Mall, Gurugram",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Gurugram M3M Broadway !",
      address: "M3M Broadway, Sector 65, Gurugram",
      facilities: ["Trampoline Arena", "Laser Tag Arena", "Soft Play", "Sky Verve", "Sky Coaster", "Wall Climbing", "Cafe", "Party Hall"]
    },
    {
      name: "Gurugram Ocus Medley !",
      address: "Ocus Medley, Sector 67, Gurugram",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Jalandhar !",
      address: "G FLOOR, 1ST FLOOR, Near Guru Ravidas Chowk, 120 Feet Road, Guru Teg Bahadur Nagar, Jalandhar, Punjab",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Karnal !",
      address: "Namastey Chawk, Karnal, Near Bank of Baroda, Haryana",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Lucknow !",
      address: "CP-3A, Vikalp Khand, Gomti Nagar, Lucknow, UP",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Noida Go Bananas !",
      address: "2nd Floor, MODI MALL, Sector-25A, Noida, Uttar Pradesh",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Noida Spectrum !",
      address: "Lower Ground Floor Atrium, Spectrum @ Metro Mall, Sector-75, Near Sector 50 Metro Station, Noida, UP",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Noida Wave !",
      address: "WAVE MALL, SECTOR 18, Noida, Gautambuddha Nagar, Uttar Pradesh",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },
    {
      name: "Pune Amanora !",
      address: "Amanora Mall, Malwadi Road, Amanora Park Township, Village Sadesatara Nali, Hadapsar, Pune, Maharashtra",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    },    {
      name: "Pune Creaticity !",
      address: "Level-02, Fountain House, Creaticity Mall, Shastrinagar, Yerawada, Pune, Maharashtra",
      facilities: ["Trampoline Arena", "Soft Play", "Party Hall"]
    }
  ];

  private pricing: Pricing[] = [
    {
      duration: "30 Min ",
      price: 499,
      description: "30 minutes of trampoline park access"
    },
    {
      duration: "60 Min ",
      price: 799,
      description: "60 minutes of trampoline park access"
    },
    {
      duration: "90 Min ",
      price: 999,
      description: "90 minutes of trampoline park access"
    }
  ];

  private safetyGuidelines: string[] = [
    "All jumpers must wear SkyJumper grip socks",
    "No food or drinks allowed on the trampolines",
    "One person per trampoline",
    "No double bouncing",
    "No flips or tricks without supervision",
    "Follow the instructions of our trained staff"
  ];

  getLocations(): Location[] {
    return this.locations;
  }

  getPricing(): Pricing[] {
    return this.pricing;
  }

  getSafetyGuidelines(): string[] {
    return this.safetyGuidelines;
  }

  getLocationByName(name: string): Location | undefined {
    return this.locations.find(loc => 
      loc.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  getPricingByDuration(duration: string): Pricing | undefined {
    return this.pricing.find(price => 
      price.duration.toLowerCase().includes(duration.toLowerCase())
    );
  }

  formatLocationInfo(location: Location): string {
    return `Location: ${location.name}\nAddress: ${location.address}\nFacilities: ${location.facilities.join(", ")}`;
  }

  formatPricingInfo(pricing: Pricing): string {
    return `Duration: ${pricing.duration}\nPrice: ₹${pricing.price}\nDescription: ${pricing.description}`;
  }

  formatSafetyGuidelines(): string {
    return "Safety Guidelines:\n" + this.safetyGuidelines.map((guideline, index) => 
      `${index + 1}. ${guideline}`
    ).join("\n");
  }
}

export const skyjumperService = new SkyJumperService(); 