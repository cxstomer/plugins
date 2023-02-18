import { createRoot } from "react-dom/client";
import loadWidget from "./widget";
import { AppContextProvider } from "./app.context";

/*
const container = document.getElementById("root");
const root = createRoot(container);
root.render(App({ message: "helloy" }));
*/

loadWidget(window, { hash: "" }, (id, container, config) => {
  if (config.debug) {
    console.log(`Rendering widget [${id}].`, container, config);
  }

  const widgetRoot = createRoot(container);
  widgetRoot.render(<AppContextProvider {...{ id, container, ...config }} />);
});
