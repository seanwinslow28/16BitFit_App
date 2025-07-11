/// <reference lib="dom" />
declare namespace helpcenter.showdown {
    function markdownToHtml(text: string): string;
    function javascriptToHtml(text: string): string;
    interface IToken {
        kind: string;
        value: string;
    }
    function javascriptToTokens(text: string, compact?: boolean): IToken[];
}
declare const hljs: HLJSApi;
declare type HLJSApi = PublicApi & ModesAPI;
interface VuePlugin {
    install: (vue: any) => void;
}
interface PublicApi {
    highlight: (languageName: string, code: string, ignoreIllegals?: boolean, continuation?: Mode) => HighlightResult;
    highlightAuto: (code: string, languageSubset?: string[]) => AutoHighlightResult;
    fixMarkup: (html: string) => string;
    highlightBlock: (element: HTMLElement) => void;
    configure: (options: Partial<HLJSOptions>) => void;
    initHighlighting: () => void;
    initHighlightingOnLoad: () => void;
    registerLanguage: (languageName: string, language: LanguageFn) => void;
    listLanguages: () => string[];
    registerAliases: (aliasList: string | string[], { languageName }: {
        languageName: string;
    }) => void;
    getLanguage: (languageName: string) => Language | undefined;
    requireLanguage: (languageName: string) => Language | never;
    autoDetection: (languageName: string) => boolean;
    inherit: <T>(original: T, ...args: Record<string, any>[]) => T;
    addPlugin: (plugin: HLJSPlugin) => void;
    debugMode: () => void;
    safeMode: () => void;
    versionString: string;
    vuePlugin: () => VuePlugin;
}
interface ModesAPI {
    SHEBANG: (mode?: Partial<Mode> & {
        binary?: string | RegExp;
    }) => Mode;
    BACKSLASH_ESCAPE: Mode;
    QUOTE_STRING_MODE: Mode;
    APOS_STRING_MODE: Mode;
    PHRASAL_WORDS_MODE: Mode;
    COMMENT: (begin: string | RegExp, end: string | RegExp, modeOpts?: Mode | {}) => Mode;
    C_LINE_COMMENT_MODE: Mode;
    C_BLOCK_COMMENT_MODE: Mode;
    HASH_COMMENT_MODE: Mode;
    NUMBER_MODE: Mode;
    C_NUMBER_MODE: Mode;
    BINARY_NUMBER_MODE: Mode;
    CSS_NUMBER_MODE: Mode;
    REGEXP_MODE: Mode;
    TITLE_MODE: Mode;
    UNDERSCORE_TITLE_MODE: Mode;
    METHOD_GUARD: Mode;
    END_SAME_AS_BEGIN: (mode: Mode) => Mode;
    IDENT_RE: string;
    UNDERSCORE_IDENT_RE: string;
    NUMBER_RE: string;
    C_NUMBER_RE: string;
    BINARY_NUMBER_RE: string;
    RE_STARTERS_RE: string;
}
declare type LanguageFn = (hljs?: HLJSApi) => Language;
declare type CompilerExt = (mode: Mode, parent: Mode | Language | null) => void;
interface HighlightResult {
    relevance: number;
    value: string;
    language?: string;
    emitter: Emitter;
    illegal: boolean;
    top?: Language | CompiledMode;
    illegalBy?: illegalData;
    sofar?: string;
    errorRaised?: Error;
    second_best?: Omit<HighlightResult, 'second_best'>;
    code?: string;
}
interface AutoHighlightResult extends HighlightResult {
}
interface illegalData {
    msg: string;
    context: string;
    mode: CompiledMode;
}
declare type BeforeHighlightContext = {
    code: string;
    language: string;
    result?: HighlightResult;
};
declare type PluginEvent = keyof HLJSPlugin;
declare type HLJSPlugin = {
    'after:highlight'?: (result: HighlightResult) => void;
    'before:highlight'?: (context: BeforeHighlightContext) => void;
    'after:highlightBlock'?: (data: {
        result: HighlightResult;
    }) => void;
    'before:highlightBlock'?: (data: {
        block: Element;
        language: string;
    }) => void;
};
interface EmitterConstructor {
    new (opts: any): Emitter;
}
interface HLJSOptions {
    noHighlightRe: RegExp;
    languageDetectRe: RegExp;
    classPrefix: string;
    tabReplace?: string;
    useBR: boolean;
    languages?: string[];
    __emitter: EmitterConstructor;
}
interface CallbackResponse {
    data: Record<string, any>;
    ignoreMatch: () => void;
}
/************
 PRIVATE API
 ************/
