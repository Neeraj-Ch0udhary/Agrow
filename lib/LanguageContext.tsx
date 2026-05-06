import { createContext, ReactNode, useContext, useState } from 'react';

type Language = 'en' | 'hi';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const translations: Record<string, Record<Language, string>> = {
  // Home Screen
  tagline:          { en: 'From land to marketplace', hi: 'ज़मीन से बाज़ार तक' },
  namaste:          { en: 'Namaste, Kisan! 👋', hi: 'नमस्ते, किसान! 👋' },
  welcomeText:      { en: 'Discover modern farming techniques that earn 3x more than traditional crops.', hi: 'आधुनिक खेती की तकनीकें जानें जो पारंपरिक फसलों से 3 गुना अधिक कमाई करती हैं।' },
  journeyTitle:     { en: 'Your Farming Journey', hi: 'आपकी खेती की यात्रा' },
  myProfile:        { en: '👤 My Profile', hi: '👤 मेरी प्रोफ़ाइल' },

  // Stage Cards
  landTitle:        { en: 'Land Assessment', hi: 'भूमि मूल्यांकन' },
  landDesc:         { en: 'Find the best crop for your land & budget', hi: 'अपनी ज़मीन और बजट के लिए सबसे अच्छी फसल खोजें' },
  learnTitle:       { en: 'Learn & Plan', hi: 'सीखें और योजना बनाएं' },
  learnDesc:        { en: 'Step-by-step guides for modern farming', hi: 'आधुनिक खेती के लिए चरण-दर-चरण मार्गदर्शिका' },
  growTitle:        { en: 'Grow', hi: 'उगाएं' },
  growDesc:         { en: 'Daily support while your crop is growing', hi: 'फसल उगाते समय रोज़ाना सहायता' },
  sellTitle:        { en: 'Sell', hi: 'बेचें' },
  sellDesc:         { en: 'Connect with buyers, get the best price', hi: 'खरीदारों से जुड़ें, सबसे अच्छा दाम पाएं' },
  mandiTitle:       { en: 'Mandi Prices', hi: 'मंडी भाव' },
  mandiDesc:        { en: 'Live crop prices from mandis across India', hi: 'भारत की मंडियों से लाइव फसल भाव' },

  // Common
  back:             { en: '← Back', hi: '← वापस' },
  loading:          { en: 'Loading...', hi: 'लोड हो रहा है...' },

  // Land Screen
  question:         { en: 'Question', hi: 'प्रश्न' },
  of:               { en: 'of', hi: 'में से' },
  bestCrop:         { en: 'Best crop for you', hi: 'आपके लिए सबसे अच्छी फसल' },
  tryAgain:         { en: '🔄 Try Again', hi: '🔄 फिर से प्रयास करें' },
  learnHow:         { en: '📚 Learn How to Grow', hi: '📚 उगाना सीखें' },

  // Profile Screen
  yourDetails:      { en: 'Your Details', hi: 'आपकी जानकारी' },
  phone:            { en: '📱 Phone', hi: '📱 फोन' },
  state:            { en: '📍 State', hi: '📍 राज्य' },
  email:            { en: '✉️ Email', hi: '✉️ ईमेल' },
  notAdded:         { en: 'Not added', hi: 'नहीं जोड़ा' },
  farmingJourney:   { en: 'Your Farming Journey', hi: 'आपकी खेती की यात्रा' },
  currentCrop:      { en: 'Current Crop', hi: 'वर्तमान फसल' },
  noCrop:           { en: 'No crop selected yet', hi: 'अभी कोई फसल नहीं चुनी' },
  takeAssessment:   { en: 'Take Land Assessment →', hi: 'भूमि मूल्यांकन करें →' },
  guidesRead:       { en: 'Guides Read', hi: 'गाइड पढ़े' },
  daysFarming:      { en: 'Days Farming', hi: 'खेती के दिन' },
  estIncome:        { en: 'Est. Income', hi: 'अनुमानित आय' },
  logout:           { en: '🚪 Logout', hi: '🚪 लॉग आउट' },
  logoutConfirm:    { en: 'Are you sure you want to logout?', hi: 'क्या आप वाकई लॉग आउट करना चाहते हैं?' },
  cancel:           { en: 'Cancel', hi: 'रद्द करें' },

  // Mandi Screen
  mandiPrices:      { en: '📈 Mandi Prices', hi: '📈 मंडी भाव' },
  pullRefresh:      { en: 'Pull down to refresh prices', hi: 'भाव ताज़ा करने के लिए नीचे खींचें' },
  topGainer:        { en: '🔼 Top Gainer', hi: '🔼 सबसे ज़्यादा बढ़ा' },
  topLoser:         { en: '🔽 Top Loser', hi: '🔽 सबसे ज़्यादा गिरा' },
  searchCrop:       { en: 'Search crop or state...', hi: 'फसल या राज्य खोजें...' },

  // Learn Screen
  cropGuides:       { en: '📚 Crop Guides', hi: '📚 फसल गाइड' },
  cropGuidesSub:    { en: 'Step-by-step guides for high-profit modern crops', hi: 'अधिक मुनाफे वाली आधुनिक फसलों की चरण-दर-चरण मार्गदर्शिका' },
  readyIn:          { en: '⏱ Ready in', hi: '⏱ तैयार होगी' },
  investment:       { en: '💰 Investment', hi: '💰 निवेश' },
  howToStart:       { en: 'How to start:', hi: 'कैसे शुरू करें:' },

  // Grow Screen
  growScreen:       { en: '🌱 Grow', hi: '🌱 उगाएं' },
  growSub:          { en: 'Your daily farming support and task guide', hi: 'आपकी रोज़ाना खेती सहायता और कार्य मार्गदर्शिका' },
  proTip:           { en: '💡 Pro Tip', hi: '💡 सुझाव' },
  proTipText:       { en: 'Complete your Land Assessment first to get a personalized growing plan.', hi: 'व्यक्तिगत खेती योजना पाने के लिए पहले भूमि मूल्यांकन करें।' },
  timeline:         { en: 'General Farming Timeline', hi: 'सामान्य खेती समयरेखा' },

  // Sell Screen
  marketplace:      { en: '🏪 Marketplace', hi: '🏪 बाज़ार' },
  marketplaceSub:   { en: 'Find buyers and sell at the best price', hi: 'खरीदार खोजें और सबसे अच्छा दाम पाएं' },
  comingSoon:       { en: '🚀 Live Marketplace — Coming Soon', hi: '🚀 लाइव बाज़ार — जल्द आ रहा है' },
  whoToSell:        { en: 'Who to sell to right now', hi: 'अभी किसे बेचें' },
  theyWant:         { en: 'They want: ', hi: 'वे चाहते हैं: ' },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    return translations[key]?.[language] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);