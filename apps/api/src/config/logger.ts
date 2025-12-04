/**
 * Logger sederhana berbasis console.
 * Di production bisa diganti dengan winston/pino tanpa mengubah pemanggil.
 */
export const logger = {
  info: (msg: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.log(msg, meta ?? "");
  },
  error: (msg: string, meta?: unknown) => {
    // eslint-disable-next-line no-console
    console.error(msg, meta ?? "");
  },
};