declare type AnnotatedError = Error & {
    mode?: Mode | Language;
    languageName?: string;
    badRule?: Mode;
};
declare type ModeCallback = (match: RegExpMatchArray, response: CallbackResponse) => void;
declare type HighlightedHTMLElement = HTMLElement & {
    result?: object;
    second_best?: object;
    parentNode: HTMLElement;
};
declare type EnhancedMatch = RegExpMatchArray & {
    rule: CompiledMode;
    type: MatchType;
};
declare type MatchType = "begin" | "end" | "illegal";
interface Emitter {
    addKeyword(text: string, kind: string): void;
    addText(text: string): void;
    toHTML(): string;
    finalize(): void;
    closeAllNodes(): void;
    openNode(kind: string): void;
    closeNode(): void;
    addSublanguage(emitter: Emitter, subLanguageName: string): void;
}
interface ModeCallbacks {
    "on:end"?: Function;
    "on:begin"?: ModeCallback;
}
interface Mode extends ModeCallbacks, ModeDetails {
}
interface LanguageDetail {
    name?: string;
    rawDefinition?: () => Language;
    aliases?: string[];
    disableAutodetect?: boolean;
    contains: (Mode)[];
    case_insensitive?: boolean;
    keywords?: Record<string, any> | string;
    compiled?: boolean;
    exports?: any;
    classNameAliases?: Record<string, string>;
    compilerExtensions?: CompilerExt[];
    supersetOf?: string;
}
declare type Language = LanguageDetail & Partial<Mode>;
interface CompiledLanguage extends LanguageDetail, CompiledMode {
    compiled: true;
    contains: CompiledMode[];
    keywords: Record<string, any>;
}
declare type KeywordData = [string, number];
declare type KeywordDict = Record<string, KeywordData>;
declare type CompiledMode = Omit<Mode, 'contains'> & {
    contains: CompiledMode[];
    keywords: KeywordDict;
    data: Record<string, any>;
    terminatorEnd: string;
    keywordPatternRe: RegExp;
    beginRe: RegExp;
    endRe: RegExp;
    illegalRe: RegExp;
    matcher: any;
    compiled: true;
    starts?: CompiledMode;
    parent?: CompiledMode;
};
interface ModeDetails {
    begin?: RegExp | string;
    match?: RegExp | string;
    end?: RegExp | string;
    className?: string;
    contains?: ("self" | Mode)[];
    endsParent?: boolean;
    endsWithParent?: boolean;
    endSameAsBegin?: boolean;
    skip?: boolean;
    excludeBegin?: boolean;
    excludeEnd?: boolean;
    returnBegin?: boolean;
    returnEnd?: boolean;
    __beforeBegin?: Function;
    parent?: Mode;
    starts?: Mode;
    lexemes?: string | RegExp;
    keywords?: Record<string, any> | string;
    beginKeywords?: string;
    relevance?: number;
    illegal?: string | RegExp | Array<string | RegExp>;
    variants?: Mode[];
    cachedVariants?: Mode[];
    subLanguage?: string | string[];
    compiled?: boolean;
    label?: string;
}
declare module 'highlight.js' {
    export = hljs;
}
declare module 'highlight.js/lib/core' {
    export = hljs;
}
declare module 'highlight.js/lib/core.js' {
    export = hljs;
}
declare module 'highlight.js/lib/languages/*' {
    export default function (hljs?: HLJSApi): LanguageDetail;
}
/**
 * Showdown namespace
 *
 * @see https://github.com/showdownjs/showdown/blob/master/src/showdown.js
 */
