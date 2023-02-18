import { Config, AppConfig, OutboundEvent, FnCall, LoadingWidget, LoadedWidget } from "./app.model";

/**
 * Loads widget instance.
 *
 * @param win {Window} Global window object which stores pre-loaded and post-loaded state of widget instance.
 * @param config {Config} The default config.
 * @param render A function called once init is done and DOM element for hosting widget is ready.
 */

export default function loadWidget(
  win: Window,
  config: Config,
  render: (id: string, container: HTMLElement, config: AppConfig) => void
) {
  // Get the loading instance, which was set in the snippet in html.
  const scriptId = win.document.currentScript.getAttribute("id");
  // Slice `-script` off to get the widget id.
  const id = scriptId.substring(0, scriptId.indexOf("-script"));
  const asyncWidget = (win as any)[id] as LoadingWidget;

  // The first call in q must be init.
  if (!asyncWidget || !asyncWidget.q) {
    throw new Error(`Widget [${id}] not found. Make sure to call 'init' function before anything else.`);
  }

  const loadedEvent = `${id}.${OutboundEvent.OnLoaded}`;

  const { q } = asyncWidget;

  // Ensure widget is not loaded twice under the same id.
  if (q.find((e) => e[0] === "event" && (e[1] as CustomEvent).type === loadedEvent)) {
    throw new Error(`Widget [${id}] was already loaded. You have multiple instances with same id.`);
  }

  // The root element of the widget instance. Either it already exists or it will be created.
  // If it already exists, this widget is being injected into a specific location.
  // If being created, this widget will be added as a div to the bottom of body.
  let targetElement: HTMLElement = win.document.getElementById(id);

  // Iterate over all methods that were called up until now
  for (let i = 0; i < asyncWidget.q.length; i++) {
    const item = asyncWidget.q[i];

    const [fn, payload] = item;

    if (i === 0 && fn !== "init") {
      throw new Error(`Failed to start widget [${id}] - 'init' must be called before anything else.`);
    } else if (i !== 0 && fn === "init") {
      continue;
    }

    switch (fn) {
      case "init":
        // Override default config with what was sent.
        const widgetConfig = Object.assign(config, payload);

        if (widgetConfig.debug) {
          console.log(`Starting widget [${id}].`, widgetConfig);
        }

        // The actual rendering of the widget.
        const wrappingElement = widgetConfig.container ?? win.document.body;

        const injectTarget = !targetElement;

        if (injectTarget) {
          targetElement = win.document.createElement("div");
          targetElement.setAttribute("id", `${id}`);
        }

        // This widget may not have an initial display.
        if (widgetConfig.hidden) {
          targetElement.hidden = true;
        }

        if (injectTarget) {
          wrappingElement.appendChild(targetElement);
        }

        render(id, targetElement, widgetConfig);

        // Store indication that widget instance was loaded.
        const e = new CustomEvent(loadedEvent);
        asyncWidget.q.push(["event", e]);
        break;
      case "event":
        // Emit the loaded event, and any other events.
        targetElement.dispatchEvent(payload as CustomEvent);
        break;
      default:
        // Handle any other async interactions with the widget from page
        // (e.q. `widgetName('refreshStats')`)
        console.warn(`Unsupported method ${id}.${fn}(${JSON.stringify(payload)}).`);
    }
  }

  // Once finished processing all async calls, convert widget into syncronous function.
  const widget: LoadedWidget = (fn: FnCall, ...args: any[]) => {
    switch (fn) {
      case "event": {
        const [type, payload] = args;
        targetElement.dispatchEvent(new CustomEvent(`${id}.${type}`, { detail: payload }));
        break;
      }
      default:
        console.warn(`Unsupported method ${id}.${fn}(${JSON.stringify(args)}).`);
    }
  };

  (win as any)[id] = widget;
}
