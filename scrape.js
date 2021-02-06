const fs = require('fs')
const process = require('process')
const puppeteer = require('puppeteer')
const { ArgumentParser } = require('argparse')


class scrapePDF {
    
    // Open browser
    // Go to given url
    // Login to Kindle Cloud
    async openPage() {
        // Start browser
        this.browser = await puppeteer.launch(this.chromeOptions);
        this.page = await this.browser.newPage();
        await this.page.goto(this.url, { waitUntil: 'networkidle0' });
        await this.page.waitForSelector(this.sel.signInButton);

        // Login to Kindle
        await this.page.focus(this.sel.emailField)
        await this.page.keyboard.type(this.email)
        await this.page.focus(this.sel.passwordField)
        await this.page.keyboard.type(this.password)
        await this.page.click(this.sel.signInButton)
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' })

        // Switch to content iframe
        await this.switchToFrame()
        await this.content.waitForSelector(this.sel.loadingWheel, { hidden: true })
    }

    async switchToFrame() {
        this.frame = await this.page.$(this.sel.iframe)
        this.content = await this.frame.contentFrame()
    }

    // Click on page settings button
    // Change font size
    // Change page margin
    // Change page color
    // Set one column only
    // Apply settings
    async changePageLayout() {
        await this.content.$eval(this.sel.pageSettingsButton, el => el.click())
        await this.content.click(this.sel.fontSize[this.fontSize])
        await this.content.click(this.sel.pageMargin[this.pageMargin])
        await this.content.click(this.sel.pageColor[this.pageColor])
        await this.content.click(this.sel.oneColumnOnly)
        await this.content.click(this.sel.applySettingsButton)
        await this.page.waitForTimeout(1000)
        await this.content.waitForSelector(this.sel.loadingWheel, { hidden: true })
    }

    // Make right-arrow button visible
    // Click on right-arrow button
    // Make right-arrow button invisible
    async goToNextPage() {
        var nextPage = await this.content.$(this.sel.nextPage)
        if (nextPage) {
            nextPage.evaluate((el) => el.style.display = 'block')
            await nextPage.click()
            nextPage.evaluate((el) => el.style.display = 'none')
            await this.page.waitForTimeout(1000)
            await this.switchToFrame()
            await this.content.waitForSelector(this.sel.loadingWheel, { hidden: true })
        } else {
            console.log('right-arrow button not found')
        }
    }

    // Save given screen to pdf with given fileName
    async saveToPdf(fileName) {
        try {
            this.printOptions.path = this.savePath+fileName
            const pdf = await this.page.pdf(this.printOptions);
        } catch(err) {
            console.log("Failed to convert page to PDF ("+err.name+" - "+err.message+")")
            console.log(err)
        }
    }

    // Print progress to stdout during scraping
    printProgress(page) {
        process.stdout.clearLine()
        process.stdout.cursorTo(0) 
        process.stdout.write('Scraping PDF pages from Kindle: '+page+' from '+this.noPages)
    }

    async run() {
        await this.openPage()
        await this.changePageLayout()
        for (let i=0; i<this.noPages; i++) {
            this.printProgress(i)
            await this.saveToPdf(i+'.pdf')
            await this.goToNextPage()
        }
        process.stdout.write('\n')
        await this.browser.close()
    }

