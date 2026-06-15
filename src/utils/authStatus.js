export const isPasswordUser = (user) => (
  user?.providerData?.some((provider) => provider.providerId === 'password') || false
);

export const isVerifiedAccount = (user) => (
  Boolean(user) &&
  !user.isAnonymous &&
  (user.emailVerified || !isPasswordUser(user))
);
