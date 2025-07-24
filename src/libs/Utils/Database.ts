import { container } from "@sapphire/framework";

export async function getDatabsePing(): Promise<number> {
  try {
    const readStart = Date.now();
    await container.database.query("SELECT 1");
    const readDuration = Date.now() - readStart;

    const writeStart = Date.now();
    await container.database.query(
      "CREATE TEMP TABLE temp_ping(id DECIMAL(20,0));",
    );
    await container.database.query(
      "INSERT INTO temp_ping(id) VALUES (99999999999999999999);",
    );
    await container.database.query("DELETE FROM temp_ping;");
    await container.database.query("DROP TABLE temp_ping;");
    const writeDuration = Date.now() - writeStart;

    const averageDuration = (readDuration + writeDuration) / 2;
    return Math.ceil(averageDuration);
  } catch (error) {
    console.error("Veritabanı ping hatası:", error);
    return -1;
  }
}
