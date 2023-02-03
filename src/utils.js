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

export const retryUntilSuccess = (func, intervalTime = 10000) => {
    return new Promise((resolve) => {
        const tryOnce = async () => {
            const res = await func();
            if (res?.data?.success) {
                clearInterval(interval);
                resolve(res);
            }
        };
        const interval = setInterval(tryOnce, intervalTime);
        tryOnce();
    });
};

export const validateEmail = str => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str);