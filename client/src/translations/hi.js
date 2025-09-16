export const hi = {
  // Navigation
  nav: {
    home: "होम",
    chat: "एआई चैट",
    pestDetection: "कीट पहचान",
    profile: "प्रोफाइल", 
    logout: "लॉग आउट",
    dashboard: "एग्रो एआई डैशबोर्ड",
    brand: "एग्रो एआई पंजाब"
  },
  
  // Common buttons and actions
  common: {
    submit: "जमा करें",
    cancel: "रद्द करें", 
    save: "सेव करें",
    edit: "संपादित करें",
    delete: "मिटाएं",
    upload: "अपलोड करें",
    send: "भेजें",
    clear: "साफ़ करें",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता"
  },
  
  // Authentication
  auth: {
    login: "लॉगिन",
    signup: "साइन अप",
    phoneNumber: "फोन नंबर",
    otp: "ओटीपी दर्ज करें",
    verifyOtp: "ओटीपी सत्यापित करें",
    sendOtp: "ओटीपी भेजें",
    name: "पूरा नाम",
    district: "जिला चुनें",
    language: "पसंदीदा भाषा",
    loginSuccess: "लॉगिन सफल!",
    otpSent: "आपके फोन पर ओटीपी भेजा गया",
    invalidOtp: "गलत ओटीपी। कृपया पुनः प्रयास करें।",
    selectDistrict: "कृपया अपना जिला चुनें",
    enterName: "कृपया अपना नाम दर्ज करें",
    enterPhone: "कृपया फोन नंबर दर्ज करें",
    guestLogin: "अतिथि के रूप में जारी रखें"
  },
  
  // Home page
  home: {
    welcome: "एग्रो एआई में आपका स्वागत है",
    subtitle: "पंजाब कृषि के लिए आपका एआई-संचालित कृषि सहायक",
    getStarted: "शुरू करें",
    features: "सुविधाएं",
    aiChat: "एआई कृषि चैट",
    aiChatDesc: "एआई द्वारा संचालित विशेषज्ञ कृषि सलाह प्राप्त करें",
    pestDetection: "स्मार्ट कीट पहचान",
    pestDetectionDesc: "छवि विश्लेषण का उपयोग करके फसल कीटों की पहचान करें",
    weatherInfo: "मौसम की जानकारी",
    weatherInfoDesc: "कृषि के लिए रियल-टाइम मौसम अपडेट"
  },
  
  // Chat interface  
  chat: {
    title: "एआई कृषि सहायक",
    placeholder: "खेती, फसलों, कीटों, मौसम के बारे में कुछ भी पूछें...",
    send: "भेजें",
    loading: "एआई सोच रहा है...",
    quickQuestions: "त्वरित प्रश्न",
    examples: [
      "पंजाब में गेहूं कैसे उगाएं?",
      "चावल के लिए कौन सी खाद का उपयोग करना चाहिए?",
      "कपास में कीटों को कैसे नियंत्रित करें?",
      "गन्ना बोने का सबसे अच्छा समय?"
    ],
    inputHint: "भेजने के लिए Enter दबाएं, नई लाइन के लिए Shift+Enter"
  },
  
  // Pest Detection
  pestDetection: {
    title: "कीट पहचान",
    uploadImage: "फसल की छवि अपलोड करें",
    analyzing: "छवि का विश्लेषण हो रहा है...",
    results: "विश्लेषण परिणाम",
    pestName: "कीट/रोग",
    confidence: "विश्वास",
    severity: "गंभीरता",
    description: "विवरण",
    treatment: "उपचार", 
    symptoms: "लक्षण",
    noResults: "कोई कीट नहीं मिला",
    uploadError: "छवि अपलोड करने में त्रुटि",
    takePhoto: "फोटो लें",
    chooseGallery: "गैलरी से चुनें",
    clear: "साफ करें",
    analyzeImage: "छवि का विश्लेषण करें",
        captureHint: "अपनी फसल के पत्ते, तने या प्रभावित क्षेत्रों को कैप्चर करें",
    detectionResult: "पहचान परिणाम",
    match: "मेल",
    keySymptoms: "मुख्य लक्षण",
    recommendedTreatment: "अनुशंसित उपचार",
    cropAffected: "प्रभावित फसल",
    season: "मौसम"
  },

  // Market
  market: {
    title: "बाजार दरें",
    lastUpdated: "अंतिम अपडेट",
    loading: "बाजार डेटा लोड हो रहा है...",
    categories: {
      grains: "अनाज",
      vegetables: "सब्जियां",
      fruits: "फल"
    },
    perQuintal: "प्रति क्विंटल",
    marketTips: "बाजार सुझाव",
    tips: {
      bestTime: {
        title: "सबसे अच्छा बाजार समय",
        desc: "सुबह के घंटे (6-10 बजे) आमतौर पर कृषि बाजारों में बेहतर कीमतें देते हैं।"
      },
      quality: {
        title: "गुणवत्ता मायने रखती है",
        desc: "ग्रेड A गुणवत्ता नियमित उत्पादन से 15-25% अधिक कीमत दिला सकती है।"
      },
      transportation: {
        title: "परिवहन",
        desc: "परिवहन लागत कम करने और लाभ बढ़ाने के लिए निकटवर्ती मंडियों पर विचार करें।"
      },
      seasonal: {
        title: "मौसमी योजना",
        desc: "अधिकतम रिटर्न के लिए मौसमी मांग पैटर्न के आधार पर अपनी फसलों की योजना बनाएं।"
      }
    }
  },
  
  // Profile
  profile: {
    title: "उपयोगकर्ता प्रोफाइल",
    personalInfo: "व्यक्तिगत जानकारी",
    farmingInfo: "कृषि जानकारी", 
    preferences: "प्राथमिकताएं",
    crops: "उगाई जाने वाली फसलें",
    experience: "कृषि अनुभव",
    beginner: "शुरुआती",
    intermediate: "मध्यम",
    advanced: "उन्नत",
    updateProfile: "प्रोफाइल अपडेट करें",
    profileUpdated: "प्रोफाइल सफलतापूर्वक अपडेट किया गया"
  },
  
  // Districts
  districts: {
    ludhiana: "लुधियाना",
    amritsar: "अमृतसर",
    jalandhar: "जालंधर", 
    patiala: "पटियाला",
    bathinda: "बठिंडा",
    mohali: "मोहाली",
    hoshiarpur: "होशियारपुर",
    kapurthala: "कपूरथला",
    firozpur: "फिरोजपुर",
    faridkot: "फरीदकोट"
  },
  
  // Languages
  languages: {
    en: "अंग्रेजी",
    hi: "हिंदी",
    pa: "पंजाबी"
  },
  
  // Crops
  crops: {
    wheat: "गेहूं",
    rice: "चावल",
    cotton: "कपास", 
    sugarcane: "गन्ना",
    maize: "मक्का",
    potato: "आलू",
    onion: "प्याज",
    tomato: "टमाटर"
  },
  
  // Weather
  weather: {
    title: "मौसम की जानकारी",
    current: "वर्तमान मौसम",
    temperature: "तापमान",
    humidity: "नमी",
    windSpeed: "हवा की गति",
    forecast: "5-दिन का पूर्वानुमान",
    today: "आज",
    tomorrow: "कल",
    loading: "मौसम डेटा लोड हो रहा है...",
    error: "मौसम लोड करने में विफल",
    retry: "पुनः प्रयास करें",
    refresh: "रिफ्रेश करें",
    sunny: "धूप",
    cloudy: "बादलों से भरा",
    partlyCloudy: "आंशिक बादल",
    lightRain: "हल्की बारिश",
    rain: "बारिश",
    agriculture: "कृषि सलाह",
    soilMoisture: "मिट्टी की नमी",
    recommendation: "सिफारिश",
    alerts: "चेतावनी",
    good: "अच्छा",
    excellent: "उत्कृष्ट",
    conditions: "स्थितियां",
    days: {
      wed: "बुध",
      thu: "गुरु", 
      fri: "शुक्र"
    },
    messages: {
      excellentConditions: "चावल की कटाई के लिए उत्कृष्ट स्थितियां। गेहूं की बुआई के मौसम की तैयारी करें। नमी के कारण कीट गतिविधि पर नज़र रखें।",
      moderateConditions: "खेती के लिए सामान्य स्थितियां। मौसम के बदलाव पर नज़र रखें।",
      monsoonEnding: "मानसून समाप्त हो रहा है - मानसून के बाद की फसलों की तैयारी करें",
      idealWheatTime: "गेहूं की खेत तैयारी का आदर्श समय",
      highHumidity: "अधिक नमी कीट गतिविधि बढ़ा सकती है",
      normalHumidity: "सामान्य नमी का स्तर - फसलों के लिए अच्छा",
      hotWeather: "गर्म मौसम - पर्याप्त सिंचाई सुनिश्चित करें",
      idealTemperature: "फसल की वृद्धि के लिए आदर्श तापमान",
      checkSoilMoisture: "मिट्टी की नमी का नियमित रूप से जांच करें"
    },
    moderate: "सामान्य",
    cold: "ठंडा"
  }
};