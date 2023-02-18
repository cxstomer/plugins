import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import App from "./app";
import { AppConfig, AppState, Config, InboundEvent, OutboundEvent } from "./app.model";

export type AppContextProps = {
  config: AppConfig;
  state: AppState;
};

const Context = createContext<AppContextProps>(null!);

export function AppContextProvider(props: PropsWithChildren<Config>): JSX.Element {
  const { id, container, children, ...config } = props;

  const [loadChat, setLoadChat] = useState(window.location.hash.endsWith(config.hash) || false);

  // Add ability to set app state from outside via events.
  useEffect(() => {
    container?.addEventListener(`${id}.${InboundEvent.LoadChat}`, (e: CustomEvent<string>) => setLoadChat(true));
  }, [container, id]);

  useEffect(() => {
    if (loadChat === false) {
      container?.dispatchEvent(new CustomEvent(`${id}.${OutboundEvent.OnLoadChat}`));
    }
  }, [container, id, loadChat]);

  const contextValue: AppContextProps = {
    config: config,
    state: { loadChat, setLoadChat }
  };

  return (
    <Context.Provider value={{ ...contextValue }}>
      <App />
      {children}
    </Context.Provider>
  );
}

export function useAppContext() {
  const context = useContext(Context);

  return context;
}
