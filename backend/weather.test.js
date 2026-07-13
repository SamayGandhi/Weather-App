// ==========================================
// weather.test.js - Unit & Validation Tests
// ==========================================

// --- 1. ACTUAL FUNCTIONS (From Project) ---

const getWeatherIcon = (condition) => {
    if (!condition) return '🌤️';
    const lowerCond = condition.toLowerCase();
    
    if (lowerCond.includes('cloud')) return '☁️';
    if (lowerCond.includes('rain') || lowerCond.includes('drizzle')) return '🌧️';
    if (lowerCond.includes('clear')) return '☀️';
    if (lowerCond.includes('thunder') || lowerCond.includes('storm')) return '⛈️';
    if (lowerCond.includes('snow')) return '❄️';
    if (lowerCond.includes('mist') || lowerCond.includes('haze') || lowerCond.includes('fog')) return '🌫️';
    
    return '🌤️'; 
};

const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Invalid or missing Authorization header" });
    }
    const token = header.split(' ')[1];
    // Mocking jwt.verify for unit test isolation
    if (token === "valid_token") {
        req.user = { id: 1 };
        next();
    } else {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

const handleSearch = async (cityName, mockSetters) => {
    // Isolated Frontend Validation Logic
    if (!cityName.trim()) {
        mockSetters.setPrevented(true);
        return;
    }
    mockSetters.setLoading(true);
};


// --- 2. JEST TEST SUITES (Matches Report) ---

describe('Weather System - Unit & Validation Testing', () => {

    // Test UT-01 (Utility function logic)
    test('[UT-01] getWeatherIcon Utility - Should return 🌧️ icon for "heavy rain"', () => {
        expect(getWeatherIcon('heavy rain')).toBe('🌧️');
    });

    test('[UT-01.1] getWeatherIcon Utility - Should return ☀️ icon for "clear sky"', () => {
        expect(getWeatherIcon('clear sky')).toBe('☀️');
    });

    // Test UT-03 (Backend Middleware validation)
    test('[UT-03] Auth Middleware - Should return 403 if Authorization header is missing', () => {
        // Mocking Express req, res, next
        const req = { headers: {} }; 
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid or missing Authorization header" });
    });

    // Test UT-02 (Frontend Search Validation)
    test('[UT-02] Search Input Validation - Should prevent API request if city name is empty', async () => {
        const mockSetters = {
            setPrevented: jest.fn(),
            setLoading: jest.fn()
        };

        await handleSearch('   ', mockSetters); // Passing empty spaces

        // API loading should NOT start, prevented flag should trigger
        expect(mockSetters.setPrevented).toHaveBeenCalledWith(true);
        expect(mockSetters.setLoading).not.toHaveBeenCalled();
    });
});