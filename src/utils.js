export const wait = (timeout) => new Promise((resolve) => {
    setTimeout(resolve, timeout);
});

export const defined = (thing) => {
    return thing !== undefined && thing !== null;
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

export const validateEmail = str => /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str);