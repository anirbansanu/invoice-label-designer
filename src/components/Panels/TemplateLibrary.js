import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Badge, Modal, InputGroup } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import { templateEngine } from '../../utils/templateEngine';

const TemplateLibrary = () => {
  const { templates, dispatch, pages, currentPage } = useCanvas();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: ''
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'invoice', label: 'Invoices' },
    { value: 'label', label: 'Labels' },
    { value: 'receipt', label: 'Receipts' },
    { value: 'badge', label: 'Badges' },
    { value: 'card', label: 'Business Cards' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'custom', label: 'Custom' }
  ];

  // Load default templates
  useEffect(() => {
    if (templates.length === 0) {
      templateEngine.loadDefaultTemplates().then(defaultTemplates => {
        defaultTemplates.forEach(template => {
          dispatch({ type: 'ADD_TEMPLATE', payload: template });
        });
      });
    }
  }, [templates.length, dispatch]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'created':
        return new Date(b.created) - new Date(a.created);
      default:
        return 0;
    }
  });

  const handleTemplatePreview = useCallback((template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  }, []);

  const handleApplyTemplate = useCallback((template) => {
    dispatch({
      type: 'APPLY_TEMPLATE',
      payload: {
        pageIndex: currentPage,
        template: template
      }
    });
    setShowTemplateModal(false);
  }, [dispatch, currentPage]);

  const handleSaveAsTemplate = useCallback(() => {
    if (pages[currentPage] && pages[currentPage].elements.length > 0) {
      const template = {
        id: `template_${Date.now()}`,
        name: newTemplate.name,
        description: newTemplate.description,
        category: newTemplate.category,
        tags: newTemplate.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        elements: pages[currentPage].elements,
        pageSize: pages[currentPage].size,
        background: pages[currentPage].background,
        preview: templateEngine.generatePreview(pages[currentPage]),
        created: new Date().toISOString(),
        author: 'User'
      };
      
      dispatch({ type: 'ADD_TEMPLATE', payload: template });
      setShowSaveModal(false);
      setNewTemplate({ name: '', description: '', category: 'general', tags: '' });
    }
  }, [pages, currentPage, newTemplate, dispatch]);

  const handleDeleteTemplate = useCallback((templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
    }
  }, [dispatch]);

  const handleExportTemplate = useCallback((template) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportTemplate = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const template = JSON.parse(e.target.result);
          template.id = `template_${Date.now()}`;
          template.imported = true;
          dispatch({ type: 'ADD_TEMPLATE', payload: template });
        } catch (error) {
          alert('Error importing template. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }, [dispatch]);

  return (
    <>
      <Card className="template-library">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Template Library</h6>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowSaveModal(true)}
              >
                <i className="fas fa-save"></i> Save
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                as="label"
                htmlFor="template-import"
              >
                <i className="fas fa-upload"></i> Import
                <input
                  id="template-import"
                  type="file"
                  accept=".json"
                  onChange={handleImportTemplate}
                  style={{ display: 'none' }}
                />
              </Button>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* Search and Filter */}
          <div className="mb-3">
            <InputGroup size="sm" className="mb-2">
              <InputGroup.Text>
                <i className="fas fa-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <div className="d-flex gap-2">
              <Form.Select
                size="sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Form.Select>
              
              <Form.Select
                size="sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
                <option value="created">Sort by Date</option>
              </Form.Select>
            </div>
          </div>
          
          {/* Template Grid */}
          <div className="template-grid">
            {filteredTemplates.length === 0 ? (
              <div className="text-center text-muted p-4">
                <i className="fas fa-file-alt fa-3x mb-2"></i>
                <p>No templates found</p>
              </div>
            ) : (
              <Row>
                {filteredTemplates.map((template) => (
                  <Col key={template.id} sm={6} md={4} lg={3} className="mb-3">
                    <Card className="template-card h-100">
                      <Card.Img
                        variant="top"
                        src={template.preview}
                        style={{ height: '120px', objectFit: 'cover' }}
                        onClick={() => handleTemplatePreview(template)}
                      />
                      <Card.Body className="p-2">
                        <Card.Title className="fs-6 mb-1">{template.name}</Card.Title>
                        <Card.Text className="small text-muted mb-2">
                          {template.description}
                        </Card.Text>
                        <div className="mb-2">
                          <Badge bg="secondary" className="me-1">
                            {template.category}
                          </Badge>
                          {template.imported && (
                            <Badge bg="info">Imported</Badge>
                          )}
                        </div>
                        <div className="d-flex gap-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleTemplatePreview(template)}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleExportTemplate(template)}
                          >
                            <i className="fas fa-download"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Template Preview Modal */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTemplate?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTemplate && (
            <div>
              <div className="text-center mb-3">
                <img
                  src={selectedTemplate.preview}
                  alt={selectedTemplate.name}
                  className="img-fluid"
                  style={{ maxHeight: '400px' }}
                />
              </div>
              <div className="row">
                <div className="col-md-6">
                  <h6>Description</h6>
                  <p>{selectedTemplate.description || 'No description available'}</p>
                </div>
                <div className="col-md-6">
                  <h6>Details</h6>
                  <ul className="list-unstyled">
                    <li><strong>Category:</strong> {selectedTemplate.category}</li>
                    <li><strong>Elements:</strong> {selectedTemplate.elements?.length || 0}</li>
                    <li><strong>Size:</strong> {selectedTemplate.pageSize?.width} × {selectedTemplate.pageSize?.height}</li>
                    <li><strong>Created:</strong> {new Date(selectedTemplate.created).toLocaleDateString()}</li>
                  </ul>
                </div>
              </div>
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div>
                  <h6>Tags</h6>
                  <div>
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} bg="outline-secondary" className="me-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleApplyTemplate(selectedTemplate)}>
            Apply Template
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Save Template Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save Current Design as Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <Form.Control
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter template description"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.filter(c => c.value !== 'all').map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={newTemplate.tags}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., business, formal, colorful"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveAsTemplate}
            disabled={!newTemplate.name.trim()}
          >
            Save Template
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TemplateLibrary;
