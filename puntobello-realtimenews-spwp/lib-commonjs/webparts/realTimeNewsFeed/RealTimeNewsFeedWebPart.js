"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// React and ReactDOM imports for building and rendering components
var React = tslib_1.__importStar(require("react"));
var ReactDom = tslib_1.__importStar(require("react-dom"));
// SPFx component base and web part imports for theming and client-side web part functionalities
var sp_component_base_1 = require("@microsoft/sp-component-base");
var sp_webpart_base_1 = require("@microsoft/sp-webpart-base");
var sp_core_library_1 = require("@microsoft/sp-core-library");
// PnP SPFx property control for number inputs in the property pane
var PropertyFieldNumber_1 = require("@pnp/spfx-property-controls/lib/PropertyFieldNumber");
// Importing localization strings and lodash utility library
var strings = tslib_1.__importStar(require("realTimeNewsFeedStrings"));
// Component imports for the RealTimeNewsFeed and context management
var RealTimeNewsFeed_1 = require("./components/RealTimeNewsFeed");
var AppContext_1 = require("./contexts/AppContext");
// Service and utility imports for logging and SharePoint interactions
var logger_1 = require("./utils/logger");
var SharePointService_1 = tslib_1.__importDefault(require("./services/SharePointService"));
var RealTimeNewsFeedWebPart = /** @class */ (function (_super) {
    tslib_1.__extends(RealTimeNewsFeedWebPart, _super);
    function RealTimeNewsFeedWebPart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.initialized = false;
        return _this;
    }
    RealTimeNewsFeedWebPart.prototype._handleThemeChangedEvent = function (args) {
        this.themeVariant = args.theme;
        this.render();
    };
    RealTimeNewsFeedWebPart.prototype.onInit = function () {
        var _a, _b, _c, _d;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var listId, listItemId, language, spo, _e, error_1;
            return tslib_1.__generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        this.logger = logger_1.Logger.getInstance();
                        this.logger.setContextInfo(this.context.manifest.alias + " with id " + this.context.manifest.id);
                        this.logger.info('Logger initialized');
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 4, , 5]);
                        // Make wp theme aware
                        this.themeProvider = this.context.serviceScope.consume(sp_component_base_1.ThemeProvider.serviceKey);
                        this.themeVariant = this.themeProvider.tryGetTheme();
                        this.themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);
                        listId = (_b = (_a = this.context.pageContext.list) === null || _a === void 0 ? void 0 : _a.id.toString()) !== null && _b !== void 0 ? _b : '';
                        listItemId = (_d = (_c = this.context.pageContext.listItem) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : 0;
                        language = this.context.pageContext.web.language;
                        return [4 /*yield*/, _super.prototype.onInit.call(this)];
                    case 2:
                        _f.sent();
                        spo = this.context.serviceScope.consume(SharePointService_1.default.serviceKey);
                        // Set the full SPFx context on the SharePoint service
                        // This is required for PnP v4 to work correctly with authentication
                        spo.setContext(this.context);
                        _e = this;
                        return [4 /*yield*/, spo.calculateLanguage(listId, listItemId, language)];
                    case 3:
                        _e.pageLanguage = _f.sent();
                        this.initialized = true;
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _f.sent();
                        this.logger.error("Error in onInit Webpart: ", error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RealTimeNewsFeedWebPart.prototype.render = function () {
        if (this.initialized) {
            var appContext = new AppContext_1.AppContext(this.context, this.logger, this.pageLanguage, this.themeVariant, this.properties.newsCount);
            var element = React.createElement(AppContext_1.AppContextProvider, { appContext: appContext }, React.createElement(RealTimeNewsFeed_1.RealTimeNewsFeed));
            ReactDom.render(element, this.domElement);
        }
    };
    RealTimeNewsFeedWebPart.prototype.onDispose = function () {
        ReactDom.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(RealTimeNewsFeedWebPart.prototype, "dataVersion", {
        get: function () {
            return sp_core_library_1.Version.parse('1.0');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RealTimeNewsFeedWebPart.prototype, "disableReactivePropertyChanges", {
        get: function () {
            return true;
        },
        enumerable: false,
        configurable: true
    });
    RealTimeNewsFeedWebPart.prototype.getPropertyPaneConfiguration = function () {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                (0, PropertyFieldNumber_1.PropertyFieldNumber)("newsCount", {
                                    key: "newsCount",
                                    label: strings.newsCountLabel,
                                    description: strings.newsCountDesc,
                                    value: this.properties.newsCount,
                                    maxValue: 24,
                                    minValue: 1,
                                    disabled: false
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    };
    return RealTimeNewsFeedWebPart;
}(sp_webpart_base_1.BaseClientSideWebPart));
exports.default = RealTimeNewsFeedWebPart;
//# sourceMappingURL=RealTimeNewsFeedWebPart.js.map