declare namespace showdown {
    /**
     * Showdown event listener.
     */
    interface EventListener {
        /**
         * @param evtName - The event name.
         * @param text - The current convert value.
         * @param converter - The converter instance.
         * @param options - The converter options.
         * @param globals - A global parsed data of the current conversion.
         * @returns Can be returned string value to change the current convert value (`text`).
         * @example
         * Change by returns string value.
         * ```ts
         * let listener: EventListener = (evtName, text, converter, options, globals) => doSome(text);
         * ```
         */
        (evtName: string, text: string, converter: Converter, options: ShowdownOptions, globals: ConverterGlobals): void | string;
    }
    interface ConverterGlobals {
        converter?: Converter;
        gDimensions?: {
            width?: number;
            height?: number;
        };
        gHtmlBlocks?: string[];
        gHtmlMdBlocks?: string[];
        gHtmlSpans?: string[];
        gListLevel?: number;
        gTitles?: {
            [key: string]: string;
        };
        gUrls?: {
            [key: string]: string;
        };
        ghCodeBlocks?: {
            codeblock?: string;
            text?: string;
        }[];
        hashLinkCounts?: {
            [key: string]: number;
        };
        langExtensions?: ShowdownExtension[];
        metadata?: {
            parsed?: {
                [key: string]: string;
            };
            raw?: string;
            format?: string;
        };
        outputModifiers?: ShowdownExtension[];
    }
    interface Extension {
        /**
         * Property defines the nature of said sub-extensions and can assume 2 values:
         *
         * * `lang`  - Language extensions add new markdown syntax to showdown.
         * * `output` - Output extensions (or modifiers) alter the HTML output generated by showdown.
         * * `listener` - Listener extensions for listening to a conversion event.
         */
        type: string;
        /**
         * Event listeners functions that called on the conversion, when the `event` occurs.
         */
        listeners?: {
            [event: string]: EventListener;
        };
    }
    /**
     * Regex/replace style extensions are very similar to javascript's string.replace function.
     * Two properties are given, `regex` and `replace`.
     *
     * @example
     * ```ts
     * let myExt: RegexReplaceExtension = {
     *   type: 'lang',
     *   regex: /markdown/g,
     *   replace: 'showdown'
     * };
     * ```
     */
    interface RegexReplaceExtension extends Extension {
        /**
         * Should be either a string or a RegExp object.
         *
         * Keep in mind that, if a string is used, it will automatically be given a g modifier,
         * that is, it is assumed to be a global replacement.
         */
        regex?: string | RegExp;
        /**
         * Can be either a string or a function. If replace is a string,
         * it can use the $1 syntax for group substitution,
         * exactly as if it were making use of string.replace (internally it does this actually).
         */
        replace?: any;
    }
    /**
     * If you'd just like to do everything yourself,you can specify a filter property.
     * The filter property should be a function that acts as a callback.
     *
     * @example
     * ```ts
     * let myExt: ShowdownExtension = {
     *   type: 'lang',
     *   filter: (text: string, converter: Converter) => text.replace('#', '*')
     * };
     * ```
     */
    interface FilterExtension extends Extension {
        filter?: (text: string, converter: Converter, options?: ConverterOptions) => string;
    }
    /**
     * Defines a plugin/extension
     * Each single extension can be one of two types:
     *
     * + Language Extension -- Language extensions are ones that that add new markdown syntax to showdown. For example, say you wanted ^^youtube http://www.youtube.com/watch?v=oHg5SJYRHA0 to automatically render as an embedded YouTube video, that would be a language extension.
     * + Output Modifiers -- After showdown has run, and generated HTML, an output modifier would change that HTML. For example, say you wanted to change <div class="header"> to be <header>, that would be an output modifier.
     * + Listener Extension -- Listener extensions for listen to conversion events.
     *
     * Each extension can provide two combinations of interfaces for showdown.
     *
     * @example
     * ```ts
     * let myext: ShowdownExtension = {
     *   type: 'output',
     *   filter(text, converter, options) {
     *      // ... do stuff to text ...
     *      return text;
     *   },
     *   listeners: {
     *      ['lists.after'](evtName, text, converter, options, globals){
     *          // ... do stuff to text ...
     *          return text;
     *      },
     *      // ...
     *   }
     * };
     * ```
     */
    interface ShowdownExtension extends RegexReplaceExtension, FilterExtension {
    }
    /**
     * Showdown extensions store object.
     */
    interface ShowdownExtensions {
        [name: string]: ShowdownExtension[];
    }
    /**
     * Showdown converter extensions store object.
     */
    interface ConverterExtensions {
        language: ShowdownExtension[];
        output: ShowdownExtension[];
    }
    interface Metadata {
        [meta: string]: string;
    }
    /**
     * Showdown options.
     *
     * @see https://github.com/showdownjs/showdown#valid-options
     * @see https://github.com/showdownjs/showdown/wiki/Showdown-options
     * @see https://github.com/showdownjs/showdown/blob/master/src/options.js
     */
    interface ShowdownOptions {
        /**
         * Omit the trailing newline in a code block.
         * By default, showdown adds a newline before the closing tags in code blocks. By enabling this option, that newline is removed.
         * This option affects both indented and fenced (gfm style) code blocks.
         *
         * @example
         *
         * **input**:
         *
         * ```md
         * var foo = 'bar';
         * ```
         *
         * **omitExtraWLInCodeBlocks** = false:
         *
         * ```html
         * <code><pre>var foo = 'bar';
         * </pre></code>
         * ```
         * **omitExtraWLInCodeBlocks** = true:
         *
         * ```html
         * <code><pre>var foo = 'bar';</pre></code>
         * ```
         * @default false
         * @since 1.0.0
         */
        omitExtraWLInCodeBlocks?: boolean;
        /**
         * Disable the automatic generation of header ids.
         * Showdown generates an id for headings automatically. This is useful for linking to a specific header.
         * This behavior, however, can be disabled with this option.
         *
         * @example
         * **input**:
         *
         * ```md
         * # This is a header
         * ```
         *
         * **noHeaderId** = false
         *
         * ```html
         * <h1 id="thisisaheader">This is a header</h1>
         * ```
         *
         * **noHeaderId** = true
         *
         * ```html
         * <h1>This is a header</h1>
         * ```
         * @default false
         * @since 1.1.0
         */
        noHeaderId?: boolean;
        /**
         * Use text in curly braces as header id.
         *
         * @example
         *  ```md
         *   ## Sample header {real-id}     will use real-id as id
         *  ```
         * @default false
         * @since 1.7.0
         */
        customizedHeaderId?: boolean;
        /**
         * Generate header ids compatible with github style (spaces are replaced
         * with dashes and a bunch of non alphanumeric chars are removed).
         *
         * @example
         * **input**:
         *
         * ```md
         * # This is a header with @#$%
         * ```
         *
         * **ghCompatibleHeaderId** = false
         *
         * ```html
         * <h1 id="thisisaheader">This is a header</h1>
         * ```
         *
         * **ghCompatibleHeaderId** = true
         *
         * ```html
         * <h1 id="this-is-a-header-with-">This is a header with @#$%</h1>
         * ```
         * @default false
         * @since 1.5.5
         */
        ghCompatibleHeaderId?: boolean;
        /**
         * Add a prefix to the generated header ids.
         * Passing a string will prefix that string to the header id.
         * Setting to true will add a generic 'section' prefix.
         *
         * @default false
         * @since 1.0.0
         */
        prefixHeaderId?: string | boolean;
        /**
         * Setting this option to true will prevent showdown from modifying the prefix.
         * This might result in malformed IDs (if, for instance, the " char is used in the prefix).
         * Has no effect if prefixHeaderId is set to false.
         *
         * @default false
         * @since 1.7.3
         */
        rawPrefixHeaderId?: boolean;
        /**
         * Remove only spaces, ' and " from generated header ids (including prefixes),
         * replacing them with dashes (-).
         * WARNING: This might result in malformed ids.
         *
         * @default false
         * @since 1.7.3
         */
        rawHeaderId?: boolean;
        /**
         * Enable support for setting image dimensions from within markdown syntax.
         *
         * @example
         * ```md
         * ![foo](foo.jpg =100x80)   simple, assumes units are in px
         * ![bar](bar.jpg =100x*)    sets the height to "auto"
         * ![baz](baz.jpg =80%x5em)  Image with width of 80% and height of 5em
         * ```
         * @default false
         * @since 1.1.0
         */
        parseImgDimensions?: boolean;
        /**
         * Set the header starting level. For instance, setting this to 3 means that
         *
         * @example
         *  **input**:
         *
         * ```md
         * # header
         * ```
         *
         * **headerLevelStart** = 1
         *
         * ```html
         * <h1>header</h1>
         * ```
         *
         * **headerLevelStart** = 3
         *
         * ```html
         * <h3>header</h3>
         * ```
         * @default 1
         * @since 1.1.0
         */
        headerLevelStart?: number;
        /**
         * Turning this option on will enable automatic linking to urls.
         *
         * @example
         * **input**:
         *
         * ```md
         * some text www.google.com
         * ```
         *
         * **simplifiedAutoLink** = false
         *
         * ```html
         * <p>some text www.google.com</p>
         * ```
         *
         * **simplifiedAutoLink** = true
         *
         * ```html
         * <p>some text <a href="www.google.com">www.google.com</a></p>
         * ```
         * @default false
         * @since 1.2.0
         */
        simplifiedAutoLink?: boolean;
        /**
         * @deprecated https://github.com/showdownjs/showdown/commit/d3ebff7ef0cde5abfc3874463946d5297fc82e78
         *
         * This option excludes trailing punctuation from autolinking urls.
         * Punctuation excluded: . ! ? ( ).
         *
         * @remarks This option only applies to links generated by {@link Showdown.ShowdownOptions.simplifiedAutoLink}.
         * @example
         * **input**:
         *
         * ```md
         *    check this link www.google.com.
         * ```
         *
         * **excludeTrailingPunctuationFromURLs** = false
         *
         * ```html
         * <p>check this link <a href="www.google.com">www.google.com.</a></p>
         * ```
         *
         * **excludeTrailingPunctuationFromURLs** = true
         *
         * ```html
         * <p>check this link <a href="www.google.com">www.google.com</a>.</p>
         * ```
         * @default false
         * @since 1.5.1
         */
        excludeTrailingPunctuationFromURLs?: boolean;
        /**
         * Turning this on will stop showdown from interpreting underscores in the middle of
         * words as <em> and <strong> and instead treat them as literal underscores.
         *
         * @example
         * **input**:
         *
         * ```md
         * some text with__underscores__in middle
         * ```
         *
         * **literalMidWordUnderscores** = false
         *
         * ```html
         * <p>some text with<strong>underscores</strong>in middle</p>
         * ```
         *
         * **literalMidWordUnderscores** = true
         *
         * ```html
         * <p>some text with__underscores__in middle</p>
         * ```
         * @default false
         * @since 1.2.0
         */
        literalMidWordUnderscores?: boolean;
        /**
         * Enable support for strikethrough syntax.
         *
         * @example
         *  **syntax**:
         *
         * ```md
         * ~~strikethrough~~
         * ```
         *
         * ```html
         * <del>strikethrough</del>
         * ```
         * @default false
         * @since 1.2.0
         */
        strikethrough?: boolean;
        /**
         * Enable support for tables syntax.
         *
         * @example
         *  **syntax**:
         *
         * ```md
         * | h1    |    h2   |      h3 |
         * |:------|:-------:|--------:|
         * | 100   | [a][1]  | ![b][2] |
         * | *foo* | **bar** | ~~baz~~ |
         * ```
         * @default false
         * @since 1.2.0
         */
        tables?: boolean;
        /**
         * If enabled adds an id property to table headers tags.
         *
         * @remarks This options only applies if **[tables][]** is enabled.
         * @default false
         * @since 1.2.0
         */
        tablesHeaderId?: boolean;
        /**
         * Enable support for GFM code block style syntax (fenced codeblocks).
         *
         * @example
         * **syntax**:
         *
         *     ```md
         *        some code here
         *        ```
         * @default true
         * @since 1.2.0
         */
        ghCodeBlocks?: boolean;
        /**
         * Enable support for GFM takslists.
         *
         * @example
         * **syntax**:
         *
         * ```md
         *  - [x] This task is done
         *  - [ ] This is still pending
         * ```
         * @default false
         * @since 1.2.0
         */
        tasklists?: boolean;
        /**
         * Prevents weird effects in live previews due to incomplete input.
         *
         * @example
         * ![awkward effect](http://i.imgur.com/YQ9iHTL.gif)
         * You can prevent this by enabling this option.
         * @default false
         */
        smoothLivePreview?: boolean;
        /**
         * Tries to smartly fix indentation problems related to es6 template
         * strings in the midst of indented code.
         *
         * @default false
         * @since 1.4.2
         */
        smartIndentationFix?: boolean;
        /**
         * Disables the requirement of indenting sublists by 4 spaces for them to be nested,
         * effectively reverting to the old behavior where 2 or 3 spaces were enough.
         *
         * @example
         * **input**:
         *
         * ```md
         * - one
         *   - two
         *
         * ...
         *
         * - one
         *     - two
         * ```
         *
         * **disableForced4SpacesIndentedSublists** = false
         *
         * ```html
         * <ul>
         * <li>one</li>
         * <li>two</li>
         * </ul>
         * <p>...</p>
         * <ul>
         * <li>one
         *    <ul>
         *        <li>two</li>
         *    </ul>
         * </li>
         * </ul>
         * ```
         *
         * **disableForced4SpacesIndentedSublists** = true
         *
         * ```html
         * <ul>
         * <li>one
         *    <ul>
         *        <li>two</li>
         *    </ul>
         * </li>
         * </ul>
         * <p>...</p>
         * <ul>
         * <li>one
         *    <ul>
         *        <li>two</li>
         *    </ul>
         * </li>
         * </ul>
         * ```
         * @default false
         * @since 1.5.0
         */
        disableForced4SpacesIndentedSublists?: boolean;
        /**
         * Parses line breaks as like GitHub does, without needing 2 spaces at the end of the line.
         *
         * @example
         * **input**:
         *
         * ```md
         * a line
         * wrapped in two
         * ```
         *
         * **simpleLineBreaks** = false
         *
         * ```html
         * <p>a line
         * wrapped in two</p>
         * ```
         *
         * **simpleLineBreaks** = true
         *
         * ```html
         * <p>a line<br>
         * wrapped in two</p>
         * ```
         * @default false
         * @since 1.5.1
         */
        simpleLineBreaks?: boolean;
        /**
         * Makes adding a space between # and the header text mandatory.
         *
         * @example
         * **input**:
         *
         * ```md
         * #header
         * ```
         *
         * **requireSpaceBeforeHeadingText** = false
         *
         * ```html
         * <h1 id="header">header</h1>
         * ```
         *
         * **simpleLineBreaks** = true
         *
         * ```html
         * <p>#header</p>
         * ```
         *
         * @default false
         * @since 1.5.3
         */
        requireSpaceBeforeHeadingText?: boolean;
        /**
         * Enables support for github @mentions, which links to the github profile page of the username mentioned.
         *
         * @example
         * **input**:
         *
         * ```md
         * hello there @tivie
         * ```
         *
         * **ghMentions** = false
         *
         * ```html
         * <p>hello there @tivie</p>
         * ```
         *
         * **ghMentions** = true
         *
         * ```html
         * <p>hello there <a href="https://www.github.com/tivie>@tivie</a></p>
         * ```
         * @default false
         * @since 1.6.0
         */
        ghMentions?: boolean;
        /**
         * Changes the link generated by @mentions. `{u}` is replaced by the text of the mentions. Only applies if **[ghMentions][]** is enabled.
         *
         * @example
         * **input**:
         *
         * ```md
         * hello there @tivie
         * ```
         *
         * **ghMentionsLink** = https://github.com/{u}
         *
         * ```html
         * <p>hello there <a href="https://www.github.com/tivie>@tivie</a></p>
         * ```
         *
         * **ghMentionsLink** = http://mysite.com/{u}/profile
         *
         * ```html
         * <p>hello there <a href="//mysite.com/tivie/profile">@tivie</a></p>
         * ```
         * @default https://github.com/{u}
         * @since 1.6.2
         */
        ghMentionsLink?: string;
        /**
         * Enables e-mail addresses encoding through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities.
         *
         * @remarks Prior to version 1.6.1, emails would always be obfuscated through dec and hex encoding.
         * @example
         * **input**:
         *
         * ```
         * <myself@example.com>
         * ```
         *
         * **encodeEmails** = false
         *
         * ```html
         * <a href="mailto:myself@example.com">myself@example.com</a>
         * ```
         *
         * **encodeEmails** = true
         *
         * ```html
         * <a href="&#109;&#97;&#105;&#108;t&#x6f;&#x3a;&#109;&#x79;s&#x65;&#x6c;&#102;&#64;&#x65;xa&#109;&#112;&#108;&#101;&#x2e;c&#x6f;&#109;">&#x6d;&#121;s&#101;&#108;f&#x40;&#x65;&#120;a&#x6d;&#x70;&#108;&#x65;&#x2e;&#99;&#x6f;&#109;</a>
         * ```
         * @default true
         * @since 1.6.1
         */
        encodeEmails?: boolean;
        /**
         * Open all links in new windows (by adding the attribute target="_blank" to <a> tags).
         *
         * @example
         * **input**:
         *
         * ```md
         * [Showdown](http://showdownjs.com)
         * ```
         *
         * **openLinksInNewWindow** = false
         * ```html
         * <p><a href="http://showdownjs.com">Showdown</a></p>
         * ```
         *
         * **openLinksInNewWindow** = true
         * ```html
         * <p><a href="http://showdownjs.com" target="_blank">Showdown</a></p>
         * ```
         * @default false
         * @since 1.7.0
         */
        openLinksInNewWindow?: boolean;
        /**
         * Support for HTML Tag escaping.
         *
         * @example
         * **input**:
         *
         * ```md
         * \<div>foo\</div>.
         * ```
         *
         * **backslashEscapesHTMLTags** = false
         * ```html
         * <p>\<div>foo\</div></p>
         * ```
         *
         * **backslashEscapesHTMLTags** = true
         * ```html
         * <p>&lt;div&gt;foo&lt;/div&gt;</p>
         * ```
         * @default false
         * @since 1.7.2
         */
        backslashEscapesHTMLTags?: boolean;
        /**
         * Enable emoji support.
         *
         * @example
         * ```md
         * this is a :smile: emoji
         * ```
         * @default false
         * @see https://github.com/showdownjs/showdown/wiki/Emojis
         * @since 1.8.0
         */
        emoji?: boolean;
        /**
         * Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled,
         * underscores no longer parses into `<em>` and `<strong>`
         *
         * @example
         * **input**:
         *
         * ```md
         * __underline word__
         * ```
         *
         * **underline** = false
         * ```html
         * <p><strong>underlined word</strong></p>
         * ```
         *
         * **underline** = true
         * ```html
         * <p><u>underlined word</u></p>
         * ```
         * @default false
         * @since 1.8.0
         */
        underline?: boolean;
        /**
         * Outputs a complete html document, including <html>, <head> and <body> tags' instead of an HTML fragment.
         *
         * @example
         * **input**:
         *
         * ```md
         * # Showdown
         * ```
         *
         * **completeHTMLDocument** = false
         * ```html
         * <p><strong>Showdown</strong></p>
         * ```
         *
         * **completeHTMLDocument** = true
         * ```html
         * <!DOCTYPE HTML>
         * <html>
         * <head>
         * <meta charset="utf-8">
         * </head>
         * <body>
         * <p><strong>Showdown</strong></p>
         * </body>
         * </html>
         * ```
         * @default false
         * @since 1.8.5
         */
        completeHTMLDocument?: boolean;
        /**
         * Enable support for document metadata (defined at the top of the document
         * between `«««` and `»»»` or between `---` and `---`).
         *
         * @example
         *  ```js
         *  var conv = new showdown.Converter({metadata: true});
         *  var html = conv.makeHtml(someMd);
         *  var metadata = conv.getMetadata(); // returns an object with the document metadata
         * ```
         * @default false
         * @since 1.8.5
         */
        metadata?: boolean;
        /**
         * Split adjacent blockquote blocks.
         *
         * @since 1.8.6
         */
        splitAdjacentBlockquotes?: boolean;
        /**
         * For custom options {extension, subParser} And also an out-of-date definitions
         */
        [key: string]: any;
    }
    interface ConverterOptions extends ShowdownOptions {
        /**
         * Add extensions to the new converter can be showdown extensions or "global" extensions name.
         */
        extensions?: ((() => ShowdownExtension[] | ShowdownExtension) | ShowdownExtension[] | ShowdownExtension | string)[];
    }
    /**
     * Showdown Flavor names.
     */
    type Flavor = 'github' | 'original' | 'ghost' | 'vanilla' | 'allOn';
    /**
    * Showdown option description.
    */
    interface ShowdownOptionDescription {
        /**
         * The default value of option.
         */
        defaultValue?: boolean;
        /**
         * The description of the option.
         */
        description?: string;
        /**
         * The type of the option value.
         */
        type?: 'boolean' | 'string' | 'integer';
    }
    /**
     * Showdown options schema.
     */
    interface ShowdownOptionsSchema {
        [key: string]: ShowdownOptionDescription;
    }
    /**
     * Showdown subParser.
     */
    type SubParser = (...args: any[]) => string;
    /**
     * Showdown Converter prototype.
     *
     * @see https://github.com/showdownjs/showdown/blob/master/src/converter.js
     */
    interface Converter {
        /**
         * Listen to an event.
         *
         * @param name - The event name.
         * @param callback - The function that will be called when the event occurs.
         * @throws Throws if the type of `name` is not string.
         * @throws Throws if the type of `callback` is not function.
         * @example
         * ```ts
         * let converter: Converter = new Converter();
         * converter
         *   .listen('hashBlock.before', (evtName, text, converter, options, globals) => {
         *     // ... do stuff to text ...
         *     return text;
         *   })
         *   .makeHtml('...');
         * ```
         */
        listen(name: string, callback: EventListener): Converter;
        /**
         * Converts a markdown string into HTML string.
         *
         * @param text - The input text (markdown).
         * @return The output HTML.
         */
        makeHtml(text: string): string;
        /**
         * Converts an HTML string into a markdown string.
         *
         * @param src - The input text (HTML)
         * @param [HTMLParser] A WHATWG DOM and HTML parser, such as JSDOM. If none is supplied, window.document will be used.
         * @returns The output markdown.
         */
        makeMarkdown(src: string, HTMLParser?: HTMLDocument): string;
        /**
         * Setting a "local" option only affects the specified Converter object.
         *
         * @param key - The key of the option.
         * @param value - The value of the option.
         */
        setOption(key: string, value: any): void;
        /**
         * Get the option of this Converter instance.
         *
         * @param key - The key of the option.
         * @returns Returns the value of the given `key`.
         */
        getOption(key: string): any;
        /**
         * Get the options of this Converter instance.
         *
         * @returns Returns the current convertor options object.
         */
        getOptions(): ShowdownOptions;
        /**
         * Add extension to THIS converter.
         *
         * @param extension - The new extension to add.
         * @param name - The extension name.
         */
        addExtension(extension: (() => ShowdownExtension[] | ShowdownExtension) | ShowdownExtension[] | ShowdownExtension, name?: string): void;
        /**
         * Use a global registered extension with THIS converter.
         *
         * @param extensionName - Name of the previously registered extension.
         */
        useExtension(extensionName: string): void;
        /**
         * Set a "local" flavor for THIS Converter instance.
         *
         * @param flavor - The flavor name.
         */
        setFlavor(name: Flavor): void;
        /**
         * Get the "local" currently set flavor of this converter.
         *
         * @returns Returns string flavor name.
         */
        getFlavor(): Flavor;
        /**
         * Remove an extension from THIS converter.
         *
         * @remarks This is a costly operation. It's better to initialize a new converter.
         * and specify the extensions you wish to use.
         * @param extensions - The extensions to remove.
         */
        removeExtension(extensions: ShowdownExtension[] | ShowdownExtension): void;
        /**
         * Get all extensions.
         *
         * @return all extensions.
         */
        getAllExtensions(): ConverterExtensions;
        /**
         * Get the metadata of the previously parsed document.
         *
         * @param raw - If to returns Row or Metadata.
         * @returns Returns Row if `row` is `true`, otherwise Metadata.
         */
        getMetadata(raw?: boolean): string | Metadata;
        /**
         * Get the metadata format of the previously parsed document.
         *
         * @returns Returns the metadata format.
         */
        getMetadataFormat(): string;
    }
    interface ConverterStatic {
        /**
         * @constructor
         * @param converterOptions - Configuration object, describes which extensions to apply.
         */
        new (converterOptions?: ConverterOptions): Converter;
    }
    /**
     * Helper Interface
     */
    interface Helper {
        replaceRecursiveRegExp(...args: any[]): string;
        [key: string]: (...args: any[]) => any;
    }
    /**
     * Constructor function for a Converter.
     */
    var Converter: ConverterStatic;
    /**
     * Showdown helper.
     */
    var helper: Helper;
    /**
     * Showdown extensions.
     */
    var extensions: ShowdownExtensions;
    /**
     * Setting a "global" option affects all instances of showdown.
     *
     * @param key - the option key.
     * @param value - the option value.
     */
    function setOption(key: string, value: any): typeof showdown;
    /**
     * Get a "global" option.
     *
     * @param key - the option key.
     * @returns Returns the value of the given `key`.
     */
    function getOption(key: string): any;
    /**
     * Get the "global" options.
     *
     * @returns Returns a options object.
     */
    function getOptions(): ShowdownOptions;
    /**
     * Reset "global" options to the default values.
     */
    function resetOptions(): void;
    /**
     * Setting a "global" flavor affects all instances of showdown.
     *
     * @param name - The flavor name.
     */
    function setFlavor(name: Flavor): void;
    /**
     * Get the "global" currently set flavor.
     *
     * @returns Returns string flavor name.
     */
    function getFlavor(): Flavor;
    /**
     * Get the options of a specified flavor. Returns undefined if the flavor was not found.
     *
     * @param name - Name of the flavor.
     * @returns Returns options object of the given flavor `name`.
     */
    function getFlavorOptions(name: Flavor): ShowdownOptions | undefined;
    /**
     * Get the default options.
     *
     * @param [simple=true] - If to returns the default showdown options or the showdown options schema.
     * @returns Returns the options schema if `simple` is `false`, otherwise the default showdown options.
     */
    function getDefaultOptions(simple?: boolean): ShowdownOptionsSchema | ShowdownOptions;
    /**
     * Get a registered subParser.
     *
     * @param name - The parser name.
     * @returns Returns the parser of the given `name`.
     * @throws Throws if `name` is not of type string.
     * @throws Throws if the parser is not exists.
     */
    function subParser(name: string): SubParser;
    /**
     * Register a subParser.
     *
     * @param name - The name of the new parser.
     * @param func - The handler function of the new parser.
     * @throws Throws if `name` is not of type string.
     */
    function subParser(name: string, func: SubParser): void;
    /**
     * Get a registered extension.
     *
     * @param name - The extension name.
     * @returns Returns the extension of the given `name`.
     * @throws Throws if `name` is not of type string.
     * @throws Throws if the extension is not exists.
     */
    function extension(name: string): ShowdownExtension[];
    /**
     * Register a extension.
     *
     * @param name - The name of the new extension.
     * @param ext - The extension.
     * @throws Throws if `name` is not of type string.
     */
    function extension(name: string, ext: (() => ShowdownExtension[] | ShowdownExtension) | ShowdownExtension[] | ShowdownExtension): void;
    /**
     * Get the "global" extensions.
     *
     * @return Returns all extensions.
     */
    function getAllExtensions(): ShowdownExtensions;
    /**
     * Remove an extension.
     *
     * @param name - The extension name.
     */
    function removeExtension(name: string): void;
    /**
     * Removes all extensions.
     */
    function resetExtensions(): void;
    /**
     * Checks if the given `ext` is a valid showdown extension.
     *
     * @param ext - The extension to checks.
     * @returns Returns `true` if the extension is valid showdown extension, otherwise `false`.
     */
    function validateExtension(ext: ShowdownExtension[] | ShowdownExtension): boolean;
}
//# sourceMappingURL=helpcenter.showdown.d.ts.map