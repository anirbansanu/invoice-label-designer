import React, { useState, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, ProgressBar, Alert } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import { exportUtils } from '../../utils/exportUtils';

const ExportDialog = ({ show, onHide }) => {
  const { pages, currentPage, labelGrid, sampleData } = useCanvas();
  const [exportSettings, setExportSettings] = useState({
    format: 'pdf',
    quality: 'high',
    dpi: 300,
    pageRange: 'current',
    includeBleed: false,
    colorMode: 'rgb',
    compression: 'medium',
    filename: 'design',
    gridLayout: false,
    batchExport: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState(null);

  const formatOptions = [
    { value: 'pdf', label: 'PDF (Print Ready)', icon: 'fas fa-file-pdf' },
    { value: 'png', label: 'PNG (High Quality)', icon: 'fas fa-file-image' },
    { value: 'jpg', label: 'JPG (Compressed)', icon: 'fas fa-file-image' },
    { value: 'svg', label: 'SVG (Vector)', icon: 'fas fa-file-code' },
    { value: 'zip', label: 'ZIP Package', icon: 'fas fa-file-archive' }
  ];

  const qualityOptions = {
    pdf: [
      { value: 'print', label: 'Print Quality (300 DPI)' },
      { value: 'screen', label: 'Screen Quality (72 DPI)' },
      { value: 'custom', label: 'Custom DPI' }
    ],
    png: [
      { value: 'high', label: 'High Quality' },
      { value: 'medium', label: 'Medium Quality' },
      { value: 'low', label: 'Low Quality' }
    ],
    jpg: [
      { value: 'high', label: 'High Quality (90%)' },
      { value: 'medium', label: 'Medium Quality (70%)' },
      { value: 'low', label: 'Low Quality (50%)' }
    ]
  };

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    try {
      const exportData = {
        pages: exportSettings.pageRange === 'all' ? pages : [pages[currentPage]],
        settings: exportSettings,
        sampleData,
        labelGrid: exportSettings.gridLayout ? labelGrid : null
      };

      const result = await exportUtils.exportDesign(
        exportData,
        (progress) => setExportProgress(progress)
      );

      if (result.success) {
        onHide();
      } else {
        setExportError(result.error);
      }
    } catch (error) {
      setExportError('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [pages, currentPage, exportSettings, sampleData, labelGrid, onHide]);

  const handleSettingChange = useCallback((key, value) => {
    setExportSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const getEstimatedFileSize = useCallback(() => {
    const baseSize = pages.reduce((acc, page) => acc + page.elements.length, 0) * 10; // KB per element
    const multiplier = {
      pdf: 1.5,
      png: 2.0,
      jpg: 0.8,
      svg: 0.5,
      zip: 1.2
    }[exportSettings.format] || 1;
    
    return Math.round(baseSize * multiplier);
  }, [pages, exportSettings.format]);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Export Design</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {exportError && (
          <Alert variant="danger" onClose={() => setExportError(null)} dismissible>
            {exportError}
          </Alert>
        )}
        
        <Row>
          <Col md={6}>
            {/* Format Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Export Format</Form.Label>
              <div className="format-options">
                {formatOptions.map(format => (
                  <div key={format.value} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="format"
                      id={format.value}
                      value={format.value}
                      checked={exportSettings.format === format.value}
                      onChange={(e) => handleSettingChange('format', e.target.value)}
                    />
                    <label className="form-check-label" htmlFor={format.value}>
                      <i className={`${format.icon} me-2`}></i>
                      {format.label}
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Quality Settings */}
            <Form.Group className="mb-3">
              <Form.Label>Quality</Form.Label>
              <Form.Select
                value={exportSettings.quality}
                onChange={(e) => handleSettingChange('quality', e.target.value)}
              >
                {qualityOptions[exportSettings.format]?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Custom DPI */}
            {exportSettings.quality === 'custom' && (
              <Form.Group className="mb-3">
                <Form.Label>DPI (Dots per inch)</Form.Label>
                <Form.Control
                  type="number"
                  value={exportSettings.dpi}
                  onChange={(e) => handleSettingChange('dpi', parseInt(e.target.value))}
                  min="72"
                  max="600"
                />
              </Form.Group>
            )}

            {/* Filename */}
            <Form.Group className="mb-3">
              <Form.Label>Filename</Form.Label>
              <Form.Control
                type="text"
                value={exportSettings.filename}
                onChange={(e) => handleSettingChange('filename', e.target.value)}
                placeholder="Enter filename"
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            {/* Page Range */}
            <Form.Group className="mb-3">
              <Form.Label>Page Range</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  name="pageRange"
                  id="current-page"
                  label="Current Page Only"
                  checked={exportSettings.pageRange === 'current'}
                  onChange={() => handleSettingChange('pageRange', 'current')}
                />
                <Form.Check
                  type="radio"
                  name="pageRange"
                  id="all-pages"
                  label="All Pages"
                  checked={exportSettings.pageRange === 'all'}
                  onChange={() => handleSettingChange('pageRange', 'all')}
                />
              </div>
            </Form.Group>

            {/* Advanced Options */}
            <Form.Group className="mb-3">
              <Form.Label>Advanced Options</Form.Label>
              
              <Form.Check
                type="checkbox"
                label="Include Bleed Area"
                checked={exportSettings.includeBleed}
                onChange={(e) => handleSettingChange('includeBleed', e.target.checked)}
              />
              
              <Form.Check
                type="checkbox"
                label="Grid Layout (Labels)"
                checked={exportSettings.gridLayout}
                onChange={(e) => handleSettingChange('gridLayout', e.target.checked)}
              />
              
              <Form.Check
                type="checkbox"
                label="Batch Export (Multiple Files)"
                checked={exportSettings.batchExport}
                onChange={(e) => handleSettingChange('batchExport', e.target.checked)}
              />
            </Form.Group>

            {/* Color Mode */}
            <Form.Group className="mb-3">
              <Form.Label>Color Mode</Form.Label>
              <Form.Select
                value={exportSettings.colorMode}
                onChange={(e) => handleSettingChange('colorMode', e.target.value)}
              >
                <option value="rgb">RGB (Screen)</option>
                <option value="cmyk">CMYK (Print)</option>
                <option value="grayscale">Grayscale</option>
              </Form.Select>
            </Form.Group>

            {/* Compression */}
            {(exportSettings.format === 'pdf' || exportSettings.format === 'jpg') && (
              <Form.Group className="mb-3">
                <Form.Label>Compression</Form.Label>
                <Form.Select
                  value={exportSettings.compression}
                  onChange={(e) => handleSettingChange('compression', e.target.value)}
                >
                  <option value="none">No Compression</option>
                  <option value="low">Low Compression</option>
                  <option value="medium">Medium Compression</option>
                  <option value="high">High Compression</option>
                </Form.Select>
              </Form.Group>
            )}
          </Col>
        </Row>

        {/* Export Progress */}
        {isExporting && (
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <ProgressBar now={exportProgress} animated />
          </div>
        )}

        {/* Export Info */}
        <div className="mt-3 p-3 bg-light rounded">
          <h6>Export Information</h6>
          <ul className="list-unstyled mb-0">
            <li><strong>Pages:</strong> {exportSettings.pageRange === 'all' ? pages.length : 1}</li>
            <li><strong>Format:</strong> {exportSettings.format.toUpperCase()}</li>
            <li><strong>Estimated Size:</strong> {getEstimatedFileSize()} KB</li>
            <li><strong>Quality:</strong> {exportSettings.quality}</li>
            {exportSettings.gridLayout && (
              <li><strong>Grid Layout:</strong> {labelGrid.rows} × {labelGrid.columns}</li>
            )}
          </ul>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isExporting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleExport}
          disabled={isExporting || !exportSettings.filename.trim()}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportDialog;
