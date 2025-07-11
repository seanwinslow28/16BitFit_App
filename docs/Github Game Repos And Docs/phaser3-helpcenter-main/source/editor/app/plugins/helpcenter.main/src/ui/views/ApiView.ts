namespace helpcenter.main.ui.views {

    import controls = colibri.ui.controls;

    type TSection = "Types" | "Events" | "Constants";

    export class ApiView extends AbstractPhaserView {
        static ID = "helpcenter.main.ui.views.classes.NamespaceView";
        private _flatLayout: boolean;
        private _showInherited: boolean;
        private _section: TSection;

        constructor() {
            super(ApiView.ID, false);

            this.setTitle("API");
            this.setIcon(MainPlugin.getInstance().getDocEntryKindIcon("namespace"));

            const layout = window.localStorage.getItem("helper.main.ui.views.ApiView.layout");
            this._flatLayout = !layout || layout === "flat";

            const showInherited = window.localStorage.getItem("helper.main.ui.views.ApiView.showInherited");
            this._showInherited = !showInherited || showInherited === "true";
        }

        protected createViewer(): controls.viewers.TreeViewer {

            const viewer = new controls.viewers.TreeViewer(this.getId());

            viewer.setFilterOnRepaintDisabled();
            viewer.setPreloadDisabled();
            viewer.setContentProvider(new ApiContentProvider(this._showInherited, this._flatLayout));
            viewer.setCellRendererProvider(new ui.viewers.PhaserCellRendererProvider());
            viewer.setStyledLabelProvider(new StyledLabelProvider(this._flatLayout));
            viewer.setInput([]);

            return viewer;
        }

        fillContextMenu(menu: controls.Menu) {

            menu.addAction({
                text: "Flat Layout",
                selected: this._flatLayout,
                callback: () => {

                    this._flatLayout = true;

                    window.localStorage.setItem("helper.main.ui.views.ApiView.layout", "flat");

                    this.updateViewer();
                }
            });

            menu.addAction({
                text: "Tree Layout",
                selected: !this._flatLayout,
                callback: () => {

                    this._flatLayout = false;

                    window.localStorage.setItem("helper.main.ui.views.ApiView.layout", "tree");

                    this.updateViewer();
                }
            });

            menu.addSeparator();

            menu.addAction({
                text: "Show Inherited Members",
                selected: this._showInherited,
                callback: () => {

                    this._showInherited = !this._showInherited;

                    window.localStorage.setItem("helper.main.ui.views.ApiView.showInherited", this._showInherited + "");

                    this.updateViewer();
                }
            });

            for (const section of ["Types", "Constants", "Events"]) {

                menu.addAction({
                    text: `Show Only ${section}`,
                    callback: () => {

                        this._section = section as any;

                        this.updateViewer();
                    },
                    selected: this._section === section
                });
            }

            menu.addAction({
                text: "Show All",
                callback: () => {

                    this._section = undefined;

                    this.updateViewer();
                },
                selected: this._section === null || this._section === undefined
            });

            menu.addSeparator();

            super.fillContextMenu(menu);
        }

        updateViewer() {

            const sel = this._viewer.getSelection();

            this._viewer.setContentProvider(new ApiContentProvider(this._showInherited, this._flatLayout, this._section));
            this._viewer.setLabelProvider(null);
            this._viewer.setStyledLabelProvider(new StyledLabelProvider(this._flatLayout));
            this._viewer.setScrollY(0);

            if (this._viewer.getFilterText().trim().length > 0) {

                this._viewer.setFilterText(this._viewer.getFilterText());
            }

            this._viewer.revealAndSelect(...sel);
        }
    }

    class StyledLabelProvider extends viewers.PhaserStyledLabelProvider {

        constructor(private flat: boolean) {
            super();
        }

        getStyledTexts(obj: any, dark: boolean) {

            if (this.flat) {

                const theme = controls.Controls.getTheme();

                if (obj instanceof phaser.core.DocEntry && obj.isNamespace()) {

                    return [{
                        color: theme.viewerForeground,
                        text: obj.getFullName()
                    }]
                }
            }

            return super.getStyledTexts(obj, dark);
        }
    }

    export class ApiContentProvider implements controls.viewers.ITreeContentProvider {

        private _section: TSection;
        private _flat: boolean;
        private _showInherited: boolean;

        constructor(showInherited: boolean, flat: boolean, section?: TSection) {

            this._flat = flat;
            this._section = section;
            this._showInherited = showInherited;
        }

        setSection(section: any) {

            this._section = section;
        }

        getRoots(input: any): any[] {

            if (this._flat) {

                let result = phaser.PhaserPlugin.getInstance().getFlatNamespaces();

                if (this._section) {

                    result = result.filter(c => {

                        return this.getChildren(c).length > 0;
                    });
                }

                return result;
            }

            return [phaser.PhaserPlugin.getInstance().getPhaserDocEntry()];
        }

        getChildren(parent: any): any[] {

            if (parent instanceof phaser.core.DocEntry) {

                let result = parent.getChildren();

                if (!this._showInherited) {

                    result = result.filter(c => !c.isInherited());
                }

                switch (this._section) {

                    case "Types":

                        result = result.filter(c => {

                            const k = c.getKind();

                            return k === "class" || k === "typedef" || c.isNamespace();
                        });

                        break;

                    case "Events":

                        result = result.filter(c => c.getKind() === "event" || c.isNamespace());

                        break;

                    case "Constants":

                        result = result.filter(c => c.getKind() === "constant" || c.isNamespace());

                        break;
                }

                if (this._section) {

                    result = result.filter(c => {

                        return !c.isNamespace() || this.getChildren(c).length > 0;
                    });
                }

                if (this._flat) {

                    result = result.filter(c => !c.isNamespace());
                }

                return result;
            }

            return [];
        }
    }
}