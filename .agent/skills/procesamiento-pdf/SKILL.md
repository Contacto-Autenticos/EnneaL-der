---
name: pdf-official
description: "Conjunto completo de herramientas para la manipulación de PDF: extracción de texto y tablas, creación de nuevos PDFs, unión/división de documentos y manejo de formularios."
license: Proprietary. LICENSE.txt has complete terms
risk: unknown
source: community
---
# Guía de Procesamiento de PDF

## Resumen

Esta guía cubre las operaciones esenciales de procesamiento de PDF utilizando bibliotecas de Python y herramientas de línea de comandos. Para funciones avanzadas, bibliotecas de JavaScript y ejemplos detallados, consulta `reference.md`. Si necesitas completar un formulario PDF, lee `forms.md` y sigue sus instrucciones.

## Inicio Rápido

```python
from pypdf import PdfReader, PdfWriter

# Leer un PDF
reader = PdfReader("documento.pdf")
print(f"Páginas: {len(reader.pages)}")

# Extraer texto
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Bibliotecas de Python

### pypdf - Operaciones Básicas

#### Unir PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("unido.pdf", "wb") as output:
    writer.write(output)
```

#### Dividir PDF
```python
reader = PdfReader("entrada.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"pagina_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Extraer Metadatos
```python
reader = PdfReader("documento.pdf")
meta = reader.metadata
print(f"Título: {meta.title}")
print(f"Autor: {meta.author}")
print(f"Asunto: {meta.subject}")
print(f"Creador: {meta.creator}")
```

#### Rotar Páginas
```python
reader = PdfReader("entrada.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Rotar 90 grados en sentido horario
writer.add_page(page)

with open("rotado.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - Extracción de Texto y Tablas

#### Extraer Texto con Diseño
```python
import pdfplumber

with pdfplumber.open("documento.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extraer Tablas
```python
with pdfplumber.open("documento.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Tabla {j+1} en la página {i+1}:")
            for fila in table:
                print(fila)
```

#### Extracción Avanzada de Tablas
```python
import pandas as pd

with pdfplumber.open("documento.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # Verificar si la tabla no está vacía
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# Combinar todas las tablas
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("tablas_extraidas.xlsx", index=False)
```

### reportlab - Crear PDFs

#### Creación Básica de PDF
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hola.pdf", pagesize=letter)
width, height = letter

# Agregar texto
c.drawString(100, height - 100, "¡Hola Mundo!")
c.drawString(100, height - 120, "Este es un PDF creado con reportlab")

# Agregar una línea
c.line(100, height - 140, 400, height - 140)

# Guardar
c.save()
```

#### Crear PDF con Múltiples Páginas
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("reporte.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Agregar contenido
title = Paragraph("Título del Reporte", styles['Title'])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("Este es el cuerpo del reporte. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

# Página 2
story.append(Paragraph("Página 2", styles['Heading1']))
story.append(Paragraph("Contenido para la página 2", styles['Normal']))

# Construir PDF
doc.build(story)
```

## Herramientas de Línea de Comandos

### pdftotext (poppler-utils)
```bash
# Extraer texto
pdftotext entrada.pdf salida.txt

# Extraer texto preservando el diseño
pdftotext -layout entrada.pdf salida.txt

# Extraer páginas específicas
pdftotext -f 1 -l 5 entrada.pdf salida.txt  # Páginas 1-5
```

### qpdf
```bash
# Unir PDFs
qpdf --empty --pages archivo1.pdf archivo2.pdf -- unido.pdf

# Dividir páginas
qpdf entrada.pdf --pages . 1-5 -- paginas1-5.pdf
qpdf entrada.pdf --pages . 6-10 -- paginas6-10.pdf

# Rotar páginas
qpdf entrada.pdf salida.pdf --rotate=+90:1  # Rotar página 1 por 90 grados

# Eliminar contraseña
qpdf --password=micontrasena --decrypt encriptado.pdf desencriptado.pdf
```

### pdftk (si está disponible)
```bash
# Unir
pdftk archivo1.pdf archivo2.pdf cat output unido.pdf

# Dividir
pdftk entrada.pdf burst

# Rotar
pdftk entrada.pdf rotate 1east output rotado.pdf
```

## Tareas Comunes

### Extraer Texto de PDFs Escaneados
```python
# Requiere: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

# Convertir PDF a imágenes
images = convert_from_path('escaneado.pdf')

# OCR de cada página
text = ""
for i, image in enumerate(images):
    text += f"Página {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### Agregar Marca de Agua
```python
from pypdf import PdfReader, PdfWriter

# Crear marca de agua (o cargar una existente)
watermark = PdfReader("marca_agua.pdf").pages[0]

# Aplicar a todas las páginas
reader = PdfReader("documento.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("con_marca.pdf", "wb") as output:
    writer.write(output)
```

### Extraer Imágenes
```bash
# Usando pdfimages (poppler-utils)
pdfimages -j entrada.pdf prefijo_salida

# Esto extrae todas las imágenes como prefijo_salida-000.jpg, prefijo_salida-001.jpg, etc.
```

### Protección por Contraseña
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("entrada.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Agregar contraseña
writer.encrypt("clave_usuario", "clave_dueno")

with open("encriptado.pdf", "wb") as output:
    writer.write(output)
```

## Referencia Rápida

| Tarea | Mejor Herramienta | Comando/Código |
|------|-----------|--------------|
| Unir PDFs | pypdf | `writer.add_page(page)` |
| Dividir PDFs | pypdf | Una página por archivo |
| Extraer texto | pdfplumber | `page.extract_text()` |
| Extraer tablas | pdfplumber | `page.extract_tables()` |
| Crear PDFs | reportlab | Canvas o Platypus |
| Unir por línea de comandos | qpdf | `qpdf --empty --pages ...` |
| OCR de PDFs escaneados | pytesseract | Convertir a imagen primero |
| Llenar formularios PDF | pdf-lib o pypdf | Ver `forms.md` |

## Próximos Pasos

- Para uso avanzado de `pypdfium2`, consulta `reference.md`
- Para bibliotecas de JavaScript (`pdf-lib`), consulta `reference.md`
- Si necesitas completar un formulario PDF, sigue las instrucciones en `forms.md`
- Para guías de resolución de problemas, consulta `reference.md`

## Cuándo Usar
Esta habilidad es aplicable para ejecutar el flujo de trabajo o las acciones descritas en el resumen.
