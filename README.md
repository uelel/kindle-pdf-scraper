# kindle-pdf-scraper
Node.js/Puppeteer scraper able to download given book from Kindle Cloud Reader as PDF.  

Scraper performs following actions in Kindle Cloud Reader:
- log into the app
- set page layout in the app
- press next-page button for each page and download each page as PDF with `page.pdf` interface  

This process was implemented in 02/2021. It is possible that this implementation will need to be adjusted in the future.  

Due to lack of Node.js PDF libraries the merging was implemented with Python 3/PyPDF2.

___

## Prerequisities
- Node.js, npm cli
- Puppeteer ^7.0.1 with built-in Chromium
- argparse ^2.0.1
- Python 3, PyPDF2 package (for PDF merging)

___

## Usage
`npm install`  

`node scrape.js -url "https://read.amazon.com/?asin=XXXXXXXXXX" -email "xxx@yy.zz" -pwd "d7nkb1!3423j" -pages 200 -path "./my-book/" -fs 0 -pm 1 -pc "white"`  

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
 
 `python merge.py -path ./my-book/ -fr 1 -to 200 -name final.pdf -l 200`
 
 ```
 usage: merge.py [-h] -path PATH -fr FR -to TO -name NAME [-l [LEFT]] [-r [RIGHT]] [-t [TOP]] [-b [BOTTOM]]

Merge given scraped PDF pages into single PDF book

optional arguments:
  -h, --help            show this help message and exit
  -path PATH            Path to scraped PDF pages with name pattern \d+/pdf (REQUIRED)
  -fr FR                Number of first PDF page to merge (REQUIRED)
  -to TO                Number of last PDF page to merge (REQUIRED)
  -name NAME            Name of final PDF file (REQUIRED)
  -l [LEFT], --left [LEFT]
                        Crop left margin of all pages (px) (default 0)
  -r [RIGHT], --right [RIGHT]
                        Crop right margin of all pages (px) (default 0)
  -t [TOP], --top [TOP]
                        Crop top margin of all pages (px) (default 0)
  -b [BOTTOM], --bottom [BOTTOM]
                        Crop bottom margin of all pages (px) (default 0)
 ```
 
 ___
 
 ## Recommendations
 Kindle Cloud Reader makes it difficult to render text on PDF pages. For that reason it is recommended to set up PDF layout first. Start with changing these parameters:
 - font size (-fs) and page margin (-pm) arguments
 - browser viewport : change `defaultViewport` values of `chromeOptions` object in the constructor  
 
 If PDF layout is still not sufficient enough, continue with changing `printOptions` object in the constructor.  
 
 ___
 
 ## Known issues
 - browser sometimes looses track of `iframe` with page content (`this.sel.iframe` selector). It was not possible to reproduce the error
