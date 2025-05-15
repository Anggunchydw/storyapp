import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  MY_USER_INFO: `${BASE_URL}/users/me`,

  STORY_LIST: `${BASE_URL}/stories`,
  STORE_NEW_REPORT: `${BASE_URL}/stories`,

  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,

  SEND_REPORT_TO_ALL_USER: (reportId) => `${BASE_URL}/stories/${reportId}/notify-all`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  try {
    const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const responseData = await fetchResponse.json();

    return {
      ok: fetchResponse.ok,
      status: fetchResponse.status,
      message: responseData.message || '',
      data: responseData.data || responseData 
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      ok: false,
      message: error.message
    };
  }
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllReports({ page, size, location } = {}) {
  const accessToken = getAccessToken();
  
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (size) params.append('size', size);
  if (location !== undefined) params.append('location', location ? '1' : '0');

  const url = `${BASE_URL}/stories?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    // Format response sesuai dengan API Dicoding
    return {
      ok: !data.error, // API Dicoding menggunakan 'error' property
      message: data.message,
      data: data.listStory || [] // Pastikan selalu mengembalikan array
    };
  } catch (error) {
    console.error('getAllReports error:', error);
    return {
      ok: false,
      message: error.message,
      data: [] // Kembalikan array kosong jika error
    };
  }
}

export async function storeNewReport({
  description,
  photo,
  lat,
  lon
}) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  
  // Tambahkan koordinat hanya jika ada
  if (lat !== undefined) formData.append('lat', lat.toString());
  if (lon !== undefined) formData.append('lon', lon.toString());

  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
        
      },
      body: formData
    });

    const data = await response.json();

    return {
      ok: !data.error, 
      message: data.message,
      data: data
    };
  } catch (error) {
    console.error('storeNewReport error:', error);
    return {
      ok: false,
      message: error.message,
      data: null
    };
  }
}
export async function sendReportToAllUserViaNotification(reportId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_REPORT_TO_ALL_USER(reportId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });
 
  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
 
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
 
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });
 
  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
 
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}


