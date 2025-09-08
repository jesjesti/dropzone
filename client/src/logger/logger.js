import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Logger levels
const LEVELS = {
  INFO: "info",
  ERROR: "error",
  WARN: "warn",
  DEBUG: "debug",
};

// LocalStorage key
const LOGGER_ENABLED_KEY = "logger_enabled";

// Utility: Get query param
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Logger Context
const LoggerContext = createContext();

// Logger Provider
export const LoggerProvider = ({ children }) => {
  const [enabled, setEnabled] = useState(false);
  const logsRef = useRef([]);

  // Enable/disable logger based on query param or localStorage
  useEffect(() => {
    const queryDebug = getQueryParam("debug");
    if (queryDebug === "true") {
      setEnabled(true);
      localStorage.setItem(LOGGER_ENABLED_KEY, "true");
    } else if (queryDebug === "false") {
      setEnabled(false);
      localStorage.removeItem(LOGGER_ENABLED_KEY);
    } else {
      const stored = localStorage.getItem(LOGGER_ENABLED_KEY);
      setEnabled(stored === "true");
    }
  }, []);

  // Expose runtime control via window
  useEffect(() => {
    window.debugEnabled = (flag) => {
      if (flag) {
        setEnabled(true);
        localStorage.setItem(LOGGER_ENABLED_KEY, "true");
      } else {
        setEnabled(false);
        localStorage.removeItem(LOGGER_ENABLED_KEY);
      }
    };
    return () => {
      delete window.debugEnabled;
    };
  }, []);

  // Logger function
  const log = (level, message, meta = {}) => {
    if (!enabled) return;
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
    };
    logsRef.current.push(entry);
    // For now, just print to console
    switch (level) {
      case LEVELS.ERROR:
        console.error(`[ERROR]`, entry);
        break;
      case LEVELS.WARN:
        console.warn(`[WARN]`, entry);
        break;
      case LEVELS.INFO:
        console.info(`[INFO]`, entry);
        break;
      case LEVELS.DEBUG:
        console.debug(`[DEBUG]`, entry);
        break;
      default:
        console.log(`[LOG]`, entry);
    }
    // Future: Push logsRef.current to ELK stack here
  };

  // Logger API
  const logger = {
    info: (msg, meta) => log(LEVELS.INFO, msg, meta),
    error: (msg, meta) => log(LEVELS.ERROR, msg, meta),
    warn: (msg, meta) => log(LEVELS.WARN, msg, meta),
    debug: (msg, meta) => log(LEVELS.DEBUG, msg, meta),
    getLogs: () => logsRef.current.slice(),
    clearLogs: () => {
      logsRef.current = [];
    },
    enabled,
  };

  return (
    <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>
  );
};

// Hook to use logger in any component
export const useLogger = () => useContext(LoggerContext);

// Example usage in a component:
// import { useLogger } from './logger';
// const logger = useLogger();
// logger.info('Component mounted', { component: 'MyComponent' });

/*
    Integration steps:
    1. Wrap your app with <LoggerProvider> in your root component.
    2. Use useLogger() hook in any component to log messages.
    3. Enable/disable logging via ?debug=true/false or window.debugEnabled(true/false).
    4. Logs are stored in memory and can be pushed to ELK stack in future.
*/
