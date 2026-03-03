import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Button, Form, Table, Row, Col, Badge, ButtonGroup, Dropdown } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import ColorPicker from '../Common/ColorPicker';
import {
  migrateLegacyTable,
  addColumnToTable,
  removeColumnFromTable,
  addRowToTable,
  removeRowFromTable,
  reorderColumns,
  autoDistributeColumns,
  mergeCells,
  splitCell,
  createColumn,
  INVOICE_COLUMN_PRESETS,
  TABLE_BORDER_PRESETS,
  DEFAULT_TABLE_STYLE,
} from '../../utils/tableUtils';

const TableEditor = ({ show, onHide }) => {
  const { selectedElementsData, updateElement } = useCanvas();
  const [editingTable, setEditingTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' | 'data' | 'style'
  const [selectedCells, setSelectedCells] = useState([]); // [{row, col}]
  const [editingCellStyle, setEditingCellStyle] = useState(null);

  // Initialize — migrate legacy model on open
  React.useEffect(() => {
    if (show && selectedElementsData.length === 1 && selectedElementsData[0].type === 'table') {
      const migrated = migrateLegacyTable(selectedElementsData[0]);
      setEditingTable(migrated);
      setTableData(migrated);
      setSelectedCells([]);
      setEditingCellStyle(null);
      setActiveTab('structure');
    }
  }, [show, selectedElementsData]);

  // ─── Column handlers ──────────────────────────────────────
  const handleColumnChange = useCallback((index, field, value) => {
    setTableData(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col
      ),
    }));
  }, []);

  const handleAddColumn = useCallback((afterIndex) => {
    setTableData(prev => addColumnToTable(prev, afterIndex));
  }, []);

  const handleAddPresetColumn = useCallback((presetKey) => {
    const preset = INVOICE_COLUMN_PRESETS[presetKey];
    if (!preset) return;
    setTableData(prev => {
      const cols = [...prev.columns];
      const newCol = createColumn(preset.header, preset.width, {
        binding: preset.binding,
        align: preset.align,
      });
      cols.push(newCol);
      const rows = prev.rows.map(row => {
        const cells = [...row.cells];
        cells.push({
          id: `cell_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          content: preset.binding || '',
          colSpan: 1,
          rowSpan: 1,
          style: {},
        });
        return { ...row, cells };
      });
      return { ...prev, columns: cols, rows };
    });
  }, []);

  const handleRemoveColumn = useCallback((index) => {
    setTableData(prev => removeColumnFromTable(prev, index));
  }, []);

  const handleMoveColumn = useCallback((fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    setTableData(prev => {
      if (toIndex < 0 || toIndex >= prev.columns.length) return prev;
      return reorderColumns(prev, fromIndex, toIndex);
    });
  }, []);

  const handleDistributeColumns = useCallback(() => {
    setTableData(prev => autoDistributeColumns(prev));
  }, []);

  // ─── Row handlers ────────────────────────────────────────
  const handleAddRow = useCallback((afterIndex) => {
    setTableData(prev => addRowToTable(prev, afterIndex));
  }, []);

  const handleRemoveRow = useCallback((index) => {
    setTableData(prev => removeRowFromTable(prev, index));
  }, []);

  const handleRowHeightChange = useCallback((index, value) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, i) =>
        i === index ? { ...row, height: Math.max(20, parseInt(value) || 28) } : row
      ),
    }));
  }, []);

  // ─── Cell handlers ───────────────────────────────────────
  const handleCellChange = useCallback((rowIndex, colIndex, value) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, ri) =>
        ri !== rowIndex ? row : {
          ...row,
          cells: row.cells.map((cell, ci) =>
            ci !== colIndex ? cell : { ...cell, content: value }
          ),
        }
      ),
    }));
  }, []);

  const handleCellStyleChange = useCallback((rowIndex, colIndex, styleProp, value) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map((row, ri) =>
        ri !== rowIndex ? row : {
          ...row,
          cells: row.cells.map((cell, ci) =>
            ci !== colIndex ? cell : {
              ...cell,
              style: { ...(cell.style || {}), [styleProp]: value },
            }
          ),
        }
      ),
    }));
  }, []);

  const toggleCellSelection = useCallback((rowIndex, colIndex) => {
    setSelectedCells(prev => {
      const exists = prev.some(c => c.row === rowIndex && c.col === colIndex);
      if (exists) return prev.filter(c => !(c.row === rowIndex && c.col === colIndex));
      return [...prev, { row: rowIndex, col: colIndex }];
    });
  }, []);

  // ─── Merge / Split ───────────────────────────────────────
  const handleMergeCells = useCallback(() => {
    if (selectedCells.length < 2) return;
    const minRow = Math.min(...selectedCells.map(c => c.row));
    const maxRow = Math.max(...selectedCells.map(c => c.row));
    const minCol = Math.min(...selectedCells.map(c => c.col));
    const maxCol = Math.max(...selectedCells.map(c => c.col));
    setTableData(prev => mergeCells(prev, minRow, minCol, maxRow, maxCol));
    setSelectedCells([]);
  }, [selectedCells]);

  const handleSplitCell = useCallback(() => {
    if (selectedCells.length !== 1) return;
    const { row, col } = selectedCells[0];
    setTableData(prev => splitCell(prev, row, col));
    setSelectedCells([]);
  }, [selectedCells]);

  // ─── Table style handlers ─────────────────────────────────
  const handleTableStyleChange = useCallback((prop, value) => {
    setTableData(prev => ({
      ...prev,
      tableStyle: { ...(prev.tableStyle || {}), [prop]: value },
    }));
  }, []);

  const applyBorderPreset = useCallback((presetKey) => {
    const preset = TABLE_BORDER_PRESETS[presetKey];
    if (!preset) return;
    setTableData(prev => ({
      ...prev,
      tableStyle: { ...(prev.tableStyle || {}), ...preset },
    }));
  }, []);

  // ─── Save ─────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (editingTable && tableData) {
      const totalWidth = tableData.columns.reduce((s, c) => s + c.width, 0);
      updateElement({
        ...tableData,
        width: totalWidth,
      });
      onHide();
    }
  }, [editingTable, tableData, updateElement, onHide]);

  // ─── Computed helpers ─────────────────────────────────────
  const ts = useMemo(() => ({
    ...DEFAULT_TABLE_STYLE, ...(tableData?.tableStyle || {}),
  }), [tableData?.tableStyle]);

  const isCellSelected = useCallback((row, col) => {
    return selectedCells.some(c => c.row === row && c.col === col);
  }, [selectedCells]);

  const canMerge = selectedCells.length >= 2;
  const canSplit = selectedCells.length === 1 && tableData?.rows?.[selectedCells[0]?.row]?.cells?.[selectedCells[0]?.col]?.colSpan > 1;

  if (!editingTable || !tableData) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" className="table-editor-dialog">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-table me-2"></i>Advanced Table Editor
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Tab Navigation */}
        <div className="d-flex gap-2 mb-3">
          {['structure', 'data', 'style'].map(tab => (
            <Button key={tab} size="sm"
              variant={activeTab === tab ? 'primary' : 'outline-secondary'}
              onClick={() => setActiveTab(tab)}>
              {tab === 'structure' && <><i className="fas fa-columns me-1"></i>Structure</>}
              {tab === 'data' && <><i className="fas fa-edit me-1"></i>Cell Data</>}
              {tab === 'style' && <><i className="fas fa-palette me-1"></i>Table Style</>}
            </Button>
          ))}
        </div>

        {/* ──────── STRUCTURE TAB ──────── */}
        {activeTab === 'structure' && (
          <>
            {/* Column Configuration */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Columns ({tableData.columns.length})</h6>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => handleAddColumn(-1)}>
                    <i className="fas fa-plus me-1"></i>Add Column
                  </Button>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-info" size="sm">
                      <i className="fas fa-file-invoice me-1"></i>Invoice Preset
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {Object.entries(INVOICE_COLUMN_PRESETS).map(([key, preset]) => (
                        <Dropdown.Item key={key} onClick={() => handleAddPresetColumn(key)}>
                          {preset.header} <small className="text-muted">({preset.binding})</small>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button variant="outline-secondary" size="sm" onClick={handleDistributeColumns}
                    title="Distribute column widths equally">
                    <i className="fas fa-arrows-alt-h"></i>
                  </Button>
                </div>
              </div>
              <div className="table-responsive">
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Header</th>
                      <th style={{ width: 80 }}>Width</th>
                      <th style={{ width: 100 }}>Alignment</th>
                      <th style={{ width: 180 }}>Binding</th>
                      <th style={{ width: 130 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.columns.map((col, ci) => (
                      <tr key={col.id || ci}>
                        <td className="text-center text-muted">{ci + 1}</td>
                        <td>
                          <Form.Control type="text" size="sm" value={col.header}
                            onChange={(e) => handleColumnChange(ci, 'header', e.target.value)} />
                        </td>
                        <td>
                          <Form.Control type="number" size="sm" value={col.width}
                            onChange={(e) => handleColumnChange(ci, 'width', Math.max(40, parseInt(e.target.value) || 40))} />
                        </td>
                        <td>
                          <Form.Select size="sm" value={col.align || 'left'}
                            onChange={(e) => handleColumnChange(ci, 'align', e.target.value)}>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control type="text" size="sm" value={col.binding || ''}
                            placeholder="{{placeholder}}"
                            onChange={(e) => handleColumnChange(ci, 'binding', e.target.value)} />
                        </td>
                        <td>
                          <ButtonGroup size="sm">
                            <Button variant="outline-secondary" disabled={ci === 0}
                              onClick={() => handleMoveColumn(ci, -1)} title="Move Left">
                              <i className="fas fa-arrow-left"></i>
                            </Button>
                            <Button variant="outline-secondary"
                              disabled={ci === tableData.columns.length - 1}
                              onClick={() => handleMoveColumn(ci, 1)} title="Move Right">
                              <i className="fas fa-arrow-right"></i>
                            </Button>
                            <Button variant="outline-danger"
                              disabled={tableData.columns.length <= 1}
                              onClick={() => handleRemoveColumn(ci)} title="Remove">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            {/* Row Management */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Rows ({tableData.rows.length})</h6>
                <Button variant="outline-primary" size="sm" onClick={() => handleAddRow(-1)}>
                  <i className="fas fa-plus me-1"></i>Add Row
                </Button>
              </div>
              <div className="table-responsive" style={{ maxHeight: 200, overflowY: 'auto' }}>
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th style={{ width: 80 }}>Height</th>
                      <th>Cells</th>
                      <th style={{ width: 80 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, ri) => (
                      <tr key={row.id || ri}>
                        <td className="text-center text-muted">{ri + 1}</td>
                        <td>
                          <Form.Control type="number" size="sm"
                            value={row.height || ts.minRowHeight}
                            onChange={(e) => handleRowHeightChange(ri, e.target.value)} />
                        </td>
                        <td>
                          <small className="text-muted">{row.cells?.length || 0} cells</small>
                        </td>
                        <td>
                          <ButtonGroup size="sm">
                            <Button variant="outline-primary" title="Insert row below"
                              onClick={() => handleAddRow(ri)}>
                              <i className="fas fa-plus"></i>
                            </Button>
                            <Button variant="outline-danger"
                              disabled={tableData.rows.length <= 1}
                              onClick={() => handleRemoveRow(ri)} title="Remove">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* ──────── DATA TAB ──────── */}
        {activeTab === 'data' && (
          <>
            {/* Merge/Split toolbar */}
            <div className="d-flex gap-2 mb-3 align-items-center">
              <Button variant="outline-secondary" size="sm" disabled={!canMerge}
                onClick={handleMergeCells}>
                <i className="fas fa-object-group me-1"></i>Merge
              </Button>
              <Button variant="outline-secondary" size="sm" disabled={!canSplit}
                onClick={handleSplitCell}>
                <i className="fas fa-object-ungroup me-1"></i>Split
              </Button>
              {selectedCells.length > 0 && (
                <Badge bg="info">{selectedCells.length} cell(s) selected</Badge>
              )}
              {selectedCells.length === 1 && (
                <Button variant="outline-primary" size="sm"
                  onClick={() => setEditingCellStyle(selectedCells[0])}>
                  <i className="fas fa-paint-brush me-1"></i>Cell Style
                </Button>
              )}
            </div>

            <div className="table-responsive">
              <Table bordered size="sm" className="table-editor-grid">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}></th>
                    {tableData.columns.map((col, ci) => (
                      <th key={col.id || ci} style={{ minWidth: 80 }}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, ri) => (
                    <tr key={row.id || ri}>
                      <td className="text-center text-muted" style={{ verticalAlign: 'middle' }}>
                        <small>{ri + 1}</small>
                      </td>
                      {(row.cells || []).map((cell, ci) => {
                        if (cell._merged) return null;
                        return (
                          <td key={cell.id || ci}
                            colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                            rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                            className={isCellSelected(ri, ci) ? 'table-primary' : ''}
                            onClick={() => toggleCellSelection(ri, ci)}
                            style={{ cursor: 'pointer', position: 'relative' }}>
                            <Form.Control type="text" size="sm"
                              value={cell.content || ''}
                              onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                              placeholder="{{placeholder}}"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                backgroundColor: cell.style?.bg || 'transparent',
                                color: cell.style?.color || undefined,
                                fontWeight: cell.style?.fontStyle === 'bold' ? 'bold' : undefined,
                                fontStyle: cell.style?.fontStyle === 'italic' ? 'italic' : undefined,
                                textAlign: cell.style?.align || undefined,
                                border: isCellSelected(ri, ci) ? '2px solid #0d6efd' : undefined,
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Cell Style Editor (inline) */}
            {editingCellStyle && (
              <div className="mt-3 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    Cell Style (Row {editingCellStyle.row + 1}, Col {editingCellStyle.col + 1})
                  </h6>
                  <Button variant="outline-secondary" size="sm"
                    onClick={() => setEditingCellStyle(null)}>
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
                {(() => {
                  const cell = tableData.rows[editingCellStyle.row]?.cells?.[editingCellStyle.col];
                  if (!cell) return null;
                  const cs = cell.style || {};
                  const onStyleChange = (prop, val) =>
                    handleCellStyleChange(editingCellStyle.row, editingCellStyle.col, prop, val);
                  return (
                    <Row>
                      <Col sm={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Font Size</Form.Label>
                          <Form.Control type="number" size="sm" value={cs.fontSize || ''}
                            placeholder="Inherit"
                            onChange={(e) => onStyleChange('fontSize', e.target.value ? parseInt(e.target.value) : null)} />
                        </Form.Group>
                      </Col>
                      <Col sm={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Font Style</Form.Label>
                          <Form.Select size="sm" value={cs.fontStyle || ''}
                            onChange={(e) => onStyleChange('fontStyle', e.target.value || null)}>
                            <option value="">Inherit</option>
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="italic">Italic</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Alignment</Form.Label>
                          <Form.Select size="sm" value={cs.align || ''}
                            onChange={(e) => onStyleChange('align', e.target.value || null)}>
                            <option value="">Inherit</option>
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col sm={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Padding</Form.Label>
                          <Form.Control type="number" size="sm" value={cs.padding || ''}
                            placeholder="Inherit"
                            onChange={(e) => onStyleChange('padding', e.target.value ? parseInt(e.target.value) : null)} />
                        </Form.Group>
                      </Col>
                      <Col sm={4}>
                        <ColorPicker label="Text Color" value={cs.color || '#000000'}
                          onChange={(val) => onStyleChange('color', val)} />
                      </Col>
                      <Col sm={4}>
                        <ColorPicker label="Background" value={cs.bg || '#ffffff'}
                          onChange={(val) => onStyleChange('bg', val)} />
                      </Col>
                      <Col sm={4}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small">Wrap Text</Form.Label>
                          <Form.Check type="switch" checked={cs.wrap !== false}
                            onChange={(e) => onStyleChange('wrap', e.target.checked)} />
                        </Form.Group>
                      </Col>
                    </Row>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {/* ──────── STYLE TAB ──────── */}
        {activeTab === 'style' && (
          <>
            {/* Header Style */}
            <div className="mb-4">
              <h6>Header</h6>
              <Row>
                <Col sm={4}>
                  <ColorPicker label="Header Background" value={ts.headerBg}
                    onChange={(v) => handleTableStyleChange('headerBg', v)} />
                </Col>
                <Col sm={4}>
                  <ColorPicker label="Header Text Color" value={ts.headerColor}
                    onChange={(v) => handleTableStyleChange('headerColor', v)} />
                </Col>
                <Col sm={4}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Header Font Size</Form.Label>
                    <Form.Control type="number" size="sm" value={ts.headerFontSize}
                      onChange={(e) => handleTableStyleChange('headerFontSize', parseInt(e.target.value) || 13)} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Check type="switch" label="Show Header Row"
                checked={ts.showHeader !== false}
                onChange={(e) => handleTableStyleChange('showHeader', e.target.checked)} />
            </div>

            {/* Cell Defaults */}
            <div className="mb-4">
              <h6>Cell Defaults</h6>
              <Row>
                <Col sm={3}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Font Size</Form.Label>
                    <Form.Control type="number" size="sm" value={ts.cellFontSize}
                      onChange={(e) => handleTableStyleChange('cellFontSize', parseInt(e.target.value) || 12)} />
                  </Form.Group>
                </Col>
                <Col sm={3}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Padding</Form.Label>
                    <Form.Control type="number" size="sm" value={ts.cellPadding}
                      onChange={(e) => handleTableStyleChange('cellPadding', parseInt(e.target.value) || 4)} />
                  </Form.Group>
                </Col>
                <Col sm={3}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Min Row Height</Form.Label>
                    <Form.Control type="number" size="sm" value={ts.minRowHeight}
                      onChange={(e) => handleTableStyleChange('minRowHeight', parseInt(e.target.value) || 24)} />
                  </Form.Group>
                </Col>
                <Col sm={3}>
                  <ColorPicker label="Cell Text Color" value={ts.cellColor}
                    onChange={(v) => handleTableStyleChange('cellColor', v)} />
                </Col>
              </Row>
              <Form.Check type="switch" label="Alternate Row Shading"
                checked={ts.alternateRowEnabled}
                onChange={(e) => handleTableStyleChange('alternateRowEnabled', e.target.checked)} />
              {ts.alternateRowEnabled && (
                <ColorPicker label="Alternate Row Color" value={ts.alternateRowBg}
                  onChange={(v) => handleTableStyleChange('alternateRowBg', v)} />
              )}
            </div>

            {/* Border Presets */}
            <div className="mb-4">
              <h6>Border Style</h6>
              <div className="d-flex gap-2 mb-2">
                {Object.keys(TABLE_BORDER_PRESETS).map(key => (
                  <Button key={key} variant="outline-secondary" size="sm"
                    onClick={() => applyBorderPreset(key)}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Button>
                ))}
              </div>
              <Row>
                <Col sm={4}>
                  <ColorPicker label="Border Color" value={ts.cellBorderColor}
                    onChange={(v) => {
                      handleTableStyleChange('cellBorderColor', v);
                      handleTableStyleChange('outerBorderColor', v);
                    }} />
                </Col>
                <Col sm={4}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Cell Border Width</Form.Label>
                    <Form.Control type="number" size="sm" min={0} max={5}
                      value={ts.cellBorderWidth}
                      onChange={(e) => handleTableStyleChange('cellBorderWidth', parseInt(e.target.value) || 0)} />
                  </Form.Group>
                </Col>
                <Col sm={4}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Outer Border Width</Form.Label>
                    <Form.Control type="number" size="sm" min={0} max={5}
                      value={ts.outerBorderWidth}
                      onChange={(e) => handleTableStyleChange('outerBorderWidth', parseInt(e.target.value) || 0)} />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Width Mode */}
            <div className="mb-4">
              <h6>Width Mode</h6>
              <Form.Select size="sm" value={ts.widthMode}
                onChange={(e) => handleTableStyleChange('widthMode', e.target.value)}>
                <option value="fixed">Fixed — manual column widths</option>
                <option value="full">Full Width — stretch to container</option>
                <option value="auto">Auto — fit content</option>
              </Form.Select>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>
          <i className="fas fa-save me-1"></i>Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TableEditor;
