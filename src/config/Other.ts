export const adminIds = ["1391139744276283422"];
export function checkAdmin(userId: string) {
  return adminIds.includes(userId);
}
