/**
 * Logger sederhana berbasis console.
 * Di production bisa diganti dengan winston/pino tanpa mengubah pemanggil.
 */
export const logger = {
  info: (msg: string, meta?: unknown) => {
    console.log(msg, meta ?? "");
  },
  error: (msg: string, meta?: unknown) => {
    console.error(msg, meta ?? "");
  },
};