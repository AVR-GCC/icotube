export const defined = (thing) => {
    return thing !== undefined && thing !== null;
}

export const refreshTokenSetup = (res) => {
    // Timing to renew access token
    let refreshTiming = (res.tokenObj.expires_in || 3600 - 5 * 60) * 1000;

    const refreshToken = async () => {
        const newAuthRes = await res.reloadAuthResponse();
        refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000;
        console.log('newAuthRes:', newAuthRes);
        // saveUserToken(newAuthRes.access_token);  <-- save new token
        localStorage.setItem('authToken', newAuthRes.id_token);

        // Setup the other timer after the first one
        setTimeout(refreshToken, refreshTiming);
    };

    // Setup first refresh timer
    setTimeout(refreshToken, refreshTiming);
};

export const setToken = (token) => {
    if (defined(token)) {
        localStorage.setItem('tubeAuthToken', token);
    } else {
        localStorage.removeItem('tubeAuthToken');
    }
};

export const getToken = () => {
    return localStorage.getItem('tubeAuthToken');
};