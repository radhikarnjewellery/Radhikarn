import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Order } from '../models/Order';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rk_jewellery';

const categories = [
  { name: "Bridal Masterpieces", image: "https://images.unsplash.com/photo-1515562141207-7a18b5ce7142?auto=format&fit=crop&q=80&w=800" },
  { name: "Eternal Rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800" },
  { name: "Royal Necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800" },
  { name: "Divine Earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800" }
];

// Curated jewelry photography IDs from Unsplash for variety
const jewelryPhotoIds = [
  "1605100804763-247f67b3557e", "1535632066927-ab7c9ab60908", "1599643478518-a784e5dc4c8f", "1611591439978-147b4e33440e",
  "1616110862037-77562c6afeBB", "1515562141207-7a18b5ce7142", "1543294001-f7cd5d7fb516", "1603561591411-0e7320b97d16",
  "1588444833072-a892b3b44e73", "1598560917505-5e736a2f4da1", "1610664805721-a36526715fbc", "1599643477127-ec110a17f66a",
  "1619119067079-c0209c47336d", "1630014135081-35b133857e53", "1601121141461-9d6647bca1ed", "1573408133714-b82b1ef74175",
  "1596944924614-afb37e9b245a", "1589128777213-950f427cd744", "1627259068052-f4358a970974", "1584370848010-1736ca508bb0",
  "1611085510594-7b8c00bb99bb", "1598463239906-6ee141d65427", "1629854744439-d5fc5bf3f8e5", "1632734135323-c40848386f7c",
  "1635767794354-93339596350f", "1603974372039-0550270a48ec", "1628144566640-10a40237957c", "1603561591411-0e7320b97d16",
  "1633182800450-48b449f84bc1", "1633519842416-8344e4a0670d", "1617038220319-276d3ac54bc6", "1611403166923-d6c7388d6722",
  "1617038262763-da9b0717282b", "1630014135081-35b133857e53", "1596944924614-afb37e9b245a", "1588444833072-a892b3b44e73",
  "1628144566640-10a40237957c", "1603561591411-0e7320b97d16", "1515562141207-7a18b5ce7142", "1535632066927-ab7c9ab60908",
  "1611591439978-147b4e33440e", "1605100804763-247f67b3557e", "1573408133714-b82b1ef74175", "1599643477127-ec110a17f66a",
  "1635767794354-93339596350f", "1599643480397-bf97cc3e8981", "1535632066927-ab7c9ab60908", "1611085510594-7b8c00bb99bb",
  "1598463239906-6ee141d65427", "1603561591411-0e7320b97d16", "1617038260840-7e616223297a", "1598560917505-5e736a2f4da1",
  "1617038262763-da9b0717282b", "1633182800450-48b449f84bc1", "1603974415444-24f46995079a", "1601121141461-9d6647bca1ed",
  "1616110862037-77562c6afeBB", "1626497746473-897db67468c4", "1588444833072-a892b3b44e73", "1605100804763-247f67b3557e",
  "1632734135323-c40848386f7c", "1635767793031-7bd3320f7797", "1627259068052-f4358a970974", "1599643480397-bf97cc3e8981"
];

const generateProducts = () => {
  const result: any[] = [];
  const descriptors = ["Royal", "Eternal", "Imperial", "Grand", "Divine", "Mystic", "Celestial", "Golden", "Majestic", "Regal"];
  const names = ["Elegance", "Masterpiece", "Signature", "Heritage", "Symphony", "Crest", "Vault", "Legacy", "Radiance", "Brilliance"];
  
  let currentPhotoIdx = 0;

  categories.forEach(cat => {
    for (let i = 1; i <= 15; i++) {
      const desc = descriptors[Math.floor(Math.random() * descriptors.length)];
      const namePart = names[Math.floor(Math.random() * names.length)];
      const fullName = `${desc} ${cat.name.replace("Masterpieces", "").replace("s", "")} ${namePart} #${i}`;
      
      const price = Math.floor(Math.random() * 400000) + 50000;
      const originalPrice = price + Math.floor(Math.random() * 50000);
      
      const photoId = jewelryPhotoIds[currentPhotoIdx % jewelryPhotoIds.length];
      const nextPhotoId = jewelryPhotoIds[(currentPhotoIdx + 1) % jewelryPhotoIds.length];
      currentPhotoIdx++;

      result.push({
        name: fullName,
        description: `A unique and high-definition creation from our ${cat.name} collection, showcasing impeccable craftsmanship and rare materials. Piece number ${i} in the ${desc} series.`,
        price: price,
        originalPrice: originalPrice,
        category: cat.name,
        images: [
          `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=800`,
          `https://images.unsplash.com/photo-${nextPhotoId}?auto=format&fit=crop&q=80&w=800`
        ],
        coverImage: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=800`,
        stock: Math.floor(Math.random() * 15) + 1,
        isNew: Math.random() > 0.5,
        isPopular: Math.random() > 0.4,
        ratings: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
        reviews: Math.floor(Math.random() * 50)
      });
    }
  });

  return result;
};

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✨ Connected to MongoDB for bulk seeding');

    // Clear existing data (but keep Users/Admin)
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data (Categories, Products, Orders)');

    // Seed Categories
    const savedCategories = await Category.insertMany(categories);
    console.log(`✅ Seeded ${savedCategories.length} Categories`);

    // Generate and Seed Products
    const bulkProducts = generateProducts();
    const savedProducts = await Product.insertMany(bulkProducts);
    console.log(`✅ Seeded ${savedProducts.length} unique Jewelry Masterpieces`);

    // Seed Orders (25 mock orders for rich daily stats)
    const year = new Date().getFullYear();
    const yearSuffix = year.toString().slice(-2);
    const usedOrderIds = new Set<string>();
    
    const mockOrders = Array.from({ length: 25 }).map((_, i) => {
      const randomProduct = savedProducts[Math.floor(Math.random() * savedProducts.length)];
      
      // Random date within last 7 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      // Generate unique order ID: RK + last 2 digits of year + 6 random digits
      let orderId = '';
      let attempts = 0;
      do {
        const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
        orderId = `RK${yearSuffix}${randomDigits}`;
        attempts++;
      } while (usedOrderIds.has(orderId) && attempts < 100);
      
      usedOrderIds.add(orderId);

      return {
        orderId,
        customerName: ["Aarav Sharma", "Priya Patel", "Rohan Gupta", "Meera Reddy", "Vikram Singh", "Ananya Verma", "Siddharth Das", "Ishani Kapoor", "Aditya Jha", "Kavya Nair"][i % 10],
        customerEmail: `client${i}@exclusive.com`,
        customerPhone: `+91 98765432${i.toString().padStart(2, '0')}`,
        address: `${100 + i}, Royal Enclave, City Hall, Jaipur`,
        items: [{
          productId: randomProduct._id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity: 1,
          image: randomProduct.images[0]
        }],
        totalAmount: randomProduct.price,
        status: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'][Math.floor(Math.random() * 4)],
        paymentStatus: Math.random() > 0.2 ? 'PAID' : 'UNPAID',
        createdAt: date
      };
    });

    await Order.insertMany(mockOrders);
    console.log(`✅ Seeded 10 Mock Orders`);

    // Update Category counts
    for (const cat of savedCategories) {
      const productCount = await Product.countDocuments({ category: cat.name });
      await Category.findByIdAndUpdate(cat._id, { count: productCount });
    }
    console.log('📊 Updated Category counts');

    console.log('🌟 Bulk Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
