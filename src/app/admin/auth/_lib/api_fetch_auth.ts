export {
    apiFetchLogin,
    apiFetchRegister
};

const apiFetchLogin = async ({ nomor }: { nomor: string }) => {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ nomor: nomor }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    
      return await response.json().catch(() => null);
};

const apiFetchRegister = async ({
  nomor,
  username,
}: {
  nomor: string;
  username: string;
}) => {
  const data = {
    username: username,
    nomor: nomor,
  };
  const respone = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ data }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await respone.json();

  return result;
  // return await respone.json().catch(() => null);
};
