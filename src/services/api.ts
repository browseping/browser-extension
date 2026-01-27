import toast from 'react-hot-toast';

const BACKEND_URL = process.env.BACKEND_URL;

export interface SignupData {
  username: string;
  password: string;
  email?: string;
  displayName?: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

// Session handling utility
const handleApiResponse = async (response: Response) => {
  const data = await response.json();
 
  if (data.sessionExpired || (response.status === 401 && data.message?.includes('Session'))) {
    toast.error('Session expired. Please login again.', {
      duration: 5000,
      position: 'top-center',
    });
    
    window.dispatchEvent(new CustomEvent('sessionExpired', { 
      detail: { message: data.error || data.message || 'Session expired. Please login again.' }
    }));
  }
  
  return data;
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}, token: string) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const signup = async (data: SignupData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (token: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const fetchFriends = async (token: string) => {
  return await fetchWithAuth(`${BACKEND_URL}/api/friends`, {}, token);
};

export const searchUsers = async (query: string, token: string) => {
  return await fetchWithAuth(`${BACKEND_URL}/api/users/search?username=${encodeURIComponent(query)}`, {}, token);
};

export const getFriendshipStatus = async (userId: string, token: string) => {
  return await fetchWithAuth(`${BACKEND_URL}/api/friends/status?userId=${userId}`, {}, token);
};

export const sendFriendRequest = async (receiverId: string, token: string) => {
  return await fetchWithAuth(`${BACKEND_URL}/api/friends/request`, {
    method: 'POST',
    body: JSON.stringify({ receiverId })
  }, token);
};

export const cancelFriendRequest = async (requestId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/request/${requestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchPendingReceivedRequests = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/requests/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchPendingReceivedRequestsCount = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/requests/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const response = await res.json();
  if (response.success && Array.isArray(response.data)) {
    return { success: true, count: response.data.length };
  }
  return { success: false, count: 0 };
};

export const fetchPendingSentRequests = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/requests/sent`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchIgnoredRequests = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/requests/ignored`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const acceptFriendRequest = async (requestId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/accept/${requestId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const ignoreFriendRequest = async (requestId: string, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/friends/ignore/${requestId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const fetchFriendsWithStatus = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/friends/firends-with-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
};

export const fetchUserProfile = async (username: string, token: string) => {
  return await fetchWithAuth(`${BACKEND_URL}/api/profile/${encodeURIComponent(username)}`, {}, token);
};

export const fetchWeeklyTabUsage = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/analytics/tab-usage/weekly`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export const updatePrivacySettings = async (data: any, token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/profile/privacy`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const flushAnalytics = async (token: string) => {
  const res = await fetch(`${BACKEND_URL}/api/analytics/flush`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

export async function fetchHourlyPresence(token: string, days = 7) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const res = await fetch(
    `${BACKEND_URL}/api/analytics/presence/hourly?days=${days}&timezone=${encodeURIComponent(timezone)}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.json();
}


export async function fetchLeaderboard(token: string, page = 1, limit = 10, month?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(month && { month })
  });
  
  const res = await fetch(`${BACKEND_URL}/api/leaderboard/top?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function fetchUserRank(token: string, month?: string) {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  
  const res = await fetch(`${BACKEND_URL}/api/leaderboard/rank?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export const fetchUserPosition = async (token: string, userId: string) => {
  const res = await fetch(`${BACKEND_URL}/api/leaderboard/user-position?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await res.json();
};

// Conversation APIs
export const getUserConversations = async (token: string) => {
  return await fetchWithAuth(`${BACKEND_URL}/api/conversation`, {}, token);
};

export const getConversationMessages = async (conversationId: string, token: string, limit = 50, cursor?: string, markAsSeen = false) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.append('cursor', cursor);
  if (markAsSeen) params.append('markAsSeen', 'true');

  const response = await fetch(`${BACKEND_URL}/api/conversation/${conversationId}/messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
};

export const sendMessage = async (data: { conversationId?: string, receiverId?: string, content: string }, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/conversation/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return await response.json();
};

export const acceptConversationInvite = async (conversationId: string, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/conversation/${conversationId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
};

export const rejectConversationInvite = async (conversationId: string, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/conversation/${conversationId}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
};

export const startConversation = async (receiverId: string, token: string) => {
  try {
    const conversationsRes = await getUserConversations(token);
    
    if (conversationsRes.success) {
      const existingConv = conversationsRes.data.find((conv: any) => 
        conv.conversation.type === 'DIRECT' && 
        conv.conversation.participants.some((p: any) => p.user.id === receiverId)
      );
      
      if (existingConv) {
        console.log('API: Found existing conversation:', {
          conversationId: existingConv.conversation.id,
          status: existingConv.status
        });
        return {
          success: true,
          conversationId: existingConv.conversation.id,
          exists: true,
          status: existingConv.status
        };
      }
    }

    return {
      success: true,
      conversationId: null,
      exists: false,
      receiverId
    };
  } catch (error) {
    console.error('API: Error checking conversation:', error);
    return {
      success: false,
      error: 'Failed to check existing conversations'
    };
  }
};

export const markConversationAsSeen = async (conversationId: string, token: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/conversation/${conversationId}/mark-seen`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('API: Mark conversation as seen response:', result);
    
    return result;
  } catch (error) {
    console.error('API: Error marking conversation as seen:', error);
    return {
      success: false,
      message: 'Network error occurred'
    };
  }
};

// Notification APIs
export const fetchNotifications = async (token: string, page = 1, limit = 20, unreadOnly = false) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString()
  });

  return await fetchWithAuth(`${BACKEND_URL}/api/notifications?${params}`, {}, token);
};

export const getUnreadNotificationCount = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await response.json();
};

export const markNotificationAsRead = async (notificationId: string, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const markAllNotificationsAsRead = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ markAll: true })
  });
  return await response.json();
};

// Profile update API
export const updateProfile = async (profileData: any, token: string) => {
  const response = await fetch(`${BACKEND_URL}/api/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  return await response.json();
};

// OTP Email Verification APIs
export const requestOTP = async (email: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/otp/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Request OTP error:', error);
    throw error;
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/otp/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

export const checkEmailVerification = async (email: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/otp/check-verification?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('Check email verification error:', error);
    throw error;
  }
};

// Forgot Password APIs
export const requestForgotPasswordOTP = async (identifier: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/forgot-password/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Request forgot password OTP error:', error);
    throw error;
  }
};

export const verifyForgotPasswordOTP = async (identifier: string, otp: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/forgot-password/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, otp }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    throw error;
  }
};

export const resetPassword = async (identifier: string, newPassword: string, confirmPassword: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/forgot-password/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, newPassword, confirmPassword }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};