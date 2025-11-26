import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("__env", {
  // Exponer variables/funciones seguras si es necesario
});
