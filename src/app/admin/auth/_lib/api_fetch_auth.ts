export {
    apiFetchLogin
};

const apiFetchLogin = async ({ nomor }: { nomor: string }) => {
    const respone = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ nomor: nomor }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    
      return await respone.json().catch(() => null);
};
