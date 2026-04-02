export interface Product {
  id: string;
  name: string;
  category: "Rings" | "Chains" | "Bracelets" | "Earrings" | "Necklaces";
  price: number;
  description: string;
  images: string[];
  rating: number;
  popularity: number;
  isNew: boolean;
  isPopular: boolean;
  originalPrice: number;
  stock: number;
}

const generateMockProducts = (): Product[] => {
  const categories = ["Rings", "Chains", "Bracelets", "Earrings", "Necklaces"] as const;
  const materials = ["18k Gold", "Rose Gold", "White Gold", "Platinum"];
  const gems = ["Diamond", "Emerald", "Sapphire", "Ruby", "Onyx"];
  
  const products: Product[] = [];
  let idCounter = 1;

  for (let i = 0; i < 24; i++) {
    const category = categories[i % categories.length];
    const material = materials[i % materials.length];
    const gem = gems[i % gems.length];
    
    // Using direct Unsplash IDs for guaranteed high-quality jewelry shots
    const imageSets = {
      Rings: [
        "https://images.unsplash.com/photo-1605100804763-247f67b2548e",
        "https://images.unsplash.com/photo-1629135313132-7213454924a1",
        "https://images.unsplash.com/photo-1622398476015-51d8b9ba170a",
        "https://images.unsplash.com/photo-1627280389308-410e53a35db4"
      ],
      Chains: [
        "https://images.unsplash.com/photo-1599643477874-5c366b5abfa3",
        "https://images.unsplash.com/photo-1611085583191-a3b1a6a9b40f",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a"
      ],
      Bracelets: [
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
        "https://images.unsplash.com/photo-1573408301145-b98c4af05b8e",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
        "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed"
      ],
      Earrings: [
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
        "https://images.unsplash.com/photo-1635767798638-3e252824364c",
        "https://images.unsplash.com/photo-1588444650733-d076780c4414",
        "https://images.unsplash.com/photo-163001901962a-095c0668f636"
      ],
      Necklaces: [
        "https://images.unsplash.com/photo-1599643478514-4a4e03164a2b",
        "https://images.unsplash.com/photo-1511253819057-5408d4d98c1a",
        "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed",
        "https://images.unsplash.com/photo-1599643477874-5c366b5abfa3"
      ]
    };

    products.push({
      id: `prod_${idCounter++}`,
      name: `${material} ${gem} ${category.slice(0, -1)}`,
      category,
      price: Math.floor(Math.random() * 4500) + 500,
      description: `Premium ${material} ${category.slice(0, -1)} handcrafted with a magnificent ${gem}.`,
      images: [
        `${imageSets[category][i % 4]}?w=1000&q=90`,
        `${imageSets[category][(i + 1) % 4]}?w=1000&q=90`
      ],
      rating: (Math.random() * 1.5 + 3.5),
      popularity: Math.floor(Math.random() * 1000),
      isNew: i < 6,
      isPopular: i % 5 === 0,
      originalPrice: Math.floor((Math.random() * 4500 + 500) * 1.3),
      stock: 10
    });
  }

  return products;
};

export const products = generateMockProducts();
