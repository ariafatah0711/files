// Default accounts logic (adapted from notes_ref)
let defaultAccounts = [];
if (import.meta.env.VITE_ACCOUNTS) {
  try {
    defaultAccounts = JSON.parse(import.meta.env.VITE_ACCOUNTS);
  } catch {
    defaultAccounts = [];
  }
} else {
  for (let i = 1; i <= 10; i++) {
    const name = import.meta.env[`VITE_ACCOUNT_${i}_USER`];
    const password = import.meta.env[`VITE_ACCOUNT_${i}_PASS`];
    const api = import.meta.env[`VITE_ACCOUNT_${i}_API`];
    if (name && password) {
      defaultAccounts.push({ name, password, api, type: "api" });
    }
  }
}

export { defaultAccounts };
