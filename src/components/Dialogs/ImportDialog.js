import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import { importUtils } from '../../utils/importUtils';

const ImportDialog = ({ show, onHide }) => {
  const { dispatch } = useCanvas();
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importPreview, setImportPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImportError(null);
      setImportSuccess(false);
      
      // Generate preview
      generatePreview(file);
    }
  };

  const generatePreview = async (file) => {
    try {
      const fileContent = await readFileContent(file);
      const parsedContent = JSON.parse(fileContent);
      
      // Validate the content
      const isValid = importUtils.validateImportData(parsedContent);
      if (!isValid) {
        setImportError('Invalid file format. Please select a valid design file.');
        return;
      }

      // Generate preview data
      const preview = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        pages: parsedContent.pages?.length || 1,
        elements: parsedContent.pages?.reduce((total, page) => total + (page.elements?.length || 0), 0) || 0,
        version: parsedContent.metadata?.version || 'Unknown',
        created: parsedContent.metadata?.created || 'Unknown'
      };

      setImportPreview(preview);
    } catch (error) {
      setImportError('Error reading file. Please check the file format.');
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportError(null);

    try {
      const fileContent = await readFileContent(selectedFile);
      setImportProgress(25);

      const parsedContent = JSON.parse(fileContent);
      setImportProgress(50);

      const importedData = await importUtils.processImportData(
        parsedContent,
        (progress) => setImportProgress(50 + (progress * 0.4))
      );
      setImportProgress(90);

      // Apply imported data to canvas
      dispatch({
        type: 'IMPORT_DESIGN',
        payload: importedData
      });

      setImportProgress(100);
      setImportSuccess(true);
      
      setTimeout(() => {
        onHide();
        resetDialog();
      }, 1500);

    } catch (error) {
      setImportError('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setImportProgress(0);
    setImportError(null);
    setImportSuccess(false);
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      onHide();
      resetDialog();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Import Design</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {importError && (
          <Alert variant="danger" onClose={() => setImportError(null)} dismissible>
            {importError}
          </Alert>
        )}

        {importSuccess && (
          <Alert variant="success">
            <i className="fas fa-check-circle me-2"></i>
            Import completed successfully!
          </Alert>
        )}

        {!importSuccess && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Select Design File</Form.Label>
              <Form.Control
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isImporting}
              />
              <Form.Text className="text-muted">
                Supported formats: JSON design files
              </Form.Text>
            </Form.Group>

            {importPreview && (
              <div className="import-preview mb-3">
                <h6>File Preview</h6>
                <div className="bg-light p-3 rounded">
                  <div className="row">
                    <div className="col-6">
                      <strong>File Name:</strong><br />
                      {importPreview.fileName}
                    </div>
                    <div className="col-6">
                      <strong>File Size:</strong><br />
                      {importPreview.fileSize}
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <strong>Pages:</strong><br />
                      {importPreview.pages}
                    </div>
                    <div className="col-6">
                      <strong>Elements:</strong><br />
                      {importPreview.elements}
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <strong>Version:</strong><br />
                      {importPreview.version}
                    </div>
                    <div className="col-6">
                      <strong>Created:</strong><br />
                      {importPreview.created}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isImporting && (
              <div className="import-progress mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <ProgressBar now={importProgress} animated />
              </div>
            )}

            <div className="import-options">
              <h6>Import Options</h6>
              <Form.Check
                type="checkbox"
                label="Replace current design"
                defaultChecked={true}
              />
              <Form.Check
                type="checkbox"
                label="Import sample data"
                defaultChecked={true}
              />
              <Form.Check
                type="checkbox"
                label="Import templates"
                defaultChecked={false}
              />
            </div>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isImporting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleImport}
          disabled={!selectedFile || isImporting || importSuccess}
        >
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportDialog;
