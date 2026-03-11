const net = require("net");
const path = require("path");
const { app, BrowserWindow, dialog, session } = require("electron");
const { startLocalServer, DEFAULT_PORT } = require("./local-server.cjs");

let localServer = null;
let mainWindow = null;

const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findFreePort = async (startPort = DEFAULT_PORT, maxAttempts = 200) => {
  let port = startPort;
  for (let i = 0; i < maxAttempts; i += 1) {
    const isFree = await new Promise((resolve) => {
      const tester = net.createServer();
      tester.once("error", () => resolve(false));
      tester.once("listening", () => {
        tester.close(() => resolve(true));
      });
      tester.listen(port, "127.0.0.1");
    });
    if (isFree) return port;
    port += 1;
  }
  throw new Error(`No free port found in range ${startPort}-${startPort + maxAttempts - 1}`);
};

const createMainWindow = (url) => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.loadURL(url);
  return win;
};

const configurePermissions = () => {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    if (permission === "media" || permission === "microphone") {
      callback(true);
      return;
    }
    callback(false);
  });
};

const shutdownServer = async () => {
  if (!localServer) return;
  const toClose = localServer;
  localServer = null;
  try {
    await toClose.close();
  } catch {
    // Ignore close race on app shutdown.
  }
};

const bootstrap = async () => {
  try {
    configurePermissions();
    const port = await findFreePort(DEFAULT_PORT);
    localServer = await startLocalServer({
      appRoot: path.resolve(__dirname, ".."),
      port,
    });

    const appUrl = `http://127.0.0.1:${localServer.port}/`;
    mainWindow = createMainWindow(appUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox("应用启动失败", `无法启动本地服务：\n${message}`);
    await waitFor(80);
    app.quit();
  }
};

app.whenReady().then(bootstrap);

app.on("window-all-closed", async () => {
  await shutdownServer();
  app.quit();
});

app.on("before-quit", async () => {
  await shutdownServer();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0 && localServer) {
    mainWindow = createMainWindow(`http://127.0.0.1:${localServer.port}/`);
  }
});
