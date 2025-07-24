import os from "os";

export async function calculateCpuUsage() {
  const cpus = os.cpus();
  const avgs = cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b);
    const nonIdle = total - cpu.times.idle;
    return nonIdle / total;
  });
  return Math.floor((avgs.reduce((a, b) => a + b) / cpus.length) * 100);
}
