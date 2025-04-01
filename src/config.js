const username = import.meta.env.VITE_USERNAME;
const correctPassword = import.meta.env.VITE_PASSWORD;
const token = import.meta.env.VITE_TOKEN;
const apiDomain = import.meta.env.VITE_API_DOMAIN || "https://files-tesing.vercel.app";
const apiVersion = import.meta.env.VITE_API_VERSION || "v2";

export { username, correctPassword, token, apiDomain, apiVersion };
