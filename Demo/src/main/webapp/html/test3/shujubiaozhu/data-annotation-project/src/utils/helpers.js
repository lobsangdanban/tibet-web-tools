export const formatData = (data) => {
    // Format data to a specific structure
    return data.map(item => ({
        id: item.id,
        value: item.value.trim(),
        timestamp: new Date().toISOString()
    }));
};

export const validateData = (data) => {
    // Validate data to ensure it meets certain criteria
    return data.every(item => item.value && typeof item.value === 'string');
};

export const generateUniqueId = () => {
    // Generate a unique identifier
    return 'id-' + Math.random().toString(36).substr(2, 16);
};