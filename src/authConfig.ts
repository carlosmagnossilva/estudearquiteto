import { LogLevel } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID as string,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID as string}`,
    redirectUri: process.env.REACT_APP_AZURE_REDIRECT_URI as string,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: [
    "User.Read",
    process.env.REACT_APP_AZURE_SCOPE
  ],
};
