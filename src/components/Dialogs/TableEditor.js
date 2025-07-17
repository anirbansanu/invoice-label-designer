import React, { useState, useCallback } from 'react';
import { Modal, Button, Form, Table, InputGroup } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';

const TableEditor = ({ show, onHide }) => {
  const { selectedElementsData, updateElement } = useCanvas();
  const [editingTable, setEditingTable] = useState(null);
  const [tableData, setTableData] = useState({ columns: [], rows: [] });

  // Initialize table data when dialog opens
  React.useEffect(() => {
    if (show && selectedElementsData.length === 1 && selectedElementsData[0].type === 'table') {
      const table = selectedElementsData[0];
      setEditingTable(table);
      setTableData({
        columns: table.columns || [],
        rows: table.rows || []
      });
    }
  }, [show, selectedElementsData]);

  const handleColumnChange = useCallback((index, field, value) => {
    setTableData(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      )
    }));
  }, []);

  const handleCellChange = useCallback((rowIndex, colIndex, value) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, i) => 
        i === rowIndex ? row.map((cell, j) => j === colIndex ? value : cell) : row
      )
    }));
  }, []);

  const addColumn = useCallback(() => {
    setTableData(prev => ({
      columns: [...prev.columns, { header: 'New Column', width: 100 }],
      rows: prev.rows.map(row => [...row, ''])
    }));
  }, []);

  const removeColumn = useCallback((index) => {
    setTableData(prev => ({
      columns: prev.columns.filter((_, i) => i !== index),
      rows: prev.rows.map(row => row.filter((_, i) => i !== index))
    }));
  }, []);

  const addRow = useCallback(() => {
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, new Array(prev.columns.length).fill('')]
    }));
  }, []);

  const removeRow = useCallback((index) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index)
    }));
  }, []);

  const mergeCells = useCallback((fromRow, fromCol, toRow, toCol) => {
    // Implementation for cell merging
    console.log('Merge cells:', { fromRow, fromCol, toRow, toCol });
  }, []);

  const handleSave = useCallback(() => {
    if (editingTable) {
      updateElement({
        ...editingTable,
        columns: tableData.columns,
        rows: tableData.rows
      });
      onHide();
    }
  }, [editingTable, tableData, updateElement, onHide]);

  if (!editingTable) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Advanced Table Editor</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Column Configuration */}
        <div className="mb-4">
          <h6>Column Configuration</h6>
          <div className="table-responsive">
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>Header</th>
                  <th>Width</th>
                  <th>Alignment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.columns.map((column, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Control
                        type="text"
                        value={column.header}
                        onChange={(e) => handleColumnChange(index, 'header', e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={column.width}
                        onChange={(e) => handleColumnChange(index, 'width', parseInt(e.target.value))}
                      />
                    </td>
                    <td>
                      <Form.Select
                        value={column.align || 'left'}
                        onChange={(e) => handleColumnChange(index, 'align', e.target.value)}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeColumn(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Button variant="outline-primary" onClick={addColumn}>
            <i className="fas fa-plus"></i> Add Column
          </Button>
        </div>

        {/* Table Data */}
        <div className="mb-4">
          <h6>Table Data</h6>
          <div className="table-responsive">
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  {tableData.columns.map((column, index) => (
                    <th key={index}>{column.header}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <Form.Control
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          placeholder="Enter value or {{placeholder}}"
                        />
                      </td>
                    ))}
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeRow(rowIndex)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Button variant="outline-primary" onClick={addRow}>
            <i className="fas fa-plus"></i> Add Row
          </Button>
        </div>

        {/* Advanced Features */}
        <div className="mb-4">
          <h6>Advanced Features</h6>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm">
              <i className="fas fa-object-group"></i> Merge Cells
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="fas fa-object-ungroup"></i> Split Cells
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="fas fa-sort"></i> Sort Data
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="fas fa-filter"></i> Filter Data
            </Button>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TableEditor;
