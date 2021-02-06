# kindle-pdf-scraper
Node.js/Puppeteer scraper able to download given book from Kindle Cloud Reader as PDF.  
Scraper performs following actions in Kindle Cloud Reader:
- log into the app
- set page layout in the app
- press next-page button for each page and download each page as PDF with `page.pdf` interface  

Due to lack of Node.js PDF libraries the merging was implemented with Python 3/PyPDF2.

## Prerequisities
- Node.js, npm cli
- Puppeteer ^7.0.1
- argparse ^2.0.1
- Python 3, PyPDF2 package (for PDF merging)


## Usage
`npm install`  

`
node scrape.js -url "https://read.amazon.com/?asin=XXXXXXXXXX" -email "xxx@yy.zz" -pwd "d7nkb1!3423j" -pages 200 -path "./my-book/" -fs 0 -pm 1 -pc "white"`  
`
```
optional arguments:  
  -h, --help            show this help message and exit
  -url URL              URL of given book in Kindle Cloud Reader (required)
  -email EMAIL          Amazon login email (required)
  -pwd PASSWORD         Amazon login password (required)
  -pages NO. PAGES      Number of pages (from beginning) to scrape (required)
  -path SAVE PATH       Absolute/relative path to save PDF files (required)
  -fs [FONTSIZE], --fontSize [FONTSIZE]
                        Font size of text 0/1/2/3/4 (default 2)
  -pm [PAGEMARGIN], --pageMargin [PAGEMARGIN]
                        PDF page margins 0/1/2/3/4 (default 1)
  -pc [PAGECOLOR], --pageColor [PAGECOLOR]
                        PDF page color white/sepia/black (default white)
 ```
 
 ## Recommendations
 Kindle Cloud Reader makes it difficult to render text on PDF pages. From that reason it is recommended to set up PDF layout first. Start with changing these parameters:
 - font size (-fs) and page margin (-pm) arguments
 - browser viewport : change `defaultViewport` values of `chromeOptions` object in the constructor  
 
 If PDF layout is still not sufficient enough, continue with changing `printOptions` object in the constructor.  
 
 ## Known issues
 - browser sometimes looses track of `iframe` with page content (`this.sel.iframe` selector). It was not possible to reproduce the error
