import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./index.css";

// Verificar si estamos en Electron o navegador web
const isElectron = () => {
  return window && window.process && window.process.type;
};

const ipcRenderer = isElectron()
  ? window.require("electron").ipcRenderer
  : null;

function App() {
  const [formData, setFormData] = useState({
    empresa: "",
    nit: "",
    persona: "",
    cedula: "",
    contador: "",
  });

  const [documentTitle, setDocumentTitle] = useState(
    "CERTIFICADO TRIBUTARIO AG 2024"
  );
  const [pageSize, setPageSize] = useState("a4");
  const [margins, setMargins] = useState({
    top: 94,
    bottom: 94,
    left: 113,
    right: 113,
  });

  const pageSizes = {
    a4: { name: "A4 (210 x 297 mm)", width: 210, height: 297 },
    letter: { name: "Carta (216 x 279 mm)", width: 216, height: 279 },
    legal: { name: "Oficio (216 x 356 mm)", width: 216, height: 356 },
    a3: { name: "A3 (297 x 420 mm)", width: 297, height: 420 },
    tabloid: { name: "Tabloid (279 x 432 mm)", width: 279, height: 432 },
  };

  const [tableData, setTableData] = useState([
    { campo: "", detalle: "" },
    { campo: "", detalle: "" },
    { campo: "", detalle: "" },
    { campo: "", detalle: "" },
    { campo: "", detalle: "" },
    { campo: "", detalle: "" },
    { campo: "", detalle: "" },
    { campo: "", detalle: "" },
  ]);

  const [textTemplate, setTextTemplate] = useState(
    "La empresa [empresa], identificada con NIT [nit], certifica que se realizó un pago a la señora [persona], identificada con número de cédula [cedula], en el marco de una operación de adquisición de moneda digital (criptoactivo) a través de la plataforma Binance."
  );

  const [presets, setPresets] = useState({
    tables: [],
    texts: [],
  });

  const [signatureImage, setSignatureImage] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const certificateRef = useRef();

  // Cargar datos persistentes al iniciar
  useEffect(() => {
    loadPersistedData();
  }, []);

  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const loadFromLocalStorage = (key, defaultValue = null) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return defaultValue;
    }
  };

  const loadPersistedData = () => {
    const defaultPresets = {
      tables: [
        {
          name: "Transacción Crypto - Por Defecto",
          data: [
            { campo: "Ciudad del receptor", detalle: "" },
            { campo: "Fecha del pago", detalle: "" },
            { campo: "Concepto del pago", detalle: "" },
            { campo: "Número de orden de la transacción", detalle: "" },
            { campo: "Cantidad adquirida", detalle: "" },
            { campo: "Tasa de cambio aplicada", detalle: "" },
            { campo: "Valor total en pesos colombianos", detalle: "" },
            { campo: "¿Se le practicó alguna retención?", detalle: "" },
          ],
        },
      ],
      texts: [
        {
          name: "Certificado Crypto - Por Defecto",
          template:
            "La empresa [empresa], identificada con NIT [nit], certifica que se realizó un pago a la señora [persona], identificada con número de cédula [cedula], en el marco de una operación de adquisición de moneda digital (criptoactivo) a través de la plataforma Binance.",
        },
      ],
    };

    const savedPresets = loadFromLocalStorage(
      "certificado-presets",
      defaultPresets
    );

    // Si no hay presets guardados, usar los por defecto y guardarlos
    if (!savedPresets.tables || savedPresets.tables.length === 0) {
      savedPresets.tables = defaultPresets.tables;
    }
    if (!savedPresets.texts || savedPresets.texts.length === 0) {
      savedPresets.texts = defaultPresets.texts;
    }

    setPresets(savedPresets);
    saveToLocalStorage("certificado-presets", savedPresets);

    // Cargar el primer preset de tabla por defecto
    if (savedPresets.tables.length > 0) {
      setTableData([...savedPresets.tables[0].data]);
    }

    // Cargar el primer preset de texto por defecto
    if (savedPresets.texts.length > 0) {
      setTextTemplate(savedPresets.texts[0].template);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTableChange = (index, field, value) => {
    const newTableData = [...tableData];
    newTableData[index][field] = value;
    setTableData(newTableData);
  };

  const addTableRow = () => {
    setTableData([...tableData, { campo: "", detalle: "" }]);
  };

  const removeTableRow = (index) => {
    if (tableData.length > 1) {
      const newTableData = tableData.filter((_, i) => i !== index);
      setTableData(newTableData);
    }
  };

  const saveTablePreset = () => {
    const name = prompt("Nombre del preset de tabla:");
    if (name) {
      const newPreset = {
        name,
        data: tableData.map((row) => ({ campo: row.campo, detalle: "" })), // Solo guardar estructura
      };
      const newPresets = {
        ...presets,
        tables: [...presets.tables, newPreset],
      };
      setPresets(newPresets);
      saveToLocalStorage("certificado-presets", newPresets);
    }
  };

  const loadTablePreset = (presetIndex) => {
    if (presets.tables[presetIndex]) {
      setTableData([...presets.tables[presetIndex].data]);
    }
  };

  const saveTextPreset = () => {
    const name = prompt("Nombre del preset de texto:");
    if (name) {
      const newPreset = { name, template: textTemplate };
      const newPresets = {
        ...presets,
        texts: [...presets.texts, newPreset],
      };
      setPresets(newPresets);
      saveToLocalStorage("certificado-presets", newPresets);
    }
  };

  const loadTextPreset = (presetIndex) => {
    if (presets.texts[presetIndex]) {
      setTextTemplate(presets.texts[presetIndex].template);
    }
  };

  const clearLogo = () => {
    setCompanyLogo(null);
  };

  const clearSignature = () => {
    setSignatureImage(null);
  };

  const processTextTemplate = (template, isForPDF = false) => {
    let processedText = template;
    const placeholders = {
      "[empresa]": formData.empresa,
      "[nit]": formData.nit,
      "[persona]": formData.persona,
      "[cedula]": formData.cedula,
      "[contador]": formData.contador,
    };

    Object.entries(placeholders).forEach(([placeholder, value]) => {
      let processedValue;
      if (value && value.trim()) {
        // Los datos del usuario SIEMPRE en mayúsculas y negrilla (en vista previa y PDF)
        processedValue = `<strong>${value.toUpperCase()}</strong>`;
      } else {
        processedValue = isForPDF
          ? '<strong style="color: red;">&lt;FALTA ESTE DATO&gt;</strong>'
          : '<span style="color: #e74c3c; font-weight: bold;">&lt;Falta este dato&gt;</span>';
      }

      // Escapar caracteres especiales en el placeholder para regex
      const escapedPlaceholder = placeholder.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      processedText = processedText.replace(
        new RegExp(escapedPlaceholder, "g"),
        processedValue
      );
    });

    return processedText;
  };

  const getFieldValue = (field, isForPDF = false) => {
    if (!field) {
      return isForPDF ? "<FALTA ESTE DATO>" : "<Falta este dato>";
    }
    // La tabla mantiene el texto original, no se convierte a mayúsculas
    return field;
  };

  const selectSignatureImage = async () => {
    if (!isElectron()) {
      // En navegador web, usar input file
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setSignatureImage(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    try {
      const result = await ipcRenderer.invoke("select-signature-image");
      if (!result.canceled && result.filePaths.length > 0) {
        const imagePath = result.filePaths[0];
        setSignatureImage(imagePath);
      }
    } catch (error) {
      console.error("Error selecting signature:", error);
    }
  };

  const selectCompanyLogo = async () => {
    if (!isElectron()) {
      // En navegador web, usar input file
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setCompanyLogo(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    try {
      const result = await ipcRenderer.invoke("select-signature-image");
      if (!result.canceled && result.filePaths.length > 0) {
        const imagePath = result.filePaths[0];
        setCompanyLogo(imagePath);
      }
    } catch (error) {
      console.error("Error selecting company logo:", error);
    }
  };

  const loadFromExcel = async () => {
    if (!isElectron()) {
      // En navegador web, usar input file
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = new Uint8Array(event.target.result);
              const workbook = XLSX.read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet);

              if (jsonData.length > 0) {
                const record = jsonData[0];
                setFormData({
                  empresa: record.empresa || formData.empresa,
                  nit: record.nit || formData.nit,
                  persona: record.persona || formData.persona,
                  cedula: record.cedula || formData.cedula,
                  contador: record.contador || formData.contador,
                });

                // Actualizar título si existe
                if (record.titulo) {
                  setDocumentTitle(record.titulo);
                }

                // Actualizar tamaño de página si existe
                if (record.tamano && pageSizes[record.tamano]) {
                  setPageSize(record.tamano);
                }

                // Actualizar márgenes si existen
                if (record.margen_superior !== undefined) {
                  setMargins((prev) => ({
                    ...prev,
                    top: record.margen_superior || prev.top,
                    bottom: record.margen_inferior || prev.bottom,
                    left: record.margen_izquierdo || prev.left,
                    right: record.margen_derecho || prev.right,
                  }));
                }

                // Actualizar tabla si existe data
                if (record.ciudad) {
                  const newTableData = [...tableData];
                  newTableData[0].detalle = record.ciudad;
                  if (record.fecha) newTableData[1].detalle = record.fecha;
                  if (record.concepto)
                    newTableData[2].detalle = record.concepto;
                  if (record.transaccion)
                    newTableData[3].detalle = record.transaccion;
                  if (record.cantidad)
                    newTableData[4].detalle = record.cantidad;
                  if (record.tasa) newTableData[5].detalle = record.tasa;
                  if (record.valor) newTableData[6].detalle = record.valor;
                  if (record.retencion)
                    newTableData[7].detalle = record.retencion;
                  setTableData(newTableData);
                }
              }
            } catch (error) {
              console.error("Error parsing Excel:", error);
              alert("Error al leer el archivo Excel");
            }
          };
          reader.readAsArrayBuffer(file);
        }
      };
      input.click();
      return;
    }

    try {
      const result = await ipcRenderer.invoke("show-open-dialog");
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fs = window.require("fs");
        const buffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length > 0) {
          const record = data[0];
          setFormData({
            empresa: record.empresa || formData.empresa,
            nit: record.nit || formData.nit,
            persona: record.persona || formData.persona,
            cedula: record.cedula || formData.cedula,
            contador: record.contador || formData.contador,
          });

          // Actualizar título si existe
          if (record.titulo) {
            setDocumentTitle(record.titulo);
          }

          // Actualizar tamaño de página si existe
          if (record.tamano && pageSizes[record.tamano]) {
            setPageSize(record.tamano);
          }

          // Actualizar márgenes si existen
          if (record.margen_superior !== undefined) {
            setMargins((prev) => ({
              ...prev,
              top: record.margen_superior || prev.top,
              bottom: record.margen_inferior || prev.bottom,
              left: record.margen_izquierdo || prev.left,
              right: record.margen_derecho || prev.right,
            }));
          }

          // Actualizar tabla si existe data
          if (record.ciudad) {
            const newTableData = [...tableData];
            newTableData[0].detalle = record.ciudad;
            if (record.fecha) newTableData[1].detalle = record.fecha;
            if (record.concepto) newTableData[2].detalle = record.concepto;
            if (record.transaccion)
              newTableData[3].detalle = record.transaccion;
            if (record.cantidad) newTableData[4].detalle = record.cantidad;
            if (record.tasa) newTableData[5].detalle = record.tasa;
            if (record.valor) newTableData[6].detalle = record.valor;
            if (record.retencion) newTableData[7].detalle = record.retencion;
            setTableData(newTableData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading Excel:", error);
      alert("Error al cargar el archivo Excel");
    }
  };

  const generatePDF = async () => {
    try {
      // Crear una versión para PDF temporalmente
      const pdfElement = createPDFVersion();
      document.body.appendChild(pdfElement);

      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Remover el elemento temporal
      document.body.removeChild(pdfElement);

      const imgData = canvas.toDataURL("image/png");
      const selectedPageSize = pageSizes[pageSize];
      const pdf = new jsPDF("p", "mm", [
        selectedPageSize.width,
        selectedPageSize.height,
      ]);
      const imgWidth = selectedPageSize.width;
      const pageHeight = selectedPageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      if (!isElectron()) {
        pdf.save("certificado-tributario.pdf");
        alert("PDF descargado exitosamente");
        return;
      }

      const result = await ipcRenderer.invoke("show-save-dialog");
      if (!result.canceled) {
        const fs = window.require("fs");
        const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
        fs.writeFileSync(result.filePath, pdfBuffer);
        alert("PDF generado exitosamente");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF");
    }
  };

  const createPDFVersion = () => {
    const element = document.createElement("div");
    const selectedPageSize = pageSizes[pageSize];
    const maxWidth =
      selectedPageSize.width === 297
        ? "1000px" // A3
        : selectedPageSize.width === 279
        ? "950px" // Tabloid
        : selectedPageSize.width === 216
        ? "750px" // Letter/Legal
        : "800px"; // A4

    element.style.cssText = `
      max-width: ${maxWidth};
      margin: 0 auto;
      padding: ${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px;
      background: white;
      border: 1px solid #ddd;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      position: absolute;
      top: -10000px;
      left: -10000px;
    `;

    element.innerHTML = `
      ${
        companyLogo
          ? `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${isElectron() ? `file://${companyLogo}` : companyLogo}" 
               alt="Logo Empresa" 
               style="max-width: 200px; max-height: 100px;" />
        </div>
      `
          : ""
      }
      
      <div style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 30px;">
        ${documentTitle || "<FALTA TÍTULO DEL DOCUMENTO>"}
      </div>
      
      <p style="text-align: justify; margin-bottom: 20px;">
        ${processTextTemplate(textTemplate, true)}
      </p>

      <p style="margin-bottom: 20px;">
        A continuación, se detallan los aspectos técnicos de la transacción:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #d3d3d3;">
            <th style="border: 1px solid #000; padding: 10px; text-align: center;">CAMPO</th>
            <th style="border: 1px solid #000; padding: 10px; text-align: center;">DETALLE</th>
          </tr>
        </thead>
        <tbody>
          ${tableData
            .map(
              (row) => `
            <tr>
              <td style="border: 1px solid #000; padding: 10px;">${getFieldValue(
                row.campo,
                true
              )}</td>
              <td style="border: 1px solid #000; padding: 10px;">${getFieldValue(
                row.detalle,
                true
              )}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="margin-top: 40px; text-align: left;">
        <p>Atentamente</p>
        
        <div style="position: relative; width: 300px; margin-top: 60px;">
          ${
            signatureImage
              ? `
            <div style="position: absolute; bottom: 45px; left: 0; z-index: 1;">
              <img src="${
                isElectron() ? `file://${signatureImage}` : signatureImage
              }" 
                   alt="Firma" 
                   style="max-width: 200px; max-height: 80px; display: block;" />
            </div>
          `
              : ""
          }
          
          <div style="border-top: 1px solid #000; width: 300px; padding-top: 10px;">
            <p style="margin: 5px 0 5px 0; font-weight: bold;">${
              formData.contador && formData.contador.trim()
                ? formData.contador.toUpperCase()
                : "&lt;FALTA NOMBRE DEL CONTADOR&gt;"
            }</p>
            <p style="margin: 0;">CONTADORA</p>
          </div>
        </div>
      </div>
    `;

    return element;
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Generador de Certificados Tributarios</h1>
      </div>

      <div className="form-section">
        <h2>Información de la Empresa</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre de la Empresa:</label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>NIT:</label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Nombre de la Persona:</label>
            <input
              type="text"
              name="persona"
              value={formData.persona}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Cédula:</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Contador:</label>
          <input
            type="text"
            name="contador"
            value={formData.contador}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Título del Documento:</label>
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="CERTIFICADO TRIBUTARIO AG 2024"
          />
        </div>

        <div className="form-group">
          <label>Tamaño de Página:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            {Object.entries(pageSizes).map(([key, size]) => (
              <option key={key} value={key}>
                {size.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <h3>Márgenes del Documento (px)</h3>
          <div className="margins-grid">
            <div className="form-group">
              <label>Superior:</label>
              <input
                type="number"
                min="10"
                max="100"
                value={margins.top}
                onChange={(e) =>
                  setMargins((prev) => ({
                    ...prev,
                    top: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Inferior:</label>
              <input
                type="number"
                min="10"
                max="100"
                value={margins.bottom}
                onChange={(e) =>
                  setMargins((prev) => ({
                    ...prev,
                    bottom: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Izquierdo:</label>
              <input
                type="number"
                min="10"
                max="100"
                value={margins.left}
                onChange={(e) =>
                  setMargins((prev) => ({
                    ...prev,
                    left: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>Derecho:</label>
              <input
                type="number"
                min="10"
                max="100"
                value={margins.right}
                onChange={(e) =>
                  setMargins((prev) => ({
                    ...prev,
                    right: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="signature-section">
          <button className="button secondary" onClick={selectCompanyLogo}>
            Seleccionar Logo Empresa
          </button>
          {companyLogo && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Logo seleccionado</span>
              <button
                className="button"
                style={{
                  background: "#e74c3c",
                  fontSize: "12px",
                  padding: "5px 10px",
                }}
                onClick={clearLogo}
              >
                Quitar
              </button>
            </div>
          )}
        </div>

        <div className="signature-section">
          <button className="button secondary" onClick={selectSignatureImage}>
            Seleccionar Firma
          </button>
          {signatureImage && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Firma seleccionada</span>
              <button
                className="button"
                style={{
                  background: "#e74c3c",
                  fontSize: "12px",
                  padding: "5px 10px",
                }}
                onClick={clearSignature}
              >
                Quitar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h2>Texto del Certificado</h2>
        <div className="form-group">
          <label>
            Template de texto (usa [empresa], [nit], [persona], [cedula],
            [contador]):
          </label>
          <textarea
            rows={4}
            value={textTemplate}
            onChange={(e) => setTextTemplate(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
          <button className="button secondary" onClick={saveTextPreset}>
            Guardar Preset de Texto
          </button>
          <select
            onChange={(e) => loadTextPreset(parseInt(e.target.value))}
            style={{ padding: "8px" }}
          >
            <option value="">Cargar Preset de Texto</option>
            {presets.texts.map((preset, index) => (
              <option key={index} value={index}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <h2>Detalles de la Transacción</h2>
        <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
          <button className="button" onClick={addTableRow}>
            + Agregar Fila
          </button>
          <button className="button secondary" onClick={saveTablePreset}>
            Guardar Preset de Tabla
          </button>
          <select
            onChange={(e) => loadTablePreset(parseInt(e.target.value))}
            style={{ padding: "8px" }}
          >
            <option value="">Cargar Preset de Tabla</option>
            {presets.tables.map((preset, index) => (
              <option key={index} value={index}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        <div className="table-editor">
          <table>
            <thead>
              <tr>
                <th>CAMPO</th>
                <th>DETALLE</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={row.campo}
                      onChange={(e) =>
                        handleTableChange(index, "campo", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.detalle}
                      onChange={(e) =>
                        handleTableChange(index, "detalle", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="button"
                      style={{
                        background: "#e74c3c",
                        fontSize: "12px",
                        padding: "5px",
                      }}
                      onClick={() => removeTableRow(index)}
                      disabled={tableData.length === 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="actions">
        <button className="button secondary" onClick={loadFromExcel}>
          Cargar desde Excel
        </button>
        <button className="button success" onClick={generatePDF}>
          Generar PDF
        </button>
      </div>

      <div className="preview-section">
        <h2>Vista Previa - {pageSizes[pageSize].name}</h2>
        <div
          ref={certificateRef}
          className="certificate-preview"
          style={{
            maxWidth:
              pageSizes[pageSize].width === 297
                ? "1000px" // A3
                : pageSizes[pageSize].width === 279
                ? "950px" // Tabloid
                : pageSizes[pageSize].width === 216
                ? "750px" // Letter/Legal
                : "800px", // A4
            padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
          }}
        >
          {companyLogo && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <img
                src={isElectron() ? `file://${companyLogo}` : companyLogo}
                alt="Logo Empresa"
                style={{ maxWidth: "200px", maxHeight: "100px" }}
              />
            </div>
          )}

          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "30px",
            }}
          >
            {documentTitle || (
              <span style={{ color: "#e74c3c", fontWeight: "bold" }}>
                &lt;Falta título del documento&gt;
              </span>
            )}
          </div>

          <p
            style={{ textAlign: "justify", marginBottom: "20px" }}
            dangerouslySetInnerHTML={{
              __html: processTextTemplate(textTemplate).replace(
                /<Falta este dato>/g,
                '<span style="color: #e74c3c; font-weight: bold;">&lt;Falta este dato&gt;</span>'
              ),
            }}
          />

          <p style={{ marginBottom: "20px" }}>
            A continuación, se detallan los aspectos técnicos de la transacción:
          </p>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "20px 0",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#d3d3d3" }}>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  CAMPO
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  DETALLE
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #000", padding: "10px" }}>
                    <span
                      style={
                        !row.campo
                          ? { color: "#e74c3c", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {row.campo || "<Falta este dato>"}
                    </span>
                  </td>
                  <td style={{ border: "1px solid #000", padding: "10px" }}>
                    <span
                      style={
                        !row.detalle
                          ? { color: "#e74c3c", fontWeight: "bold" }
                          : {}
                      }
                    >
                      {row.detalle || "<Falta este dato>"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "40px", textAlign: "left" }}>
            <p>Atentamente</p>

            <div
              style={{
                position: "relative",
                width: "300px",
                marginTop: "60px",
              }}
            >
              {signatureImage && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "45px",
                    left: "0",
                    zIndex: 1,
                  }}
                >
                  <img
                    src={
                      isElectron() ? `file://${signatureImage}` : signatureImage
                    }
                    alt="Firma"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "80px",
                      display: "block",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  borderTop: "1px solid #000",
                  width: "300px",
                  paddingTop: "10px",
                }}
              >
                <p style={{ margin: "5px 0 5px 0", fontWeight: "bold" }}>
                  {formData.contador && formData.contador.trim() ? (
                    <strong>{formData.contador.toUpperCase()}</strong>
                  ) : (
                    <span style={{ color: "#e74c3c", fontWeight: "bold" }}>
                      &lt;Falta nombre del contador&gt;
                    </span>
                  )}
                </p>
                <p style={{ margin: "0" }}>CONTADORA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
