const Document = require('../models/document');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { Poppler } = require('node-poppler');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

exports.upload = async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    const fileExtension = originalname.split('.').pop().toLowerCase();
    let extractedContent = '';
    let documentType = '';

    // Basic file size validation (100MB)
    const fileSizeMB = buffer.length / (1024 * 1024);
    if (fileSizeMB > 100) {
      return res.status(400).json({ msg: 'File size exceeds 100MB limit' });
    }

    // Determine document type and extract content
    switch (fileExtension) {
      case 'pdf':
        // Save PDF to a temporary file for pdf-poppler
        const tempPdfPath = path.join(__dirname, `temp_${Date.now()}.pdf`);
        await fs.promises.writeFile(tempPdfPath, buffer);

        const imagePaths = []; // Declared here to be accessible in finally block
        const poppler = new Poppler(); // Instantiate Poppler here

        try {
          // Extract text using pdf-parse (for selectable text)
          const data = await pdf(buffer);
          extractedContent = data.text;

          const outputPrefix = path.join(__dirname, `temp_page_${Date.now()}`);
          await poppler.pdfToCairo(tempPdfPath, outputPrefix, { pngFile: true });

          const filesInDir = await fs.promises.readdir(__dirname);
          const prefixBase = path.basename(outputPrefix);
          const pageImageFiles = filesInDir.filter(f =>
            f.startsWith(prefixBase) && f.endsWith('.png')
          );

          console.log(`Found ${pageImageFiles.length} image files for OCR.`);

          for (const imageFile of pageImageFiles) {
            const imagePath = path.join(__dirname, imageFile);
            imagePaths.push(imagePath);
            console.log(`Attempting OCR on: ${imagePath}`);
            try {
              const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
              console.log(`OCR result for ${imageFile}:\n${text.substring(0, 200)}...`); // Log first 200 chars
              extractedContent += `\n\n--- OCR from ${imageFile} ---\n${text}`;
            } catch (ocrErr) {
              console.error(`Error during OCR for ${imageFile}:`, ocrErr);
            }
          }

        } finally {
          // Clean up temporary PDF and image files
          await fs.promises.unlink(tempPdfPath);
          console.log(`Deleted temporary PDF: ${tempPdfPath}`);
          for (const imgPath of imagePaths) {
            await fs.promises.unlink(imgPath).catch(err => console.error("Error deleting temp image:", err));
            console.log(`Deleted temporary image: ${imgPath}`);
          }
        }
        documentType = 'bill'; // Assuming PDFs are bills for now
        break;
      case 'docx':
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        extractedContent = result.value;
        documentType = 'review'; // Assuming DOCX are reviews for now
        break;
      case 'txt':
      case 'md':
        extractedContent = buffer.toString('utf-8');
        documentType = 'review'; // Assuming TXT/MD are reviews for now
        break;
      default:
        return res.status(400).json({ msg: 'Unsupported file type' });
    }

    const document = new Document({
      userId: req.user.id,
      filename: originalname,
      content: extractedContent,
      type: documentType,
      upload_date: new Date(),
    });
    await document.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    if (document.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    if (document.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await document.remove();
    res.json({ msg: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
