# Generador de Certificados Tributarios

Una aplicación de escritorio para generar certificados tributarios basados en el template estándar.

## Características

- ✅ Interfaz de usuario intuitiva para editar todos los campos
- ✅ Tabla editable para detalles de transacciones
- ✅ Campos editables: empresa, NIT, persona, cédula, contador
- ✅ Carga de imagen de firma digital
- ✅ Lectura de datos desde archivos Excel
- ✅ Generación de PDF idéntico al template original
- ✅ Vista previa en tiempo real

## Instalación

1. Instalar dependencias:
```bash
cd certificado-app
npm install
```

2. Para desarrollo:
```bash
# Terminal 1 - Ejecutar React
npm start

# Terminal 2 - Ejecutar Electron
npm run electron-dev
```

3. Para compilar aplicación:
```bash
npm run build
npm run dist
```

## Formato de Excel

Para cargar datos desde Excel, el archivo debe tener las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| empresa | Nombre de la empresa |
| nit | NIT de la empresa |
| persona | Nombre completo de la persona |
| cedula | Número de cédula |
| contador | Nombre del contador |
| ciudad | Ciudad del receptor |
| fecha | Fecha del pago |
| concepto | Concepto del pago |
| transaccion | Número de transacción |
| cantidad | Cantidad adquirida |
| tasa | Tasa de cambio |
| valor | Valor total |
| retencion | Retención aplicada |

## Uso

1. **Cargar datos desde Excel**: Usar el botón "Cargar desde Excel" para importar datos
2. **Editar campos manualmente**: Modificar cualquier campo en la interfaz
3. **Cargar firma**: Seleccionar imagen de firma (PNG, JPG, JPEG)
4. **Vista previa**: Ver el certificado antes de generar
5. **Generar PDF**: Crear el archivo PDF final

## Estructura de archivos generados

```
certificado-app/
├── src/
│   ├── App.js          # Componente principal
│   ├── index.js        # Punto de entrada React
│   └── index.css       # Estilos
├── public/
│   ├── electron.js     # Proceso principal Electron
│   └── index.html      # Template HTML
└── package.json        # Dependencias y scripts
```

## Requisitos del sistema

- Node.js 16 o superior
- npm 8 o superior
- Sistema operativo: Windows, macOS, Linux

## Dependencias principales

- **Electron**: Framework para aplicaciones de escritorio
- **React**: Librería de UI
- **jsPDF**: Generación de archivos PDF
- **html2canvas**: Captura de pantalla HTML a imagen
- **xlsx**: Lectura de archivos Excel