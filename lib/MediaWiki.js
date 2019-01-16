"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var country_language_1 = __importDefault(require("country-language"));
var domino_1 = __importDefault(require("domino"));
var url_1 = __importDefault(require("url"));
var U = __importStar(require("./Utils"));
// Stub for now
var MediaWiki = /** @class */ (function () {
    function MediaWiki(logger, config) {
        this.logger = logger;
        // Normalize args
        this.base = config.base.replace(/\/$/, '') + "/";
        this.wikiPath = config.wikiPath !== undefined && config.wikiPath !== true ? config.wikiPath : 'wiki/';
        this.apiPath = config.apiPath === undefined ? 'w/api.php' : config.apiPath;
        this.modulePath = config.modulePath === undefined ? 'w/load.php' : config.modulePath;
        this.domain = config.domain || '';
        this.username = config.username;
        this.password = config.password;
        this.spaceDelimiter = config.spaceDelimiter;
        // Computed properties
        this.webUrl = "" + (this.base + this.wikiPath);
        this.apiUrl = this.base + this.apiPath + "?";
        this.modulePath = this.base + this.modulePath + "?";
        this.webUrlPath = url_1.default.parse(this.webUrl).pathname;
        // State
        this.namespaces = {};
        this.namespacesToMirror = [];
    }
    MediaWiki.prototype.login = function (downloader) {
        return __awaiter(this, void 0, void 0, function () {
            var url, content, body, jsonResponse, subContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.username && this.password)) return [3 /*break*/, 3];
                        url = this.apiUrl + "action=login&format=json&lgname=" + this.username + "&lgpassword=" + this.password;
                        if (this.domain) {
                            url = url + "&lgdomain=" + this.domain;
                        }
                        return [4 /*yield*/, downloader.downloadContent(url)];
                    case 1:
                        content = (_a.sent()).content;
                        body = content.toString();
                        jsonResponse = JSON.parse(body).login;
                        downloader.loginCookie = jsonResponse.cookieprefix + "_session=" + jsonResponse.sessionid;
                        if (!(jsonResponse.result !== 'SUCCESS')) return [3 /*break*/, 3];
                        url = url + "&lgtoken=" + jsonResponse.token;
                        return [4 /*yield*/, downloader.downloadContent(url)];
                    case 2:
                        subContent = (_a.sent()).content;
                        body = subContent.toString();
                        jsonResponse = JSON.parse(body).login;
                        if (jsonResponse.result !== 'Success') {
                            throw new Error('Login Failed');
                        }
                        downloader.loginCookie = jsonResponse.cookieprefix + "_session=" + jsonResponse.sessionid;
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // In all the url methods below:
    // * encodeURIComponent is mandatory for languages with illegal letters for uri (fa.wikipedia.org)
    // * encodeURI is mandatory to encode the pipes '|' but the '&' and '=' must not be encoded
    MediaWiki.prototype.siteInfoUrl = function () {
        return this.apiUrl + "action=query&meta=siteinfo&format=json";
    };
    MediaWiki.prototype.imageQueryUrl = function (title) {
        return this.apiUrl + "action=query&prop=pageimages&pithumbsize=300&format=json&titles=" + encodeURIComponent(title);
    };
    MediaWiki.prototype.articleQueryUrl = function (title) {
        return this.apiUrl + "action=query&redirects&format=json&prop=revisions|coordinates&titles=" + encodeURIComponent(title);
    };
    MediaWiki.prototype.backlinkRedirectsQueryUrls = function (articleIds, maxArticlesPerUrl, maxUrlLength) {
        var baseUrl = this.apiUrl + "action=query&prop=redirects&format=json&rdprop=title&rdlimit=max&rawcontinue=&titles=";
        var redirectUrls = articleIds.reduce(function (_a, articleId) {
            var urls = _a.urls, activeUrlArticleCount = _a.activeUrlArticleCount;
            var encodedArticleId = encodeURIComponent(articleId);
            var url = urls[urls.length - 1];
            if (!urls.length || url.length + encodedArticleId.length > maxUrlLength || activeUrlArticleCount >= maxArticlesPerUrl) {
                urls.push(baseUrl + encodedArticleId);
                activeUrlArticleCount = 1;
            }
            else {
                urls[urls.length - 1] += '|' + encodedArticleId;
                activeUrlArticleCount += 1;
            }
            return { urls: urls, activeUrlArticleCount: activeUrlArticleCount };
        }, { urls: [], activeUrlArticleCount: 0 });
        return redirectUrls.urls;
    };
    MediaWiki.prototype.pageGeneratorQueryUrl = function (namespace, init) {
        return this.apiUrl + "action=query&generator=allpages&gapfilterredir=nonredirects&gaplimit=max&colimit=max&prop=revisions|coordinates&gapnamespace=" + this.namespaces[namespace].num + "&format=json&rawcontinue=" + init;
    };
    MediaWiki.prototype.articleApiUrl = function (articleId) {
        return this.apiUrl + "action=parse&format=json&page=" + encodeURIComponent(articleId) + "&prop=" + encodeURI('modules|jsconfigvars|headhtml');
    };
    MediaWiki.prototype.getTextDirection = function (env, downloader) {
        return __awaiter(this, void 0, void 0, function () {
            var self, logger, content, body, doc, contentNode, languageDirectionRegex, parts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        logger = self.logger;
                        logger.log('Getting text direction...');
                        return [4 /*yield*/, downloader.downloadContent(this.webUrl)];
                    case 1:
                        content = (_a.sent()).content;
                        body = content.toString();
                        doc = domino_1.default.createDocument(body);
                        contentNode = doc.getElementById('mw-content-text');
                        languageDirectionRegex = /"pageLanguageDir":"(.*?)"/;
                        parts = languageDirectionRegex.exec(body);
                        if (parts && parts[1]) {
                            env.ltr = (parts[1] === 'ltr');
                        }
                        else if (contentNode) {
                            env.ltr = (contentNode.getAttribute('dir') === 'ltr');
                        }
                        else {
                            logger.log('Unable to get the language direction, fallback to ltr');
                            env.ltr = true;
                        }
                        logger.log("Text direction is " + (env.ltr ? 'ltr' : 'rtl'));
                        return [2 /*return*/];
                }
            });
        });
    };
    MediaWiki.prototype.getSiteInfo = function (env, downloader) {
        return __awaiter(this, void 0, void 0, function () {
            var self, url, content, body, entries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        this.logger.log('Getting web site name...');
                        url = this.apiUrl + "action=query&meta=siteinfo&format=json&siprop=general|namespaces|statistics|variables|category|wikidesc";
                        return [4 /*yield*/, downloader.downloadContent(url)];
                    case 1:
                        content = (_a.sent()).content;
                        body = content.toString();
                        entries = JSON.parse(body).query.general;
                        /* Welcome page */
                        if (!env.zim.mainPageId && !env.zim.articleList) {
                            env.zim.mainPageId = entries.mainpage.replace(/ /g, self.spaceDelimiter);
                        }
                        /* Site name */
                        if (!env.zim.name) {
                            env.zim.name = entries.sitename;
                        }
                        /* Language */
                        env.zim.langIso2 = entries.lang;
                        country_language_1.default.getLanguage(env.zim.langIso2, function (error, language) {
                            if (error || !language.iso639_3) {
                                env.zim.langIso3 = env.zim.langIso2;
                            }
                            else {
                                env.zim.langIso3 = language.iso639_3;
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    MediaWiki.prototype.getNamespaces = function (addNamespaces, downloader) {
        return __awaiter(this, void 0, void 0, function () {
            var self, url, content, body, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        self = this;
                        url = this.apiUrl + "action=query&meta=siteinfo&siprop=namespaces|namespacealiases&format=json";
                        return [4 /*yield*/, downloader.downloadContent(url)];
                    case 1:
                        content = (_a.sent()).content;
                        body = content.toString();
                        json = JSON.parse(body);
                        ['namespaces', 'namespacealiases'].forEach(function (type) {
                            var entries = json.query[type];
                            Object.keys(entries).forEach(function (key) {
                                var entry = entries[key];
                                var name = entry['*'].replace(/ /g, self.spaceDelimiter);
                                var num = entry.id;
                                var allowedSubpages = ('subpages' in entry);
                                var isContent = !!(entry.content !== undefined || U.contains(addNamespaces, num));
                                var canonical = entry.canonical ? entry.canonical.replace(/ /g, self.spaceDelimiter) : '';
                                var details = { num: num, allowedSubpages: allowedSubpages, isContent: isContent };
                                /* Namespaces in local language */
                                self.namespaces[U.lcFirst(name)] = details;
                                self.namespaces[U.ucFirst(name)] = details;
                                /* Namespaces in English (if available) */
                                if (canonical) {
                                    self.namespaces[U.lcFirst(canonical)] = details;
                                    self.namespaces[U.ucFirst(canonical)] = details;
                                }
                                /* Is content to mirror */
                                if (isContent) {
                                    self.namespacesToMirror.push(name);
                                }
                            });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    MediaWiki.prototype.extractPageTitleFromHref = function (href) {
        try {
            var pathname = url_1.default.parse(href, false, true).pathname || '';
            if (pathname.indexOf('./') === 0) {
                return U.decodeURIComponent(pathname.substr(2));
            }
            if (pathname.indexOf(this.webUrlPath) === 0) {
                return U.decodeURIComponent(pathname.substr(this.webUrlPath.length));
            }
            return null; /* Interwiki link? -- return null */
        }
        catch (error) {
            this.logger.warn("Unable to parse href " + href);
            return null;
        }
    };
    return MediaWiki;
}());
exports.default = MediaWiki;
