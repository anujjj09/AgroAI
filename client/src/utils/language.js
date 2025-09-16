import { API } from './api';

export const updateUserLanguage = async (language) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await API.post('/api/user/language', 
      { language },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data.success) {
      // Update user data in localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        user.language = language;
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }

    return response.data;
  } catch (error) {
    console.error('Error updating language:', error);
    throw error;
  }
};