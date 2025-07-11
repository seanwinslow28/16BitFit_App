namespace helpcenter.main.ui.views {

    import controls = colibri.ui.controls;

    export class ExamplesSearchView extends colibri.ui.ide.ViewerView {

        static ID = "helpcenter.main.ui.views.examples.ExamplesSearchView";
        private _propertyProvider: ui.properties.ExampleSectionProvider;

        constructor() {
            super(ExamplesSearchView.ID);

            this.setTitle("Examples Code");
            this.setIcon(MainPlugin.getInstance().getIcon(ICON_LABS));

            this._propertyProvider = new ui.properties.ExampleSectionProvider();
        }

        fillContextMenu(menu: controls.Menu) {

            const chain = this.getViewer().getSelectionFirstElement() as phaser.core.ExampleChain;

            if (chain) {

                new ExampleMenuCreator(chain.example).build(menu);
            }
        }

        protected createViewer(): colibri.ui.controls.viewers.TreeViewer {

            const viewer = new ExampleChainsViewer();

            viewer.setPreloadDisabled();
            viewer.setFilterOnRepaintDisabled();

            viewer.setLabelProvider(new ExampleChainLabelProvider());
            viewer.setStyledLabelProvider(new ExampleChainStyledLabelProvider());
            viewer.setContentProvider(new controls.viewers.ArrayTreeContentProvider());
            viewer.setCellRendererProvider(new ExampleChainCellRendererProvider());
            viewer.setTreeRenderer(new ExampleChainTreeRenderer(viewer));
            viewer.setCellSize(32, true);
            viewer.setInput(phaser.PhaserPlugin.getInstance().getExampleChains());

            viewer.eventOpenItem.addListener((chain: phaser.core.ExampleChain) => {

                const editor = colibri.Platform.getWorkbench().openEditor(chain.example) as editors.ExampleEditor;
                editor.scrollToLine(chain.lineNumber, 0);
            });

            return viewer;
        }

        getPropertyProvider() {

            return this._propertyProvider;
        }
    }

    class ExampleChainsViewer extends controls.viewers.TreeViewer {

        constructor() {
            super(ExamplesSearchView.ID + ".viewer");
        }

        setFilterText(text: string) {

            let chains = phaser.PhaserPlugin.getInstance().getExampleChains();

            controls.viewers.Viewer.prototype.setFilterText.call(this, text);

            if (text.trim().length > 0) {

                this.getSearchEngine().prepare(text);

                chains = chains.filter(c => this.matches(c));
            }

            this.setInput(chains);

            this.setScrollY(0);
        }

        isFilterIncluded(obj: any) {

            return true;
        }
    }

    export class ExampleChainCellRendererProvider implements controls.viewers.ICellRendererProvider {

        private _provider: viewers.ExampleCellRendererProvider;

        constructor() {

            this._provider = new viewers.ExampleCellRendererProvider();
        }

        getCellRenderer(obj: phaser.core.ExampleChain): controls.viewers.ICellRenderer {

            return this._provider.getCellRenderer(obj.example);
        }

        async preload(args: controls.viewers.PreloadCellArgs): Promise<controls.PreloadResult> {

            return controls.PreloadResult.NOTHING_LOADED;
        }
    }


    class ExampleChainStyledLabelProvider implements controls.viewers.IStyledLabelProvider {

        getStyledTexts(obj: phaser.core.ExampleChain, dark: boolean): controls.viewers.IStyledText[] {

            const tokens = showdown.javascriptToTokens(obj.line);

            const styles = dark ? DARK_SYNTAX_COLOR : LIGHT_SYNTAX_COLOR;
            const theme = controls.Controls.getTheme();

            const codeStyles = tokens.map(token => {
                return {
                    text: token.value,
                    color: styles[token.kind] || theme.viewerForeground
                };
            });

            return [...codeStyles, {
                text: " " + obj.example.getPath(),
                color: dark ? "gray" : "gray"
            }];
        }
    }

    const EXAMPLE_CHAIN_FONT = controls.getCanvasFontHeight() + "px Monospace";

    class ExampleChainTreeRenderer extends controls.viewers.TreeViewerRenderer {

        prepareContextForText(args: controls.viewers.RenderCellArgs) {

            super.prepareContextForText(args);

            args.canvasContext.font = EXAMPLE_CHAIN_FONT;
        }

        // measureText(args: controls.viewers.RenderCellArgs, text: string) {

        //     return Math.floor(controls.FONT_HEIGHT * 0.6 * text.length);
        // }
    }

    class ExampleChainLabelProvider implements controls.viewers.ILabelProvider {

        getLabel(obj: phaser.core.ExampleChain): string {

            return obj.line + " " + obj.example.getPath();
        }
    }
}