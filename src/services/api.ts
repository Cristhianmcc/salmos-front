const API_BASE_URL = 'http://localhost:5000/api';

export interface Artist {
    name: string;
}

export interface Thumbnail {
    url: string;
    width?: number;
    height?: number;
}

export interface Song {
    videoId: string;
    title: string;
    artists: Artist[];
    thumbnails: Thumbnail[];
    duration?: string;
    album?: string;
}

export interface StreamResponse {
    videoId: string;
    streamUrl?: string;
    embedUrl?: string;
    method: string;
    title?: string;
    duration?: number;
}

export interface Album {
    browseId: string;
    title: string;
    artists: Artist[];
    thumbnails: Thumbnail[];
    year?: string;
}

export interface ArtistData {
    browseId: string;
    name: string;
    thumbnails: Thumbnail[];
}

export const musicApi = {
    search: async (
        query: string,
        type: 'songs' | 'albums' | 'artists' | 'playlists' = 'songs',
        limit: number = 20
    ): Promise<Song[] | Album[] | ArtistData[]> => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    },

    getStreamUrl: async (videoId: string): Promise<StreamResponse | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stream/${videoId}`);

            if (!response.ok) {
                throw new Error(`Stream failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Stream error:', error);
            return null;
        }
    },

    getSong: async (videoId: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/song/${videoId}`);

            if (!response.ok) {
                throw new Error(`Get song failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get song error:', error);
            return null;
        }
    },

    getArtist: async (browseId: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/artist/${browseId}`);

            if (!response.ok) {
                throw new Error(`Get artist failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get artist error:', error);
            return null;
        }
    },

    getAlbum: async (browseId: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/album/${browseId}`);

            if (!response.ok) {
                throw new Error(`Get album failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get album error:', error);
            return null;
        }
    },

    getPlaylist: async (playlistId: string, limit: number = 100): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/playlist/${playlistId}?limit=${limit}`);

            if (!response.ok) {
                throw new Error(`Get playlist failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get playlist error:', error);
            return null;
        }
    },

    getCharts: async (country: string = 'US'): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE_URL}/charts?country=${country}`);

            if (!response.ok) {
                throw new Error(`Get charts failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get charts error:', error);
            return [];
        }
    },

    searchCover: async (query: string): Promise<any> => {
        try {
            console.log(`🎨 [API] Fetching cover for: "${query}"`);
            const url = `${API_BASE_URL}/cover/search?q=${encodeURIComponent(query)}`;
            console.log(`🌐 [API] URL: ${url}`);

            const response = await fetch(url);

            console.log(`📡 [API] Cover response status: ${response.status}`);

            if (!response.ok) {
                console.warn(`⚠️ [API] Cover not OK: ${response.status}`);
                return null;
            }

            const data = await response.json();
            console.log(`✅ [API] Cover data received:`, data);
            return data;
        } catch (error) {
            console.error('❌ [API] Search cover error:', error);
            return null;
        }
    },

    searchLyrics: async (artist: string, title: string, videoId?: string): Promise<any> => {
        try {
            console.log(`🎤 [API] Fetching lyrics for: "${artist} - ${title}" (VideoID: ${videoId})`);
            let url = `${API_BASE_URL}/lyrics/search?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`;
            if (videoId) {
                url += `&videoId=${videoId}`;
            }
            console.log(`🌐 [API] URL: ${url}`);

            const response = await fetch(url);

            console.log(`📡 [API] Lyrics response status: ${response.status}`);

            if (!response.ok) {
                console.warn(`⚠️ [API] Lyrics not OK: ${response.status}`);
                return null;
            }

            const data = await response.json();
            console.log(`✅ [API] Lyrics data received (${data.lyrics?.length || 0} chars) from ${data.source}`);
            return data;
        } catch (error) {
            console.error('❌ [API] Search lyrics error:', error);
            return null;
        }
    },
};

export const storage = {
    getHistory: (): Song[] => {
        const history = localStorage.getItem('musicHistory');
        return history ? JSON.parse(history) : [];
    },

    saveToHistory: (song: Song): void => {
        let history = storage.getHistory();
        history = history.filter(s => s.videoId !== song.videoId);
        history.unshift({
            ...song,
            playedAt: new Date().toISOString()
        } as any);

        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        localStorage.setItem('musicHistory', JSON.stringify(history));
    },

    getLikedSongs: (): Song[] => {
        const liked = localStorage.getItem('likedSongs');
        return liked ? JSON.parse(liked) : [];
    },

    toggleLike: (song: Song): boolean => {
        let liked = storage.getLikedSongs();
        const index = liked.findIndex(s => s.videoId === song.videoId);

        if (index > -1) {
            liked.splice(index, 1);
            localStorage.setItem('likedSongs', JSON.stringify(liked));
            return false;
        } else {
            liked.unshift({
                ...song,
                likedAt: new Date().toISOString()
            } as any);
            localStorage.setItem('likedSongs', JSON.stringify(liked));
            return true;
        }
    },

    isLiked: (videoId: string): boolean => {
        const liked = storage.getLikedSongs();
        return liked.some(s => s.videoId === videoId);
    },
};
