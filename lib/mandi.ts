const API_KEY = '579b464db66ec23bdd0000018b5f742d4e854a596ee56a4086e52d6a';
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export type MandiPrice = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
};

export type MandiResponse = {
  records: MandiPrice[];
  total: number;
};

export const fetchMandiPrices = async (
  state: string = 'Haryana',
  commodity: string = '',
  limit: number = 50
): Promise<MandiResponse> => {
  try {
    // Use lowercase field IDs as shown in API response
    let url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=${limit}&filters[state]=${encodeURIComponent(state)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;

    console.log('🌾 Fetching URL:', url);
    const response = await fetch(url);
    const data = await response.json();
    console.log('📦 API Response:', JSON.stringify(data).slice(0, 500));
    console.log('📊 Records count:', data.records?.length ?? 0);

    return {
      records: data.records || [],
      total: data.total || 0,
    };
  } catch (e: any) {
    console.log('❌ Mandi API error:', e.message);
    return { records: [], total: 0 };
  }
};