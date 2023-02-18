import { useCallback, useEffect } from "react";
import { useAppContext } from "./app.context";
import styles from "./app.module.scss";

export default function App() {
  const { config, state } = useAppContext();
  const { hash } = config;

  const { loadChat, setLoadChat } = state;

  const openChatFromParam = useCallback(
    (hash: string) => {
      // Check if hash is in url to open chat.
      const openChat = window.location.hash.endsWith(hash) || false;

      // Show loader if not already showing.
      setLoadChat((prev) => (openChat ? prev || true : false));

      // Remove the hash.
      if (openChat) {
        window.history.replaceState({}, null, window.location.href.split("#")[0]);
      }

      // Load and open chat.
      const waitForGorgias = window.GorgiasChat
        ? window.GorgiasChat.init().then(() => Promise.resolve({ open: openChat }))
        : new Promise<{ open: boolean }>((resolve) => {
            // Remove any event listener before adding it.
            window.removeEventListener("gorgias-widget-loaded", () => resolve({ open: openChat }));

            // Wait for Gorgias before doing anything.
            window.addEventListener("gorgias-widget-loaded", () => resolve({ open: openChat }));
          });

      const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

      Promise.all([waitForGorgias, delay(1000)])
        .then((res) => res[0])
        .then(async ({ open }) => {
          setLoadChat(false);
          if (!open) {
            return;
          }

          window.GorgiasChat.open();
        });
    },
    [setLoadChat]
  );

  useEffect(() => {
    if (loadChat) {
      openChatFromParam(hash);
    }
  }, [hash, loadChat, openChatFromParam]);

  if (loadChat) {
    return (
      <>
        <div
          style={{
            display: "flex",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "12px",
              width: "160px",
              height: "auto",
              padding: "16px"
            }}
          >
            <strong style={{ margin: "0 0 8px" }}>Loading chat</strong>
            <span>
              <svg className={styles.spinner} height="50px" viewBox="0 0 50 50">
                <circle
                  className={styles.path}
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="#1d3855"
                  strokeWidth="5"
                  strokeLinecap="round"
                ></circle>
              </svg>
            </span>
          </div>
        </div>
      </>
    );
  }

  // This widget has no display if not loading.
  return null;
}
