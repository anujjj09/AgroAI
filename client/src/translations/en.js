export const en = {
  // Navigation
  nav: {
    home: "Home",
    chat: "AI Chat",
    pestDetection: "Pest Detection", 
    profile: "Profile",
    logout: "Logout",
    dashboard: "AgroAI Dashboard",
    brand: "AgroAI Punjab"
  },
  
  // Common buttons and actions
  common: {
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    upload: "Upload",
    send: "Send",
    clear: "Clear",
    loading: "Loading...",
    error: "Error",
    success: "Success"
  },
  
  // Authentication
  auth: {
    login: "Login",
    signup: "Sign Up",
    phoneNumber: "Phone Number",
    otp: "Enter OTP",
    verifyOtp: "Verify OTP",
    sendOtp: "Send OTP",
    name: "Full Name",
    district: "Select District",
    language: "Preferred Language",
    loginSuccess: "Login successful!",
    otpSent: "OTP sent to your phone",
    invalidOtp: "Invalid OTP. Please try again.",
    selectDistrict: "Please select your district",
    enterName: "Please enter your name",
    enterPhone: "Please enter phone number",
    guestLogin: "Continue as Guest"
  },
  
  // Home page
  home: {
    welcome: "Welcome to AgroAI",
    subtitle: "Your AI-powered farming assistant for Punjab agriculture",
    getStarted: "Get Started",
    features: "Features",
    aiChat: "AI Agricultural Chat",
    aiChatDesc: "Get expert farming advice powered by AI",
    pestDetection: "Smart Pest Detection",
    pestDetectionDesc: "Identify crop pests using image analysis",
    weatherInfo: "Weather Information",
    weatherInfoDesc: "Real-time weather updates for farming"
  },
  
  // Chat interface
  chat: {
    title: "AI Agriculture Assistant",
    placeholder: "Ask me anything about farming, crops, pests, weather...",
    send: "Send",
    loading: "AI is thinking...",
    quickQuestions: "Quick Questions",
    examples: [
      "How to grow wheat in Punjab?",
      "What fertilizer should I use for rice?",
      "How to control pests in cotton?",
      "Best time to plant sugarcane?"
    ],
    inputHint: "Press Enter to send, Shift+Enter for new line"
  },
  
  // Pest Detection
  pestDetection: {
    title: "Pest Detection",
    uploadImage: "Upload Crop Image",
    analyzing: "Analyzing image...",
    results: "Analysis Results",
    pestName: "Pest/Disease",
    confidence: "Confidence",
    severity: "Severity",
    description: "Description",
    treatment: "Treatment",
    symptoms: "Symptoms",
    noResults: "No pests detected",
    uploadError: "Error uploading image",
    takePhoto: "Take Photo",
    chooseGallery: "Choose from Gallery",
    clear: "Clear",
    analyzeImage: "Analyze Image",
    captureHint: "Upload crop images for accurate AI-powered pest identification with bounding box visualization",
    detectionResult: "Detection Result",
    match: "Match",
    keySymptoms: "Key Symptoms",
    recommendedTreatment: "Recommended Treatment",
    cropAffected: "Crop Affected",
    season: "Season",
    // YOLOv8 specific
    selectImage: "Select an image to analyze",
    dragDrop: "Supports JPEG, PNG • Max size: 10MB",
    runDetection: "Run Pest Detection",
    processing: "Processing image...",
    detectionComplete: "Detection Complete",
    pestsFound: "Pests Found",
    noPestsDetected: "No pests detected in this image. Your crop appears healthy!",
    confidenceScore: "Confidence Score",
    boundingBoxes: "Detected Objects",
    serverError: "Unable to connect to server. Please check if the backend is running.",
    imageError: "Please select an image first",
    simulationMode: "Running in simulation mode"
  },

  // Market
  market: {
    title: "Market Prices",
    lastUpdated: "Last updated",
    loading: "Loading market data...",
    categories: {
      grains: "Grains",
      vegetables: "Vegetables", 
      fruits: "Fruits"
    },
    perQuintal: "per quintal",
    marketTips: "Market Tips",
    tips: {
      bestTime: {
        title: "Best Market Time",
        desc: "Morning hours (6-10 AM) typically offer better prices in agricultural markets."
      },
      quality: {
        title: "Quality Matters", 
        desc: "Grade A quality can fetch 15-25% higher prices than regular produce."
      },
      transportation: {
        title: "Transportation",
        desc: "Consider nearby mandis to reduce transportation costs and increase profits."
      },
      seasonal: {
        title: "Seasonal Planning",
        desc: "Plan your crops based on seasonal demand patterns for maximum returns."
      }
    }
  },
  
  // Profile
  profile: {
    title: "User Profile",
    personalInfo: "Personal Information",
    farmingInfo: "Farming Information",
    preferences: "Preferences",
    crops: "Crops Grown",
    experience: "Farming Experience",
    beginner: "Beginner",
    intermediate: "Intermediate", 
    advanced: "Advanced",
    updateProfile: "Update Profile",
    profileUpdated: "Profile updated successfully"
  },
  
  // Districts
  districts: {
    ludhiana: "Ludhiana",
    amritsar: "Amritsar",
    jalandhar: "Jalandhar",
    patiala: "Patiala",
    bathinda: "Bathinda",
    mohali: "Mohali",
    hoshiarpur: "Hoshiarpur",
    kapurthala: "Kapurthala",
    firozpur: "Firozpur",
    faridkot: "Faridkot"
  },
  
  // Languages
  languages: {
    en: "English",
    hi: "Hindi", 
    pa: "Punjabi"
  },
  
  // Crops
  crops: {
    wheat: "Wheat",
    rice: "Rice", 
    cotton: "Cotton",
    sugarcane: "Sugarcane",
    maize: "Maize",
    potato: "Potato",
    onion: "Onion",
    tomato: "Tomato"
  },
  
  // Weather
  weather: {
    title: "Weather Information",
    current: "Current Weather", 
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    forecast: "5-Day Forecast",
    today: "Today",
    tomorrow: "Tomorrow",
    loading: "Loading weather data...",
    error: "Failed to load weather",
    retry: "Retry",
    refresh: "Refresh",
    sunny: "Sunny",
    cloudy: "Cloudy", 
    partlyCloudy: "Partly Cloudy",
    lightRain: "Light Rain",
    rain: "Rain",
    agriculture: "Agricultural Advisory",
    soilMoisture: "Soil Moisture",
    recommendation: "Recommendation", 
    alerts: "Alerts",
    good: "Good",
    excellent: "Excellent",
    conditions: "conditions",
    days: {
      wed: "Wed",
      thu: "Thu", 
      fri: "Fri"
    },
    messages: {
      excellentConditions: "Excellent conditions for rice harvesting. Prepare for wheat sowing season. Monitor for pest activity due to humidity.",
      moderateConditions: "Moderate conditions for farming. Monitor weather changes closely.",
      monsoonEnding: "Monsoon ending - prepare for post-monsoon crops",
      idealWheatTime: "Ideal time for wheat field preparation",
      highHumidity: "High humidity may increase pest activity",
      normalHumidity: "Normal humidity levels - good for crops",
      hotWeather: "Hot weather - ensure adequate irrigation",
      idealTemperature: "Ideal temperature for crop growth",
      checkSoilMoisture: "Check soil moisture levels regularly"
    },
    moderate: "Moderate",
    cold: "Cold"
  }
};