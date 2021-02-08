import sys
import argparse
from PyPDF2 import PdfFileReader, PdfFileWriter

def mergePdf(path=None,
             startNo=None,
             stopNo=None,
             fileName=None,
             cropLeft=0,
             cropRight=0,
             cropTop=0,
             cropBottom=0):
    """
    Merges given scraped PDF pages into single PDF book
    path (str): path to scraped PDF pages with name pattern "\d+.pdf"
    startNo (int): number of first PDF page to merge
    stopNo (int): number of last PDF page to merge
    fileName (str): name of final PDF file
    cropLeft (int): crop left margin of all pages (px)
    cropRight (int): crop right margin of all pages (px)
    cropTop (int): crop top margin of all pages (px)
    cropBottom (int): crop bottom margin of all pages (px)
    """

    inputStreams = []
    try:
        # Open all files
        for i in range(startNo,stopNo+1):
            inputStreams.append(open(path+str(i)+'.pdf', 'rb'))
            
        # Create final PDF file
        finalPdf = PdfFileWriter()
        for reader in map(PdfFileReader, inputStreams):
            for i in range(reader.getNumPages()):
                page = reader.getPage(i)
                # Crop page
                page.mediaBox.upperRight = (page.mediaBox.getUpperRight_x()-cropRight,
                                            page.mediaBox.getUpperRight_y()-cropTop)
                page.mediaBox.lowerLeft  = (page.mediaBox.getLowerLeft_x()+cropLeft,
                                            page.mediaBox.getLowerLeft_y()+cropBottom)
                finalPdf.addPage(page)
        
        # Remove links from final PDF
        finalPdf.removeLinks()
        
        # Save final PDF file
        with open(path+fileName, 'wb') as outputStream:
            finalPdf.write(outputStream)
    finally:
        for f in inputStreams:
            f.close()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Merge given scraped PDF pages into single PDF book')
    parser.add_argument('-path', type=str, required=True, help="Path to scraped PDF pages with name pattern \d+/pdf (REQUIRED)")
    parser.add_argument('-fr', type=int, required=True, help="Number of first PDF page to merge (REQUIRED)")
    parser.add_argument('-to', type=int, required=True, help="Number of last PDF page to merge (REQUIRED)")
    parser.add_argument('-name', type=str, required=True, help="Name of final PDF file (REQUIRED)")
    parser.add_argument('-l', '--left', type=int, nargs='?', default=0, help="Crop left margin of all pages (px) (default 0)")
    parser.add_argument('-r', '--right', type=int, nargs='?', default=0, help="Crop right margin of all pages (px) (default 0)")
    parser.add_argument('-t', '--top',  type=int, nargs='?', default=0, help="Crop top margin of all pages (px) (default 0)")
    parser.add_argument('-b', '--bottom', type=int, nargs='?', default=0, help="Crop bottom margin of all pages (px) (default 0)")
    args = parser.parse_args()


    mergePdf(path=args.path,
             startNo=args.fr,
             stopNo=args.to,
             fileName=args.name,
             cropLeft=args.left,
             cropRight=args.right,
             cropTop=args.top,
             cropBottom=args.bottom)
