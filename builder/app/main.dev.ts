/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import IPCHandlers from './ipc-handlers';

export default class AppUpdater {
	constructor() {
		log.transports.file.level = 'info';
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;
let objectViewerWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production' || true) {
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' || true) {
	require('electron-debug')();
}

const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = [ 'REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS' ];

	return Promise.all(extensions.map((name) => installer.default(installer[name], forceDownload))).catch(console.log);
};
const createObjectViewerWindow = async () => {
	objectViewerWindow = new BrowserWindow({
		show: false,
		width: 400,
		height: 400,
		frame: false,
		webPreferences:
			process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
				? {
						nodeIntegration: true
					}
				: {
						nodeIntegration: true,
						preload: path.join(__dirname, 'dist', 'renderer.prod.js')
					}
	});
	objectViewerWindow.loadURL(`file://${__dirname}/app.html`);
	objectViewerWindow.webContents.on('did-finish-load', () => {
		if (!objectViewerWindow) {
			throw new Error('"mainWindow" is not defined');
		}
		// if (process.env.START_MINIMIZED) {
		// 	objectViewerWindow.minimize();
		// } else {
		// 	objectViewerWindow.show();
		// 	objectViewerWindow.focus();
		// }
		// mainWindow.webContents.openDevTools()
	});

	objectViewerWindow.on('closed', () => {
		objectViewerWindow = null;
	});
};
const createWindow = async () => {
	if (objectViewerWindow === null) await createObjectViewerWindow();
	if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
		await installExtensions();
	}

	mainWindow = new BrowserWindow({
		show: false,
		width: 1024,
		height: 728,
		webPreferences:
			process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
				? {
						nodeIntegration: true
					}
				: {
						nodeIntegration: true,
						preload: path.join(__dirname, 'dist', 'renderer.prod.js')
					}
	});

	mainWindow.loadURL(`file://${__dirname}/app.html`);

	// @TODO: Use 'ready-to-show' event
	//        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
	mainWindow.webContents.on('did-finish-load', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}
		IPCHandlers.setup(mainWindow, {
			mainWindow: mainWindow,
			objectViewerWindow: objectViewerWindow
		});

		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
			mainWindow.focus();
		}
	});

	mainWindow.on('closed', () => {
		if (objectViewerWindow) {
			objectViewerWindow.close();
		}
		mainWindow = null;
	});

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	// new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('will-quit', () => {
	IPCHandlers.tearDown();
});

app.on('ready', createWindow);

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.

	if (mainWindow === null) createWindow();
});
