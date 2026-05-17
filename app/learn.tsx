import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';

export const CROPS = [
  {
    id: 'mushroom',
    emoji: '🍄',
    name: 'Oyster Mushrooms',
    profit: '₹8,000–15,000/month',
    time: '45 days',
    investment: '₹3,000',
    difficulty: 'Beginner',
    space: '50 sq ft',
    color: '#7b5ea7',
    bg: '#f3e5f5',
    tagline: 'Grow indoors, earn big — no land needed',
    description: 'Oyster mushrooms are the easiest modern crop to start. They grow in small dark rooms, require minimal investment, and produce harvests every 45 days. Restaurants pay premium prices for fresh supply.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '25–28°C' },
      { icon: '💧', label: 'Humidity', value: '80–90%' },
      { icon: '☀️', label: 'Light', value: 'Indirect / Dark' },
      { icon: '📦', label: 'Space', value: '50+ sq ft' },
    ],
    steps: [
      { title: 'Buy Spawn', desc: 'Purchase oyster mushroom spawn from a local supplier or online. Cost: ₹200–500 per kg.' },
      { title: 'Prepare Substrate', desc: 'Soak rice straw or wheat straw in water for 8–10 hours. Drain and let it cool completely.' },
      { title: 'Fill Bags', desc: 'Alternate layers of straw and spawn in polythene bags. Seal with cotton plugs to allow airflow.' },
      { title: 'Incubation', desc: 'Keep bags in a dark room at 25–28°C for 15–20 days until white mycelium covers the substrate.' },
      { title: 'Fruiting', desc: 'Move bags to a humid area. Mist with water 2–3 times daily. Mushrooms appear in 7–10 days.' },
      { title: 'Harvest', desc: 'Harvest when caps are fully open but before edges curl up. Twist and pull gently.' },
    ],
    buyers: ['Local restaurants', 'Supermarkets', 'Vegetable vendors', 'Hotels', 'Direct consumers'],
    tips: [
      'Sterilize bags properly — contamination is the #1 reason for failure',
      'Maintain humidity with a spray bottle or misting system',
      'One bag can give 2–3 flushes before exhausted',
      'Start with 20–30 bags to earn ₹3,000–5,000 per cycle',
    ],
    profit_breakdown: [
      { label: 'Investment (30 bags)', value: '₹3,000' },
      { label: 'Yield per cycle', value: '15–20 kg' },
      { label: 'Selling price', value: '₹100–150/kg' },
      { label: 'Revenue per cycle', value: '₹1,500–3,000' },
      { label: 'Monthly profit', value: '₹8,000–15,000' },
    ],
  },
  {
    id: 'microgreens',
    emoji: '🌿',
    name: 'Microgreens',
    profit: '₹10,000–20,000/month',
    time: '7–14 days',
    investment: '₹2,000',
    difficulty: 'Beginner',
    space: '30 sq ft',
    color: '#4caf50',
    bg: '#e8f5e9',
    tagline: 'Ready in 10 days — fastest cash crop',
    description: 'Microgreens are young vegetable greens harvested just after sprouting. They are nutrition-dense, sell at ₹300–600/kg, and can be grown on a terrace or balcony. Urban restaurants love them.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '18–24°C' },
      { icon: '💧', label: 'Humidity', value: '50–70%' },
      { icon: '☀️', label: 'Light', value: '4–6 hrs sunlight' },
      { icon: '📦', label: 'Space', value: '30+ sq ft' },
    ],
    steps: [
      { title: 'Choose Seeds', desc: 'Start with sunflower, radish, mustard, or peas. Buy from agri stores. Cost: ₹100–300/kg.' },
      { title: 'Prepare Trays', desc: 'Fill shallow trays (2 inches deep) with coconut coir or potting mix. Moisten the medium.' },
      { title: 'Sow Seeds', desc: 'Spread seeds densely across the tray. Press gently into the medium. Water lightly.' },
      { title: 'Germination', desc: 'Cover with a dome or cloth for 2–3 days in darkness. Seeds sprout within 24–48 hours.' },
      { title: 'Growing', desc: 'Remove cover once sprouts appear. Place in sunlight. Water from the bottom to prevent mold.' },
      { title: 'Harvest', desc: 'Cut with scissors just above soil level when 2–3 inches tall. Pack and deliver same day.' },
    ],
    buyers: ['Restaurants & cafes', 'Juice bars', 'Health food stores', 'Online delivery apps', 'Gyms & fitness centers'],
    tips: [
      'Bottom watering prevents damping-off (mold at soil level)',
      'Blackout period in germination is crucial — use a cardboard cover',
      'Sell fresh — microgreens have 5–7 day shelf life',
      'Sunflower and pea shoots fetch highest prices',
    ],
    profit_breakdown: [
      { label: 'Investment (10 trays)', value: '₹2,000' },
      { label: 'Yield per tray', value: '150–200g' },
      { label: 'Selling price', value: '₹300–600/kg' },
      { label: 'Revenue per cycle', value: '₹500–1,200' },
      { label: 'Monthly profit', value: '₹10,000–20,000' },
    ],
  },
  {
    id: 'stevia',
    emoji: '🌱',
    name: 'Stevia',
    profit: '₹15,000–25,000/month',
    time: '3 months',
    investment: '₹5,000',
    difficulty: 'Intermediate',
    space: '200 sq ft',
    color: '#26a69a',
    bg: '#e0f2f1',
    tagline: 'Natural sweetener — pharma companies buy everything',
    description: 'Stevia is a natural zero-calorie sweetener. Indian pharma and food companies have a massive unmet demand. Once planted, stevia can be harvested multiple times per year for 5+ years.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '15–30°C' },
      { icon: '💧', label: 'Humidity', value: '40–60%' },
      { icon: '☀️', label: 'Light', value: 'Full sun 6+ hrs' },
      { icon: '📦', label: 'Space', value: '200+ sq ft' },
    ],
    steps: [
      { title: 'Buy Saplings', desc: 'Purchase certified stevia saplings from a government nursery or online. Avoid seeds — slow germination.' },
      { title: 'Prepare Soil', desc: 'Stevia needs well-drained sandy loam soil. Add organic compost. pH should be 6.5–7.5.' },
      { title: 'Planting', desc: 'Plant saplings 45cm apart in rows. Water immediately after planting. Mulch to retain moisture.' },
      { title: 'Maintenance', desc: 'Water every 2–3 days. Add organic fertilizer monthly. Remove flowering buds to boost leaf yield.' },
      { title: 'Harvest', desc: 'Harvest just before flowering (when sweetness peaks). Cut 2/3 of plant, leaving base to regrow.' },
      { title: 'Sell', desc: 'Dry leaves in shade, pack, and sell to pharma companies or through cooperatives. Fetch ₹150–200/kg.' },
    ],
    buyers: ['Pharma companies', 'Food manufacturers', 'Cooperative societies', 'Exporters', 'Health food brands'],
    tips: [
      'Contact pharma companies before planting — get a buyback agreement',
      'Avoid waterlogged soil — stevia roots rot easily',
      'One plant produces for 5+ years — long-term income',
      'Shade drying preserves steviol glycoside content (sweetness)',
    ],
    profit_breakdown: [
      { label: 'Investment (200 sq ft)', value: '₹5,000' },
      { label: 'Yield per harvest', value: '8–12 kg dry leaves' },
      { label: 'Selling price', value: '₹150–200/kg' },
      { label: 'Harvests per year', value: '3–4 times' },
      { label: 'Monthly profit', value: '₹15,000–25,000' },
    ],
  },
  {
    id: 'exotic-veg',
    emoji: '🥦',
    name: 'Exotic Vegetables',
    profit: '₹20,000–40,000/month',
    time: '60–90 days',
    investment: '₹10,000',
    difficulty: 'Intermediate',
    space: '500 sq ft',
    color: '#f5a623',
    bg: '#fff3e0',
    tagline: 'Supply restaurants what they can\'t get locally',
    description: 'Broccoli, colored capsicum, zucchini, and cherry tomatoes are in massive demand from urban restaurants. Most cities import these from far away — a local supplier gets premium rates and repeat orders.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '15–25°C' },
      { icon: '💧', label: 'Humidity', value: '50–70%' },
      { icon: '☀️', label: 'Light', value: 'Full sun 8 hrs' },
      { icon: '📦', label: 'Space', value: '500+ sq ft' },
    ],
    steps: [
      { title: 'Choose Crops', desc: 'Pick 2–3 vegetables. Broccoli + colored capsicum is a strong combo. Buy hybrid seeds.' },
      { title: 'Prepare Beds', desc: 'Raised beds with rich compost soil. Add vermicompost for best yield. Test soil pH (6–7).' },
      { title: 'Seedling Stage', desc: 'Sow in seedling trays, transplant at 3–4 weeks. Harden seedlings before field planting.' },
      { title: 'Growing', desc: 'Drip irrigation saves water and prevents disease. Add NPK fertilizer at 30 and 60 days.' },
      { title: 'Pest Control', desc: 'Weekly neem oil spray prevents 80% of pest attacks. Use yellow sticky traps for monitoring.' },
      { title: 'Harvest & Sell', desc: 'Harvest at correct maturity. Grade produce. Deliver directly to restaurants for best price.' },
    ],
    buyers: ['5-star restaurants', 'Hotel chains', 'Modern supermarkets', 'Cloud kitchens', 'Catering companies'],
    tips: [
      'Visit restaurants before growing — understand exactly what they want',
      'Consistent quality and reliable delivery builds long-term contracts',
      'Cold storage extends shelf life by 5–7 days',
      'Colored capsicum fetches 3× the price of regular capsicum',
    ],
    profit_breakdown: [
      { label: 'Investment (500 sq ft)', value: '₹10,000' },
      { label: 'Yield per cycle', value: '80–120 kg' },
      { label: 'Selling price', value: '₹60–120/kg' },
      { label: 'Revenue per cycle', value: '₹7,000–14,000' },
      { label: 'Monthly profit', value: '₹20,000–40,000' },
    ],
  },
  {
    id: 'lemongrass',
    emoji: '🌾',
    name: 'Lemongrass',
    profit: '₹12,000–20,000/month',
    time: '3 months',
    investment: '₹4,000',
    difficulty: 'Beginner',
    space: '300 sq ft',
    color: '#558b2f',
    bg: '#f1f8e9',
    tagline: 'Low maintenance, high demand from oil companies',
    description: 'Lemongrass is a perennial crop that grows back after every harvest. The essential oil extracted from it is in huge demand from cosmetics, pharma, and food companies. Minimal water needed.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '10–35°C' },
      { icon: '💧', label: 'Humidity', value: 'Low — drought tolerant' },
      { icon: '☀️', label: 'Light', value: 'Full sun' },
      { icon: '📦', label: 'Space', value: '300+ sq ft' },
    ],
    steps: [
      { title: 'Get Slips', desc: 'Buy lemongrass slips (stem cuttings) from a nursery. Plant in spring or monsoon.' },
      { title: 'Planting', desc: 'Plant 60cm apart in rows. Water well initially. Mulch to retain moisture.' },
      { title: 'First Growth', desc: 'Minimal care needed. Water every 7–10 days. No major fertilizer needed.' },
      { title: 'First Harvest', desc: 'Cut stalks 10cm above ground at 3 months. The plant regrows automatically.' },
      { title: 'Repeat Harvest', desc: 'Harvest every 3 months. One planting lasts 4–5 years with minimal maintenance.' },
      { title: 'Sell', desc: 'Sell fresh to distilleries, or distill oil yourself for 10× higher value.' },
    ],
    buyers: ['Essential oil distilleries', 'Cosmetic companies', 'Tea companies', 'Food flavoring units', 'Pharma companies'],
    tips: [
      'One-time planting, multiple harvests — best ROI per effort',
      'Distilling oil at home gives 10× more income than selling fresh',
      'Grows on degraded land where nothing else grows well',
      'Government subsidies available for aromatic plant cultivation',
    ],
    profit_breakdown: [
      { label: 'Investment (300 sq ft)', value: '₹4,000' },
      { label: 'Yield per harvest', value: '20–30 kg fresh grass' },
      { label: 'Selling price (fresh)', value: '₹8–12/kg' },
      { label: 'Harvests per year', value: '3–4 times' },
      { label: 'Monthly profit', value: '₹12,000–20,000' },
    ],
  },
  {
    id: 'hydroponics',
    emoji: '💧',
    name: 'Hydroponics',
    profit: '₹30,000–80,000/month',
    time: '60 days',
    investment: '₹25,000',
    difficulty: 'Advanced',
    space: '100 sq ft',
    color: '#1565c0',
    bg: '#e3f2fd',
    tagline: 'Soil-free farming — 3× yield in same space',
    description: 'Hydroponics grows plants in nutrient-rich water without soil. You can grow lettuce, spinach, herbs, and strawberries. 3–4× yield compared to soil farming in the same area.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '18–24°C' },
      { icon: '💧', label: 'Water pH', value: '5.5–6.5' },
      { icon: '☀️', label: 'Light', value: 'LED grow lights / sunlight' },
      { icon: '📦', label: 'Space', value: '100+ sq ft' },
    ],
    steps: [
      { title: 'Setup System', desc: 'Build or buy an NFT (Nutrient Film Technique) or DWC (Deep Water Culture) system. Budget ₹15,000–25,000.' },
      { title: 'Prepare Nutrients', desc: 'Mix hydroponic nutrient solution (A+B formula). Maintain EC 1.5–2.5 and pH 5.5–6.5.' },
      { title: 'Plant Seedlings', desc: 'Place seedlings in net pots with clay pebbles. Roots should touch the nutrient solution.' },
      { title: 'Monitor Daily', desc: 'Check pH and EC daily. Top up water as needed. Ensure pump runs 24/7.' },
      { title: 'Harvest', desc: 'Lettuce and herbs ready in 25–35 days. Harvest outer leaves first for continuous yield.' },
      { title: 'Scale Up', desc: 'Reinvest profits to add more channels. 100 sq ft earns ₹30–50k; 300 sq ft earns ₹1L+.' },
    ],
    buyers: ['Premium supermarkets', '5-star hotels', 'Organic stores', 'Corporate cafeterias', 'Export markets'],
    tips: [
      'Start small — master the system before investing heavily',
      'pH monitoring is critical — wrong pH = nutrient lockout',
      'LED grow lights allow 24/7 growing without sunlight dependence',
      'Lettuce and basil are easiest for beginners',
    ],
    profit_breakdown: [
      { label: 'Setup investment', value: '₹25,000' },
      { label: 'Monthly running cost', value: '₹3,000' },
      { label: 'Yield per month', value: '40–60 kg' },
      { label: 'Selling price', value: '₹150–300/kg' },
      { label: 'Monthly profit', value: '₹30,000–80,000' },
    ],
  },
  {
    id: 'spinach',
    emoji: '🥬',
    name: 'Spinach',
    profit: '₹6,000–8,000/month',
    time: '30 days',
    investment: '₹1,500',
    difficulty: 'Beginner',
    space: '200 sq ft',
    color: '#388e3c',
    bg: '#e8f5e9',
    tagline: 'Fast growing, consistent demand year-round',
    description: 'Spinach is one of the easiest leafy vegetables to grow. Multiple harvests from one planting, consistent demand from households and restaurants, and very low investment make it a great starter crop.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '15–20°C' },
      { icon: '💧', label: 'Humidity', value: '50–70%' },
      { icon: '☀️', label: 'Light', value: '4–6 hrs sunlight' },
      { icon: '📦', label: 'Space', value: '200+ sq ft' },
    ],
    steps: [
      { title: 'Prepare Soil', desc: 'Loosen soil to 6 inches depth. Mix in compost. Spinach prefers slightly alkaline soil (pH 6.5–7).' },
      { title: 'Sow Seeds', desc: 'Sow seeds 1 inch apart in rows 12 inches apart. Cover lightly with soil and water gently.' },
      { title: 'Watering', desc: 'Keep soil consistently moist. Water every 2 days. Avoid waterlogging.' },
      { title: 'Thinning', desc: 'Thin seedlings to 4 inches apart when 2 inches tall. Use thinnings as baby spinach.' },
      { title: 'Fertilize', desc: 'Apply nitrogen-rich fertilizer at 2 weeks. This boosts leaf growth significantly.' },
      { title: 'Harvest', desc: 'Harvest outer leaves when 4–6 inches tall. Plant keeps producing for 6–8 weeks.' },
    ],
    buyers: ['Local vegetable vendors', 'Restaurants', 'Households', 'Juice bars', 'Supermarkets'],
    tips: [
      'Sow new seeds every 2 weeks for continuous supply',
      'Harvest in early morning for best freshness and shelf life',
      'Spinach bolts in heat — grow in winter and spring',
      'Baby spinach sells at 2× the price of mature spinach',
    ],
    profit_breakdown: [
      { label: 'Investment (200 sq ft)', value: '₹1,500' },
      { label: 'Yield per cycle', value: '20–30 kg' },
      { label: 'Selling price', value: '₹20–40/kg' },
      { label: 'Cycles per year', value: '6–8 times' },
      { label: 'Monthly profit', value: '₹6,000–8,000' },
    ],
  },
  {
    id: 'coriander',
    emoji: '🌿',
    name: 'Coriander',
    profit: '₹5,000–6,000/month',
    time: '21 days',
    investment: '₹800',
    difficulty: 'Beginner',
    space: '100 sq ft',
    color: '#43a047',
    bg: '#e8f5e9',
    tagline: 'Fastest herb — restaurants buy daily',
    description: 'Coriander is the most used herb in Indian cooking. It grows incredibly fast, can be cut and regrows, and restaurants and households buy it daily. Very low investment with quick returns.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '17–27°C' },
      { icon: '💧', label: 'Humidity', value: '40–60%' },
      { icon: '☀️', label: 'Light', value: '4–5 hrs sunlight' },
      { icon: '📦', label: 'Space', value: '100+ sq ft' },
    ],
    steps: [
      { title: 'Crush Seeds', desc: 'Gently crush coriander seeds to split them — this speeds up germination.' },
      { title: 'Sow Densely', desc: 'Sow seeds densely across the bed. Cover with thin layer of soil. Water gently.' },
      { title: 'Germination', desc: 'Seeds sprout in 7–10 days. Keep soil moist but not waterlogged.' },
      { title: 'Watering', desc: 'Water every alternate day. Morning watering is best to prevent fungal issues.' },
      { title: 'First Cut', desc: 'Cut when plants are 6 inches tall. Leave 2 inches of stem — it will regrow.' },
      { title: 'Sell Fresh', desc: 'Bundle and sell same day. Restaurants want daily fresh supply at ₹20–40 per bundle.' },
    ],
    buyers: ['Local restaurants', 'Vegetable vendors', 'Households', 'Dhabas', 'Catering services'],
    tips: [
      'Sow a new batch every week for uninterrupted supply',
      'Sell in the morning — freshness is everything for herbs',
      'One 100 sq ft bed gives 3–4 cuts before replanting',
      'Organic coriander fetches 50% higher price in cities',
    ],
    profit_breakdown: [
      { label: 'Investment (100 sq ft)', value: '₹800' },
      { label: 'Yield per cut', value: '5–8 kg' },
      { label: 'Selling price', value: '₹30–50/kg' },
      { label: 'Cuts per cycle', value: '3–4 times' },
      { label: 'Monthly profit', value: '₹5,000–6,000' },
    ],
  },
  {
    id: 'tulsi',
    emoji: '🌱',
    name: 'Tulsi (Holy Basil)',
    profit: '₹8,000–10,000/month',
    time: '60 days',
    investment: '₹2,000',
    difficulty: 'Beginner',
    space: '150 sq ft',
    color: '#00897b',
    bg: '#e0f2f1',
    tagline: 'Sacred herb with massive pharma demand',
    description: 'Tulsi is India\'s most revered medicinal herb. Pharma companies, Ayurvedic brands, and tea companies buy it in huge quantities. It grows back after every cut and lasts for years.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '20–35°C' },
      { icon: '💧', label: 'Humidity', value: '50–70%' },
      { icon: '☀️', label: 'Light', value: 'Full sun 6+ hrs' },
      { icon: '📦', label: 'Space', value: '150+ sq ft' },
    ],
    steps: [
      { title: 'Get Saplings', desc: 'Buy tulsi saplings from a nursery. Ram tulsi and Krishna tulsi are most demanded.' },
      { title: 'Plant', desc: 'Plant 30cm apart in well-drained soil. Water immediately after planting.' },
      { title: 'Pinch Tips', desc: 'Pinch growing tips regularly to make plants bushy and increase leaf yield.' },
      { title: 'Watering', desc: 'Water every 2–3 days. Tulsi is drought-tolerant once established.' },
      { title: 'Harvest', desc: 'Harvest stems with leaves when plant is 12 inches tall. Cut 1/3 of the plant.' },
      { title: 'Dry & Sell', desc: 'Sell fresh to temples and markets, or dry and sell to pharma/tea companies.' },
    ],
    buyers: ['Pharma companies', 'Ayurvedic brands', 'Tea companies', 'Temples', 'Health stores'],
    tips: [
      'Contact Patanjali or local Ayurvedic companies for bulk buying agreements',
      'Fresh tulsi sells to temples daily — reliable local market',
      'Dried tulsi powder fetches 5× the price of fresh leaves',
      'One planting lasts 3–4 years with regular harvesting',
    ],
    profit_breakdown: [
      { label: 'Investment (150 sq ft)', value: '₹2,000' },
      { label: 'Yield per harvest', value: '10–15 kg fresh' },
      { label: 'Selling price', value: '₹30–60/kg' },
      { label: 'Harvests per year', value: '4–5 times' },
      { label: 'Monthly profit', value: '₹8,000–10,000' },
    ],
  },
  {
    id: 'aloe-vera',
    emoji: '🌵',
    name: 'Aloe Vera',
    profit: '₹8,000–9,000/month',
    time: '180 days',
    investment: '₹3,000',
    difficulty: 'Beginner',
    space: '200 sq ft',
    color: '#00695c',
    bg: '#e0f2f1',
    tagline: 'Drought-tolerant — cosmetic companies buy in bulk',
    description: 'Aloe vera requires almost no water and grows in poor soil. Cosmetic, pharma, and food companies buy aloe gel in huge quantities. One planting lasts 5+ years with minimal effort.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '20–35°C' },
      { icon: '💧', label: 'Humidity', value: 'Low — very drought tolerant' },
      { icon: '☀️', label: 'Light', value: 'Full sun' },
      { icon: '📦', label: 'Space', value: '200+ sq ft' },
    ],
    steps: [
      { title: 'Get Pups', desc: 'Buy aloe vera pups (offshoots) from a nursery. Avoid planting from seeds — too slow.' },
      { title: 'Plant in Sandy Soil', desc: 'Plant in well-drained sandy or loamy soil. Add sand if soil is heavy clay.' },
      { title: 'Minimal Watering', desc: 'Water only every 2–3 weeks. Overwatering is the #1 cause of aloe death.' },
      { title: 'No Fertilizer Needed', desc: 'Aloe grows in poor soil. Excessive fertilizer reduces gel quality.' },
      { title: 'Harvest Leaves', desc: 'Cut mature outer leaves at the base after 18 months. Plant keeps producing.' },
      { title: 'Extract & Sell', desc: 'Sell whole leaves or extract gel. Cosmetic companies pay ₹15,000–20,000 per tonne.' },
    ],
    buyers: ['Cosmetic companies', 'Pharma companies', 'Juice manufacturers', 'Ayurvedic brands', 'Exporters'],
    tips: [
      'Find a buyer before planting — cosmetic companies want large volumes',
      'Rajasthan and Gujarat have highest aloe vera demand from companies',
      'Never overwater — aloe rots very easily in waterlogged soil',
      'Aloe gel processing unit multiplies income 10×',
    ],
    profit_breakdown: [
      { label: 'Investment (200 sq ft)', value: '₹3,000' },
      { label: 'Yield per harvest', value: '50–80 kg leaves' },
      { label: 'Selling price', value: '₹5–8/kg' },
      { label: 'Harvests per year', value: '2–3 times' },
      { label: 'Monthly profit', value: '₹8,000–9,000' },
    ],
  },
  {
    id: 'cherry-tomato',
    emoji: '🍅',
    name: 'Cherry Tomato',
    profit: '₹15,000–18,000/month',
    time: '75 days',
    investment: '₹6,000',
    difficulty: 'Intermediate',
    space: '300 sq ft',
    color: '#c62828',
    bg: '#ffebee',
    tagline: 'Premium variety — hotels pay ₹120–180/kg year-round',
    description: 'Cherry tomatoes are a premium variety that fetches 3× the price of regular tomatoes. Hotels, restaurants, and salad bars buy them year-round. Growing in poly-tunnels extends the season significantly.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '20–27°C' },
      { icon: '💧', label: 'Humidity', value: '60–70%' },
      { icon: '☀️', label: 'Light', value: 'Full sun 8 hrs' },
      { icon: '📦', label: 'Space', value: '300+ sq ft' },
    ],
    steps: [
      { title: 'Buy Hybrid Seeds', desc: 'Buy F1 hybrid cherry tomato seeds. Varieties like "Sungold" and "Sweet Million" are popular.' },
      { title: 'Seedling Tray', desc: 'Start seeds in seedling trays with potting mix. Transplant after 3–4 weeks.' },
      { title: 'Prepare Beds', desc: 'Raised beds with compost-rich soil. Add coir peat for water retention. pH 6–6.8.' },
      { title: 'Staking', desc: 'Provide vertical support with bamboo stakes or wire. Cherry tomatoes grow tall.' },
      { title: 'Pruning', desc: 'Remove suckers (side shoots) weekly. This directs energy to fruit production.' },
      { title: 'Harvest', desc: 'Pick clusters when fully colored. Harvest every 2–3 days for best quality and price.' },
    ],
    buyers: ['5-star hotels', 'Restaurants', 'Salad bars', 'Premium supermarkets', 'Online grocery apps'],
    tips: [
      'Grow in poly-tunnels to produce year-round regardless of season',
      'Sell in clusters — presentation adds perceived value',
      'Consistent size and color command the highest prices',
      'Start with 2–3 varieties to find which sells best locally',
    ],
    profit_breakdown: [
      { label: 'Investment (300 sq ft)', value: '₹6,000' },
      { label: 'Yield per cycle', value: '40–60 kg' },
      { label: 'Selling price', value: '₹120–180/kg' },
      { label: 'Revenue per cycle', value: '₹6,000–10,800' },
      { label: 'Monthly profit', value: '₹15,000–18,000' },
    ],
  },
  {
    id: 'ginger',
    emoji: '🫚',
    name: 'Ginger',
    profit: '₹18,000–20,000/month',
    time: '270 days',
    investment: '₹8,000',
    difficulty: 'Intermediate',
    space: '400 sq ft',
    color: '#f9a825',
    bg: '#fffde7',
    tagline: 'High-value spice — massive export demand',
    description: 'Ginger is one of India\'s most exported spices. It fetches ₹80–120/kg and has consistent demand from food companies, exporters, and local markets. One crop per year with high returns.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '20–30°C' },
      { icon: '💧', label: 'Humidity', value: '70–80%' },
      { icon: '☀️', label: 'Light', value: 'Partial shade' },
      { icon: '📦', label: 'Space', value: '400+ sq ft' },
    ],
    steps: [
      { title: 'Select Rhizomes', desc: 'Buy disease-free ginger rhizomes from a certified nursery. Each piece should have 2–3 buds.' },
      { title: 'Prepare Beds', desc: 'Deep loamy soil with compost. Raised beds work best. pH 5.5–6.5.' },
      { title: 'Plant', desc: 'Plant rhizomes 4 inches deep, 8 inches apart. Plant at start of monsoon season.' },
      { title: 'Mulch', desc: 'Apply thick mulch layer to retain moisture and control weeds. Very important for ginger.' },
      { title: 'Irrigation', desc: 'Regular watering during growing season. Reduce drastically before harvest.' },
      { title: 'Harvest', desc: 'Harvest at 8–9 months when leaves turn yellow. Fresh ginger fetches 2× dried ginger.' },
    ],
    buyers: ['Spice exporters', 'Food processing companies', 'Local markets', 'Pickle manufacturers', 'Tea companies'],
    tips: [
      'Fresh ginger fetches much higher prices than dried — sell fresh when possible',
      'Store harvested ginger in sand or sawdust to extend shelf life',
      'Organic ginger commands 40% premium in export markets',
      'Kerala and Karnataka varieties are most preferred by exporters',
    ],
    profit_breakdown: [
      { label: 'Investment (400 sq ft)', value: '₹8,000' },
      { label: 'Yield per crop', value: '60–80 kg' },
      { label: 'Selling price', value: '₹80–120/kg' },
      { label: 'Revenue per crop', value: '₹5,000–9,600' },
      { label: 'Monthly profit (avg)', value: '₹18,000–20,000' },
    ],
  },
  {
    id: 'ashwagandha',
    emoji: '🌿',
    name: 'Ashwagandha',
    profit: '₹20,000–22,000/month',
    time: '180 days',
    investment: '₹5,000',
    difficulty: 'Intermediate',
    space: '300 sq ft',
    color: '#6d4c41',
    bg: '#efebe9',
    tagline: 'Ayurvedic herb with global supplement demand',
    description: 'Ashwagandha is one of the most sought-after Ayurvedic herbs globally. The supplement industry is booming and Indian pharma companies need massive quantities. Grows well in dry conditions.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '20–35°C' },
      { icon: '💧', label: 'Humidity', value: 'Low — drought tolerant' },
      { icon: '☀️', label: 'Light', value: 'Full sun' },
      { icon: '📦', label: 'Space', value: '300+ sq ft' },
    ],
    steps: [
      { title: 'Buy Seeds', desc: 'Purchase certified ashwagandha seeds from a government nursery or Patanjali.' },
      { title: 'Sow in June', desc: 'Sow at start of monsoon. Broadcast seeds and lightly cover with soil.' },
      { title: 'Thin Plants', desc: 'Thin to 20cm spacing after germination. Use thinnings as transplants elsewhere.' },
      { title: 'Minimal Care', desc: 'Ashwagandha is drought-hardy. Water only every 10–14 days after establishment.' },
      { title: 'Harvest Roots', desc: 'Dig roots at 180 days when leaves turn yellow. Wash, cut and dry in shade.' },
      { title: 'Sell Dried Roots', desc: 'Dried roots sell at ₹100–150/kg to pharma companies and traders.' },
    ],
    buyers: ['Pharma companies', 'Ayurvedic manufacturers', 'Herbal exporters', 'Supplement brands', 'Patanjali'],
    tips: [
      'Contact Himalaya Drug Company or Patanjali directly for bulk buying',
      'Grow in sandy or loamy soil — waterlogged soil kills the roots',
      'Ashwagandha powder fetches 3× the price of raw dried roots',
      'Madhya Pradesh and Rajasthan are top production states — buyers are local',
    ],
    profit_breakdown: [
      { label: 'Investment (300 sq ft)', value: '₹5,000' },
      { label: 'Yield per crop', value: '25–35 kg dried roots' },
      { label: 'Selling price', value: '₹100–150/kg' },
      { label: 'Revenue per crop', value: '₹2,500–5,250' },
      { label: 'Monthly profit (avg)', value: '₹20,000–22,000' },
    ],
  },
  {
    id: 'strawberry',
    emoji: '🍓',
    name: 'Strawberry',
    profit: '₹30,000–35,000/month',
    time: '90 days',
    investment: '₹12,000',
    difficulty: 'Intermediate',
    space: '400 sq ft',
    color: '#e53935',
    bg: '#ffebee',
    tagline: 'Premium berry — hotels pay ₹200–400/kg',
    description: 'Strawberries are a premium fruit with very high demand from hotels, restaurants, and online delivery platforms. They can be grown in raised beds or even vertical systems for maximum yield per sq ft.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '15–25°C' },
      { icon: '💧', label: 'Humidity', value: '60–75%' },
      { icon: '☀️', label: 'Light', value: 'Full sun 6–8 hrs' },
      { icon: '📦', label: 'Space', value: '400+ sq ft' },
    ],
    steps: [
      { title: 'Buy Runners', desc: 'Purchase certified strawberry runners from a government horticulture nursery.' },
      { title: 'Raised Beds', desc: 'Create raised beds 12 inches high. Mix compost, cocopeat and soil equally.' },
      { title: 'Drip Irrigation', desc: 'Set up drip irrigation — strawberries need consistent moisture without waterlogging.' },
      { title: 'Mulch with Plastic', desc: 'Cover beds with black plastic mulch. Keeps fruit clean and prevents weeds.' },
      { title: 'Fertilize', desc: 'Apply balanced fertilizer at planting and potassium-rich fertilizer at flowering.' },
      { title: 'Harvest Daily', desc: 'Pick ripe fruits daily. Strawberries go from red to overripe in 24 hours.' },
    ],
    buyers: ['5-star hotels', 'Bakeries', 'Online grocery apps', 'Premium supermarkets', 'Ice cream companies'],
    tips: [
      'October–November planting gives February–March harvest — peak demand season',
      'Package in clamshell boxes — presentation commands premium prices',
      'Vertical growing systems triple yield per sq ft',
      'Sell directly to bakeries — they pay the highest prices',
    ],
    profit_breakdown: [
      { label: 'Investment (400 sq ft)', value: '₹12,000' },
      { label: 'Yield per season', value: '50–80 kg' },
      { label: 'Selling price', value: '₹200–400/kg' },
      { label: 'Revenue per season', value: '₹10,000–32,000' },
      { label: 'Monthly profit', value: '₹30,000–35,000' },
    ],
  },
  {
    id: 'saffron',
    emoji: '🌸',
    name: 'Saffron',
    profit: '₹80,000–1,00,000/month',
    time: '120 days',
    investment: '₹30,000',
    difficulty: 'Advanced',
    space: '100 sq ft',
    color: '#f57f17',
    bg: '#fffde7',
    tagline: 'World\'s most expensive spice — ₹2–3 lakh/kg',
    description: 'Saffron is the most expensive spice in the world at ₹2–3 lakh per kg. It can now be grown indoors in controlled conditions across India. Very high investment but extraordinary returns.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '15–20°C (cooled room)' },
      { icon: '💧', label: 'Humidity', value: '40–50%' },
      { icon: '☀️', label: 'Light', value: 'LED grow lights' },
      { icon: '📦', label: 'Space', value: '100+ sq ft (indoor)' },
    ],
    steps: [
      { title: 'Buy Corms', desc: 'Purchase saffron corms (bulbs) from Kashmir or certified suppliers. Cost: ₹200–300 per corm.' },
      { title: 'Indoor Setup', desc: 'Set up a temperature-controlled room at 15–20°C with LED grow lights.' },
      { title: 'Plant Corms', desc: 'Plant corms 3 inches deep, 4 inches apart in coco peat. Ensure good drainage.' },
      { title: 'Flowering', desc: 'Flowers appear in 6–8 weeks. Each flower has 3 red stigmas — that is the saffron.' },
      { title: 'Harvest Stigmas', desc: 'Pick flowers in early morning. Extract red stigmas with tweezers immediately.' },
      { title: 'Dry & Store', desc: 'Dry stigmas at 40°C for 30 minutes. Store in airtight glass container. Sell at premium.' },
    ],
    buyers: ['Luxury food brands', 'Exporters', 'Spice traders', 'Ayurvedic companies', 'High-end restaurants'],
    tips: [
      'Indoor growing bypasses Kashmir\'s climate restrictions — grow anywhere in India',
      'Even 10 grams of saffron sells for ₹2,000–3,000 — tiny quantities, huge value',
      'Get lab-certified purity test before selling to exporters for best prices',
      'One corm produces for 3–4 years, multiplying into daughter corms',
    ],
    profit_breakdown: [
      { label: 'Investment (100 sq ft)', value: '₹30,000' },
      { label: 'Yield per season', value: '50–100g dried saffron' },
      { label: 'Selling price', value: '₹2,00,000–3,00,000/kg' },
      { label: 'Revenue per season', value: '₹10,000–30,000' },
      { label: 'Monthly profit', value: '₹80,000–1,00,000' },
    ],
  },
  {
    id: 'moringa',
    emoji: '🌳',
    name: 'Moringa (Drumstick)',
    profit: '₹12,000–15,000/month',
    time: '180 days',
    investment: '₹4,000',
    difficulty: 'Beginner',
    space: '500 sq ft',
    color: '#2e7d32',
    bg: '#e8f5e9',
    tagline: 'Superfood with global demand — leaves, pods and powder all sell',
    description: 'Moringa is called the "miracle tree" — every part sells. Leaves, pods, seeds, and powder all have buyers. Export demand for moringa powder is skyrocketing globally. Very easy to grow.',
    requirements: [
      { icon: '🌡️', label: 'Temperature', value: '25–35°C' },
      { icon: '💧', label: 'Humidity', value: 'Low — drought tolerant' },
      { icon: '☀️', label: 'Light', value: 'Full sun' },
      { icon: '📦', label: 'Space', value: '500+ sq ft' },
    ],
    steps: [
      { title: 'Plant Seeds or Cuttings', desc: 'Plant seeds directly or use stem cuttings. Cuttings establish faster.' },
      { title: 'Spacing', desc: 'Plant 3 meters apart for full trees, or 30cm apart for leaf-only dense planting.' },
      { title: 'Watering', desc: 'Water weekly for first month. After that, moringa survives on rain alone.' },
      { title: 'Pruning', desc: 'Keep trees at 1–1.5 meters height for easy leaf harvesting. Prune every 3 months.' },
      { title: 'Harvest Leaves', desc: 'Strip leaves from branches every 3 months. One tree gives 50–100kg leaves/year.' },
      { title: 'Dry & Powder', desc: 'Dry leaves in shade and grind to powder. Powder sells at ₹300–500/kg to exporters.' },
    ],
    buyers: ['Health food exporters', 'Supplement companies', 'Ayurvedic brands', 'Organic food stores', 'Local markets'],
    tips: [
      'Moringa powder export is booming — connect with export agents in your state',
      'Dense planting for leaves gives 10× more yield per acre than tree spacing',
      'Shade drying preserves nutrients — never sun dry moringa leaves',
      'Tamil Nadu and Andhra Pradesh are largest moringa producing states — buyers are local',
    ],
    profit_breakdown: [
      { label: 'Investment (500 sq ft)', value: '₹4,000' },
      { label: 'Leaf yield per harvest', value: '30–50 kg fresh' },
      { label: 'Powder yield', value: '3–5 kg per harvest' },
      { label: 'Powder selling price', value: '₹300–500/kg' },
      { label: 'Monthly profit', value: '₹12,000–15,000' },
    ],
  },
];

