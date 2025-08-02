const Document = require('../models/document');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

exports.upload = async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    const fileExtension = originalname.split('.').pop().toLowerCase();
    let extractedContent = '';
    let documentType = '';

    // Determine document type and extract content
    switch (fileExtension) {
      case 'pdf':
        const data = await pdf(buffer);
        extractedContent = data.text;
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

    // Basic file size validation (100MB)
    const fileSizeMB = buffer.length / (1024 * 1024);
    if (fileSizeMB > 100) {
      return res.status(400).json({ msg: 'File size exceeds 100MB limit' });
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