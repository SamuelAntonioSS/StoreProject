import app from "./app.js";
import config from "./config.js";
import connectDB from "./database.js";

// Conectar a la base de datos
connectDB();

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
  console.log(`📍 Ambiente: ${config.nodeEnv}`);
});