export default function LearnScreen() {
  const router = useRouter();
  const { t }  = useTranslation();

  const getDifficultyColor = (d: string) =>
    d === 'Beginner' ? '#1a6b3c' : d === 'Intermediate' ? '#f57f17' : '#c62828';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌱 Learn & Plan</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerSection}>
          <Text style={styles.headerSub}>Tap any crop to see the full guide, profit breakdown and buyer contacts</Text>
        </View>

        {CROPS.map((crop, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.cropCard, { borderLeftColor: crop.color }]}
            onPress={() => router.push({ pathname: '/crop-detail', params: { id: crop.id } })}
            activeOpacity={0.85}>

            <View style={styles.cropHeader}>
              <View style={[styles.emojiBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              </View>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={[styles.cropProfit, { color: crop.color }]}>{crop.profit}</Text>
                <Text style={styles.cropTagline}>{crop.tagline}</Text>
              </View>
            </View>

            <View style={styles.cropStats}>
              <View style={[styles.statBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.statLabel}>⏱ Ready in</Text>
                <Text style={[styles.statValue, { color: crop.color }]}>{crop.time}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.statLabel}>💰 Investment</Text>
                <Text style={[styles.statValue, { color: crop.color }]}>{crop.investment}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: crop.bg }]}>
                <Text style={styles.statLabel}>📐 Space</Text>
                <Text style={[styles.statValue, { color: crop.color }]}>{crop.space}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(crop.difficulty) + '18' }]}>
                <Text style={[styles.diffText, { color: getDifficultyColor(crop.difficulty) }]}>
                  {crop.difficulty}
                </Text>
              </View>
              <Text style={[styles.viewGuide, { color: crop.color }]}>View Full Guide →</Text>
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f0f4f0' },
  header:       { backgroundColor: '#1a6b3c', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText:     { color: '#a8d5b5', fontSize: 15, fontWeight: '600' },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSection:{ paddingHorizontal: 16, paddingVertical: 12 },
  headerSub:    { fontSize: 13, color: '#666', lineHeight: 18 },
  cropCard:     { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 14, borderRadius: 18, padding: 16, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  cropHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  emojiBox:     { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cropEmoji:    { fontSize: 28 },
  cropInfo:     { flex: 1 },
  cropName:     { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 3 },
  cropProfit:   { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  cropTagline:  { fontSize: 11, color: '#888', lineHeight: 15 },
  cropStats:    { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox:      { flex: 1, borderRadius: 10, padding: 8 },
  statLabel:    { fontSize: 9, color: '#888', marginBottom: 3 },
  statValue:    { fontSize: 12, fontWeight: '700' },
  cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffText:     { fontSize: 11, fontWeight: '700' },
  viewGuide:    { fontSize: 12, fontWeight: '700' },
});