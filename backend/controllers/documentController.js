const Document = require('../models/document');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const path = require('path');

// Define allowed file extensions
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'txt', 'md', 'jpg', 'jpeg', 'png']);

exports.upload = async (req, res) => {
  console.log('req.file:', req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const { originalname, buffer, size } = req.file;
    const fileExtension = path.extname(originalname).slice(1).toLowerCase();
    console.log(`Backend received file: ${originalname}, Extension: ${fileExtension}, Size: ${size} bytes`);

    // Validate file extension
    if (!ALLOWED_EXTENSIONS.has(fileExtension)) {
      return res.status(400).json({ msg: `Unsupported file type. Allowed types are: ${[...ALLOWED_EXTENSIONS].join(', ')}` });
    }

    let extractedContent = '';
    const lowerCaseFilename = originalname.toLowerCase();
    let documentType = 'general';

    if (lowerCaseFilename.includes('bill')) {
      documentType = 'bill';
    } else if (lowerCaseFilename.includes('feedback')) {
      documentType = 'feedback';
    } else if (lowerCaseFilename.includes('revenue')) {
      documentType = 'revenue';
    }

    // Extract content based on file type
    switch (fileExtension) {
      case 'pdf':
        const data = await pdf(buffer);
        extractedContent = data.text;
        break;
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer });
        extractedContent = docxResult.value;
        break;
      case 'txt':
      case 'md':
        extractedContent = buffer.toString('utf-8');
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
        extractedContent = text;
        break;
    }

    const document = new Document({
      userId: req.user.id,
      filename: originalname,
      content: extractedContent,
      type: documentType,
      size: size,
      upload_date: new Date(),
    });

    await document.save();
    res.json(document);

  } catch (err) {
    console.error('Error during file upload:', err);
    if (err.message.includes('File size')) { // Check for multer's file size error
        return res.status(400).json({ msg: 'File size exceeds the 100MB limit.' });
    }
    res.status(500).send('Server error');
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.id;
    let query = { userId };

    if (search) {
      //$or condition finds documents where the search term appears in either
      //the filename or the content field. 
      query.$or = [
        //The $regex operator allows for partial matching, 
        //$options: 'i' makes search case-insensitive.
        { filename: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(query);
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
