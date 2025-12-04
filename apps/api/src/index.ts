import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const port = env.PORT;

app.listen(port, () => {
  logger.info(`API server berjalan di http://localhost:${port}`);
});