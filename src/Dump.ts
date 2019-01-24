import * as pathParser from 'path';
import * as urlParser from 'url';
import { MWMetaData } from './util/mediaWiki';
import { AsyncQueue } from 'async';


interface DumpOpts {
    username: any;
    password: any;
    spaceDelimiter: string;
    outputDirectory: string;
    tmpDirectory: string;
    keepHtml: boolean;
    publisher: string;
    withoutZimFullTextIndex: boolean;
    customZimTags?: string;
    customZimTitle?: string;
    customZimDescription?: string;
    mainPage?: string;
    filenamePrefix?: string;
    articleList?: string;
}

export class Dump {
    nopic: boolean;
    novid: boolean;
    nopdf: boolean;
    nozim: boolean;
    nodet: boolean;
    contentDate: string;
    opts: DumpOpts;
    mwMetaData: MWMetaData;


    mediaQueue: AsyncQueue<string>;

    constructor(format: string, opts: DumpOpts, mwMetaData: MWMetaData) {
        this.mwMetaData = mwMetaData;
        this.opts = opts;

        this.nopic = format.toString().search('nopic') >= 0;
        this.novid = format.toString().search('novid') >= 0;
        this.nopdf = format.toString().search('nopdf') >= 0;
        this.nozim = format.toString().search('nozim') >= 0;
        this.nodet = format.toString().search('nodet') >= 0;

        const date = new Date();
        this.contentDate = `${date.getFullYear()}-${(`0${date.getMonth() + 1}`).slice(-2)}`;

    }

    public computeFilenameRadical(withoutSelection?, withoutContentSpecifier?, withoutDate?) {
        let radical;
        if (this.opts.filenamePrefix) {
            radical = this.opts.filenamePrefix;
        } else {
            radical = `${this.mwMetaData.creator.charAt(0).toLowerCase() + this.mwMetaData.creator.substr(1)}_`;
            const hostParts = urlParser.parse(this.mwMetaData.webUrl).hostname.split('.');
            let langSuffix = this.mwMetaData.langIso2;
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < hostParts.length; i += 1) {
                if (hostParts[i] === this.mwMetaData.langIso3) {
                    langSuffix = hostParts[i];
                    break;
                }
            }
            radical += langSuffix;
        }
        if (!withoutSelection && !this.opts.filenamePrefix) {
            if (this.opts.articleList) {
                radical += `_${pathParser.basename(this.opts.articleList, pathParser.extname(this.opts.articleList)).toLowerCase().replace(/ /g, this.opts.spaceDelimiter)}`;
            } else {
                radical += '_all';
            }
        }
        if (!withoutContentSpecifier) {
            if (this.nopic) {
                radical += '_nopic';
            } else if (this.nopdf) {
                radical += '_nopdf';
            } else if (this.novid && !this.nodet) {
                radical += '_novid';
            }
            radical += this.nodet ? '_nodet' : '';
        }
        if (!withoutDate) {
            radical += `_${this.contentDate}`;
        }
        return radical;
    }

    public computeHtmlRootPath() {
        let htmlRootPath;
        if (this.nozim) {
            htmlRootPath = this.opts.outputDirectory[0] === '/' ? this.opts.outputDirectory : `${pathParser.resolve(process.cwd(), this.opts.tmpDirectory)}/`;
        } else {
            htmlRootPath = this.opts.tmpDirectory[0] === '/' ? this.opts.tmpDirectory : `${pathParser.resolve(process.cwd(), this.opts.tmpDirectory)}/`;
        }
        htmlRootPath += `${this.computeFilenameRadical()}/`;
        return htmlRootPath;
    }

    public async getRelevantStylesheetUrls() {
        const sheetUrls: string[] = [];

        /* Load main page to see which CSS files are needed */
        const { content } = await downloadContentAndCache(this.mwMetaData.webUrl);
        const html = content.toString();
        const doc = domino.createDocument(html);
        const links = doc.getElementsByTagName('link');

        /* Go through all CSS links */
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < links.length; i += 1) {
            const link = links[i];
            if (link.getAttribute('rel') === 'stylesheet') {
                sheetUrls.push(link);
            }
        }

        /* Push Mediawiki:Offline.css (at the end) */
        const offlineCssUrl = `${this.mwMetaData.webUrl}Mediawiki:offline.css?action=raw`;
        sheetUrls.push(offlineCssUrl);

        return sheetUrls.filter(a => a.trim());
    }



}