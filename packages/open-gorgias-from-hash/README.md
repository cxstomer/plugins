# open-gorgias-from-hash

Plugin to open Gorgias chat from url hash.

## Debug

Start the project to test locally. Make sure to have a valid Gorgias app id saved to `.env.local` file.

```sh
npm start
```

Navigate to hash `#chat`, and press the link to send the `loadchat` event to the widget.

## Debug with Chrome against a production website

Sources: https://developer.chrome.com/docs/devtools/workspaces/?utm_source=devtools

- Add folder to root of this project called `.chrome`.
- In Chrome, open Developer Tools > Sources tab.
- In sub menu (`>>`), select Overrides, then add `.chrome` folder. Click **Allow** button.
- In sub menu (`>>`), select Page, then select the `(index)` file that contains the site html, listed under the website url.

```
|-- top
    |-- www.thesite.com
        |-- some-folder/maybe-plugins/js
        |-- another-folder/js
        |-- (index) <-- one of the (index) files will be html and the other JavaScript
        |-- 3d9d9efe-dfc5-4be4-bdef-3f6d1514c144
        |-- (index)
    |-- www.googletagmanager.com
    |-- assets.gorgias.chat
    |-- ...
```

- Add a new line to `(index)` file in the contents to the right of where you selected it, and then save it `ctrl+s`.
  - This creates a folder inside of the `.chrome` folder, like `.chrome/www.thesite.com`, with the altered index.html file.
- build the project:

```sh
npm run build
```

- Take just the js file from the `build` folder and drag it into the site folder `.chrome/www.thesite.com`.
  - Now the js file should exist next to `index.html`, in the site folder: `.chrome/www.thesite.com/open-gorgias-from-hash.1.0.0.js`.
- In vscode, open the saved index.html file at `.chrome/www.thesite.com/index.html`, and add the snippet to install this wiget as the last script tag in body:
  - Make sure the file name is correct as the last param of the snippet function. In this example it is `open-gorgias-from-hash.1.0.0.js`.
  - Make sure to save the changes in index.html.
  - Saving may take a while bc prettier will attempt to format the file - be patient.

```html
<script>
  (function (w, d, o, f, js, fjs) {
    w[o] =
      typeof w[0] === "function"
        ? w[o]
        : function () {
            (w[o].q = w[o].q || []).push(arguments);
          };
    (js = d.createElement("script")), (fjs = d.getElementsByTagName("script")[0]);
    js.id = `${o}-script`;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  })(window, document, "open_gorgias_from_hash", "./open-gorgias-from-hash.1.0.0.js");
  open_gorgias_from_hash("init", { hash: "chat", debug: true });
</script>
```

- Refresh the site and the plugin should work. Test it by adding the hash `#chat` to the url, then refresh. This should display a loading dialog and then open the Gorgias chat.

## Deplyment

**Always change the version in package.json before building for production**

- Update the version in package.json.
- Build the plugin

```sh
npm run build
```

- Copy the built js file into your website, and add the snippet like above into index.html.

### WordPress

- Zip all `build` contents **EXCEPT** the html file, into a zip folder with the name `open_gorgias_from_hash.zip`. 
- Upload the zip file as a plugin.

## References

https://blog.jenyay.com/building-javascript-widget/
https://blog.jenyay.com/web-ui-widget/