    constructor(url,
                email,
                password,
                noPages,
                savePath,
                fontSize=1,
                pageMargin=2,
                pageColor='white') {

        this.url = url
        this.email = email
        this.password = password
        this.noPages = noPages;
        this.savePath = savePath;
        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath);
        }
        if (![0,1,2,3,4].includes(fontSize)) {
            throw "fontSize argument must be one of following [0,1,2,3,4]"
        }
        this.fontSize = fontSize
        if (![0,1,2,3,4].includes(pageMargin)) {
            throw "pageMargin argument must be one of following [0,1,2,3,4]"
        }
        this.pageMargin = pageMargin
        if (!["white","sepia","black"].includes(pageColor)) {
            throw "pageColor argument must be one of following ['white','sepia','black']"
        }
        this.pageColor = pageColor

        // DOM selectors
        this.sel = {
            iframe: '#KindleReaderIFrame',
            loadingWheel: '#loading_spinner',
            nextPage: '#kindleReader_pageTurnAreaRight',
            emailField: '#ap_email',
            passwordField: '#ap_password',
            signInButton: '#signInSubmit',
            pageSettingsButton: '#kindleReader_button_controlPanel',
            fontSize: {
                0: '#kindleReader_controlPanel_xSmallFont',
                1: '#kindleReader_controlPanel_smallFont',
                2: '#kindleReader_controlPanel_mediumFont',
                3: '#kindleReader_controlPanel_largeFont',
                4: '#kindleReader_controlPanel_xLargeFont'
            },
            pageMargin: {
                0: '#kindleReader_controlPanel_xSmallMargin',
                1: '#kindleReader_controlPanel_smallMargin',
                2: '#kindleReader_controlPanel_mediumMargin',
                3: '#kindleReader_controlPanel_largeMargin',
                4: '#kindleReader_controlPanel_xLargeMargin'
            },
            pageColor: {
                'white': '#kindleReader_controlPanel_colorWhite',
                'sepia': '#kindleReader_controlPanel_colorSepia',
                'black': '#kindleReader_controlPanel_colorBlack'
            },
            oneColumnOnly: '#kindleReader_controlPanel_columnButton_on',
            applySettingsButton: 'body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.settings_dialog > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(2)'
        }

        // options for puppeteer.launch method
        this.chromeOptions = {
            headless: true,
            defaultViewport: {
                width: 960,
                height: 900
            },
            slowMo: 0,
            args: []
        }

        // options for page.pdf method
        this.printOptions = {
            format: 'A4', 
            path: null,
            scale: 1.0,
            displayHeaderFooter: false,
            printBackground: true,
            landscape: false,
            margin: {
                top: 0.0,
                bottom: 0.0,
                left: 0.0,
                right: 0.0
            },
            preferCSSPageSize: false
        }

        this.run()
    }
}




const parser = new ArgumentParser({
    description: 'Scrape single PDF pages of given book from Kindle Cloud Reader'
})

parser.add_argument('-url', {
    type: 'str',
    required: true,
    help: 'URL of given book in Kindle Cloud Reader (required)'
})
parser.add_argument('-email', {
    type: 'str',
    required: true,
    help: 'Amazon login email (required)'
})
parser.add_argument('-pwd', {
    type: 'str',
    required: true,
    metavar: 'PASSWORD',
    help: 'Amazon login password (required)'
})
parser.add_argument('-pages', {
    type: 'int',
    required: true,
    metavar: 'NO. PAGES',
    help: 'Number of pages (from beginning) to scrape (required)'
})
parser.add_argument('-path', {
    type: 'str',
    required: true,
    metavar: 'SAVE PATH',
    help: 'Absolute/relative path to save PDF files (required)'
})
parser.add_argument('-fs', '--fontSize', {
    type: 'int',
    nargs: '?',
    default: 2,
    help: 'Font size of text 0/1/2/3/4 (default 2)'
})
parser.add_argument('-pm', '--pageMargin', {
    type: 'int',
    nargs: '?',
    default: 1,
    help: 'PDF page margins 0/1/2/3/4 (default 1)'
})
parser.add_argument('-pc', '--pageColor', {
    type: 'str',
    nargs: '?',
    default: 'white',
    help: 'PDF page color white/sepia/black (default white)'
})

const args = parser.parse_args()

new scrapePDF(url=args.url,
              email=args.email,
              password=args.pwd,
              noPages=args.pages,
              savePath=args.path,
              fontSize=args.fontSize,
              pageMargin=args.pageMargin,
              pageColor=args.pageColor)

