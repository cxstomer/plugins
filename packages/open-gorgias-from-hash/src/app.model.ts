import { CSSProperties, Dispatch } from "react";

export interface AppConfig {
  style?: CSSProperties;
  className?: string;
  hidden?: boolean;
  debug?: boolean;
  hash: string;
}

export interface AppState {
  loadChat: boolean;
  setLoadChat: Dispatch<React.SetStateAction<boolean>>;
}

export interface Config extends AppConfig {
  id?: string;
  container?: HTMLElement;
}

export type FnCall = "init" | "event";

export enum InboundEvent {
  LoadChat = "loadchat"
}

export enum OutboundEvent {
  OnLoaded = "onloaded",
  OnLoadChat = "onloadchat"
}

export interface LoadingWidget {
  /**
   * Queue that accumulates method calls during downloading
   * and loading of widget's script file.
   */
  q: Array<[FnCall, Record<string, any> | CustomEvent<any>]>;
}

export type LoadedWidget = (method: FnCall, ...args: any[]) => void;
