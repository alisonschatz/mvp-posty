// Serviço de integração com Pexels
const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
const PEXELS_API_BASE = 'https://api.pexels.com/v1';

// Buscar imagens no Pexels
export const searchPexelsImages = async (query, page = 1, perPage = 9) => {
  try {
    if (!PEXELS_API_KEY) {
      console.warn('Chave do Pexels não configurada');
      return { images: [], total: 0, totalPages: 0 };
    }

    const response = await fetch(
      `${PEXELS_API_BASE}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=square`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      images: data.photos.map(photo => ({
        id: `pexels-${photo.id}`,
        urls: {
          thumb: photo.src.small,
          small: photo.src.medium,
          regular: photo.src.large,
          full: photo.src.original
        },
        alt: photo.alt || query,
        user: {
          name: photo.photographer,
          username: photo.photographer,
          profile: photo.photographer_url
        },
        downloadUrl: photo.src.original,
        htmlUrl: photo.url,
        source: 'pexels'
      })),
      total: data.total_results,
      totalPages: Math.ceil(data.total_results / perPage)
    };
  } catch (error) {
    console.error('Erro ao buscar imagens no Pexels:', error);
    return { images: [], total: 0, totalPages: 0 };
  }
};

// Buscar imagens curadas do Pexels
export const getCuratedPexelsImages = async (page = 1, perPage = 9) => {
  try {
    if (!PEXELS_API_KEY) {
      console.warn('Chave do Pexels não configurada');
      return { images: [], total: 0, totalPages: 0 };
    }

    const response = await fetch(
      `${PEXELS_API_BASE}/curated?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      images: data.photos.map(photo => ({
        id: `pexels-${photo.id}`,
        urls: {
          thumb: photo.src.small,
          small: photo.src.medium,
          regular: photo.src.large,
          full: photo.src.original
        },
        alt: photo.alt || 'Curated image',
        user: {
          name: photo.photographer,
          username: photo.photographer,
          profile: photo.photographer_url
        },
        downloadUrl: photo.src.original,
        htmlUrl: photo.url,
        source: 'pexels'
      })),
      total: data.total_results,
      totalPages: Math.ceil(data.total_results / perPage)
    };
  } catch (error) {
    console.error('Erro ao buscar imagens curadas do Pexels:', error);
    return { images: [], total: 0, totalPages: 0 };
  }
};