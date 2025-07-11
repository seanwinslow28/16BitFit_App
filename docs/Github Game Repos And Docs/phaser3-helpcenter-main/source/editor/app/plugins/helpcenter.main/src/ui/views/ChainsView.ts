namespace helpcenter.main.ui.views {

    import controls = colibri.ui.controls;

    export class ChainsView extends AbstractPhaserView {
        static ID = "helpcenter.main.ui.views.classes.ChainsView";
        private _model: ChainsModel;


        constructor() {
            super(ChainsView.ID, false);

            this.setTitle("API Chains");
            this.setIcon(MainPlugin.getInstance().getDocEntryKindIcon("namespace"));
        }

        protected createViewer(): controls.viewers.TreeViewer {

            this._model = new ChainsModel();
            this._model.build();

            const viewer = new ChainsViewer(this._model);
            viewer.setPreloadDisabled();
            viewer.setFilterOnRepaintDisabled();

            viewer.setCellRendererProvider(new ChainsCellRendererProvider());
            viewer.setLabelProvider(new ChainsLabelProvider());
            viewer.setStyledLabelProvider(new ChainsStyledLabelProvider());
            viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
            viewer.setTreeRenderer(new ChainsTreeRenderer(viewer));
            viewer.setInput(this._model.getChains());

            return viewer;
        }
    }

    class ChainsSearchEngine extends controls.viewers.MultiWordSearchEngine {

        prepare(pattern: string) {

            if (pattern.startsWith("this")) {

                pattern = "Phaser.Scene" + pattern.substring(4);
            }

            super.prepare(pattern)
        }
    }

    class ChainsViewer extends controls.viewers.TreeViewer {

        _model: ChainsModel;

        constructor(model: ChainsModel) {
            super(ChainsView.ID + ".viewer");

            this._model = model;

            this.setSearchEngine(new ChainsSearchEngine());
        }

        setFilterText(text: string) {

            controls.viewers.Viewer.prototype.setFilterText.call(this, text);

            let chains: Chain[] = [];

            if (text.trim().length > 0) {

                this.getSearchEngine().prepare(text);

                chains = this._model.getChains().filter(c => this.matches(c));

            } else {

                chains = this._model.getChains();
            }

            this.setInput(chains);

            this.setScrollY(0);
        }

        isFilterIncluded(obj: any) {

            return true;
        }
    }

    class ChainsTreeRenderer extends controls.viewers.TreeViewerRenderer {

        prepareContextForText(args: controls.viewers.RenderCellArgs) {

            super.prepareContextForText(args);

            args.canvasContext.font = controls.getCanvasFontHeight() + "px Monospace";
        }
    }

    class ChainsStyledLabelProvider implements controls.viewers.IStyledLabelProvider {

        private _labelProvider = new ChainsLabelProvider();

        getStyledTexts(obj: any, dark: boolean): controls.viewers.IStyledText[] {

            if (obj instanceof Chain) {

                return dark ? obj.darkStyledLabel : obj.lightStyledLabel;
            }

            return [{
                text: this._labelProvider.getLabel(obj),
                color: controls.Controls.getTheme().viewerForeground
            }]
        }
    }

    class ChainsLabelProvider implements controls.viewers.ILabelProvider {

        getLabel(obj: any): string {

            if (obj instanceof Chain) {

                return obj.label;
            }

            return "";
        }
    }

    class ChainsCellRendererProvider implements controls.viewers.ICellRendererProvider {

        getCellRenderer(element: any): controls.viewers.ICellRenderer {

            if (element instanceof Chain) {

                return ui.viewers.PhaserCellRendererProvider.getDocEntryCellRenderer(element.docEntry);
            }

            return controls.viewers.EmptyCellRenderer.instance;
        }

        async preload(args: controls.viewers.PreloadCellArgs): Promise<controls.PreloadResult> {

            return controls.PreloadResult.NOTHING_LOADED;
        }
    }

    class Chain {

        public docEntry: phaser.core.DocEntry;

        public label: string;

        public lightStyledLabel: controls.viewers.IStyledText[];

        public darkStyledLabel: controls.viewers.IStyledText[];

        public countDots: number;

        public chained: boolean;

        adaptToDocEntry() {

            return this.docEntry;
        }
    }

    class ChainsModel {

        private _chains: Chain[];

        build() {

            this._chains = [];

            const root = phaser.PhaserPlugin.getInstance().getDocEntry("Phaser");

            this.buildAll(root, "Phaser", 1);

            this._chains.sort((a, b) => {

                const aa = a.countDots * (a.chained ? 2 : 1);
                const bb = b.countDots * (b.chained ? 2 : 1)

                return aa - bb;
            });
        }

        getChains() {

            return this._chains;
        }

        private buildAll(parent: phaser.core.DocEntry, parentLabel: string, depth: number) {

            if (depth < 0) {

                return;
            }

            for (const child of parent.getChildren()) {

                // if (child.isInherited()) {

                //     continue;
                // }

                const entryFullName = parentLabel + "." + child.getName();

                if (child.getKind() === "namespace") {

                    this.buildAll(child, entryFullName, depth);

                } else {

                    const chain = new Chain();
                    chain.chained = depth !== 1;

                    const baseLabel = entryFullName
                        + child.getTypeSignature()
                        + child.getMethodSignature()
                        + child.getReturnsTypeSignature();


                    const tags = [];

                    const classMember = ["member", "function"].indexOf(child.getKind()) >= 0;

                    if (classMember) {

                        tags.push(child.isInherited() ? "#i" : "#d");
                    }

                    tags.push(chain.chained ? "#c" : "#u");

                    const since = child.getRawEntry().since;

                    const version = since ? " v" + since : "";

                    const tagsLabel = tags.join(" ");

                    chain.label = child.getKind() + " " + baseLabel + " " + tagsLabel + version;
                    chain.countDots = chain.label.split("").filter(c => c === ".").length;

                    chain.lightStyledLabel = [{
                        text: child.getKind() + " ",
                        color: LIGHT_SYNTAX_COLOR.keyword
                    }, {
                        text: entryFullName,
                        color: controls.Controls.LIGHT_THEME.viewerForeground + (chain.chained ? "a0" : "")
                    },
                    {
                        text: child.getTypeSignature(),
                        color: LIGHT_SYNTAX_COLOR.typeSignature
                    }, {
                        text: child.getMethodSignature(),
                        color: LIGHT_SYNTAX_COLOR.methodSignature
                    }, {
                        text: child.getReturnsTypeSignature(),
                        color: LIGHT_SYNTAX_COLOR.returnTypeSignature
                    }, {
                        text: " " + tagsLabel,
                        color: "cadetBlue"
                    }, {
                        text: version,
                        color: "gray"
                    }];

                    chain.darkStyledLabel = [{
                        text: child.getKind() + " ",
                        color: DARK_SYNTAX_COLOR.keyword
                    }, {
                        text: entryFullName,
                        color: controls.Controls.DARK_THEME.viewerForeground + (chain.chained ? "a0" : "")
                    },
                    {
                        text: child.getTypeSignature(),
                        color: DARK_SYNTAX_COLOR.typeSignature
                    }, {
                        text: child.getMethodSignature(),
                        color: DARK_SYNTAX_COLOR.methodSignature
                    }, {
                        text: child.getReturnsTypeSignature(),
                        color: DARK_SYNTAX_COLOR.returnTypeSignature
                    }, {
                        text: " " + tagsLabel,
                        color: "bisque"
                    }, {
                        text: version,
                        color: "gray"
                    }];

                    chain.lightStyledLabel = chain.lightStyledLabel.filter(s => s.text.length > 0);
                    chain.darkStyledLabel = chain.darkStyledLabel.filter(s => s.text.length > 0);

                    chain.docEntry = child;

                    this._chains.push(chain);

                    this.buildAll(child, baseLabel, depth);

                    const type = child.getType();

                    if (type) {

                        for (const name of type.names) {

                            if (name === "Phaser.Scene" || name === "Phaser.Game" || name === "Phaser.GameObjects.GameObject") {

                                continue;
                            }

                            const typeEntry = phaser.PhaserPlugin.getInstance().getDocEntry(name);

                            if (typeEntry) {

                                this.buildAll(typeEntry, entryFullName, depth - 1);
                            }
                        }
                    }
                }
            }
        }
    }
}