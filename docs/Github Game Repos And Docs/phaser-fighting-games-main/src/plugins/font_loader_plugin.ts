/**
 * Plugin for adding support to load font files in Phaser 3.80.x. Converted to TS, based off of Qugurun's work
 * Version: 1.0.0
 * Author: zkfazal
 * License: MIT
 */

import { Plugins, Loader } from "phaser";

export class FontLoaderPlugin extends Plugins.BasePlugin {
    loader: Loader.LoaderPlugin;
    constructor(pluginManager: Plugins.PluginManager) {
        super(pluginManager);
        pluginManager.registerFileType("font", function (key, url) {
            const fontName = key;
            this.addFile(new FontFile(this, key, fontName, url));
        });
    }
}

export class FontFile extends Phaser.Loader.File {
    fontName: string;
    constructor(loader: any, key: string, fontName: string, url: string) {
        super(loader, {
            type: "font",
            key: key,
            url: url
        });

        this.fontName = fontName;
    }

    load() {
        const newFontFace = new FontFace(this.fontName, `url(${this.url})`);
        document.fonts.add(newFontFace);

        newFontFace.load().then(() => {
            this.loader.emit('fileprogress', this, 1);
            this.loader.nextFile(this, true);
        }).catch((error) => {
            console.error(`Failed to load ${this.fontName}`, error);
            this.loader.nextFile(this, false);
        });
    }
}