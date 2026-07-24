import argon2 from 'argon2';

export async function digest(plaintextKey: string) {
  const hash = await argon2.hash(plaintextKey, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 1 << 16,
    parallelism: 1,
  });

  return hash;
}

export async function verifyHashedKey(hashedKey: string, plaintextKey: string) {
  return argon2.verify(hashedKey, plaintextKey);
}
